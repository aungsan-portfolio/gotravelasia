#!/usr/bin/env python3
"""
GoTravel Price Bot — Auto-updates transport prices for the website.

Scrapes 12Go.asia for real transport prices between Thai cities.
Falls back to estimated prices if scraping fails.
Outputs structured JSON to client/public/data/transport.json.

Usage:
    python scripts/price_bot.py              # Run once
    python scripts/price_bot.py --dry-run    # Preview without writing

Schedule with cron (every 6 hours):
    0 */6 * * * cd /path/to/gotravel && python scripts/price_bot.py
"""

import json
import sys
import os
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Install with: pip install -r scripts/requirements.txt")
    sys.exit(1)

# ─── Configuration ───────────────────────────────────────────────

AFFILIATE_ID = "14566451"
OUTPUT_PATH = Path(__file__).parent.parent / "client" / "public" / "data" / "transport.json"
REQUEST_TIMEOUT = 15
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# ─── Buffer Pricing ─────────────────────────────────────────────
# Show slightly higher prices on the website so customers feel happy
# when the actual price on 12Go is lower. Smart marketing!
BUFFER_FLIGHT = 0.15      # +15% for flights
BUFFER_FERRY = 0.12       # +12% for ferries
BUFFER_DEFAULT = 0.10     # +10% for buses, trains, minivans


