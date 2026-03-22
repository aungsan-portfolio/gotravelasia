// ─── Environment ────────────────────────────────────────────────
import dotenv from "dotenv";
import path   from "path";
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), override: true });

// ─── Core deps ──────────────────────────────────────────────────
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter }           from "../routers";
import { createContext }        from "./context";
import { searchHotels }         from "../api/hotels";
import handleAuth              from "../../api/_handlers/auth";
import handleFlights           from "../../api/_handlers/flights";
import handleGeo               from "../../api/_handlers/geo";
import handleNewsletter        from "../../api/_handlers/newsletter";

// ─── Utils ──────────────────────────────────────────────────────
import { findAvailablePort }    from "../utils/port";

// ─── Middleware ─────────────────────────────────────────────────
import { cspOpen }              from "../middleware/csp";

// ─── Routes ─────────────────────────────────────────────────────
import sitemapRouter         from "../routes/sitemap";
import destinationRouter     from "../routes/destinationLanding";
import chatRouter            from "../routes/chat";
import cheapPricesRouter     from "../routes/cheapPrices";
import calendarPricesRouter  from "../routes/calendarPrices";
import priceAlertsRouter     from "../routes/priceAlerts";
import cronRouter            from "../routes/cron";

// ─── App Setup ─────────────────────────────────────────────────
const app = express();

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

export default app;

// ─── Server bootstrap (Local Only) ──────────────────────────────
async function startServer() {
  const server = createServer(app);

  // ── Vite / Static ─────────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    const { serveStatic } = await import("./vite");
    serveStatic(app);
  }

  // ── Listen ────────────────────────────────────────────────────
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  server.listen(port, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${port}/`));
}

// Start server if not running in Vercel serverless environment
if (process.env.VERCEL !== "1") {
  startServer().catch(console.error);
}
