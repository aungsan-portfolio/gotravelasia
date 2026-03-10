import json
import logging
import os
from pathlib import Path
from typing import List, Dict
from datetime import datetime

from .config import (
    SEA_AIRPORTS, JAPAN_AIRPORTS, KOREA_AIRPORTS,
    INDIA_AIRPORTS, CHINA_AIRPORTS, TAIWAN_AIRPORTS,
    MYANMAR_HUBS, MAJOR_ASIAN_HUBS, POPULAR_ROUTES_SET, MONTHS_TO_SCAN, UAE_AIRPORTS
)
from .models import RouteTask, CheckpointState

logger = logging.getLogger(__name__)

CHECKPOINT_PATH = Path("scripts/flight_bot/.checkpoint.json")

def generate_tasks(last_fetched_map: Dict[str, str]) -> List[RouteTask]:
    """Build and sort the full list of fetch tasks, oldest-first."""
    tasks = []

    def add_task(origin, dest, region_tag):
        if origin == dest:
            return
        for month in MONTHS_TO_SCAN:
            key = f"{origin}_{dest}_{month}"
            # business key for last_fetched check
            last_fetched = last_fetched_map.get(key, "2000-01-01 00:00")

            # Tiered priority logic (0 represents highest priority)
            if (origin, dest) in POPULAR_ROUTES_SET:
                priority = 0
            elif origin in MYANMAR_HUBS or dest in MYANMAR_HUBS:
                priority = 1  # Tier 1: Myanmar hubs to anywhere
            elif origin in MAJOR_ASIAN_HUBS or dest in MAJOR_ASIAN_HUBS:
                priority = 2  # Tier 2: Major SEA hubs to anywhere
            else:
                priority = 3  # Tier 3: Rest of SEA intra-region

            tasks.append(RouteTask(
                origin=origin,
                destination=dest,
                month=month,
                region=region_tag,
                priority=priority,
                last_fetched_at=last_fetched
            ))

    # 1. Tier 3 & Intra-SEA Routes (prioritized based on Tier logic during insertion)
    for origin in SEA_AIRPORTS:
        for dest in SEA_AIRPORTS:
            add_task(origin, dest, "SEA")

    # Helper for adding hub connections to rest of Asia
    def add_hub_connections(hubs_list):
        for hub in hubs_list:
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
            for uae in UAE_AIRPORTS:
                add_task(hub, uae, "UAE")
                add_task(uae, hub, "UAE")

    # 2. Tier 1: Myanmar Hubs <-> Rest of Asia
    add_hub_connections(MYANMAR_HUBS)
    
    # 3. Tier 2: Major Asian Hubs <-> Rest of Asia
    add_hub_connections(MAJOR_ASIAN_HUBS)

    # Sort: Priority first (1 before 2), then last_fetched_at (oldest first)
    tasks.sort(key=lambda x: (x.priority, x.last_fetched_at))
    return tasks

def load_checkpoint(run_id: str) -> CheckpointState:
    """Load checkpoint from file if it exists, otherwise return fresh state."""
    if CHECKPOINT_PATH.exists():
        try:
            with CHECKPOINT_PATH.open("r", encoding="utf-8") as f:
                data = json.load(f)
                logger.info(f"Loaded existing checkpoint at index {data.get('last_processed_index')}")
                # We reuse the run_id from the file if it's recent (optional policy)
                return CheckpointState(**data)
        except Exception as e:
            logger.error(f"Failed to load checkpoint: {e}")
            
    return CheckpointState(run_id=run_id)

def save_checkpoint_file(state: CheckpointState):
    """Save checkpoint state to file."""
    try:
        state.last_saved_at = datetime.utcnow().isoformat()
        with CHECKPOINT_PATH.open("w", encoding="utf-8") as f:
            json.dump(state.to_dict(), f, indent=2)
    except Exception as e:
        logger.error(f"Failed to save checkpoint: {e}")

def delete_checkpoint():
    """Delete checkpoint file on completion."""
    if CHECKPOINT_PATH.exists():
        CHECKPOINT_PATH.unlink()
