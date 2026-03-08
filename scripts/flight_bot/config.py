"""
Constants, environment variables, and airport lists.
"""
import os
from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env.local")
load_dotenv(env_path)

# ─── HTTP / Rate Limiting ──────────────────────────────────────────────────
REQUEST_TIMEOUT = 10
THROTTLE_DELAY = 0.5  # 0.5s between requests (safe for 200/min API limit)
MAX_RETRIES = 3
BACKOFF_FACTOR = 1.0
RETRY_STATUS_CODES = (429, 500, 502, 503, 504)

# ─── File Paths ────────────────────────────────────────────────────────────
OUTPUT_PATH = os.path.join("client", "public", "data", "flight_data.json")

# ─── Price Bounds ──────────────────────────────────────────────────────────
MIN_PRICE_USD = 10
MAX_PRICE_USD = 5000

# ─── Airport Lists ─────────────────────────────────────────────────────────
SEA_AIRPORTS = [
    "RGN", "MDL", "BKK", "SIN", "KUL", "CNX", "HKT",
    "SGN", "HAN", "DAD", "CGK", "DPS", "MNL", "CEB", "BKI", "BWN"
]

JAPAN_AIRPORTS = ["NRT", "KIX"]
KOREA_AIRPORTS = ["ICN", "CJU"]
INDIA_AIRPORTS = ["DEL", "CCU"]
CHINA_AIRPORTS = ["PEK", "PVG", "CAN", "CTU", "HKG", "MFM"]
TAIWAN_AIRPORTS = ["TPE"]

MYANMAR_HUBS = ["RGN", "MDL"]

# ─── Popular Routes (priority boost) ──────────────────────────────────────
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
    ("BKK", "DAD"), ("DAD", "BKK"),
    ("BKK", "SGN"), ("SGN", "BKK"),
    ("SIN", "DPS"), ("DPS", "SIN"),
    ("KUL", "DPS"), ("DPS", "KUL"),
]

POPULAR_ROUTES_SET = frozenset(POPULAR_ROUTES)

# ─── Scheduling ────────────────────────────────────────────────────────────
def _generate_months(ahead=6):
    """Auto-generate next N months so the bot never goes stale."""
    now = datetime.now(timezone.utc)
    return [(now + relativedelta(months=i)).strftime("%Y-%m") for i in range(ahead)]

MONTHS_TO_SCAN = _generate_months(ahead=9)   # 9 months = more date coverage
MAX_REQUESTS_PER_RUN = 1000                  # 5x increase (≈8 min at 0.5s delay)
AMADEUS_MAX_REQUESTS_PER_RUN = 20            # Free limit: ~66 daily -> 20 route-months (60 API calls)
CHECKPOINT_EVERY = 50
