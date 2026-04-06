import { Router } from "express";
import { searchFlights } from "../flights/searchFlights.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await searchFlights(req.query as Record<string, any>);
    res.json(result);
  } catch (error) {
    console.error("[FlightsSearch] error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search flights",
      flights: [],
      best: [],
      cheapest: [],
      fastest: [],
      meta: {
        provider: "amadeus",
        count: 0,
        searchedAt: new Date().toISOString(),
      },
    });
  }
});

export default router;
