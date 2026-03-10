"""
Fetcher module — provides both legacy function API (for bot.py) and modern class API.
"""
import logging
from typing import List
from .models import FlightDeal, RouteTask, RuntimeConfig
from .providers.travelpayouts import TravelPayoutsProvider
from .providers.amadeus import AmadeusProvider

logger = logging.getLogger(__name__)


class FetchManager:
    """Manages multi-provider flight data fetching."""

    def __init__(self, config: RuntimeConfig):
        self.config = config
        self.providers = [
            TravelPayoutsProvider(config)
        ]
        
        # Add Amadeus only if credentials exist
        if config.amadeus_id:
            self.providers.append(AmadeusProvider(config))

    def fetch_all(self, task: RouteTask) -> List[FlightDeal]:
        """Fetch from all enabled providers for a given task."""
        all_results = []
        
        for provider in self.providers:
            try:
                results = provider.fetch_deals(task)
                if results:
                    all_results.extend(results)
                    logger.debug(f"{provider.name} found {len(results)} deals for {task.origin}->{task.destination}")
            except Exception as e:
                logger.error(f"Provider {provider.name} failed for task {task.origin}->{task.destination}: {e}")
        
        return all_results


# ════════════════════════════════════════════════════════════════
# Legacy function-based API (used by bot.py)
# ════════════════════════════════════════════════════════════════

def fetch_prices_v3(session, token, origin, destination, month, region, new_routes, counter):
    """Legacy wrapper: Fetch prices from TravelPayouts V3 API."""
    import requests
    from datetime import datetime

    url = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"
    params = {
        "token": token,
        "origin": origin,
        "destination": destination,
        "departure_at": month,
        "sorting": "price",
        "limit": "30",
        "market": "th",
        "currency": "USD",
    }

    try:
        counter["requests"] += 1
        resp = session.get(url, params=params, timeout=15)

        if resp.status_code == 429:
            logger.warning(f"TravelPayouts rate limited: {origin}->{destination}")
            counter["errors"] += 1
            return
        
        if resp.status_code >= 400:
            logger.error(f"TravelPayouts error {resp.status_code}: {origin}->{destination}")
            counter["errors"] += 1
            return

        data = resp.json()
        items = data.get("data", [])

        now_ts = int(datetime.utcnow().timestamp() * 1000)
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

        for item in items:
            new_routes.append({
                "origin": origin,
                "destination": destination,
                "price": float(item["price"]),
                "date": item["departure_at"].split("T")[0],
                "airline": item.get("airline", ""),
                "airline_code": item.get("airline", ""),
                "transfers": item.get("transfers", 0),
                "flight_number": str(item.get("flight_number", "")),
                "found_at": now_str,
                "fetchedAt": now_ts,
                "provider": "tp",
                "region": region,
            })

        if items:
            logger.info(f"  ✓ {origin}->{destination} ({month}): {len(items)} deals found")

    except Exception as e:
        logger.error(f"TravelPayouts fetch failed {origin}->{destination}: {e}")
        counter["errors"] += 1


def fetch_amadeus(amadeus_client, origin, destination, month, region, new_routes, counter):
    """Legacy wrapper: Fetch prices from Amadeus API."""
    import time
    from datetime import datetime
    from dateutil.relativedelta import relativedelta

    if not amadeus_client:
        return

    year, mon = map(int, month.split("-"))
    sample_dates = [5, 15, 25]

    now_ts = int(datetime.utcnow().timestamp() * 1000)
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

    for day in sample_dates:
        date_str = f"{year}-{mon:02d}-{day:02d}"

        # Skip past dates
        if datetime.strptime(date_str, "%Y-%m-%d") < datetime.now():
            continue

        try:
            counter["requests"] += 1
            response = amadeus_client.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
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

                carrier = segments[0]["carrierCode"]
                flight_num = segments[0]["number"]
                transfers = len(segments) - 1

                new_routes.append({
                    "origin": origin,
                    "destination": destination,
                    "price": price,
                    "date": date_str,
                    "airline": carrier,
                    "airline_code": carrier,
                    "transfers": transfers,
                    "flight_number": flight_num,
                    "found_at": now_str,
                    "fetchedAt": now_ts,
                    "provider": "amadeus",
                    "is_amadeus": True,
                    "region": region,
                })

                # Interpolation (±2 days)
                for offset in [-2, -1, 1, 2]:
                    nearby = datetime.strptime(date_str, "%Y-%m-%d") + relativedelta(days=offset)
                    if nearby.month != mon:
                        continue
                    nearby_str = nearby.strftime("%Y-%m-%d")
                    est_price = round(price * (1 + (abs(offset) * 0.02)), 2)

                    new_routes.append({
                        "origin": origin,
                        "destination": destination,
                        "price": est_price,
                        "date": nearby_str,
                        "airline": carrier,
                        "airline_code": carrier,
                        "transfers": transfers,
                        "flight_number": flight_num,
                        "found_at": now_str,
                        "fetchedAt": now_ts,
                        "provider": "amadeus",
                        "is_amadeus": True,
                        "is_estimated": True,
                        "region": region,
                    })

                logger.info(f"  ✓ [Amadeus] {origin}->{destination} ({date_str}): ${price}")

            time.sleep(0.5)  # Throttle

        except Exception as e:
            logger.warning(f"Amadeus failed {origin}->{destination} ({date_str}): {e}")
            counter["errors"] += 1
