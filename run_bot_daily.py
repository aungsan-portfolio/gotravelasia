import json
import time
import subprocess
import schedule
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
import os

# Myanmar time is UTC+6:30. 
# 03:00 AM MMT = 20:30 UTC of the previous day.
# If the server is in UTC, we schedule at 20:30.
TARGET_TIME_UTC = "20:30" 

def run_bot():
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Starting daily flight bot run...")
    subprocess.run(["python", "scripts/flight_bot.py"])
    try:
        with open("client/public/data/flight_data.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            routes_count = len(data.get("routes", []))
            print(f"[FLIGHT BOT] Daily run completed at {time.strftime('%H:%M:%S')} - Updated {routes_count} routes")
    except Exception as e:
        print(f"[FLIGHT BOT] Daily run completed at {time.strftime('%H:%M:%S')} - Updated unknown routes ({e})")

class PingHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/run-bot':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"Bot triggered manually/via cron ping!")
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] External ping received on /run-bot")
            # Run in a separate thread so we respond immediately to the ping service
            threading.Thread(target=run_bot).start()
        else:
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"Flight Bot Scheduler is running. Ping /run-bot to trigger.")

    def log_message(self, format, *args):
        # Suppress automatic HTTP logging for silent background operation
        pass

def start_ping_server():
    port = int(os.getenv("BOT_PORT", "8080"))
    server = HTTPServer(('0.0.0.0', port), PingHandler)
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Ping server listening on port {port}...")
    server.serve_forever()

if __name__ == "__main__":
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Initializing Flight Bot Scheduler...")
    
    # Schedule the daily run for 03:00 AM MMT (UTC+6:30).
    schedule.every().day.at(TARGET_TIME_UTC).do(run_bot)
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Scheduled bot to run daily at {TARGET_TIME_UTC} UTC (03:00 AM MMT).")
    
    # Start the HTTP server in a thread for Option 2 (External Ping)
    threading.Thread(target=start_ping_server, daemon=True).start()
    
    # Keep the schedule loop running for Option 1 (Always On)
    while True:
        schedule.run_pending()
        time.sleep(60)
