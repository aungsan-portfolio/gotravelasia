"""
Utility helpers: date parsing, timestamps.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def parse_date(departure_at: str) -> Optional[str]:
    """Extract YYYY-MM-DD from a departure_at string."""
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
