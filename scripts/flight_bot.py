import os
import json
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load env vars
load_dotenv('.env.local')

class FlightBot:
    def __init__(self):
        self.token = os.getenv("TRAVELPAYOUTS_TOKEN")
        if not self.token:
            logger.warning("TRAVELPAYOUTS_TOKEN not found in environment!")
            # Fallback or exit if necessary, though we can still try API without token sometimes,
            # but Travelpayouts cheap prices API usually requires a token for reliable data.
        
        self.api_url = "https://api.travelpayouts.com/v1/prices/cheap"
        
        # Primary origins
        self.origins = ["RGN", "MDL"]
        
        # Destinations
        self.destinations = [
            "BKK", "DMK", "CNX", "HKT", # Thailand
            "KUL",                      # Malaysia
            "SIN",                      # Singapore
            "SGN", "HAN",               # Vietnam
            "PNH", "REP",               # Cambodia
            "CGK", "DPS",               # Indonesia
            "MNL"                       # Philippines
        ]
        
        # Also check reverse routes from major hubs to Myanmar
        self.reverse_destinations = ["BKK", "DMK", "CNX", "KUL", "SIN"]
        
        self.results = []
        self.errors = 0
        
        # To match the structure found in client/public/data/flight_data.json
        # "airline_code", "airline", "date", "transfers", "flight_num", "found_at"

    def fetch_cheap_prices(self, origin, destination):
        params = {
            "origin": origin,
            "destination": destination,
            "currency": "USD",
            "page": 1,
            "limit": 5
        }
        
        headers = {}
        if self.token:
            headers["x-access-token"] = self.token
            
        try:
            response = requests.get(self.api_url, params=params, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            if data.get("success") and data.get("data"):
                route_data = data["data"].get(destination, {})
                for flight_id, flight_info in route_data.items():
                    # Parse interesting fields
                    price = flight_info.get("price")
                    departure_at = flight_info.get("departure_at") # "2026-03-12T10:00:00Z"
                    airline = flight_info.get("airline")
                    flight_num = str(flight_info.get("flight_number", ""))
                    
                    if not price or not departure_at:
                        continue
                        
                    # Extract date
                    date_only = departure_at.split("T")[0]
                    
                    self.results.append({
                        "origin": origin,
                        "destination": destination,
                        "price": float(price),
                        "currency": "USD",
                        "airline_code": airline,
                        "airline": airline,  # Can consider mapping this if needed
                        "date": date_only,
                        "transfers": 0, # Travelpayouts API doesn't specify transfers simply in this endpoint, assuming direct or cheap
                        "flight_num": flight_num,
                        "found_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
                    })
                    
                logger.info(f"Found {len(route_data)} deals for {origin} -> {destination}")
            else:
                logger.info(f"No deals found for {origin} -> {destination}")
                
        except Exception as e:
            logger.error(f"Error fetching {origin} -> {destination}: {str(e)}")
            self.errors += 1

    def run(self):
        logger.info("Starting flight price check...")
        
        # Check from Myanmar
        for origin in self.origins:
            for dest in self.destinations:
                self.fetch_cheap_prices(origin, dest)
                
        # Check reverse to Myanmar
        for dest in self.origins:
            for origin in self.reverse_destinations:
                self.fetch_cheap_prices(origin, dest)
                
        # Sort results by price
        self.results.sort(key=lambda x: x["price"])
        
        self.save_results()

    def save_results(self):
        filepath = os.path.join("client", "public", "data", "flight_data.json")
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        if not self.results:
            logger.warning("No results to save.")
            # We will still save to not break UI, maybe keep old file if we don't want to overwrite with empty
            return
            
        overall_cheapest = self.results[0] if self.results else None
        
        output = {
            "meta": {
                "updated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                "currency": "USD",
                "direct_only": True,
                "total_routes_scanned": len(self.origins) * len(self.destinations) + len(self.reverse_destinations) * len(self.origins),
                "total_deals_found": len(self.results),
                "errors": self.errors,
                "overall_cheapest": overall_cheapest
            },
            "routes": self.results
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)
            
        logger.info(f"Saved {len(self.results)} flights to {filepath}")


if __name__ == "__main__":
    bot = FlightBot()
    bot.run()
