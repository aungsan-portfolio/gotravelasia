"""
API call logic — TravelPayouts V1 (cheap prices) and V3 (prices_for_dates).
"""
import json
import logging
import time

import requests

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


def fetch_prices_v1(session: requests.Session, origin: str, destination: str,
                    month: str, region: str, new_routes: list,
                    counter: dict) -> bool:
    """Fetch from V1 /prices/cheap. Returns True on success."""
    params = {
        "origin": origin,
        "destination": destination,
        "depart_date": month,
        "currency": "USD",
        "page": 1,
        "limit": 100,
    }

    try:
        response = session.get(API_V1_URL, params=params, timeout=REQUEST_TIMEOUT)
        counter["requests"] += 1

        if response.status_code == 429:
            retry_after = response.headers.get("Retry-After", "60")
            wait = int(retry_after) if retry_after.isdigit() else 60
            logger.warning("Rate limited. Waiting %ds...", wait)
            time.sleep(wait)
            counter["errors"] += 1
            return False

        if response.status_code >= 400:
            logger.error(
                "HTTP %d for %s -> %s %s: %s",
                response.status_code, origin, destination, month,
                response.text[:300],
            )
            counter["errors"] += 1
            return False

        data = response.json()

        if not data.get("success"):
            logger.warning("API returned success=false for %s->%s %s", origin, destination, month)
            return False

        if not data.get("data"):
            logger.debug("No deals found for %s -> %s (%s)", origin, destination, month)
            return True

        route_data = data["data"].get(destination, {})
        count = 0
        now_ts = int(now_utc().timestamp() * 1000)

        for _flight_id, flight_info in route_data.items():
            price = flight_info.get("price")
            departure_at = flight_info.get("departure_at", "")
            airline = flight_info.get("airline")
            flight_num = str(flight_info.get("flight_number", ""))
            transfers = flight_info.get("number_of_changes", 0)

            if not price or not (MIN_PRICE_USD <= price <= MAX_PRICE_USD):
                continue

            date_only = parse_date(departure_at)
            if not date_only:
                continue

            if not date_only.startswith(month):
                continue

            if not airline:
                continue

            new_routes.append(
                _build_route_dict(origin, destination, price, airline,
                                  date_only, transfers, flight_num, region, now_ts)
            )
            count += 1

        if count > 0:
            logger.info("Found %d deals for %s -> %s (%s)", count, origin, destination, month)
        return True

    except requests.exceptions.Timeout:
        logger.error("Timeout after %ds", REQUEST_TIMEOUT)
        counter["errors"] += 1
    except requests.exceptions.ConnectionError as exc:
        logger.error("Connection error: %s", exc)
        counter["errors"] += 1
    except requests.exceptions.RequestException as exc:
        logger.error("Request failed: %s", exc)
        counter["errors"] += 1
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Bad response body: %s", exc)
        counter["errors"] += 1

    return False


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
