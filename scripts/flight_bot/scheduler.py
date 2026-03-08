"""
Task generation and priority sorting.
"""
from .config import (
    SEA_AIRPORTS, JAPAN_AIRPORTS, KOREA_AIRPORTS,
    INDIA_AIRPORTS, CHINA_AIRPORTS, TAIWAN_AIRPORTS,
    MYANMAR_HUBS, POPULAR_ROUTES_SET, MONTHS_TO_SCAN,
)


def generate_tasks(last_fetched_map: dict) -> list[dict]:
    """Build and sort the full list of fetch tasks, oldest-first."""
    tasks = []

    def add_task(origin, dest, region_tag, priority_boost=False):
        if origin == dest:
            return
        for month in MONTHS_TO_SCAN:
            key = f"{origin}_{dest}_{month}"
            last_fetched = last_fetched_map.get(key, "2000-01-01 00:00")

            score = last_fetched
            if priority_boost:
                score = "1_" + score
            else:
                score = "2_" + score

            tasks.append({
                "origin": origin,
                "destination": dest,
                "month": month,
                "key": key,
                "score": score,
                "region": region_tag,
            })

    # 1. SEA Routes (all combinations)
    for origin in SEA_AIRPORTS:
        for dest in SEA_AIRPORTS:
            is_popular = (origin, dest) in POPULAR_ROUTES_SET
            add_task(origin, dest, "SEA", priority_boost=is_popular)

    # 2. Full Asia Phase 1 (Only RGN/MDL <-> New Airports)
    for hub in MYANMAR_HUBS:
        for jp in JAPAN_AIRPORTS:
            add_task(hub, jp, "Japan")
            add_task(jp, hub, "Japan")
        for kr in KOREA_AIRPORTS:
            add_task(hub, kr, "Korea")
            add_task(kr, hub, "Korea")
        for ind in INDIA_AIRPORTS:
            add_task(hub, ind, "India")
            add_task(ind, hub, "India")
        for cn in CHINA_AIRPORTS:
            add_task(hub, cn, "China")
            add_task(cn, hub, "China")
        for tw in TAIWAN_AIRPORTS:
            add_task(hub, tw, "Taiwan")
            add_task(tw, hub, "Taiwan")

    # Sort by score ascending (oldest first, priority first)
    tasks.sort(key=lambda x: x["score"])
    return tasks
