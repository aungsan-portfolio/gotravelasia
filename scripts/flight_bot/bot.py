"""
Main FlightBot orchestrator — slim run loop.
"""
import logging
import os
import time
from typing import Optional

from .config import MAX_REQUESTS_PER_RUN, AMADEUS_MAX_REQUESTS_PER_RUN, THROTTLE_DELAY, CHECKPOINT_EVERY
from .session import build_session
from .scheduler import generate_tasks
from .fetcher import fetch_prices_v1, fetch_prices_v3, fetch_amadeus
from .merger import load_existing_data, merge_and_save

logger = logging.getLogger(__name__)


class FlightBot:
    def __init__(self) -> None:
        self.token: Optional[str] = os.getenv("TRAVELPAYOUTS_TOKEN")
        if not self.token:
            logger.warning("TRAVELPAYOUTS_TOKEN not found in environment!")

        self.session = build_session()
        if self.token:
            self.session.headers["x-access-token"] = self.token
            
        self.amadeus_client = None
        amadeus_key = os.getenv("AMADEUS_CLIENT_ID")
        amadeus_secret = os.getenv("AMADEUS_CLIENT_SECRET")
        amadeus_hostname = os.getenv("AMADEUS_HOSTNAME", "test")
        
        if amadeus_key and amadeus_secret:
            try:
                from amadeus import Client
                import ssl
                # For Windows testing environments where local certs might be missing
                ssl._create_default_https_context = ssl._create_unverified_context
                
                self.amadeus_client = Client(
                    client_id=amadeus_key, 
                    client_secret=amadeus_secret,
                    hostname=amadeus_hostname,
                    ssl=True
                )
                logger.info("Amadeus client initialized successfully (host: %s)", amadeus_hostname)
            except ImportError:
                logger.warning("Amadeus SDK not installed. Skipping Amadeus.")
            except Exception as e:
                logger.warning("Amadeus client initialization failed: %s", e)
        else:
            logger.warning("Amadeus credentials not found in environment. Skipping Amadeus.")

        self.existing_data = load_existing_data()

        # Track when each route-month was last fetched
        self.last_fetched_map: dict[str, str] = {}
        for r in self.existing_data["routes"]:
            orig = r["origin"]
            dest = r["destination"]
            month_str = r["date"][:7]
            key = f"{orig}_{dest}_{month_str}"
            found_at = r.get("found_at", "2000-01-01 00:00")
            if key not in self.last_fetched_map or found_at > self.last_fetched_map[key]:
                self.last_fetched_map[key] = found_at

        self.counter = {"errors": 0, "requests": 0}
        self.new_routes: list[dict] = []

    def run(self) -> None:
        start_time = time.monotonic()
        logger.info("=" * 60)
        logger.info("Flight bot (SEA Expansion + Amadeus) starting")

        all_tasks = generate_tasks(self.last_fetched_map)
        logger.info("Total SEA combinations: %d", len(all_tasks))

        # Each task makes 2 API calls (V1 and V3), so divide max requests by 2
        tasks_to_run = all_tasks[:MAX_REQUESTS_PER_RUN // 2]
        logger.info("Running top %d tasks for TravelPayouts", len(tasks_to_run))
        
        # Amadeus limit: Free API (~66 daily max, checking 3 days = ~20 limit)
        amadeus_tasks = all_tasks[:AMADEUS_MAX_REQUESTS_PER_RUN] if self.amadeus_client else []
        if amadeus_tasks:
            logger.info("Running top %d tasks for Amadeus", len(amadeus_tasks))
            
        logger.info("=" * 60)

        processed_so_far: list[dict] = []

        # 1. TravelPayouts Loop
        for i, task in enumerate(tasks_to_run, 1):
            if i % 50 == 0:
                logger.info(
                    "[%d/%d] Checking %s -> %s for %s (%s)",
                    i, len(tasks_to_run),
                    task["origin"], task["destination"], task["month"], task["region"],
                )
                
            fetch_prices_v1(
                self.session, task["origin"], task["destination"],
                task["month"], task["region"], self.new_routes, self.counter,
            )
            time.sleep(THROTTLE_DELAY * 0.5) # Slight throttle 
            fetch_prices_v3(
                self.session, self.token or "", task["origin"], task["destination"],
                task["month"], task["region"], self.new_routes, self.counter,
            )

            processed_so_far.append(task)

            if i % CHECKPOINT_EVERY == 0:
                logger.info("Checkpoint save at TP task %d...", i)
                merge_and_save(
                    self.existing_data, self.new_routes,
                    processed_so_far, self.counter["errors"],
                )

        # 2. Amadeus Loop  (Strict limits applied)
        if amadeus_tasks:
            logger.info("-" * 60)
            logger.info("Starting Amadeus background tests")
            for i, task in enumerate(amadeus_tasks, 1):
                logger.info(
                    "[Amadeus %d/%d] Checking %s -> %s for %s",
                    i, len(amadeus_tasks),
                    task["origin"], task["destination"], task["month"],
                )
                fetch_amadeus(
                    self.amadeus_client, task["origin"], task["destination"],
                    task["month"], task["region"], self.new_routes, self.counter,
                )
                time.sleep(0.5) # Strict 0.5s throttle for amadeus

        merge_and_save(
            self.existing_data, self.new_routes,
            processed_so_far, self.counter["errors"],
        )

        elapsed = time.monotonic() - start_time
        logger.info("=" * 60)
        logger.info("RUN SUMMARY")
        logger.info("  TP Tasks processed  : %d", len(tasks_to_run))
        logger.info("  Amadeus Tasks       : %d", len(amadeus_tasks))
        logger.info("  HTTP requests       : %d", self.counter["requests"])
        logger.info("  New deals found     : %d", len(self.new_routes))
        logger.info("  Errors              : %d", self.counter["errors"])
        logger.info("  Duration            : %.1fs", elapsed)
        logger.info("=" * 60)