def apply_price_buffer(price: int, transport_type: str) -> int:
    """Apply buffer markup so displayed price is slightly above actual."""
    t = transport_type.lower()
    if "flight" in t:
        buffer = BUFFER_FLIGHT
    elif "ferry" in t:
        buffer = BUFFER_FERRY
    else:
        buffer = BUFFER_DEFAULT
    # Round up to nearest 50 for clean display
    buffered = int(price * (1 + buffer))
    return ((buffered + 49) // 50) * 50

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("price_bot")

# ─── Route Definitions ──────────────────────────────────────────

ROUTES = [
    {"from": "Bangkok", "to": "Chiang Mai", "slug_from": "bangkok", "slug_to": "chiang-mai"},
    {"from": "Chiang Mai", "to": "Bangkok", "slug_from": "chiang-mai", "slug_to": "bangkok"},
    {"from": "Bangkok", "to": "Phuket", "slug_from": "bangkok", "slug_to": "phuket"},
    {"from": "Phuket", "to": "Bangkok", "slug_from": "phuket", "slug_to": "bangkok"},
    {"from": "Bangkok", "to": "Krabi", "slug_from": "bangkok", "slug_to": "krabi"},
    {"from": "Krabi", "to": "Bangkok", "slug_from": "krabi", "slug_to": "bangkok"},
    {"from": "Bangkok", "to": "Koh Samui", "slug_from": "bangkok", "slug_to": "koh-samui"},
    {"from": "Koh Samui", "to": "Bangkok", "slug_from": "koh-samui", "slug_to": "bangkok"},
    {"from": "Bangkok", "to": "Pattaya", "slug_from": "bangkok", "slug_to": "pattaya"},
    {"from": "Pattaya", "to": "Bangkok", "slug_from": "pattaya", "slug_to": "bangkok"},
    {"from": "Bangkok", "to": "Hua Hin", "slug_from": "bangkok", "slug_to": "hua-hin"},
    {"from": "Hua Hin", "to": "Bangkok", "slug_from": "hua-hin", "slug_to": "bangkok"},
    {"from": "Chiang Mai", "to": "Chiang Rai", "slug_from": "chiang-mai", "slug_to": "chiang-rai"},
    {"from": "Chiang Rai", "to": "Chiang Mai", "slug_from": "chiang-rai", "slug_to": "chiang-mai"},
    {"from": "Chiang Mai", "to": "Pai", "slug_from": "chiang-mai", "slug_to": "pai"},
    {"from": "Pai", "to": "Chiang Mai", "slug_from": "pai", "slug_to": "chiang-mai"},
    {"from": "Phuket", "to": "Krabi", "slug_from": "phuket", "slug_to": "krabi"},
    {"from": "Krabi", "to": "Phuket", "slug_from": "krabi", "slug_to": "phuket"},
    {"from": "Phuket", "to": "Koh Samui", "slug_from": "phuket", "slug_to": "koh-samui"},
    {"from": "Koh Samui", "to": "Phuket", "slug_from": "koh-samui", "slug_to": "phuket"},
    {"from": "Bangkok", "to": "Surat Thani", "slug_from": "bangkok", "slug_to": "surat-thani"},
    {"from": "Surat Thani", "to": "Bangkok", "slug_from": "surat-thani", "slug_to": "bangkok"},
    {"from": "Bangkok", "to": "Koh Phangan", "slug_from": "bangkok", "slug_to": "koh-phangan"},
    {"from": "Koh Phangan", "to": "Bangkok", "slug_from": "koh-phangan", "slug_to": "bangkok"},
    {"from": "Bangkok", "to": "Koh Tao", "slug_from": "bangkok", "slug_to": "koh-tao"},
    {"from": "Koh Tao", "to": "Bangkok", "slug_from": "koh-tao", "slug_to": "bangkok"},
]

# ─── Estimated/Fallback Price Data ──────────────────────────────
# These are realistic estimates based on Thai transport pricing (2024-2025).
# The bot tries to scrape real prices first; uses these as fallback.

FALLBACK_PRICES: dict[str, list[dict]] = {
    "Bangkok-Chiang Mai": [
        {"type": "Bus", "provider": "Transport Co (VIP)", "price": 650, "duration": "10 hours", "departure": "08:00", "arrival": "18:00", "rating": 4.3},
        {"type": "Bus", "provider": "Nakhonchai Air", "price": 750, "duration": "9h 30m", "departure": "20:00", "arrival": "05:30 (+1)", "rating": 4.5},
        {"type": "Train", "provider": "CNR 1st Class AC Sleeper", "price": 1500, "duration": "13 hours", "departure": "18:10", "arrival": "07:15 (+1)", "rating": 4.9, "availability": "High Demand"},
        {"type": "Train", "provider": "CNR 2nd Class AC Sleeper", "price": 850, "duration": "13 hours", "departure": "18:10", "arrival": "07:15 (+1)", "rating": 4.7, "availability": "Available"},
        {"type": "Train", "provider": "State Railway (Sleeper)", "price": 1200, "duration": "12 hours", "departure": "19:00", "arrival": "07:00 (+1)", "rating": 4.6},
        {"type": "Flight", "provider": "Various Airlines", "price": 1500, "duration": "1h 20m", "departure": "Various", "arrival": "Various", "rating": 4.8},
    ],
    "Chiang Mai-Bangkok": [
        {"type": "Bus", "provider": "Transport Co (VIP)", "price": 650, "duration": "10 hours", "departure": "08:00", "arrival": "18:00", "rating": 4.3},
        {"type": "Train", "provider": "CNR 1st Class AC Sleeper", "price": 1500, "duration": "13 hours", "departure": "18:00", "arrival": "06:50 (+1)", "rating": 4.9, "availability": "High Demand"},
        {"type": "Train", "provider": "CNR 2nd Class AC Sleeper", "price": 850, "duration": "13 hours", "departure": "18:00", "arrival": "06:50 (+1)", "rating": 4.7, "availability": "Available"},
        {"type": "Train", "provider": "State Railway (Sleeper)", "price": 1200, "duration": "12 hours", "departure": "17:00", "arrival": "05:00 (+1)", "rating": 4.6},
        {"type": "Flight", "provider": "Various Airlines", "price": 1400, "duration": "1h 20m", "departure": "Various", "arrival": "Various", "rating": 4.8},
    ],
    "Bangkok-Phuket": [
        {"type": "Bus + Ferry", "provider": "Phantip Travel", "price": 1100, "duration": "14 hours", "departure": "Evening", "arrival": "Morning", "rating": 4.2},
        {"type": "Flight", "provider": "Various Airlines", "price": 1800, "duration": "1h 30m", "departure": "Various", "arrival": "Various", "rating": 4.7},
    ],
    "Phuket-Bangkok": [
        {"type": "Bus + Ferry", "provider": "Phantip Travel", "price": 1100, "duration": "14 hours", "departure": "Evening", "arrival": "Morning", "rating": 4.2},
        {"type": "Flight", "provider": "Various Airlines", "price": 1800, "duration": "1h 30m", "departure": "Various", "arrival": "Various", "rating": 4.7},
    ],
    "Bangkok-Krabi": [
        {"type": "Bus", "provider": "Nakhonchai Air", "price": 850, "duration": "12 hours", "departure": "18:00", "arrival": "06:00 (+1)", "rating": 4.4},
        {"type": "Flight", "provider": "Various Airlines", "price": 2100, "duration": "1h 25m", "departure": "Various", "arrival": "Various", "rating": 4.7},
    ],
    "Krabi-Bangkok": [
        {"type": "Bus", "provider": "Nakhonchai Air", "price": 850, "duration": "12 hours", "departure": "17:00", "arrival": "05:00 (+1)", "rating": 4.4},
        {"type": "Flight", "provider": "Various Airlines", "price": 2100, "duration": "1h 25m", "departure": "Various", "arrival": "Various", "rating": 4.7},
    ],
    "Bangkok-Koh Samui": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 1200, "duration": "13 hours", "departure": "Evening", "arrival": "Morning", "rating": 4.5},
        {"type": "Flight", "provider": "Bangkok Airways", "price": 3500, "duration": "1h 10m", "departure": "Various", "arrival": "Various", "rating": 4.9},
    ],
    "Koh Samui-Bangkok": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 1200, "duration": "13 hours", "departure": "Evening", "arrival": "Morning", "rating": 4.5},
        {"type": "Flight", "provider": "Bangkok Airways", "price": 3500, "duration": "1h 10m", "departure": "Various", "arrival": "Various", "rating": 4.9},
    ],
    "Bangkok-Pattaya": [
        {"type": "Bus", "provider": "Roong Reuang Coach", "price": 120, "duration": "2h 30m", "departure": "Various", "arrival": "Various", "rating": 4.4},
        {"type": "Minivan", "provider": "Bell Travel", "price": 250, "duration": "2 hours", "departure": "Various", "arrival": "Various", "rating": 4.3},
    ],
    "Pattaya-Bangkok": [
        {"type": "Bus", "provider": "Roong Reuang Coach", "price": 120, "duration": "2h 30m", "departure": "Various", "arrival": "Various", "rating": 4.4},
        {"type": "Minivan", "provider": "Bell Travel", "price": 250, "duration": "2 hours", "departure": "Various", "arrival": "Various", "rating": 4.3},
    ],
    "Bangkok-Hua Hin": [
        {"type": "Bus", "provider": "Transport Co", "price": 180, "duration": "3h 30m", "departure": "Various", "arrival": "Various", "rating": 4.3},
        {"type": "Train", "provider": "State Railway", "price": 250, "duration": "4 hours", "departure": "Various", "arrival": "Various", "rating": 4.2},
        {"type": "Minivan", "provider": "Bell Travel", "price": 300, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.4},
    ],
    "Hua Hin-Bangkok": [
        {"type": "Bus", "provider": "Transport Co", "price": 180, "duration": "3h 30m", "departure": "Various", "arrival": "Various", "rating": 4.3},
        {"type": "Train", "provider": "State Railway", "price": 250, "duration": "4 hours", "departure": "Various", "arrival": "Various", "rating": 4.2},
        {"type": "Minivan", "provider": "Bell Travel", "price": 300, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.4},
    ],
    "Chiang Mai-Chiang Rai": [
        {"type": "Bus", "provider": "Green Bus", "price": 250, "duration": "3h 30m", "departure": "Various", "arrival": "Various", "rating": 4.5},
        {"type": "Minivan", "provider": "Private Minivan", "price": 350, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.3},
    ],
    "Chiang Rai-Chiang Mai": [
        {"type": "Bus", "provider": "Green Bus", "price": 250, "duration": "3h 30m", "departure": "Various", "arrival": "Various", "rating": 4.5},
        {"type": "Minivan", "provider": "Private Minivan", "price": 350, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.3},
    ],
    "Chiang Mai-Pai": [
        {"type": "Bus", "provider": "Sombat Tour", "price": 180, "duration": "3h 30m", "departure": "Various", "arrival": "Various", "rating": 4.0},
        {"type": "Minivan", "provider": "Prempracha Transport", "price": 250, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.2},
    ],
    "Pai-Chiang Mai": [
        {"type": "Bus", "provider": "Sombat Tour", "price": 180, "duration": "3h 30m", "departure": "Various", "arrival": "Various", "rating": 4.0},
        {"type": "Minivan", "provider": "Prempracha Transport", "price": 250, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.2},
    ],
    "Phuket-Krabi": [
        {"type": "Bus", "provider": "Phantip Travel", "price": 200, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.2},
        {"type": "Ferry", "provider": "Tigerline Ferry", "price": 450, "duration": "2h 30m", "departure": "09:00", "arrival": "11:30", "rating": 4.6},
    ],
    "Krabi-Phuket": [
        {"type": "Bus", "provider": "Phantip Travel", "price": 200, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.2},
        {"type": "Ferry", "provider": "Tigerline Ferry", "price": 450, "duration": "2h 30m", "departure": "10:00", "arrival": "12:30", "rating": 4.6},
    ],
    "Phuket-Koh Samui": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 850, "duration": "8 hours", "departure": "07:00", "arrival": "15:00", "rating": 4.4},
        {"type": "Flight", "provider": "Bangkok Airways", "price": 3200, "duration": "1 hour", "departure": "Various", "arrival": "Various", "rating": 4.8},
    ],
    "Koh Samui-Phuket": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 850, "duration": "8 hours", "departure": "08:00", "arrival": "16:00", "rating": 4.4},
        {"type": "Flight", "provider": "Bangkok Airways", "price": 3200, "duration": "1 hour", "departure": "Various", "arrival": "Various", "rating": 4.8},
    ],
    "Bangkok-Surat Thani": [
        {"type": "Bus", "provider": "Nakhonchai Air", "price": 600, "duration": "10 hours", "departure": "19:00", "arrival": "05:00 (+1)", "rating": 4.4},
        {"type": "Train", "provider": "State Railway", "price": 800, "duration": "11 hours", "departure": "17:30", "arrival": "04:30 (+1)", "rating": 4.3},
        {"type": "Flight", "provider": "Various Airlines", "price": 2200, "duration": "1h 10m", "departure": "Various", "arrival": "Various", "rating": 4.7},
    ],
    "Surat Thani-Bangkok": [
        {"type": "Bus", "provider": "Nakhonchai Air", "price": 600, "duration": "10 hours", "departure": "18:00", "arrival": "04:00 (+1)", "rating": 4.4},
        {"type": "Train", "provider": "State Railway", "price": 800, "duration": "11 hours", "departure": "16:30", "arrival": "03:30 (+1)", "rating": 4.3},
        {"type": "Flight", "provider": "Various Airlines", "price": 2200, "duration": "1h 10m", "departure": "Various", "arrival": "Various", "rating": 4.7},
    ],
    "Bangkok-Koh Phangan": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 1100, "duration": "14 hours", "departure": "Evening", "arrival": "Morning", "rating": 4.4},
        {"type": "Flight + Ferry", "provider": "Various + Lomprayah", "price": 2800, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.6},
    ],
    "Koh Phangan-Bangkok": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 1100, "duration": "14 hours", "departure": "Morning", "arrival": "Evening", "rating": 4.4},
        {"type": "Flight + Ferry", "provider": "Various + Lomprayah", "price": 2800, "duration": "3 hours", "departure": "Various", "arrival": "Various", "rating": 4.6},
    ],
    "Bangkok-Koh Tao": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 1200, "duration": "15 hours", "departure": "Evening", "arrival": "Morning", "rating": 4.3},
        {"type": "Flight + Ferry", "provider": "Various + Lomprayah", "price": 3000, "duration": "4 hours", "departure": "Various", "arrival": "Various", "rating": 4.5},
    ],
    "Koh Tao-Bangkok": [
        {"type": "Bus + Ferry", "provider": "Lomprayah", "price": 1200, "duration": "15 hours", "departure": "Morning", "arrival": "Evening", "rating": 4.3},
        {"type": "Flight + Ferry", "provider": "Various + Lomprayah", "price": 3000, "duration": "4 hours", "departure": "Various", "arrival": "Various", "rating": 4.5},
    ],
}


