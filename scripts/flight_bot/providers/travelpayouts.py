import logging
import requests
import json
from typing import List
from datetime import datetime
from .base import BaseProvider
from ..models import FlightDeal, RouteTask, RuntimeConfig

logger = logging.getLogger(__name__)

class TravelPayoutsProvider(BaseProvider):
    V3_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"

    def fetch_deals(self, task: RouteTask) -> List[FlightDeal]:
        params = {
            "token": self.config.tp_token,
            "origin": task.origin,
            "destination": task.destination,
            "departure_at": task.month,
            "sorting": "price",
            "limit": "30",
            "market": "th",
            "currency": "USD",
        }

        try:
            response = requests.get(self.V3_URL, params=params, timeout=15)
            if response.status_code == 429:
                logger.warning(f"TravelPayouts rate limited. Task: {task.origin}->{task.destination}")
                return []
            
            if response.status_code >= 400:
                logger.error(f"TravelPayouts error {response.status_code}")
                return []

            data = response.json()
            items = data.get("data", [])
            
            deals = []
            now_ts = int(datetime.utcnow().timestamp() * 1000)
            now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

            for item in items:
                deals.append(FlightDeal(
                    origin=task.origin,
                    destination=task.destination,
                    price=float(item["price"]),
                    date=item["departure_at"].split("T")[0],
                    airline_code=item["airline"],
                    transfers=item["transfers"],
                    flight_num=str(item.get("flight_number", "")),
                    found_at=now_str,
                    fetchedAt=now_ts,
                    provider="tp"
                ))
            
            return deals

        except Exception as e:
            logger.error(f"TravelPayouts fetch failed: {e}")
            return []
