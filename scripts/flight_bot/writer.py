import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any
from .models import FlightDeal

logger = logging.getLogger(__name__)

def write_atomic_json(path: Path, data: Any):
    """
    Writes data to a temporary file, flushes, fsyncs, and then renames it 
    to the target path to ensure an atomic and durable write.
    """
    temp_path = path.with_suffix(".json.tmp")
    
    # Ensure parent directory exists
    path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with temp_path.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.flush()
            os.fsync(f.fileno()) # Force write to physical disk
            
        # Atomic rename (on POSIX, and usually on Windows if target doesn't exist or using replace)
        temp_path.replace(path)
    except Exception as e:
        logger.error(f"Failed to write atomic JSON to {path}: {e}")
        if temp_path.exists():
            temp_path.unlink()
        raise

def finalize_outputs(deals: List[FlightDeal], flight_data_path: Path, transport_data_path: Path):
    """
    Validates deals, generates transport records, and writes final production JSONs.
    """
    # 1. Prepare flight_data.json
    # Sort deals by origin, destination, then price for consistency
    sorted_deals = sorted(
        [d.to_dict() for d in deals],
        key=lambda x: (x['origin'], x['destination'], x['price'])
    )
    
    flight_output = {
        "meta": {
            "updated_at": deals[0].found_at if deals else "",
            "count": len(deals),
            "currency": "USD"
        },
        "routes": sorted_deals
    }
    
    # 2. Prepare transport.json
    transport_output = []
    for d in deals:
        transport_output.append({
            "id": f"flight-{d.origin}-{d.destination}-{d.date}-{d.airline_code}",
            "type": "flight",
            "origin": d.origin,
            "destination": d.destination,
            "price": d.price,
            "currency": "USD",
            "provider": d.provider,
            "updated_at": d.found_at
        })

    # 3. Write files atomically
    write_atomic_json(flight_data_path, flight_output)
    write_atomic_json(transport_data_path, transport_output)
    
    logger.info(f"Successfully finalized outputs: {len(deals)} records written.")