# ─── Scraper ─────────────────────────────────────────────────────

def build_affiliate_url(slug_from: str, slug_to: str) -> str:
    """Build 12Go.asia affiliate URL with tracking params."""
    return f"https://12go.asia/en/travel/{slug_from}/{slug_to}?referer={AFFILIATE_ID}&z={AFFILIATE_ID}&sub_id=transport_schedule"


def scrape_route(slug_from: str, slug_to: str) -> Optional[list[dict]]:
    """
    Attempt to scrape prices from 12Go.asia for a given route.
    Returns list of transport options, or None if scraping fails.
    """
    url = f"https://12go.asia/en/travel/{slug_from}/{slug_to}"
    headers = {"User-Agent": USER_AGENT}

    try:
        resp = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "lxml")

        # Look for price data in the page
        # 12Go.asia uses JavaScript-rendered content, so we try to extract
        # any visible price indicators from the static HTML
        options = []

        # Try to find search result items
        result_items = soup.select(".search-result-item, .trip-item, [data-trip-id]")

        for item in result_items:
            try:
                # Extract transport type
                type_el = item.select_one(".transport-type, .vehicle-type, .trip-type")
                transport_type = type_el.get_text(strip=True) if type_el else "Bus"

                # Extract provider
                provider_el = item.select_one(".operator-name, .company-name, .provider")
                provider = provider_el.get_text(strip=True) if provider_el else "Unknown"

                # Extract price
                price_el = item.select_one(".price, .cost, [data-price]")
                if price_el:
                    price_text = price_el.get_text(strip=True)
                    # Extract numeric value
                    price_num = "".join(c for c in price_text if c.isdigit() or c == ".")
                    price = int(float(price_num)) if price_num else 0
                else:
                    continue  # Skip items without price

                # Extract duration
                duration_el = item.select_one(".duration, .travel-time")
                duration = duration_el.get_text(strip=True) if duration_el else "N/A"

                # Extract departure time
                dep_el = item.select_one(".departure-time, .depart-time")
                departure = dep_el.get_text(strip=True) if dep_el else "Various"

                arr_el = item.select_one(".arrival-time, .arrive-time")
                arrival = arr_el.get_text(strip=True) if arr_el else "Various"

                if price > 0:
                    options.append({
                        "type": transport_type,
                        "provider": provider,
                        "price": price,
                        "duration": duration,
                        "departure": departure,
                        "arrival": arrival,
                        "rating": 4.5,  # Default rating
                    })
            except Exception as e:
                log.debug(f"Failed to parse item: {e}")
                continue

        return options if options else None

    except requests.RequestException as e:
        log.warning(f"Failed to scrape {slug_from} → {slug_to}: {e}")
        return None
    except Exception as e:
        log.warning(f"Parse error for {slug_from} → {slug_to}: {e}")
        return None


