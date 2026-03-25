// ─── Environment ────────────────────────────────────────────────
import dotenv from "dotenv";
import path   from "path";
import fs     from "fs";
fs.appendFileSync("server_debug.log", "[APP] Starting app.ts imports...\n");
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });
fs.appendFileSync("server_debug.log", "[APP] Environment loaded.\n");

// ─── Core deps ──────────────────────────────────────────────────
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth.js";
import { appRouter }           from "../routers.js";
import { createContext }        from "./context.js";
import { searchHotels }         from "../api/hotels.js";
import handleAuth              from "../../api/_handlers/auth.js";
import handleFlights           from "../../api/_handlers/flights.js";
import handleGeo               from "../../api/_handlers/geo.js";
import handleNewsletter        from "../../api/_handlers/newsletter.js";
fs.appendFileSync("server_debug.log", "[APP] Core deps & handlers loaded.\n");

// ─── Utils ──────────────────────────────────────────────────────
import { findAvailablePort }    from "../utils/port.js";

// ─── Middleware ─────────────────────────────────────────────────
import { cspOpen }              from "../middleware/csp.js";

// ─── Routes ─────────────────────────────────────────────────────
import sitemapRouter         from "../routes/sitemap.js";
import destinationRouter     from "../routes/destinationLanding.js";
import chatRouter            from "../routes/chat.js";
import cheapPricesRouter     from "../routes/cheapPrices.js";
import calendarPricesRouter  from "../routes/calendarPrices.js";
import priceAlertsRouter     from "../routes/priceAlerts.js";
import cronRouter            from "../routes/cron.js";
fs.appendFileSync("server_debug.log", "[APP] All routes imported.\n");

// ─── App Setup ─────────────────────────────────────────────────
const app = express();

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth
registerOAuthRoutes(app);

// SEO
app.use(sitemapRouter);

// CSP headers for main pages
app.use(["/", "/transport", "/hotels", "/flights"], cspOpen);

// ── API routes ────────────────────────────────────────────────
app.use("/api/destination-landing", destinationRouter);
app.use("/api/chat",                chatRouter);
app.use("/api/cheap-prices",        cheapPricesRouter);
app.use("/api/calendar-prices",     calendarPricesRouter);
app.use("/api/hotels/search",       searchHotels);
app.use("/api/price-alerts",        priceAlertsRouter);
app.use("/api/alerts",              priceAlertsRouter);
app.use("/api/cron",                cronRouter);
app.use("/api/auth",                handleAuth as any);
app.use("/api/flights",             handleFlights as any);
app.use("/api/geo",                 handleGeo as any);
app.use("/api/newsletter",          handleNewsletter as any);
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

app.get("/api/ping", (req, res) => res.json({ ok: true }));
fs.appendFileSync("server_debug.log", "[APP] App setup complete, exporting app.\n");
export default app;
