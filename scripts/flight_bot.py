#!/usr/bin/env python3
"""
GoTravel Flight Bot — Auto-updates flight prices via Travelpayouts API.
Feature: DIRECT FLIGHTS ONLY (Quality over Quantity)

Routes: Myanmar ↔ Thailand (bidirectional) + SE Asia (SIN, KUL, SGN)
Output: client/public/data/flight_data.json

Usage:
    python scripts/flight_bot.py              # Run once
    python scripts/flight_bot.py --dry-run    # Preview without writing
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

# Logging Setup
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

    # 🔧 CORE SETTINGS
    months_to_scan: int = 4
    direct_only: bool = True        # ✅ TRUE: တိုက်ရိုက်လမ်းကြောင်းသီးသန့် (No transits)
    group_by: str = "departure_at"

    # 🌐 NETWORK SETTINGS
    timeout: int = 60               # Connection Timeout (seconds)
    sleep_429: int = 5              # Rate-limit retry wait
    sleep_between: float = 0.5      # Pause between routes to avoid 429

    @property
    def output_path(self) -> str:
        return os.path.join(self.output_dir, self.output_filename)


# ─── Route Definitions ──────────────────────────────────────────

ROUTES = [
    # 🇲🇲 Myanmar → 🇹🇭 Thailand
    {"origin": "RGN", "destination": "BKK"},   # Yangon → Bangkok (Suvarnabhumi)
    {"origin": "RGN", "destination": "DMK"},   # Yangon → Don Mueang
    {"origin": "RGN", "destination": "CNX"},   # Yangon → Chiang Mai
    {"origin": "MDL", "destination": "BKK"},   # Mandalay → Bangkok
    {"origin": "MDL", "destination": "DMK"},   # Mandalay → Don Mueang

    # 🇹🇭 Thailand → 🇲🇲 Myanmar (အပြန်)
    {"origin": "BKK", "destination": "RGN"},
    {"origin": "DMK", "destination": "RGN"},
    {"origin": "BKK", "destination": "MDL"},
    {"origin": "DMK", "destination": "MDL"},
    {"origin": "CNX", "destination": "RGN"},   # Chiang Mai → Yangon

    # 🌏 SE Asia Expansion
    {"origin": "RGN", "destination": "SIN"},   # Singapore
    {"origin": "RGN", "destination": "KUL"},   # Kuala Lumpur
    {"origin": "RGN", "destination": "SGN"},   # Ho Chi Minh (Vietnam)
]

AIRLINE_MAP = {
    # Thailand
    "FD": "Thai AirAsia",
    "8M": "MAI",
    "UB": "Myanmar National Airlines",
    "TG": "Thai Airways",
    "SL": "Thai Lion Air",
    "WE": "Thai Smile",
    "PG": "Bangkok Airways",
    "DD": "Nok Air",
    # SE Asia
    "SQ": "Singapore Airlines",
    "TR": "Scoot",
    "AK": "AirAsia",
    "MH": "Malaysia Airlines",
    "VJ": "VietJet Air",
    "VN": "Vietnam Airlines",
    "QR": "Qatar Airways",
}


# ─── Helpers ─────────────────────────────────────────────────────

def get_months(n: int) -> List[str]:
    """Generate list of YYYY-MM strings for the next n months."""
    now = datetime.now()
    y, m = now.year, now.month
    out: List[str] = []
    for _ in range(n):
        out.append(f"{y:04d}-{m:02d}")
        m += 1
        if m == 13:
            m = 1
            y += 1
    return out


def build_session(timeout: int) -> requests.Session:
    """Build a requests session with robust retry logic."""
    s = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=1.5,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    adapter = HTTPAdapter(max_retries=retries, pool_maxsize=4)
    s.mount("https://", adapter)
    s.headers.update({
        "Accept-Encoding": "gzip, deflate",
        "User-Agent": "GoTravel-FlightBot/1.0",
    })
    return s


def parse_best(
    data: Dict[str, Any],
    origin: str,
    destination: str,
    currency: str,
) -> Optional[Dict[str, Any]]:
    """Extract the cheapest flight deal from grouped_prices response."""
    flights = data.get("data", {}) if isinstance(data, dict) else {}
    best: Optional[Dict[str, Any]] = None

    for date_key, f in flights.items():
        if not isinstance(f, dict):
            continue
        price = f.get("price")
        if price is None:
            continue

        code = str(f.get("airline", "Unknown"))
        deal: Dict[str, Any] = {
            "origin": origin,
            "destination": destination,
            "price": float(price),
            "currency": currency,
            "airline_code": code,
            "airline": AIRLINE_MAP.get(code, code),
            "date": str((f.get("departure_at") or date_key))[:10],
            "transfers": f.get("transfers", 0),
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
    """Fetch prices for a specific month with Direct-Only setting."""
    params = {
        "origin": origin,
        "destination": destination,
        "departure_at": month,
        "group_by": cfg.group_by,
        "direct": "true" if cfg.direct_only else "false",
        "currency": cfg.currency,
        "token": token,
    }

    try:
        r = s.get(cfg.endpoint, params=params, timeout=cfg.timeout)

        if r.status_code == 401:
            log.error("❌ Invalid API Token (401 Unauthorized)")
            raise SystemExit(1)  # Stop entire bot on auth failure
        if r.status_code == 429:
            return {"__rate_limited__": True}

        r.raise_for_status()
        return r.json()

    except requests.exceptions.ConnectionError as e:
        log.warning("⚠️ Connection error for %s→%s (%s): %s", origin, destination, month, e)
        return None
    except requests.exceptions.Timeout:
        log.warning("⏱️ Timeout for %s→%s (%s) after %ds", origin, destination, month, cfg.timeout)
        return None
    except requests.exceptions.HTTPError as e:
        log.warning("⚠️ HTTP error for %s→%s: %s", origin, destination, e)
        return None


def scan_route(
    s: requests.Session,
    cfg: Config,
    token: str,
    origin: str,
    destination: str,
) -> Optional[Dict[str, Any]]:
    """Scan all configured months for a route and return the cheapest."""
    best: Optional[Dict[str, Any]] = None
    for month in get_months(cfg.months_to_scan):
        raw = fetch_month(s, cfg, token, origin, destination, month)

        if not raw:
            continue
        if raw.get("__rate_limited__"):
            log.warning("⏳ Rate limited (429). Sleeping %ds...", cfg.sleep_429)
            time.sleep(cfg.sleep_429)
            # Retry once after sleeping
            raw = fetch_month(s, cfg, token, origin, destination, month)
            if not raw or raw.get("__rate_limited__"):
                continue
        if not raw.get("success"):
            continue

        cand = parse_best(raw, origin, destination, cfg.currency)
        if cand and (best is None or cand["price"] < best["price"]):
            best = cand

    return best


# ─── File Output ─────────────────────────────────────────────────

def atomic_write(path: str, payload: Dict[str, Any]) -> None:
    """Safe atomic write to prevent data corruption.
    Writes to .tmp first, then renames — if bot crashes mid-write,
    the original file stays intact."""
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


# ─── Main Logic ──────────────────────────────────────────────────

def main() -> None:
    cfg = Config()
    dry_run = "--dry-run" in sys.argv
    token = os.environ.get(cfg.token_env)

    # Output Folder Creation
    os.makedirs(cfg.output_dir, exist_ok=True)

    if not token:
        log.error("🚨 Missing environment variable: %s", cfg.token_env)
        log.error("   Run with: $env:TRAVELPAYOUTS_TOKEN='your_token'; python scripts/flight_bot.py")
        sys.exit(1)

    log.info("🚀 GoTravel Flight Bot starting...")
    log.info("   Mode: %s", "Direct Flights Only ✈️" if cfg.direct_only else "All Flights")
    log.info("   Routes: %d | Months: %d | Timeout: %ds", len(ROUTES), cfg.months_to_scan, cfg.timeout)

    s = build_session(cfg.timeout)
    deals: List[Dict[str, Any]] = []
    errors = 0

    for i, r in enumerate(ROUTES, 1):
        log.info("[%d/%d] Scanning %s → %s ...", i, len(ROUTES), r["origin"], r["destination"])
        try:
            d = scan_route(s, cfg, token, r["origin"], r["destination"])

            if d:
                deals.append(d)
                log.info("   ✓ $%.0f via %s (%s) — %s",
                         d["price"], d["airline"], d["date"],
                         "Direct" if d["transfers"] == 0 else f"{d['transfers']} stop(s)")
            else:
                log.info("   ✗ No direct flights found")
        except Exception as e:
            errors += 1
            log.error("   ❌ Error scanning route: %s", e)

        # Small pause between routes to avoid hammering the API
        if i < len(ROUTES):
            time.sleep(cfg.sleep_between)

    # Sort deals by price (cheapest first)
    deals.sort(key=lambda x: x["price"])

    payload: Dict[str, Any] = {
        "meta": {
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "currency": cfg.currency,
            "direct_only": cfg.direct_only,
            "total_routes_scanned": len(ROUTES),
            "total_deals_found": len(deals),
            "errors": errors,
        },
        "routes": deals,
    }

    if deals:
        payload["meta"]["overall_cheapest"] = deals[0]

    if dry_run:
        log.info("🔍 DRY RUN — Preview:")
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        return

    # Data Safety: never overwrite good data with empty results
    if not deals:
        log.warning("⚠️ No flights found at all. Keeping old data safe.")
        return

    atomic_write(cfg.output_path, payload)
    output_size = Path(cfg.output_path).stat().st_size
    log.info("✅ Saved → %s (%d routes, %d bytes)", cfg.output_path, len(deals), output_size)

    if errors > 0:
        log.warning("⚠️ Completed with %d error(s) — check logs above.", errors)
    else:
        log.info("🎉 All done — %d deals saved successfully!", len(deals))


if __name__ == "__main__":
    main()
