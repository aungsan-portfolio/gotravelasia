#!/usr/bin/env python3
"""
GoTravel Flight Bot — Auto-updates flight prices via Travelpayouts API.

Fetches cheapest flights from Yangon/Mandalay to Bangkok/Chiang Mai
using the Aviasales grouped_prices endpoint (v3).
Outputs structured JSON to client/public/data/flight_data.json.

Usage:
    python scripts/flight_bot.py              # Run once
    python scripts/flight_bot.py --dry-run    # Preview without writing

Schedule with cron (every 6 hours):
    0 */6 * * * cd /path/to/gotravel && python scripts/flight_bot.py
"""

import os
import json
import sys
import time
import logging
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("flight_bot")


# ─── Configuration ───────────────────────────────────────────────

@dataclass(frozen=True)
class Config:
    output_dir: str = "client/public/data"
    output_filename: str = "flight_data.json"
    token_env: str = "TRAVELPAYOUTS_TOKEN"
    currency: str = "USD"
    endpoint: str = "https://api.travelpayouts.com/aviasales/v3/grouped_prices"
    months_to_scan: int = 4
    direct_only: bool = False        # cheapest-first: stopover allowed
    group_by: str = "departure_at"
    timeout: int = 15
    sleep_429: int = 5

    @property
    def output_path(self) -> str:
        return os.path.join(self.output_dir, self.output_filename)


# ─── Route Definitions ──────────────────────────────────────────

ROUTES = [
    {"origin": "RGN", "destination": "BKK"},
    {"origin": "RGN", "destination": "DMK"},
    {"origin": "RGN", "destination": "CNX"},
    {"origin": "MDL", "destination": "BKK"},
    {"origin": "MDL", "destination": "DMK"},
    {"origin": "MDL", "destination": "CNX"},
]

AIRLINE_MAP = {
    "FD": "Thai AirAsia",
    "8M": "MAI",
    "UB": "Myanmar National Airlines",
    "TG": "Thai Airways",
    "SL": "Thai Lion Air",
    "WE": "Thai Smile",
    "PG": "Bangkok Airways",
    "DD": "Nok Air",
}


# ─── Helpers ─────────────────────────────────────────────────────

def get_months(n: int) -> List[str]:
    """Generate list of YYYY-MM strings for the next n months."""
    now = datetime.now()
    y, m = now.year, now.month
    out = []
    for _ in range(n):
        out.append(f"{y:04d}-{m:02d}")
        m += 1
        if m == 13:
            m = 1
            y += 1
    return out


def build_session() -> requests.Session:
    """Build a requests session with retry logic."""
    s = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504],
    )
    s.mount("https://", HTTPAdapter(max_retries=retries))
    s.headers.update({"Accept-Encoding": "gzip, deflate"})
    return s


def parse_best(
    data: Dict[str, Any],
    origin: str,
    destination: str,
    currency: str,
) -> Optional[Dict[str, Any]]:
    """Extract the cheapest flight deal from grouped_prices response."""
    flights = data.get("data", {}) if isinstance(data, dict) else {}
    best = None

    for date_key, f in flights.items():
        if not isinstance(f, dict):
            continue
        price = f.get("price")
        if price is None:
            continue

        code = str(f.get("airline", "Unknown"))
        deal = {
            "origin": origin,
            "destination": destination,
            "price": float(price),
            "currency": currency,
            "airline_code": code,
            "airline": AIRLINE_MAP.get(code, code),
            "date": str((f.get("departure_at") or date_key))[:10],
            "transfers": f.get("transfers", None),
            "flight_num": f.get("flight_number"),
            "found_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        }
        if best is None or deal["price"] < best["price"]:
            best = deal

    return best


# ─── API Fetch ───────────────────────────────────────────────────

def fetch_month(
    s: requests.Session,
    cfg: Config,
    token: str,
    origin: str,
    destination: str,
    month: str,
) -> Optional[Dict[str, Any]]:
    """Fetch grouped_prices for a single origin-destination-month combo."""
    params = {
        "origin": origin,
        "destination": destination,
        "departure_at": month,  # YYYY-MM
        "group_by": cfg.group_by,
        "direct": "true" if cfg.direct_only else "false",
        "currency": cfg.currency,
        "token": token,
    }
    r = s.get(cfg.endpoint, params=params, timeout=cfg.timeout)

    if r.status_code == 401:
        raise RuntimeError("Invalid TRAVELPAYOUTS_TOKEN (401).")
    if r.status_code == 429:
        return {"__rate_limited__": True}

    r.raise_for_status()
    return r.json()


def scan_route(
    s: requests.Session,
    cfg: Config,
    token: str,
    origin: str,
    destination: str,
) -> Optional[Dict[str, Any]]:
    """Scan all months for a route and return the cheapest deal found."""
    best = None
    for month in get_months(cfg.months_to_scan):
        raw = fetch_month(s, cfg, token, origin, destination, month)
        if not raw:
            continue
        if raw.get("__rate_limited__"):
            log.warning("Rate limited (429). Sleeping %ds...", cfg.sleep_429)
            time.sleep(cfg.sleep_429)
            continue
        if not raw.get("success"):
            continue
        cand = parse_best(raw, origin, destination, cfg.currency)
        if cand and (best is None or cand["price"] < best["price"]):
            best = cand
    return best


# ─── File Output ─────────────────────────────────────────────────

def atomic_write(path: str, payload: Dict[str, Any]) -> None:
    """Write JSON atomically: write to .tmp then replace.
    Keeps last good data if bot fails mid-write."""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


# ─── Main Logic ──────────────────────────────────────────────────

def main():
    cfg = Config()
    dry_run = "--dry-run" in sys.argv
    token = os.environ.get(cfg.token_env)

    os.makedirs(cfg.output_dir, exist_ok=True)

    if not token:
        log.error("Missing %s environment variable", cfg.token_env)
        sys.exit(1)

    log.info("🚀 GoTravel Flight Bot starting...")
    log.info("   Endpoint: %s", cfg.endpoint)
    log.info("   Direct only: %s", cfg.direct_only)
    log.info("   Months to scan: %d", cfg.months_to_scan)

    s = build_session()
    deals: List[Dict[str, Any]] = []

    for r in ROUTES:
        log.info("Scanning %s → %s ...", r["origin"], r["destination"])
        d = scan_route(s, cfg, token, r["origin"], r["destination"])
        if d:
            deals.append(d)
            log.info(
                "  ✓ %s → %s: $%.0f %s on %s (%s)",
                r["origin"], r["destination"],
                d["price"], d["currency"], d["date"], d["airline"],
            )
        else:
            log.info("  ✗ No data for %s → %s", r["origin"], r["destination"])

    # Sort by price (cheapest first)
    deals.sort(key=lambda x: x["price"])

    payload: Dict[str, Any] = {
        "meta": {
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "currency": cfg.currency,
            "direct_only": cfg.direct_only,
        },
        "routes": deals,
    }
    if deals:
        payload["meta"]["overall_cheapest"] = deals[0]

    if dry_run:
        log.info("🔍 DRY RUN — Preview:")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return

    # Only write if we have data (never overwrite good data with empty)
    if not deals:
        log.warning("⚠️ No deals found. Keeping existing data untouched.")
        return

    atomic_write(cfg.output_path, payload)
    output_size = Path(cfg.output_path).stat().st_size
    log.info("✅ Saved → %s (%d bytes, %d routes)", cfg.output_path, output_size, len(deals))


if __name__ == "__main__":
    main()
