"""
Utility to download and cache static TravelPayouts data (airlines, airports, cities).
Allows the bot to resolve IATA codes to full names and provide better UX.
"""
import requests
import json
import os
from pathlib import Path

BASE_DATA_URL = "http://api.travelpayouts.com/data/en/"
CACHE_DIR = Path(__file__).parent / "cache"

FILES_TO_DOWNLOAD = [
    "airlines.json",
    "airports.json",
    "cities.json"
]

def update_static_data():
    """Download and save static data files to local cache."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    for filename in FILES_TO_DOWNLOAD:
        url = f"{BASE_DATA_URL}{filename}"
        print(f"Downloading {url}...")
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            output_path = CACHE_DIR / filename
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ Saved to {output_path} ({len(data)} items)")
            
        except Exception as e:
            print(f"  ✗ Failed to download {filename}: {e}")

if __name__ == "__main__":
    update_static_data()
