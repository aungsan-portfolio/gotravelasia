import os
import json
import logging
import time
from datetime import datetime, timezone
from typing import Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

load_dotenv(".env.local")

REQUEST_TIMEOUT = 10
THROTTLE_DELAY = 0.5
MAX_RETRIES = 3
BACKOFF_FACTOR = 1.0
RETRY_STATUS_CODES = (429, 500, 502, 503, 504)
OUTPUT_PATH = os.path.join("client", "public", "data", "flight_data.json")

ORIGINS = ["RGN", "MDL"]
DESTINATIONS = [
    "BKK", "DMK", "CNX", "HKT",
    "KUL",
    "SIN",
    "SGN", "HAN",
    "PNH", "REP",
    "CGK", "DPS",
    "MNL",
]
REVERSE_ORIGINS = ["BKK", "DMK", "CNX", "KUL", "SIN"]


def _build_session() -> requests.Session:
    session = requests.Session()
    retry_strategy = Retry(
        total=MAX_RETRIES,
        backoff_factor=BACKOFF_FACTOR,
        status_forcelist=RETRY_STATUS_CODES,
        allowed_methods=["GET"],
        respect_retry_after_header=True,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _parse_date(departure_at: str) -> Optional[str]:
    if not departure_at:
        return None
    if "T" in departure_at:
        return departure_at.split("T")[0]
    try:
        datetime.strptime(departure_at[:10], "%Y-%m-%d")
        return departure_at[:10]
    except (ValueError, IndexError):
        logger.warning("Unexpected date format: %s", departure_at)
        return None


class FlightBot:
    API_URL = "https://api.travelpayouts.com/v1/prices/cheap"

    def __init__(self) -> None:
        self.token: Optional[str] = os.getenv("TRAVELPAYOUTS_TOKEN")
        if not self.token:
            logger.warning("TRAVELPAYOUTS_TOKEN not found in environment!")

        self.session = _build_session()
        if self.token:
            self.session.headers["x-access-token"] = self.token

        self.results: list[dict] = []
        self.errors: int = 0
        self.requests_made: int = 0

    def fetch_cheap_prices(self, origin: str, destination: str) -> None:
        params = {
            "origin": origin,
            "destination": destination,
            "currency": "USD",
            "page": 1,
            "limit": 5,
        }

        try:
            response = self.session.get(
                self.API_URL, params=params, timeout=REQUEST_TIMEOUT
            )
            self.requests_made += 1

            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "60")
                wait = int(retry_after) if retry_after.isdigit() else 60
                logger.warning(
                    "Rate limited on %s -> %s. Waiting %ds...",
                    origin, destination, wait,
                )
                time.sleep(wait)
                self.errors += 1
                return

            if response.status_code >= 400:
                logger.error(
                    "HTTP %d for %s -> %s: %s",
                    response.status_code, origin, destination,
                    response.text[:300],
                )
                self.errors += 1
                return

            data = response.json()

            if not data.get("success") or not data.get("data"):
                logger.info("No deals found for %s -> %s", origin, destination)
                return

            route_data = data["data"].get(destination, {})
            count = 0

            for _flight_id, flight_info in route_data.items():
                price = flight_info.get("price")
                departure_at = flight_info.get("departure_at", "")
                airline = flight_info.get("airline")
                flight_num = str(flight_info.get("flight_number", ""))
                transfers = flight_info.get("number_of_changes", 0)

                if price is None or price < 0:
                    logger.warning(
                        "Skipping invalid price (%s) for %s -> %s",
                        price, origin, destination,
                    )
                    continue

                date_only = _parse_date(departure_at)
                if not date_only:
                    logger.warning(
                        "Skipping deal with bad date (%s) for %s -> %s",
                        departure_at, origin, destination,
                    )
                    continue

                if not airline:
                    logger.warning(
                        "Missing airline for %s -> %s (price $%.0f), skipping",
                        origin, destination, price,
                    )
                    continue

                self.results.append({
                    "origin": origin,
                    "destination": destination,
                    "price": float(price),
                    "currency": "USD",
                    "airline_code": airline,
                    "airline": airline,
                    "date": date_only,
                    "transfers": int(transfers) if transfers else 0,
                    "flight_num": flight_num,
                    "found_at": _now_utc().strftime("%Y-%m-%d %H:%M"),
                })
                count += 1

            logger.info(
                "Found %d deals for %s -> %s", count, origin, destination
            )

        except requests.exceptions.Timeout:
            logger.error(
                "Timeout after %ds for %s -> %s",
                REQUEST_TIMEOUT, origin, destination,
            )
            self.errors += 1
        except requests.exceptions.ConnectionError as exc:
            logger.error(
                "Connection error for %s -> %s: %s",
                origin, destination, exc,
            )
            self.errors += 1
        except requests.exceptions.RequestException as exc:
            logger.error(
                "Request failed for %s -> %s: %s",
                origin, destination, exc,
            )
            self.errors += 1
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error(
                "Bad response body for %s -> %s: %s",
                origin, destination, exc,
            )
            self.errors += 1

    def run(self) -> None:
        start_time = time.monotonic()
        logger.info("=" * 60)
        logger.info("Flight price check starting")
        logger.info("Origins: %s | Destinations: %d | Reverse origins: %d",
                     ORIGINS, len(DESTINATIONS), len(REVERSE_ORIGINS))
        logger.info("=" * 60)

        route_pairs: list[tuple[str, str]] = []
        for origin in ORIGINS:
            for dest in DESTINATIONS:
                route_pairs.append((origin, dest))
        for reverse_origin in REVERSE_ORIGINS:
            for dest in ORIGINS:
                route_pairs.append((reverse_origin, dest))

        total_routes = len(route_pairs)
        for i, (origin, dest) in enumerate(route_pairs, 1):
            logger.info("[%d/%d] Checking %s -> %s", i, total_routes, origin, dest)
            self.fetch_cheap_prices(origin, dest)
            if i < total_routes:
                time.sleep(THROTTLE_DELAY)

        self.results.sort(key=lambda x: x["price"])
        self.save_results()

        elapsed = time.monotonic() - start_time
        logger.info("=" * 60)
        logger.info("RUN SUMMARY")
        logger.info("  Routes scanned : %d", total_routes)
        logger.info("  HTTP requests  : %d", self.requests_made)
        logger.info("  Deals found    : %d", len(self.results))
        logger.info("  Errors         : %d", self.errors)
        logger.info("  Duration       : %.1fs", elapsed)
        if self.results:
            cheapest = self.results[0]
            logger.info(
                "  Cheapest deal  : %s -> %s $%.0f (%s)",
                cheapest["origin"], cheapest["destination"],
                cheapest["price"], cheapest["airline"],
            )
        logger.info("=" * 60)

    def save_results(self) -> None:
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

        now_str = _now_utc().strftime("%Y-%m-%d %H:%M")
        total_routes_scanned = (
            len(ORIGINS) * len(DESTINATIONS)
            + len(REVERSE_ORIGINS) * len(ORIGINS)
        )

        overall_cheapest = self.results[0] if self.results else None

        output: dict = {
            "meta": {
                "updated_at": now_str,
                "currency": "USD",
                "direct_only": True,
                "total_routes_scanned": total_routes_scanned,
                "total_deals_found": len(self.results),
                "errors": self.errors,
                "overall_cheapest": overall_cheapest,
            },
            "routes": self.results,
        }

        if not self.results:
            logger.warning(
                "No deals found this run. Saving empty results with timestamp "
                "so frontend knows data is current."
            )

        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)

        logger.info("Saved %d flights to %s", len(self.results), OUTPUT_PATH)


if __name__ == "__main__":
    bot = FlightBot()
    bot.run()
