# Setting up Daily Flight Data Refresh on Replit

We have structured the flight bot to run automatically in the background using a scheduler script (`run_bot_daily.py`).

By default, `.replit` has been updated so that anytime your app runs (via `pnpm dev` or in production `node dist/index.js`), it will automatically start the daily background scheduler.

If your Replit instance is set to **"Always On"**, the scheduler will perfectly trigger a data scrape every day at exactly **03:00 AM Myanmar Time (MMT)** (which is 20:30 UTC).

However, if your Replit sleeps (free tier) and wakes up periodically, you can guarantee a daily run by using an external **Ping Service**.

## Option 1: Replit "Always On" (Recommended & Simple)

1. In your Replit project settings, simply ensure the **"Always On"** toggle is enabled (requires a paid plan or enough cycle credits).
2. Because of the modifications we just made to `.replit`, your main dashboard "Run" button now launches the `run_bot_daily.py` script automatically in the background alongside your web frontend.
3. The bot will quietly wait in the background and run precisely at `03:00 AM MMT` daily, emitting a confirmation log to the Replit console.

## Option 2: External Free Cron Ping (For Free Tier Replit)

If your app goes to sleep, you can use a free 3rd-party service (like [cron-job.org](https://cron-job.org/) or [UptimeRobot](https://uptimerobot.com/)) to forcefully wake up your app and trigger the bot simultaneously.

The `run_bot_daily.py` scheduler opens a tiny hidden server on port `8080`.

**Steps to activate:**

1. Go to [cron-job.org](https://cron-job.org/) and create a free account.
2. Click **Create Cronjob**.
3. **URL:** Enter your Replit public URL and append `:8080/run-bot` to it.
   *(Example: `https://gotravel-main-YOURUSERNAME.replit.app:8080/run-bot`)*
4. **Execution schedule:** Set it to run every 24 hours at a specific time (e.g., `20:30 UTC` for `03:00 AM` Myanmar time).
5. Click **Save**.

That's it! The external ping will instantly hit the `/run-bot` endpoint, forcing the python script to run in a separate thread, saving the 60 priority flight entries flawlessly while keeping your app awake.
