"""
API call logic — TravelPayouts V1 (cheap prices) and V3 (prices_for_dates).
"""
import json
import logging
import time
from datetime import datetime

import requests
from dateutil.relativedelta import relativedelta

from .config import REQUEST_TIMEOUT, MIN_PRICE_USD, MAX_PRICE_USD
from .models import now_utc, parse_date

logger = logging.getLogger(__name__)

API_V1_URL = "https://api.travelpayouts.com/v1/prices/cheap"
API_V3_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"


def _build_route_dict(origin, destination, price, airline, date_only,
                      transfers, flight_num, region, now_ts):
    """Build a standardised route dict (shared by V1 and V3)."""
    return {
        "origin": origin,
        "destination": destination,
        "price": float(price),
        "currency": "USD",
        "airline_code": airline,
        "airline": airline,
        "date": date_only,
        "transfers": int(transfers) if transfers else 0,
        "flight_num": flight_num,
        "region": region,
        "found_at": now_utc().strftime("%Y-%m-%d %H:%M"),
        "fetchedAt": now_ts,
    }


def fetch_prices_v3(session: requests.Session, token: str,
                    origin: str, destination: str,
                    month: str, region: str, new_routes: list,
                    counter: dict) -> bool:
    """Fetch from V3 /prices_for_dates. Returns True on success."""
    params = {
        "token": token or "",
        "origin": origin,
        "destination": destination,
        "departure_at": month,
        "sorting": "price",
        "limit": "30",
        "one_way": "true",
        "direct": "true", # Enforce direct flights for better quality Yangon/Asia data
        "currency": "USD",
    }

    try:
        response = session.get(API_V3_URL, params=params, timeout=REQUEST_TIMEOUT)
        counter["requests"] += 1

        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After", "60")
            wait = int(retry_after) if retry_after.isdigit() else 60
            logger.warning("v3 Rate limited. Waiting %ds...", wait)
            time.sleep(wait)
            counter["errors"] += 1
            return False

        if response.status_code >= 400:
            logger.debug("v3 HTTP %d for %s -> %s %s", response.status_code, origin, destination, month)
            return False

        data = response.json()
        arr = data.get("data", [])
        if not isinstance(arr, list):
            return True

        count = 0
        now_ts = int(now_utc().timestamp() * 1000)

        for e in arr:
            price = e.get("price")
            departure_at = e.get("departure_at", "")
            airline = e.get("airline", "")
            flight_num = str(e.get("flight_number", ""))
            transfers = e.get("transfers", 0)

            if not price or not (MIN_PRICE_USD <= price <= MAX_PRICE_USD) or not airline:
                continue

            date_only = parse_date(departure_at)
            if not date_only or not date_only.startswith(month):
                continue

            new_routes.append(
                _build_route_dict(origin, destination, price, airline,
                                  date_only, transfers, flight_num, region, now_ts)
            )
            count += 1

        if count > 0:
            logger.info("v3: Found %d deals for %s -> %s (%s)", count, origin, destination, month)
        return True

    except requests.exceptions.Timeout:
        logger.warning("v3 Timeout: %s->%s", origin, destination)
        counter["errors"] += 1
    except requests.exceptions.RequestException as exc:
        logger.warning("v3 Request failed: %s->%s: %s", origin, destination, exc)
        counter["errors"] += 1
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("v3 Bad JSON: %s->%s: %s", origin, destination, exc)
        counter["errors"] += 1
    return False


