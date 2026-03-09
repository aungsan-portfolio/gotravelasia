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
