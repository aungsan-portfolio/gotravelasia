import logging
import json
import os
from typing import List, Dict
from datetime import datetime
from pathlib import Path

from .models import FlightDeal
from .config import OUTPUT_PATH

logger = logging.getLogger(__name__)

def load_existing_data() -> Dict:
    """Load existing flight_data.json or return empty structure."""
    path = Path(OUTPUT_PATH)
    if path.exists():
        try:
            with path.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load existing data from {OUTPUT_PATH}: {e}")
    return {"meta": {}, "routes": []}

def merge_incremental(existing_deals: List[FlightDeal], new_deals: List[FlightDeal]) -> List[FlightDeal]:
    """
    Merge new deals into existing deals using the Idempotency/Business Key policy.
    Rules:
    1. Drop past dates.
    2. Group by (origin, destination, date, airline_code).
    3. Keep cheapest price.
    4. If prices are equal, prioritize Amadeus for richer metadata.
    """
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    # Store by business key
    merged_map: Dict[str, FlightDeal] = {}
    
    # 1. Process Existing (Filter out old flights)
    for deal in existing_deals:
        if deal.date < today_str:
            continue
        merged_map[deal.get_idempotency_key()] = deal
        
    # 2. Process New
    for new_deal in new_deals:
        if new_deal.date < today_str:
            continue
            
        key = new_deal.get_idempotency_key()
        existing = merged_map.get(key)
        
        if not existing:
            merged_map[key] = new_deal
            continue
            
        # Comparison logic
        # Rule: Keep cheapest
        if new_deal.price < existing.price:
            merged_map[key] = new_deal
        elif new_deal.price == existing.price:
            # Tie-break: Prioritize Amadeus metadata
            if new_deal.is_amadeus and not existing.is_amadeus:
                merged_map[key] = new_deal
            # Or prioritize real data over estimated
            elif not new_deal.is_estimated and existing.is_estimated:
                merged_map[key] = new_deal
                
    return list(merged_map.values())
