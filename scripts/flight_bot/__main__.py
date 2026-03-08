"""
Entry point: python -m flight_bot
"""
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

from .bot import FlightBot

if __name__ == "__main__":
    bot = FlightBot()
    bot.run()
