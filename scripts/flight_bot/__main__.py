"""
Entry point: python -m scripts.flight_bot
"""
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

from .bot import FlightBot

if __name__ == "__main__":
    bot = FlightBot()
    bot.run()
    sys.exit(0)