# ─── Main Logic ──────────────────────────────────────────────────

def build_transport_data() -> dict:
    """Build the full transport data JSON."""
    routes_data = []
    scrape_success = 0
    fallback_used = 0

    for route in ROUTES:
        route_key = f"{route['from']}-{route['to']}"
        log.info(f"Processing: {route['from']} → {route['to']}...")

        # Try scraping first
        scraped = scrape_route(route["slug_from"], route["slug_to"])

        if scraped and len(scraped) > 0:
            options = scraped
            scrape_success += 1
            log.info(f"  ✓ Scraped {len(options)} options")
        else:
            # Use fallback estimates
            options = FALLBACK_PRICES.get(route_key, [])
            fallback_used += 1
            log.info(f"  ⚡ Using fallback ({len(options)} options)")

        # Build affiliate URL
        booking_url = build_affiliate_url(route["slug_from"], route["slug_to"])

        # Add booking URL, currency, and apply price buffer
        for opt in options:
            opt["currency"] = "THB"
            opt["bookingUrl"] = booking_url
            opt["price"] = apply_price_buffer(opt["price"], opt["type"])

        # Sort by price (cheapest first)
        options.sort(key=lambda x: x.get("price", 99999))

        routes_data.append({
            "from": route["from"],
            "to": route["to"],
            "options": options,
        })

    now = datetime.now(timezone.utc).isoformat()
    result = {
        "lastUpdated": now,
        "affiliateId": AFFILIATE_ID,
        "totalRoutes": len(routes_data),
        "scrapeStats": {
            "success": scrape_success,
            "fallback": fallback_used,
        },
        "routes": routes_data,
    }

    log.info(f"\n📊 Results: {scrape_success} scraped, {fallback_used} fallback, {len(routes_data)} total routes")

    # ─── Featured Train Data (BKK-CNX Special Express) ───
    featured_trains = {
        "Bangkok-Chiang Mai": {
            "trainNumber": "9",
            "trainName": "Uttraphimuk Special Express (CNR)",
            "departure": "18:10",
            "arrival": "07:15 (+1)",
            "duration": "13 hours",
            "frequency": "Daily",
            "classes": [
                {
                    "class": "1st Class AC Sleeper",
                    "price": apply_price_buffer(1500, "Train"),
                    "availability": "High Demand — Book 60-90 days ahead",
                    "features": ["Private Lockable Cabin (2 Berth)", "Touchscreen & USB Charging", "Wash Basin & Mirror", "Shared Hot Shower"],
                },
                {
                    "class": "2nd Class AC Sleeper",
                    "price": apply_price_buffer(850, "Train"),
                    "availability": "Available — Book 30-60 days ahead",
                    "features": ["Comfortable Open-Plan Berths", "Privacy Curtains", "Power Outlet at every berth", "Clean Bedding Provided"],
                },
            ],
            "bookingUrl": f"https://12go.asia/en/travel/bangkok/chiang-mai?z={AFFILIATE_ID}&sub_id=featured_train",
            "tips": [
                "Lower berths have windows and more space — book early for best picks",
                "Dining car serves Thai food and drinks — bring snacks too",
                "Hua Lamphong (Bangkok) or Krung Thep Aphiwat station — check your ticket",
            ],
        },
        "Chiang Mai-Bangkok": {
            "trainNumber": "10",
            "trainName": "Uttraphimuk Special Express (CNR)",
            "departure": "18:00",
            "arrival": "06:50 (+1)",
            "duration": "13 hours",
            "frequency": "Daily",
            "classes": [
                {
                    "class": "1st Class AC Sleeper",
                    "price": apply_price_buffer(1500, "Train"),
                    "availability": "High Demand — Book 60-90 days ahead",
                    "features": ["Private Lockable Cabin (2 Berth)", "Touchscreen & USB Charging", "Wash Basin & Mirror", "Shared Hot Shower"],
                },
                {
                    "class": "2nd Class AC Sleeper",
                    "price": apply_price_buffer(850, "Train"),
                    "availability": "Available — Book 30-60 days ahead",
                    "features": ["Comfortable Open-Plan Berths", "Privacy Curtains", "Power Outlet at every berth", "Clean Bedding Provided"],
                },
            ],
            "bookingUrl": f"https://12go.asia/en/travel/chiang-mai/bangkok?z={AFFILIATE_ID}&sub_id=featured_train",
            "tips": [
                "Lower berths have windows and more space — book early for best picks",
                "Dining car serves Thai food and drinks — bring snacks too",
                "Chiang Mai station is central — easy taxi/songthaew to Old City",
            ],
        },
    }

    return result, featured_trains


def main():
    dry_run = "--dry-run" in sys.argv

    log.info("🚀 GoTravel Price Bot starting...")
    data, featured_trains = build_transport_data()

    # Merge featured trains into data
    data["featuredTrains"] = featured_trains

    if dry_run:
        log.info("🔍 DRY RUN — Preview:")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        return

    # Ensure output directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Write JSON
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    log.info(f"✅ Written to: {OUTPUT_PATH}")
    log.info(f"📦 File size: {OUTPUT_PATH.stat().st_size:,} bytes")
    log.info(f"🕐 Last updated: {data['lastUpdated']}")


if __name__ == "__main__":
    main()
