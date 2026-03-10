import logging
import os
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional

from .models import RuntimeConfig, CheckpointState, FlightDeal, RouteTask
from .writer import finalize_outputs
from .scheduler import generate_tasks, load_checkpoint, save_checkpoint_file, delete_checkpoint
from .merger import load_existing_data, merge_incremental
from .fetcher import FetchManager

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_runtime_config() -> RuntimeConfig:
    """Loads bot configuration from environment variables."""
    return RuntimeConfig(
        tp_token=os.getenv("TRAVELPAYOUTS_TOKEN", ""),
        amadeus_id=os.getenv("AMADEUS_CLIENT_ID"),
        amadeus_secret=os.getenv("AMADEUS_CLIENT_SECRET"),
        max_requests=int(os.getenv("MAX_REQUESTS_PER_RUN", "200")),
        checkpoint_interval=int(os.getenv("CHECKPOINT_EVERY", "50"))
    )

def main() -> int:
    """Main orchestration entry point."""
    try:
        config = load_runtime_config()
        if not config.tp_token:
            logger.error("TRAVELPAYOUTS_TOKEN is required but missing.")
            return 1

        # 1. Initialization
        run_id = str(uuid.uuid4())[:8]
        logger.info(f"Starting Flight Bot Run [ID: {run_id}]")
        
        # 2. Load Existing Data
        existing_json = load_existing_data()
        deals = [FlightDeal.from_dict(d) for d in existing_json.get("routes", [])]
        logger.info(f"Loaded {len(deals)} existing deals.")
        
        # 3. Resume / Load Checkpoint
        checkpoint = load_checkpoint(run_id)
        
        # 4. Generate Task Queue
        last_fetched_map = {}
        for d in deals:
            key = f"{d.origin}_{d.destination}_{d.date[:7]}"
            if key not in last_fetched_map or d.found_at > last_fetched_map[key]:
                last_fetched_map[key] = d.found_at
                
        all_tasks = generate_tasks(last_fetched_map)
        
        # Determine slice
        start_idx = checkpoint.last_processed_index
        end_idx = min(start_idx + config.max_requests, len(all_tasks))
        tasks_to_run = all_tasks[start_idx : end_idx]
        
        if not tasks_to_run:
            logger.info("All planned routes are up to date. No new tasks.")
            return 0

        logger.info(f"Task Queue: Total {len(all_tasks)} | This Run: {len(tasks_to_run)} [Index {start_idx} to {end_idx}]")

        # 5. Execution
        fetcher = FetchManager(config)
        consecutive_failures = 0
        total_fetched = 0
        
        for i, task in enumerate(tasks_to_run, 1):
            global_index = start_idx + i
            logger.info(f"Processing task {i}/{len(tasks_to_run)}: {task.origin} -> {task.destination} ({task.month})")
            
            try:
                # Fetch from all providers for this route
                new_deals = fetcher.fetch_all(task)
                
                if new_deals:
                    deals = merge_incremental(deals, new_deals)
                    total_fetched += len(new_deals)
                    consecutive_failures = 0
                else:
                    # If both providers return nothing, we count as a soft failure if it's a timeout/error
                    # but here FetchManager handles internal errors.
                    pass
                
            except Exception as e:
                logger.error(f"Failed to process {task.origin}->{task.destination}: {e}")
                consecutive_failures += 1
                if consecutive_failures >= 3:
                    logger.critical("Stopping run: 3 consecutive failures encountered.")
                    checkpoint.last_processed_index = global_index
                    save_checkpoint_file(checkpoint)
                    return 1
            
            # Periodic Checkpoint & Partial Save
            if i % config.checkpoint_interval == 0:
                logger.info(f"Checkpoint at {i}/{len(tasks_to_run)}...")
                checkpoint.last_processed_index = global_index
                save_checkpoint_file(checkpoint)
                finalize_outputs(deals, Path(config.output_path), Path(config.transport_path))

        # 6. Finalization
        finalize_outputs(deals, Path(config.output_path), Path(config.transport_path))
        
        # Cleanup
        if end_idx >= len(all_tasks):
            logger.info("Project iteration complete. Deleting checkpoint.")
            delete_checkpoint()
        else:
            checkpoint.last_processed_index = end_idx
            save_checkpoint_file(checkpoint)
            logger.info(f"Next run will start from index {end_idx}")

        logger.info(f"Run Summary: {total_fetched} new deals integrated. Total deals: {len(deals)}.")
        return 0

    except Exception as e:
        logger.exception(f"Fatal orchestration error: {e}")
        return 1

if __name__ == "__main__":
    import sys
    sys.exit(main())
