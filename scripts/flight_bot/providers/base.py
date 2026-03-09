from abc import ABC, abstractmethod
from typing import List, Optional
from ..models import FlightDeal, RouteTask, RuntimeConfig

class BaseProvider(ABC):
    """Base class for all flight data providers."""
    
    def __init__(self, config: RuntimeConfig):
        self.config = config
        self.name = self.__class__.__name__

    @abstractmethod
    def fetch_deals(self, task: RouteTask) -> List[FlightDeal]:
        """Fetch deals for a specific route task."""
        pass

    def normalize_price(self, price: float, from_currency: str) -> float:
        """Normalize price to USD (LOCKED policy)."""
        if from_currency == "USD":
            return price
        # TODO: Implement basic conversion if needed, otherwise skip
        return price
