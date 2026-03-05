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
THROTTLE_DELAY = 0.5  # 0.5s between requests (safe for 200/min API limit)
MAX_RETRIES = 3
BACKOFF_FACTOR = 1.0
RETRY_STATUS_CODES = (429, 500, 502, 503, 504)
OUTPUT_PATH = os.path.join("client", "public", "data", "flight_data.json")

# Southeast Asia main airports
SEA_AIRPORTS = [
    "RGN", "MDL", "BKK", "SIN", "KUL", "CNX", "HKT",
    "SGN", "HAN", "DAD", "CGK", "DPS", "MNL", "CEB", "BKI", "BWN"
]

# Full Asia (Phase 1)
JAPAN_AIRPORTS = ["NRT", "KIX"]
KOREA_AIRPORTS = ["ICN", "CJU"]
INDIA_AIRPORTS = ["DEL", "CCU"]
CHINA_AIRPORTS = ["PEK", "PVG", "CAN", "CTU", "HKG", "MFM"]
TAIWAN_AIRPORTS = ["TPE"]

MYANMAR_HUBS = ["RGN", "MDL"]

# Popular routes get a priority boost
POPULAR_ROUTES = [
    ("RGN", "BKK"), ("BKK", "RGN"),
    ("MDL", "BKK"), ("BKK", "MDL"),
    ("RGN", "SIN"), ("SIN", "RGN"),
    ("BKK", "SIN"), ("SIN", "BKK"),
    ("HKT", "SIN"), ("SIN", "HKT"),
    ("CNX", "BKK"), ("BKK", "CNX"),
    ("CNX", "SIN"), ("SIN", "CNX"),
    ("RGN", "KUL"), ("KUL", "RGN"),
    ("CNX", "HKT"), ("HKT", "CNX"),
    ("RGN", "TYO"), ("TYO", "RGN"),
    ("RGN", "SEL"), ("SEL", "RGN"),
]

POPULAR_ROUTES_SET = frozenset(POPULAR_ROUTES)

MONTHS_TO_SCAN = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08"]
MAX_REQUESTS_PER_RUN = 200