def fetch_amadeus(amadeus_client, origin: str, destination: str,
                  month: str, region: str, new_routes: list,
                  counter: dict) -> bool:
    """Fetch from Amadeus Flight Offers Search for 3 sample dates in the month."""
    if not amadeus_client:
        return False
        
    try:
        from amadeus import ResponseError
    except ImportError:
        logger.error("Amadeus SDK not installed")
        return False

    year_str, month_str = month.split("-")
    year, mon = int(year_str), int(month_str)
    
    # We sample 3 dates per month (5th, 15th, 25th)
    sample_dates = [5, 15, 25]
    sample_prices = []
    
    for day in sample_dates:
        date_str = f"{year}-{mon:02d}-{day:02d}"
        
        # Don't search raw dates in the past
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        if date_obj.timestamp() < time.time() + 86400: # Needs 1 day buffer
            continue
            
        try:
            response = amadeus_client.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
                departureDate=date_str,
                adults=1,
                currencyCode="USD",
                max=5
            )
            counter["requests"] += 1
            
            # Find cheapest flight
            best_offer = None
            best_price = float('inf')
            
            if hasattr(response, 'data') and response.data:
                for offer in response.data:
                    price_val = float(offer.get("price", {}).get("total", 0))
                    if price_val > 0 and price_val < best_price:
                        best_price = price_val
                        best_offer = offer
            
            if best_offer:
                itineraries = best_offer.get("itineraries", [])
                if itineraries:
                    segments = itineraries[0].get("segments", [])
                    transfers = max(0, len(segments) - 1)
                    
                    # Extract airline code
                    airline = ""
                    flight_num = ""
                    if segments:
                        airline = segments[0].get("carrierCode", "")
                        flight_num = segments[0].get("number", "")
                    
                    sample_prices.append({
                        "date": date_str,
                        "price": best_price,
                        "airline": airline,
                        "transfers": transfers,
                        "flight_num": flight_num
                    })
                    
        except ResponseError as error:
            logger.warning(f"Amadeus error for {origin}->{destination} on {date_str}: {error}")
            counter["errors"] += 1
            continue
        except Exception as exc:
            logger.error(f"Unexpected Amadeus error: {exc}")
            counter["errors"] += 1
            continue
            
    if not sample_prices:
        return False
        
    now_ts = int(now_utc().timestamp() * 1000)
    result_map = {}
    
    # 1. Add real sample dates
    for sp in sample_prices:
        result_map[sp["date"]] = {
            "origin": origin,
            "destination": destination,
            "price": sp["price"],
            "currency": "USD",
            "airline_code": sp["airline"],
            "airline": sp["airline"],
            "date": sp["date"],
            "transfers": sp["transfers"],
            "flight_num": sp["flight_num"],
            "region": region,
            "found_at": now_utc().strftime("%Y-%m-%d %H:%M"),
            "fetchedAt": now_ts,
            "is_amadeus": True,
            "is_estimated_amadeus": False
        }
        
    # 2. Interpolate nearby dates (±3 days)
    for sp in sample_prices:
        sp_date = datetime.strptime(sp["date"], "%Y-%m-%d")
        
        for offset in range(-3, 4):
            if offset == 0:
                continue
                
            nearby = sp_date + relativedelta(days=offset)
            if nearby.month != mon or nearby.year != year:
                continue
                
            nearby_str = nearby.strftime("%Y-%m-%d")
            
            # Don't overwrite real data or better estimates
            existing = result_map.get(nearby_str)
            if existing and not existing.get("is_estimated_amadeus"):
                continue
                
            # Add slight price variance (±2%)
            variance = 1.0 + (abs(offset) * 0.02) * (1 if offset > 0 else -1)
            est_price = round(sp["price"] * variance, 2)
            
            result_map[nearby_str] = {
                "origin": origin,
                "destination": destination,
                "price": est_price,
                "currency": "USD",
                "airline_code": sp["airline"],
                "airline": sp["airline"],
                "date": nearby_str,
                "transfers": sp["transfers"],
                "flight_num": sp["flight_num"],
                "region": region,
                "found_at": now_utc().strftime("%Y-%m-%d %H:%M"),
                "fetchedAt": now_ts,
                "is_amadeus": True,
                "is_estimated_amadeus": True
            }
            
    for deal in result_map.values():
        new_routes.append(deal)
        
    logger.info(f"Amadeus: Added {len(result_map)} dates for {origin}->{destination} ({month})")
    return True
