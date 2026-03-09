import logging
import time
from typing import List
from datetime import datetime
from dateutil.relativedelta import relativedelta
from .base import BaseProvider
from ..models import FlightDeal, RouteTask, RuntimeConfig

logger = logging.getLogger(__name__)

class AmadeusProvider(BaseProvider):
    def __init__(self, config: RuntimeConfig):
        super().__init__(config)
        self.client = None
        if config.amadeus_id and config.amadeus_secret:
            try:
                from amadeus import Client
                self.client = Client(client_id=config.amadeus_id, client_secret=config.amadeus_secret)
            except ImportError:
                logger.error("Amadeus SDK not installed")

    def fetch_deals(self, task: RouteTask) -> List[FlightDeal]:
        if not self.client:
            return []

        year, mon = map(int, task.month.split("-"))
        sample_dates = [5, 15, 25]
        all_deals = []
        
        now_ts = int(datetime.utcnow().timestamp() * 1000)
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

        for day in sample_dates:
            date_str = f"{year}-{mon:02d}-{day:02d}"
            
            # Basic past date check
            if datetime.strptime(date_str, "%Y-%m-%d") < datetime.now():
                continue

            try:
                response = self.client.shopping.flight_offers_search.get(
                    originLocationCode=task.origin,
                    destinationLocationCode=task.destination,
                    departureDate=date_str,
                    adults=1,
                    currencyCode="USD",
                    max=1
                )
                
                if response.data:
                    offer = response.data[0]
                    price = float(offer["price"]["total"])
                    itinerary = offer["itineraries"][0]
                    segments = itinerary["segments"]
                    
                    deal = FlightDeal(
                        origin=task.origin,
                        destination=task.destination,
                        price=price,
                        date=date_str,
                        airline_code=segments[0]["carrierCode"],
                        transfers=len(segments) - 1,
                        flight_num=segments[0]["number"],
                        found_at=now_str,
                        fetchedAt=now_ts,
                        provider="amadeus",
                        is_amadeus=True
                    )
                    all_deals.append(deal)
                    
                    # Interpolation logic (±2 days to keep it simple)
                    for offset in [-2, -1, 1, 2]:
                        nearby = datetime.strptime(date_str, "%Y-%m-%d") + relativedelta(days=offset)
                        if nearby.month != mon: continue
                        
                        nearby_str = nearby.strftime("%Y-%m-%d")
                        est_price = round(price * (1 + (abs(offset) * 0.02)), 2)
                        
                        all_deals.append(FlightDeal(
                            origin=task.origin,
                            destination=task.destination,
                            price=est_price,
                            date=nearby_str,
                            airline_code=deal.airline_code,
                            transfers=deal.transfers,
                            flight_num=deal.flight_num,
                            found_at=now_str,
                            fetchedAt=now_ts,
                            provider="amadeus",
                            is_amadeus=True,
                            is_estimated=True
                        ))
                
                time.sleep(0.5) # Throttle

            except Exception as e:
                logger.warning(f"Amadeus failed for date {date_str}: {e}")
                
        return all_deals