MIN_PRICE_USD = 10
MAX_PRICE_USD = 5000


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
    API_V1_URL = "https://api.travelpayouts.com/v1/prices/cheap"
    API_V3_URL = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"

    def __init__(self) -> None:
        self.token: Optional[str] = os.getenv("TRAVELPAYOUTS_TOKEN")
        if not self.token:
            logger.warning("TRAVELPAYOUTS_TOKEN not found in environment!")

        self.session = _build_session()
        if self.token:
            self.session.headers["x-access-token"] = self.token

        self.existing_data = {"meta": {}, "routes": []}
        self.load_existing_data()
        
        # Track when each route-month was last fetched
        self.last_fetched_map = {}
        for r in self.existing_data["routes"]:
            orig = r["origin"]
            dest = r["destination"]
            date_str = r["date"]  # e.g., "2026-03-15"
            month_str = date_str[:7]
            key = f"{orig}_{dest}_{month_str}"
            found_at = r.get("found_at", "2000-01-01 00:00")
            # keep the most recent fetch time
            if key not in self.last_fetched_map or found_at > self.last_fetched_map[key]:
                self.last_fetched_map[key] = found_at

        self.errors: int = 0
        self.requests_made: int = 0
        
        # We will collect new routes here
        self.new_routes = []

    def load_existing_data(self):
        if os.path.exists(OUTPUT_PATH):
            try:
                with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "routes" in data:
                        self.existing_data = data
                        logger.info("Loaded %d existing routes", len(data["routes"]))
            except Exception as e:
                logger.error("Failed to load existing data: %s", e)

    def generate_tasks(self) -> list[dict]:
        tasks = []
        
        def add_task(origin, dest, region_tag, priority_boost=False):
            if origin == dest:
                return
            for month in MONTHS_TO_SCAN:
                key = f"{origin}_{dest}_{month}"
                last_fetched = self.last_fetched_map.get(key, "2000-01-01 00:00")
                
                score = last_fetched
                if priority_boost:
                    score = "1_" + score
                else:
                    score = "2_" + score
                    
                tasks.append({
                    "origin": origin,
                    "destination": dest,
                    "month": month,
                    "key": key,
                    "score": score,
                    "region": region_tag
                })

        # 1. SEA Routes (all combinations)
        for origin in SEA_AIRPORTS:
            for dest in SEA_AIRPORTS:
                is_popular = (origin, dest) in POPULAR_ROUTES_SET
                add_task(origin, dest, "SEA", priority_boost=is_popular)

        # 2. Full Asia Phase 1 (Only RGN/MDL <-> New Airports)
        for hub in MYANMAR_HUBS:
            for jp in JAPAN_AIRPORTS:
                add_task(hub, jp, "Japan")
                add_task(jp, hub, "Japan")
            for kr in KOREA_AIRPORTS:
                add_task(hub, kr, "Korea")
                add_task(kr, hub, "Korea")
            for ind in INDIA_AIRPORTS:
                add_task(hub, ind, "India")
                add_task(ind, hub, "India")
            for cn in CHINA_AIRPORTS:
                add_task(hub, cn, "China")
                add_task(cn, hub, "China")
            for tw in TAIWAN_AIRPORTS:
                add_task(hub, tw, "Taiwan")
                add_task(tw, hub, "Taiwan")
                    
        # Sort by score ascending (oldest first, priority first)
        tasks.sort(key=lambda x: x["score"])
        return tasks

    def fetch_prices_for_month(self, origin: str, destination: str, month: str, region: str) -> bool:
        """Returns True if successful, False if skipped/error"""
        params = {
            "origin": origin,
            "destination": destination,
            "depart_date": month,
            "currency": "USD",
            "page": 1,
            "limit": 100, # fetch as many as possible for that month
        }

        try:
            response = self.session.get(
                self.API_V1_URL, params=params, timeout=REQUEST_TIMEOUT
            )
            self.requests_made += 1

            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "60")
                wait = int(retry_after) if retry_after.isdigit() else 60
                logger.warning(
                    "Rate limited. Waiting %ds...", wait
                )
                time.sleep(wait)
                self.errors += 1
                return False

            if response.status_code >= 400:
                logger.error(
                    "HTTP %d for %s -> %s %s: %s",
                    response.status_code, origin, destination, month,
                    response.text[:300],
                )
                self.errors += 1
                return False

            data = response.json()

            if not data.get("success"):
                logger.warning("API returned success=false for %s->%s %s", origin, destination, month)
                return False

            if not data.get("data"):
                logger.debug("No deals found for %s -> %s (%s)", origin, destination, month)
                return True # Request succeeded, just no deals

            route_data = data["data"].get(destination, {})
            count = 0

            for _flight_id, flight_info in route_data.items():
                price = flight_info.get("price")
                departure_at = flight_info.get("departure_at", "")
                airline = flight_info.get("airline")
                flight_num = str(flight_info.get("flight_number", ""))
                transfers = flight_info.get("number_of_changes", 0)

                if not price or not (MIN_PRICE_USD <= price <= MAX_PRICE_USD):
                    continue

                date_only = _parse_date(departure_at)
                if not date_only:
                    continue
                    
                # Ensure the returned flight is actually in the target month (API can sometimes return outside)
                if not date_only.startswith(month):
                    continue

                if not airline:
                    continue

                self.new_routes.append({
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
                    "found_at": _now_utc().strftime("%Y-%m-%d %H:%M"),
                })
                count += 1

            if count > 0:
                logger.info(
                    "Found %d deals for %s -> %s (%s)", count, origin, destination, month
                )
            return True

        except requests.exceptions.Timeout:
            logger.error("Timeout after %ds", REQUEST_TIMEOUT)
            self.errors += 1
        except requests.exceptions.ConnectionError as exc:
            logger.error("Connection error: %s", exc)
            self.errors += 1
        except requests.exceptions.RequestException as exc:
            logger.error("Request failed: %s", exc)
            self.errors += 1
        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Bad response body: %s", exc)
            self.errors += 1
            
        return False

    def fetch_v3_prices(self, origin: str, destination: str, month: str, region: str) -> bool:
        """Fetch from v3 prices_for_dates API for additional data density"""
        params = {
            "token": self.token or "",
            "origin": origin,
            "destination": destination,
            "departure_at": month,
            "sorting": "price",
            "limit": "30",
            "one_way": "true",
            "currency": "USD",
        }

        try:
            response = self.session.get(
                self.API_V3_URL, params=params, timeout=REQUEST_TIMEOUT
            )
            self.requests_made += 1

            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "60")
                wait = int(retry_after) if retry_after.isdigit() else 60
                logger.warning("v3 Rate limited. Waiting %ds...", wait)
                time.sleep(wait)
                self.errors += 1
                return False

            if response.status_code >= 400:
                logger.debug("v3 HTTP %d for %s -> %s %s", response.status_code, origin, destination, month)
                return False

            data = response.json()
            arr = data.get("data", [])
            if not isinstance(arr, list):
                return True

            count = 0
            for e in arr:
                price = e.get("price")
                departure_at = e.get("departure_at", "")
                airline = e.get("airline", "")
                flight_num = str(e.get("flight_number", ""))
                transfers = e.get("transfers", 0)

                if not price or not (MIN_PRICE_USD <= price <= MAX_PRICE_USD) or not airline:
                    continue

                date_only = _parse_date(departure_at)
                if not date_only or not date_only.startswith(month):
                    continue

                self.new_routes.append({
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
                    "found_at": _now_utc().strftime("%Y-%m-%d %H:%M"),
                })
                count += 1

            if count > 0:
                logger.info("v3: Found %d deals for %s -> %s (%s)", count, origin, destination, month)
            return True

        except Exception as exc:
            logger.debug("v3 error for %s -> %s: %s", origin, destination, exc)
            return False

    def run(self) -> None:
        start_time = time.monotonic()
        logger.info("=" * 60)
        logger.info("Flight bot (SEA Expansion) starting")
        
        all_tasks = self.generate_tasks()
        logger.info("Total SEA combinations: %d", len(all_tasks))
        
        # Each task makes 2 API calls (V1 and V3), so divide max requests by 2
        tasks_to_run = all_tasks[:MAX_REQUESTS_PER_RUN // 2]
        logger.info("Running top %d tasks to respect rate limits", len(tasks_to_run))
        logger.info("=" * 60)

        CHECKPOINT_EVERY = 50

        for i, task in enumerate(tasks_to_run, 1):
            logger.info("[%d/%d] Checking %s -> %s for %s (%s)", i, len(tasks_to_run), task["origin"], task["destination"], task["month"], task["region"])
            success = self.fetch_prices_for_month(task["origin"], task["destination"], task["month"], task["region"])
            time.sleep(THROTTLE_DELAY)
            # Also fetch from v3 API for additional data density
            self.fetch_v3_prices(task["origin"], task["destination"], task["month"], task["region"])
            
            if i % CHECKPOINT_EVERY == 0:
                logger.info("Checkpoint save at task %d...", i)
                self.merge_and_save_results(tasks_to_run[:i])

        self.merge_and_save_results(tasks_to_run)

        elapsed = time.monotonic() - start_time
        logger.info("=" * 60)
        logger.info("RUN SUMMARY")
        logger.info("  Tasks processed: %d", len(tasks_to_run))
        logger.info("  HTTP requests  : %d", self.requests_made)
        logger.info("  New deals found: %d", len(self.new_routes))
        logger.info("  Errors         : %d", self.errors)
        logger.info("  Duration       : %.1fs", elapsed)
        logger.info("=" * 60)

    def _route_key(self, route: dict) -> str:
        return f"{route.get('origin')}_{route.get('destination')}_{route.get('date')}_{route.get('airline_code')}_{route.get('flight_num')}"

    def merge_and_save_results(self, processed_tasks: list[dict]) -> None:
        # Create a set of base keys (orig_dest_month) that were processed in this run
        processed_keys = set(t["key"] for t in processed_tasks)
        
        # Keep old routes UNLESS they match a key we just processed
        # Also clean up old dates from the past
        today_str = _now_utc().strftime("%Y-%m-%d")
        
        final_routes = []
        for r in self.existing_data.get("routes", []):
            if r.get("date", "") < today_str:
                continue # drop past flights
                
            month_str = r.get("date", "")[:7]
            key = f"{r.get('origin')}_{r.get('destination')}_{month_str}"
            
            # If we didn't just re-fetch this month, keep the old data
            if key not in processed_keys:
                final_routes.append(r)
                
        # Add all the new routes we just fetched
        final_routes.extend(self.new_routes)
        
        # Deduplicate final routes
        seen_keys = set()
        deduped_routes = []
        for r in final_routes:
            rk = self._route_key(r)
            if rk not in seen_keys:
                seen_keys.add(rk)
                deduped_routes.append(r)
        
        final_routes = deduped_routes
        
        # Sort globally by price
        final_routes.sort(key=lambda x: x["price"])
        
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        now_str = _now_utc().strftime("%Y-%m-%d %H:%M")
        
        overall_cheapest = final_routes[0] if final_routes else None

        output: dict = {
            "meta": {
                "updated_at": now_str,
                "currency": "USD",
                "direct_only": True,
                "total_routes_tracked": len(final_routes),
                "errors_this_run": self.errors,
                "overall_cheapest": overall_cheapest,
            },
            "routes": final_routes,
        }

        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)

        logger.info("Saved %d total flights to %s", len(final_routes), OUTPUT_PATH)


if __name__ == "__main__":
    bot = FlightBot()
    bot.run()
