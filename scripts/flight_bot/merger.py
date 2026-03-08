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

    # Deduplicate - Prioritize Amadeus Over TravelPayouts
    # When multiple sources find flights for the exact same route on the same date,
    # we want the highest quality data (Amadeus > Bots).
    best_deals = {}
    
    for r in final_routes:
        # Key deduplicates down to the Origin -> Dest -> Exact Date
        # (We only want 1 flight recommendation per day per route)
        rk = f"{r.get('origin')}_{r.get('destination')}_{r.get('date')}"
        
        existing = best_deals.get(rk)
        if not existing:
            best_deals[rk] = r
            continue
            
        # Priority Logic
        # 1. Amadeus beats Non-Amadeus
        r_is_amadeus = r.get("is_amadeus", False)
        ex_is_amadeus = existing.get("is_amadeus", False)
        
        if r_is_amadeus and not ex_is_amadeus:
            best_deals[rk] = r
        elif r_is_amadeus == ex_is_amadeus:
            # If both are same tier, take cheaper
            if r["price"] < existing["price"]:
                best_deals[rk] = r

    final_routes = list(best_deals.values())

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
