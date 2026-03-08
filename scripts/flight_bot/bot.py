"""
Main FlightBot orchestrator — slim run loop.
"""
import logging
import os
import time
from typing import Optional

from .config import MAX_REQUESTS_PER_RUN, THROTTLE_DELAY, CHECKPOINT_EVERY
from .session import build_session
from .scheduler import generate_tasks
from .fetcher import fetch_prices_v1, fetch_prices_v3
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
        logger.info("Flight bot (SEA Expansion) starting")

        all_tasks = generate_tasks(self.last_fetched_map)
        logger.info("Total SEA combinations: %d", len(all_tasks))

        # Each task makes 2 API calls (V1 and V3), so divide max requests by 2
        tasks_to_run = all_tasks[:MAX_REQUESTS_PER_RUN // 2]
        logger.info("Running top %d tasks to respect rate limits", len(tasks_to_run))
        logger.info("=" * 60)

        processed_so_far: list[dict] = []

        for i, task in enumerate(tasks_to_run, 1):
            logger.info(
                "[%d/%d] Checking %s -> %s for %s (%s)",
                i, len(tasks_to_run),
                task["origin"], task["destination"], task["month"], task["region"],
            )
            fetch_prices_v1(
                self.session, task["origin"], task["destination"],
                task["month"], task["region"], self.new_routes, self.counter,
            )
            time.sleep(THROTTLE_DELAY)
            fetch_prices_v3(
                self.session, self.token or "", task["origin"], task["destination"],
                task["month"], task["region"], self.new_routes, self.counter,
            )

            processed_so_far.append(task)

            if i % CHECKPOINT_EVERY == 0:
                logger.info("Checkpoint save at task %d...", i)
                merge_and_save(
                    self.existing_data, self.new_routes,
                    processed_so_far, self.counter["errors"],
                )

        merge_and_save(
            self.existing_data, self.new_routes,
            processed_so_far, self.counter["errors"],
        )

        elapsed = time.monotonic() - start_time
        logger.info("=" * 60)
        logger.info("RUN SUMMARY")
        logger.info("  Tasks processed: %d", len(tasks_to_run))
        logger.info("  HTTP requests  : %d", self.counter["requests"])
        logger.info("  New deals found: %d", len(self.new_routes))
        logger.info("  Errors         : %d", self.counter["errors"])
        logger.info("  Duration       : %.1fs", elapsed)
        logger.info("=" * 60)
