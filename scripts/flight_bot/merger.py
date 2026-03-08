"""
Merge, deduplicate, and save flight data to JSON.
"""
import json
import logging
import os

from .config import OUTPUT_PATH
from .models import now_utc

logger = logging.getLogger(__name__)


def load_existing_data() -> dict:
    """Load existing flight_data.json, or return empty structure."""
    if os.path.exists(OUTPUT_PATH):
        try:
            with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                if "routes" in data:
                    logger.info("Loaded %d existing routes", len(data["routes"]))
                    return data
        except Exception as e:
            logger.error("Failed to load existing data: %s", e)
    return {"meta": {}, "routes": []}


def _route_key(route: dict) -> str:
    return (
        f"{route.get('origin')}_{route.get('destination')}_"
        f"{route.get('date')}_{route.get('airline_code')}_{route.get('flight_num')}"
    )


def merge_and_save(existing_data: dict, new_routes: list,
                   processed_tasks: list, errors: int) -> None:
    """Merge new routes with existing data, deduplicate, and save."""
    processed_keys = set(t["key"] for t in processed_tasks)

    today_str = now_utc().strftime("%Y-%m-%d")

    final_routes = []
    for r in existing_data.get("routes", []):
        if r.get("date", "") < today_str:
            continue  # drop past flights

        month_str = r.get("date", "")[:7]
        key = f"{r.get('origin')}_{r.get('destination')}_{month_str}"

        if key not in processed_keys:
            final_routes.append(r)

    # Add all the new routes we just fetched
    final_routes.extend(new_routes)

    # Deduplicate
    seen_keys = set()
    deduped_routes = []
    for r in final_routes:
        rk = _route_key(r)
        if rk not in seen_keys:
            seen_keys.add(rk)
            deduped_routes.append(r)

    final_routes = deduped_routes

    # Sort globally by price
    final_routes.sort(key=lambda x: x["price"])

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    now_str = now_utc().strftime("%Y-%m-%d %H:%M")

    overall_cheapest = final_routes[0] if final_routes else None
    has_directs = any(r.get("transfers", 1) == 0 for r in final_routes)

    output: dict = {
        "meta": {
            "updated_at": now_str,
            "currency": "USD",
            "direct_only": False,
            "has_direct_flights": has_directs,
            "total_routes_tracked": len(final_routes),
            "errors_this_run": errors,
            "overall_cheapest": overall_cheapest,
        },
        "routes": final_routes,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    logger.info("Saved %d total flights to %s", len(final_routes), OUTPUT_PATH)
