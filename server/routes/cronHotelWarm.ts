import { Router } from "express";
import { getHotelCities, getHubCities, type City } from "../../shared/hotels/cities.js";
import { defaultHotelDates } from "../../shared/hotels/searchParams.js";
import { executeHotelSearch } from "../api/hotels.js";
import { getHotelCacheStats } from "../hotels/cache.js";

const router = Router();

// ─── Configuration ─────────────────────────────────────────────────

/** Maximum cities to warm per cron invocation (prevents timeout) */
const MAX_CITIES_PER_RUN = Number(process.env.HOTEL_WARM_MAX_CITIES) || 10;

/** Delay between city warm requests to avoid Agoda rate limiting (ms) */
const DELAY_BETWEEN_CITIES_MS = Number(process.env.HOTEL_WARM_DELAY_MS) || 2000;

/** How many days ahead to warm (tomorrow + N days) */
const WARM_DAYS_AHEAD = [1, 3, 7, 14];

// ─── Helpers ───────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getWarmDates(): Array<{ checkIn: string; checkOut: string }> {
  const now = new Date();
  const MS_PER_DAY = 86_400_000;

  return WARM_DAYS_AHEAD.map((daysAhead) => {
    const checkInDate = new Date(now.getTime() + daysAhead * MS_PER_DAY);
    const checkOutDate = new Date(checkInDate.getTime() + 3 * MS_PER_DAY); // 3-night stay

    return {
      checkIn: checkInDate.toISOString().split("T")[0],
      checkOut: checkOutDate.toISOString().split("T")[0],
    };
  });
}

/**
 * Select which cities to warm. Priority order:
 * 1. Hub cities (highest traffic)
 * 2. Cities with agodaLtCityId (verified, most likely to succeed)
 * 3. Remaining hotel cities
 */
function selectCitiesToWarm(maxCities: number): City[] {
  const hubs = getHubCities().filter((c) => c.hasHotels);
  const verified = getHotelCities().filter(
    (c) => !c.hub && c.agodaLtCityId && c.agodaLtCityId > 0
  );
  const remaining = getHotelCities().filter(
    (c) => !c.hub && (!c.agodaLtCityId || c.agodaLtCityId <= 0)
  );

  const prioritized = [...hubs, ...verified, ...remaining];
  return prioritized.slice(0, maxCities);
}

// ─── Route Handler ─────────────────────────────────────────────────

/**
 * GET /api/cron/warm-hotels
 *
 * Pre-warms the hotel search cache for popular cities and upcoming dates.
 * Designed to be called by Vercel Cron, GitHub Actions, or external scheduler.
 *
 * Auth: Bearer CRON_SECRET
 *
 * Query params (optional):
 *   maxCities  - Override max cities per run (default: 10)
 *   datesOnly  - If "default", only warm default dates (tomorrow+3nights)
 */
router.get("/warm-hotels", async (req: any, res: any) => {
  const startedAt = Date.now();

  // Auth check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const maxCities = Math.min(
      Number(req.query.maxCities) || MAX_CITIES_PER_RUN,
      30 // Hard cap
    );
    const useDefaultDatesOnly = req.query.datesOnly === "default";

    const cities = selectCitiesToWarm(maxCities);
    const datePairs = useDefaultDatesOnly
      ? [defaultHotelDates()]
      : getWarmDates();

    const results: Array<{
      city: string;
      checkIn: string;
      checkOut: string;
      success: boolean;
      hotelCount?: number;
      durationMs: number;
      error?: string;
    }> = [];

    let warmedCount = 0;
    let failedCount = 0;

    for (const city of cities) {
      for (const dates of datePairs) {
        const cityStart = Date.now();

        try {
          const search = await executeHotelSearch({
            city: city.slug,
            checkIn: dates.checkIn,
            checkOut: dates.checkOut,
            adults: "2",
            rooms: "1",
            page: "1",
            sort: "best",
          });

          const hotelCount = search.hotels.length;
          results.push({
            city: city.slug,
            checkIn: dates.checkIn,
            checkOut: dates.checkOut,
            success: true,
            hotelCount,
            durationMs: Date.now() - cityStart,
          });

          warmedCount++;
          console.log(
            `[CronWarm] ✓ ${city.slug} (${dates.checkIn}) → ${hotelCount} hotels (${Date.now() - cityStart}ms)`
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          results.push({
            city: city.slug,
            checkIn: dates.checkIn,
            checkOut: dates.checkOut,
            success: false,
            durationMs: Date.now() - cityStart,
            error: message,
          });

          failedCount++;
          console.error(
            `[CronWarm] ✗ ${city.slug} (${dates.checkIn}) → ${message}`
          );
        }

        // Rate limit between requests
        if (DELAY_BETWEEN_CITIES_MS > 0) {
          await sleep(DELAY_BETWEEN_CITIES_MS);
        }
      }
    }

    const totalDurationMs = Date.now() - startedAt;
    const cacheStats = getHotelCacheStats();

    console.info("[CronWarm] Completed", {
      totalDurationMs,
      citiesProcessed: cities.length,
      datePairsPerCity: datePairs.length,
      warmed: warmedCount,
      failed: failedCount,
    });

    return res.json({
      ok: true,
      message: `Cache warming complete: ${warmedCount} warmed, ${failedCount} failed`,
      summary: {
        citiesProcessed: cities.length,
        datePairsPerCity: datePairs.length,
        totalSearches: warmedCount + failedCount,
        warmed: warmedCount,
        failed: failedCount,
        totalDurationMs,
      },
      cacheStats: {
        l1Size: cacheStats.l1Size,
        hitRate: cacheStats.hitRate,
        totalSets: cacheStats.sets,
      },
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[CronWarm] Fatal error:", message);
    return res.status(500).json({
      error: "Cache warming failed",
      detail: message,
      durationMs: Date.now() - startedAt,
    });
  }
});

export default router;
