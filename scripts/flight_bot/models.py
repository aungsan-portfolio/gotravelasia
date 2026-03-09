from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict
import time

@dataclass
class FlightDeal:
    """Canonical flight deal record."""
    origin: str           # "BKK"
    destination: str      # "CNX"
    price: float          # Normalized to USD
    date: str             # "2026-03-25" (YYYY-MM-DD)
    currency: str = "USD"
    airline: str = ""
    airline_code: str = ""
    transfers: int = 0
    flight_num: str = ""
    found_at: str = ""    # ISO 8601 UTC
    fetchedAt: int = 0    # Unix ms timestamp UTC
    provider: str = "tp"  # "tp" | "amadeus"
    is_amadeus: bool = False
    is_estimated: bool = False

    def get_idempotency_key(self) -> str:
        """Business key: origin-dest-date-airline"""
        return f"{self.origin}-{self.destination}-{self.date}-{self.airline_code}"

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items()}

    @classmethod
    def from_dict(cls, data: dict) -> 'FlightDeal':
        # Filter out keys that aren't in the dataclass
        valid_keys = cls.__dataclass_fields__.keys()
        filtered_data = {k: v for k, v in data.items() if k in valid_keys}
        return cls(**filtered_data)

@dataclass
class RouteTask:
    """A specific route search task."""
    origin: str
    destination: str
    month: str           # "2026-03"
    region: str          # "Thailand"
    priority: int = 1
    last_fetched_at: Optional[str] = None # ISO UTC

@dataclass
class CheckpointState:
    """Runtime progress state for resuming."""
    run_id: str
    last_processed_index: int = 0
    completed_keys: List[str] = field(default_factory=list)
    failed_keys: List[str] = field(default_factory=list)
    provider_health: Dict[str, str] = field(default_factory=lambda: {"tp": "up", "amadeus": "up"})
    last_saved_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items()}

@dataclass
class RuntimeConfig:
    """Bot execution configuration."""
    tp_token: str
    amadeus_id: Optional[str] = None
    amadeus_secret: Optional[str] = None
    max_requests: int = 200
    checkpoint_interval: int = 50
    output_path: str = "client/public/data/flight_data.json"
    transport_path: str = "client/public/data/transport.json"
    pythonpath: str = "."
