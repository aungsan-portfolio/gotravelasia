// Auto-generated — do not edit. Source: server/_core/api-entry.ts
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/destination/registry.ts
function toSlug(value) {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
function getSeedBySlug(slug) {
  const normalized = toSlug(slug);
  return DESTINATION_SEEDS.find((s) => toSlug(s.slug) === normalized || s.aliases?.map(toSlug).includes(normalized));
}
var DESTINATION_SEEDS;
var init_registry = __esm({
  "shared/destination/registry.ts"() {
    "use strict";
    DESTINATION_SEEDS = [
      // ... (I will copy the seeds from destinationRegistry.ts)
      { slug: "singapore", city: "Singapore", code: "SIN", airport: "Changi Airport", country: "Singapore", flag: "\u{1F1F8}\u{1F1EC}", priceRatio: 1, avgFlightHours: 2.4, avgTempC: 27, avgRainMm: 190, aliases: ["sin", "singapo", "sg", "singapore-country"], isPopularDestination: true, type: "country" },
      { slug: "brunei", city: "Brunei", code: "BWN", airport: "Brunei Intl Airport", country: "Brunei", flag: "\u{1F1E7}\u{1F1F3}", priceRatio: 1.3, avgFlightHours: 3.2, avgTempC: 27, avgRainMm: 230, aliases: ["bandar-seri-begawan", "bwn", "brunei-darussalam"], isPopularDestination: true, type: "country" },
      { slug: "cambodia", city: "Cambodia", code: "PNH", airport: "Phnom Penh Intl Airport", country: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}", priceRatio: 0.85, avgFlightHours: 1.2, avgTempC: 28, avgRainMm: 150, aliases: ["pnh", "kh"], isPopularDestination: true, type: "country" },
      { slug: "china", city: "China", code: "PEK", airport: "Beijing Capital Intl", country: "China", flag: "\u{1F1E8}\u{1F1F3}", priceRatio: 1.8, avgFlightHours: 5, avgTempC: 13, avgRainMm: 60, aliases: ["cn", "prc", "mainland-china"], isPopularDestination: true, type: "country" },
      { slug: "hong-kong", city: "Hong Kong", code: "HKG", airport: "Hong Kong Intl Airport", country: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}", priceRatio: 1.5, avgFlightHours: 2.8, avgTempC: 23, avgRainMm: 180, aliases: ["hkg", "hk", "hongkong", "hong-kong-country"], isPopularDestination: true, type: "country" },
      { slug: "india", city: "India", code: "BOM", airport: "Chhatrapati Shivaji Intl", country: "India", flag: "\u{1F1EE}\u{1F1F3}", priceRatio: 1.6, avgFlightHours: 4.5, avgTempC: 28, avgRainMm: 200, aliases: ["bom", "in", "bharat"], isPopularDestination: true, type: "country" },
      { slug: "indonesia", city: "Indonesia", code: "CGK", airport: "Soekarno-Hatta Intl", country: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", priceRatio: 1.1, avgFlightHours: 3.5, avgTempC: 27, avgRainMm: 175, aliases: ["cgk", "id"], isPopularDestination: true, type: "country" },
      { slug: "japan", city: "Japan", code: "NRT", airport: "Narita Intl Airport", country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", priceRatio: 2.2, avgFlightHours: 6, avgTempC: 16, avgRainMm: 130, aliases: ["narita", "nrt", "jp"], isPopularDestination: true, type: "country" },
      { slug: "laos", city: "Laos", code: "VTE", airport: "Wattay Intl Airport", country: "Laos", flag: "\u{1F1F1}\u{1F1E6}", priceRatio: 0.9, avgFlightHours: 1.2, avgTempC: 26, avgRainMm: 150, aliases: ["vte", "lao", "lao-pdr"], isPopularDestination: true, type: "country" },
      { slug: "macau", city: "Macau", code: "MFM", airport: "Macau Intl Airport", country: "Macau", flag: "\u{1F1F2}\u{1F1F4}", priceRatio: 1.4, avgFlightHours: 2.5, avgTempC: 23, avgRainMm: 170, aliases: ["mfm", "mo", "macao"], isPopularDestination: true, type: "country" },
      { slug: "malaysia", city: "Malaysia", code: "KUL", airport: "KLIA", country: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", priceRatio: 0.75, avgFlightHours: 2.2, avgTempC: 28, avgRainMm: 210, aliases: ["kul", "my"], isPopularDestination: true, type: "country" },
      { slug: "philippines", city: "Philippines", code: "MNL", airport: "Ninoy Aquino Intl", country: "Philippines", flag: "\u{1F1F5}\u{1F1ED}", priceRatio: 1.2, avgFlightHours: 3.3, avgTempC: 28, avgRainMm: 190, aliases: ["mnl", "ph"], isPopularDestination: true, type: "country" },
      { slug: "south-korea", city: "South Korea", code: "ICN", airport: "Incheon Intl Airport", country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", priceRatio: 2, avgFlightHours: 5.5, avgTempC: 12, avgRainMm: 110, aliases: ["icn", "korea", "kr", "republic-of-korea"], isPopularDestination: true, type: "country" },
      { slug: "taiwan", city: "Taiwan", code: "TPE", airport: "Taoyuan Intl Airport", country: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}", priceRatio: 1.7, avgFlightHours: 3.8, avgTempC: 23, avgRainMm: 160, aliases: ["tpe", "tw"], isPopularDestination: true, type: "country" },
      { slug: "thailand", city: "Thailand", code: "BKK", airport: "Suvarnabhumi Airport", country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", priceRatio: 0.5, avgFlightHours: 1, avgTempC: 29, avgRainMm: 150, aliases: ["bkk", "th", "siam"], isPopularDestination: true, type: "country" },
      { slug: "united-arab-emirates", city: "United Arab Emirates", code: "DXB", airport: "Dubai Intl Airport", country: "United Arab Emirates", flag: "\u{1F1E6}\u{1F1EA}", priceRatio: 2.5, avgFlightHours: 6.5, avgTempC: 28, avgRainMm: 10, aliases: ["uae", "dxb", "emirates", "u-a-e"], isPopularDestination: true, type: "country" },
      { slug: "vietnam", city: "Vietnam", code: "HAN", airport: "Noi Bai Intl Airport", country: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", priceRatio: 0.85, avgFlightHours: 1.8, avgTempC: 24, avgRainMm: 150, aliases: ["han", "vn"], isPopularDestination: true, type: "country" },
      { slug: "yangon", city: "Yangon", code: "RGN", airport: "Yangon Intl Airport", country: "Myanmar", flag: "\u{1F1F2}\u{1F1F2}", priceRatio: 0.8, avgFlightHours: 1.3, avgTempC: 28, avgRainMm: 240, aliases: ["rgn"], isPopularCity: true },
      { slug: "mandalay", city: "Mandalay", code: "MDL", airport: "Mandalay Intl Airport", country: "Myanmar", flag: "\u{1F1F2}\u{1F1F2}", priceRatio: 0.85, avgFlightHours: 1.5, avgTempC: 27, avgRainMm: 130, aliases: ["mdl"], isPopularCity: true },
      { slug: "kuala-lumpur", city: "Kuala Lumpur", code: "KUL", airport: "KLIA", country: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", priceRatio: 0.7, avgFlightHours: 2.2, avgTempC: 28, avgRainMm: 210, aliases: ["kl"], isPopularCity: true },
      { slug: "bangkok", city: "Bangkok", code: "BKK", airport: "Suvarnabhumi Airport", country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", priceRatio: 0.3, avgFlightHours: 1, avgTempC: 29, avgRainMm: 150, aliases: ["bkk"], isPopularCity: true },
      { slug: "seoul", city: "Seoul", code: "ICN", airport: "Incheon Intl Airport", country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", priceRatio: 2, avgFlightHours: 5.5, avgTempC: 12, avgRainMm: 110, aliases: ["icn"], isPopularCity: true },
      { slug: "tokyo", city: "Tokyo", code: "NRT", airport: "Narita Intl Airport", country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", priceRatio: 2.2, avgFlightHours: 6, avgTempC: 16, avgRainMm: 130, aliases: ["narita", "nrt"], isPopularCity: true },
      { slug: "singapore-city", city: "Singapore", code: "SIN", airport: "Changi Airport", country: "Singapore", flag: "\u{1F1F8}\u{1F1EC}", priceRatio: 1, avgFlightHours: 2.4, avgTempC: 27, avgRainMm: 190, aliases: ["singapore-city-page", "singapore-sin"], isPopularCity: true, type: "city" },
      { slug: "hong-kong-city", city: "Hong Kong", code: "HKG", airport: "Hong Kong Intl Airport", country: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}", priceRatio: 1.5, avgFlightHours: 2.8, avgTempC: 23, avgRainMm: 180, aliases: ["hong-kong-city-page", "hong-kong-hkg"], isPopularCity: true, type: "city" },
      { slug: "bali", city: "Bali", code: "DPS", airport: "Ngurah Rai Intl", country: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", priceRatio: 0.98, avgFlightHours: 4.5, avgTempC: 27, avgRainMm: 170, aliases: ["denpasar", "dps"], isPopularCity: true },
      { slug: "phuket", city: "Phuket", code: "HKT", airport: "Phuket Intl Airport", country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", priceRatio: 0.95, avgFlightHours: 2, avgTempC: 28, avgRainMm: 180, aliases: ["hkt"], isPopularCity: true },
      { slug: "da-nang", city: "Da Nang", code: "DAD", airport: "Da Nang Intl Airport", country: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", priceRatio: 0.78, avgFlightHours: 2.5, avgTempC: 25, avgRainMm: 140, aliases: ["dad"], isPopularCity: true },
      { slug: "ho-chi-minh-city", city: "Ho Chi Minh City", code: "SGN", airport: "Tan Son Nhat Intl", country: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", priceRatio: 0.8, avgFlightHours: 2, avgTempC: 28, avgRainMm: 160, aliases: ["sgn", "hcmc"], isPopularCity: true },
      { slug: "siem-reap", city: "Siem Reap", code: "SAI", airport: "Siem Reap\u2013Angkor Intl", country: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}", priceRatio: 0.85, avgFlightHours: 2, avgTempC: 27, avgRainMm: 150, aliases: ["sai"], isPopularCity: true },
      { slug: "taipei", city: "Taipei", code: "TPE", airport: "Taoyuan Intl Airport", country: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}", priceRatio: 1.7, avgFlightHours: 3.8, avgTempC: 23, avgRainMm: 160, aliases: ["tpe"], isPopularCity: true },
      { slug: "osaka", city: "Osaka", code: "OSA", airport: "Kansai Intl Airport", country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", priceRatio: 1.15, avgFlightHours: 6.5, avgTempC: 16, avgRainMm: 110, aliases: ["kix"], isPopularCity: true },
      { slug: "chiang-mai", city: "Chiang Mai", code: "CNX", airport: "Chiang Mai Intl", country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", priceRatio: 0.82, avgFlightHours: 1.5, avgTempC: 26, avgRainMm: 120, aliases: ["cnx"], isPopularCity: true },
      { slug: "phnom-penh", city: "Phnom Penh", code: "PNH", airport: "Phnom Penh Intl Airport", country: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}", priceRatio: 0.85, avgFlightHours: 1.2, avgTempC: 28, avgRainMm: 150, aliases: ["pnh"] },
      { slug: "beijing", city: "Beijing", code: "PEK", airport: "Beijing Capital Intl", country: "China", flag: "\u{1F1E8}\u{1F1F3}", priceRatio: 1.8, avgFlightHours: 5, avgTempC: 13, avgRainMm: 60 },
      { slug: "shanghai", city: "Shanghai", code: "PVG", airport: "Pudong Intl", country: "China", flag: "\u{1F1E8}\u{1F1F3}", priceRatio: 1.7, avgFlightHours: 4.5, avgTempC: 16, avgRainMm: 110 },
      { slug: "guangzhou", city: "Guangzhou", code: "CAN", airport: "Baiyun Intl", country: "China", flag: "\u{1F1E8}\u{1F1F3}", priceRatio: 1.5, avgFlightHours: 4, avgTempC: 22, avgRainMm: 170 },
      { slug: "chengdu", city: "Chengdu", code: "CTU", airport: "Shuangliu Intl", country: "China", flag: "\u{1F1E8}\u{1F1F3}", priceRatio: 1.3, avgFlightHours: 5, avgTempC: 16, avgRainMm: 90 },
      { slug: "shenzhen", city: "Shenzhen", code: "SZX", airport: "Bao'an Intl", country: "China", flag: "\u{1F1E8}\u{1F1F3}", priceRatio: 1.6, avgFlightHours: 4, avgTempC: 23, avgRainMm: 190 },
      { slug: "mumbai", city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji Intl", country: "India", flag: "\u{1F1EE}\u{1F1F3}", priceRatio: 1.6, avgFlightHours: 4.5, avgTempC: 28, avgRainMm: 200 },
      { slug: "dubai", city: "Dubai", code: "DXB", airport: "Dubai Intl Airport", country: "United Arab Emirates", flag: "\u{1F1E6}\u{1F1EA}", priceRatio: 2.5, avgFlightHours: 6.5, avgTempC: 28, avgRainMm: 10 },
      { slug: "hanoi", city: "Hanoi", code: "HAN", airport: "Noi Bai Intl Airport", country: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", priceRatio: 0.9, avgFlightHours: 1.8, avgTempC: 24, avgRainMm: 150 },
      { slug: "krabi", city: "Krabi", code: "KBV", airport: "Krabi Intl Airport", country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", priceRatio: 0.9, avgFlightHours: 2.2, avgTempC: 28, avgRainMm: 170 },
      { slug: "penang", city: "Penang", code: "PEN", airport: "Penang Intl Airport", country: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", priceRatio: 0.75, avgFlightHours: 1.8, avgTempC: 27, avgRainMm: 190 },
      { slug: "luang-prabang", city: "Luang Prabang", code: "LPQ", airport: "Luang Prabang Intl", country: "Laos", flag: "\u{1F1F1}\u{1F1E6}", priceRatio: 0.88, avgFlightHours: 1.5, avgTempC: 25, avgRainMm: 140 }
    ];
  }
});

// server/api/destination-landing.ts
var destination_landing_exports = {};
__export(destination_landing_exports, {
  getDestinationLandingData: () => getDestinationLandingData
});
async function getDestinationLandingData(params) {
  const seed = getSeedBySlug(params.slug);
  if (!seed) {
    throw new Error(`Destination not found: ${params.slug}`);
  }
  return {
    destination: {
      slug: seed.slug,
      city: seed.city,
      country: seed.country,
      iata: seed.code,
      flag: seed.flag,
      airport: seed.airport
    },
    originMarket: "TH",
    popularDestinations: DESTINATION_SEEDS.filter((s) => s.isPopularDestination).map((s) => ({
      slug: s.slug,
      city: s.city,
      country: s.country,
      flag: s.flag,
      iata: s.code
    })),
    popularCities: DESTINATION_SEEDS.filter((s) => s.isPopularCity).map((s) => ({
      slug: s.slug,
      city: s.city,
      country: s.country,
      flag: s.flag,
      iata: s.code
    })),
    priceInsights: {
      cheapestMonth: "May 2026",
      currentMinPrice: 4200
    },
    fareFinder: []
  };
}
var init_destination_landing = __esm({
  "server/api/destination-landing.ts"() {
    "use strict";
    init_registry();
  }
});

// server/_core/app.ts
import dotenv from "dotenv";
import path3 from "path";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, and, asc, isNull, lte, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var flightPriceAlerts = mysqlTable("flightPriceAlerts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  departDate: varchar("departDate", { length: 10 }).notNull(),
  // YYYY-MM-DD
  returnDate: varchar("returnDate", { length: 10 }),
  // YYYY-MM-DD
  targetPrice: int("targetPrice").notNull(),
  lastNotifiedPrice: int("lastNotifiedPrice"),
  currency: varchar("currency", { length: 3 }).default("THB").notNull(),
  routeId: varchar("routeId", { length: 20 }),
  // e.g. "RGN-BKK"
  source: varchar("source", { length: 20 }).default("track_button").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var emailQueue = mysqlTable("emailQueue", {
  id: int("id").autoincrement().primaryKey(),
  toEmail: varchar("toEmail", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  htmlContent: text("htmlContent").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  // pending|processing|pending_retry|sent|failed
  attempts: int("attempts").default(0).notNull(),
  lastError: text("lastError"),
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).default("popup"),
  // popup, google, etc.
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["country", "city", "airport"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  iataCode: varchar("iataCode", { length: 5 }),
  countryCode: varchar("countryCode", { length: 2 }),
  primaryAirports: json("primaryAirports").$type(),
  cities: json("cities").$type(),
  capital: varchar("capital", { length: 255 }),
  weatherData: json("weatherData").$type(),
  priceRatio: json("priceRatio").$type(),
  highlights: text("highlights"),
  climate: text("climate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var hotelDeals = mysqlTable("hotelDeals", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: varchar("hotelId", { length: 64 }).notNull(),
  hotelName: text("hotelName").notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  price: int("price").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  discountPercentage: int("discountPercentage").default(0),
  imageUrl: text("imageUrl"),
  bookingUrl: text("bookingUrl").notNull(),
  checkIn: varchar("checkIn", { length: 10 }),
  // YYYY-MM-DD
  checkOut: varchar("checkOut", { length: 10 }),
  // YYYY-MM-DD
  isBotVerified: boolean("isBotVerified").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    if (existing.length > 0) {
      await db.update(users).set({
        name: user.name,
        email: user.email,
        updatedAt: /* @__PURE__ */ new Date(),
        lastSignedIn: /* @__PURE__ */ new Date()
      }).where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values({
        ...user,
        role: user.role || "user"
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getActivePriceAlerts() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(flightPriceAlerts).where(eq(flightPriceAlerts.isActive, true));
  } catch (err) {
    console.error("[Database] Failed to get active alerts:", err);
    return [];
  }
}
async function updateAlertPrice(id, price) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(flightPriceAlerts).set({ lastNotifiedPrice: price, updatedAt: /* @__PURE__ */ new Date() }).where(eq(flightPriceAlerts.id, id));
  } catch (err) {
    console.error(`[Database] Failed to update alert price for ${id}:`, err);
  }
}
async function touchPriceAlerts(ids) {
  if (!ids.length) return;
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(flightPriceAlerts).set({ updatedAt: /* @__PURE__ */ new Date() }).where(inArray(flightPriceAlerts.id, ids));
  } catch (err) {
    console.error("[Database] Failed to touch price alerts:", err);
  }
}
async function createPriceAlert(alert) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create alert: database not available");
    return { success: false, alreadyExists: false };
  }
  try {
    const existing = await db.select().from(flightPriceAlerts).where(
      and(
        eq(flightPriceAlerts.email, alert.email),
        eq(flightPriceAlerts.origin, alert.origin),
        eq(flightPriceAlerts.destination, alert.destination),
        eq(flightPriceAlerts.departDate, alert.departDate),
        eq(flightPriceAlerts.isActive, true)
      )
    ).limit(1);
    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }
    await db.insert(flightPriceAlerts).values({
      ...alert,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    });
    return { success: true, alreadyExists: false };
  } catch (error) {
    console.error("[Database] Failed to save flight price alert:", error);
    throw error;
  }
}
async function saveSubscriber(values) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const existing = await db.select().from(subscribers).where(eq(subscribers.email, values.email)).limit(1);
    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }
    await db.insert(subscribers).values({
      email: values.email,
      source: values.source || "popup",
      isActive: true
    });
    return { success: true, alreadyExists: false };
  } catch (error) {
    console.error("[Database] Failed to save subscriber:", error);
    throw error;
  }
}
async function ensureEmailQueueTable() {
  const db = await getDb();
  if (!db) return;
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS emailQueue (
      id INT AUTO_INCREMENT PRIMARY KEY,
      toEmail VARCHAR(320) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      htmlContent TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0,
      lastError TEXT NULL,
      scheduledAt TIMESTAMP NULL,
      sentAt TIMESTAMP NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}
async function enqueueEmail(values) {
  const db = await getDb();
  if (!db) return false;
  await db.insert(emailQueue).values({
    toEmail: values.toEmail,
    subject: values.subject,
    htmlContent: values.htmlContent,
    status: "pending",
    scheduledAt: values.scheduledAt ?? null,
    attempts: 0,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  return true;
}
async function getDueEmailQueueItems(batchSize, maxAttempts) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return db.select().from(emailQueue).where(
    and(
      or(eq(emailQueue.status, "pending"), eq(emailQueue.status, "pending_retry")),
      lte(emailQueue.attempts, maxAttempts - 1),
      or(isNull(emailQueue.scheduledAt), lte(emailQueue.scheduledAt, now))
    )
  ).orderBy(asc(emailQueue.id)).limit(batchSize);
}
async function claimEmailQueueItem(id, expectedAttempts) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.execute(sql`
    UPDATE emailQueue
    SET status = 'processing', updatedAt = NOW()
    WHERE id = ${id}
      AND status IN ('pending', 'pending_retry')
      AND attempts = ${expectedAttempts}
  `);
  const affectedRows = Number(result?.[0]?.affectedRows ?? 0);
  return affectedRows > 0;
}
async function markEmailQueueSent(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(emailQueue).set({
    status: "sent",
    sentAt: /* @__PURE__ */ new Date(),
    lastError: null,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(emailQueue.id, id));
}
async function markEmailQueueAttemptFailed(params) {
  const db = await getDb();
  if (!db) return;
  const nextAttempts = params.attempts + 1;
  const hasAttemptsLeft = nextAttempts < params.maxAttempts;
  const retryAt = hasAttemptsLeft ? new Date(Date.now() + params.retryDelayMinutes * 60 * 1e3) : null;
  await db.update(emailQueue).set({
    status: hasAttemptsLeft ? "pending_retry" : "failed",
    attempts: nextAttempts,
    scheduledAt: retryAt,
    lastError: params.error,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(emailQueue.id, params.id));
}

// server/_core/cookies.ts
var LOCAL_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "::1"]);
function isIpAddress(host) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}
function isSecureRequest(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const proto = Array.isArray(forwardedProto) ? forwardedProto.join(",") : forwardedProto;
  return proto.split(",").some((p) => p.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const rawHost = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "";
  const hostname = (Array.isArray(rawHost) ? rawHost[0] : rawHost).split(":")[0].trim();
  const shouldSetDomain = hostname.length > 0 && !LOCAL_HOSTS.has(hostname) && !isIpAddress(hostname);
  const domain = shouldSetDomain ? hostname.startsWith(".") ? hostname : `.${hostname}` : void 0;
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
    ...domain ? { domain } : {}
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  amadeusId: process.env.AMADEUS_CLIENT_ID ?? "",
  amadeusSecret: process.env.AMADEUS_CLIENT_SECRET ?? ""
};

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client2) {
    this.client = client2;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client2 = createOAuthHttpClient()) {
    this.client = client2;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const rawReq = req;
    const rawCookie = rawReq.headers["cookie"];
    const cookieHeader = Array.isArray(rawCookie) ? rawCookie[0] : rawCookie;
    const cookies = this.parseCookies(cookieHeader);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session || !session.openId) {
      throw ForbiddenError("Invalid session cookie or missing openId");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { z as z4 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/transport.ts
function mockSchedules(from, to) {
  const routes = {
    "BKK-CNX": [
      {
        id: "1",
        type: "bus",
        company: "Nok Air",
        departureTime: "08:00",
        arrivalTime: "09:15",
        duration: "1h 15m",
        price: 1200,
        currency: "THB",
        seats: 12,
        rating: 4.8,
        bookingUrl: "https://12go.asia/en/travel/bangkok/chiang-mai?z=14566451&sub_id=transport_api"
      },
      {
        id: "2",
        type: "bus",
        company: "Chiang Mai Tour",
        departureTime: "10:30",
        arrivalTime: "11:45",
        duration: "1h 15m",
        price: 1100,
        currency: "THB",
        seats: 8,
        rating: 4.6,
        bookingUrl: "https://www.12go.asia/en/travel/bus/bangkok-chiang-mai"
      },
      {
        id: "3",
        type: "minibus",
        company: "Thai Airways",
        departureTime: "14:00",
        arrivalTime: "15:30",
        duration: "1h 30m",
        price: 1500,
        currency: "THB",
        seats: 6,
        rating: 4.9,
        bookingUrl: "https://www.12go.asia/en/travel/bus/bangkok-chiang-mai"
      }
    ],
    "BKK-PHK": [
      {
        id: "4",
        type: "bus",
        company: "Phuket Tour",
        departureTime: "07:00",
        arrivalTime: "12:30",
        duration: "5h 30m",
        price: 450,
        currency: "THB",
        seats: 15,
        rating: 4.5,
        bookingUrl: "https://12go.asia/en/travel/bangkok/phuket?z=14566451&sub_id=transport_api"
      },
      {
        id: "5",
        type: "bus",
        company: "First Class Transport",
        departureTime: "09:00",
        arrivalTime: "14:30",
        duration: "5h 30m",
        price: 550,
        currency: "THB",
        seats: 20,
        rating: 4.7,
        bookingUrl: "https://www.12go.asia/en/travel/bus/bangkok-phuket"
      }
    ],
    "CNX-BKK": [
      {
        id: "6",
        type: "bus",
        company: "Nok Air",
        departureTime: "10:00",
        arrivalTime: "11:15",
        duration: "1h 15m",
        price: 1200,
        currency: "THB",
        seats: 10,
        rating: 4.8,
        bookingUrl: "https://12go.asia/en/travel/chiang-mai/bangkok?z=14566451&sub_id=transport_api"
      }
    ],
    "PHK-KBI": [
      {
        id: "7",
        type: "minibus",
        company: "Krabi Express",
        departureTime: "08:00",
        arrivalTime: "10:30",
        duration: "2h 30m",
        price: 300,
        currency: "THB",
        seats: 8,
        rating: 4.6,
        bookingUrl: "https://12go.asia/en/travel/phuket/krabi?z=14566451&sub_id=transport_api"
      }
    ]
  };
  const key = `${from}-${to}`;
  return routes[key] || [];
}
async function searchTransport(params) {
  const { from, to, date } = params;
  const schedules = mockSchedules(from, to);
  return {
    from,
    to,
    date,
    schedules,
    affiliateLink: `https://12go.asia/en/travel/${from.toLowerCase()}/${to.toLowerCase()}?z=14566451&sub_id=transport_api`
  };
}
function getPopularRoutes(destination) {
  const routes = {
    "CNX": [
      { from: "BKK", to: "CNX", label: "Bangkok to Chiang Mai" },
      { from: "CNX", to: "BKK", label: "Chiang Mai to Bangkok" },
      { from: "CNX", to: "PHK", label: "Chiang Mai to Phuket" }
    ],
    "PHK": [
      { from: "BKK", to: "PHK", label: "Bangkok to Phuket" },
      { from: "PHK", to: "KBI", label: "Phuket to Krabi" },
      { from: "PHK", to: "BKK", label: "Phuket to Bangkok" }
    ],
    "KBI": [
      { from: "PHK", to: "KBI", label: "Phuket to Krabi" },
      { from: "KBI", to: "PHK", label: "Krabi to Phuket" }
    ]
  };
  return routes[destination] || [];
}

// server/destinationRouter.ts
import { z as z2 } from "zod";
import { eq as eq2 } from "drizzle-orm";

// server/amadeusAPI.ts
var amadeusToken = null;
var tokenExpiry = null;
async function getAmadeusToken() {
  if (amadeusToken && tokenExpiry && Date.now() < tokenExpiry - 3e4) {
    return amadeusToken;
  }
  if (!ENV.amadeusId || !ENV.amadeusSecret) {
    console.warn("[Amadeus] Missing API credentials in environment.");
    return null;
  }
  try {
    const response = await fetch("https://test.api.amadeus.com/v1/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: ENV.amadeusId,
        client_secret: ENV.amadeusSecret
      })
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error("[Amadeus] Auth failure:", response.status, errText);
      return null;
    }
    const data = await response.json();
    amadeusToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1e3;
    return amadeusToken;
  } catch (error) {
    console.error("[Amadeus] Token fetch error:", error);
    return null;
  }
}
var amadeusAPI = {
  /**
   * Fetches destination metadata from Amadeus location API.
   * Maps 'city' or 'airport' to our unified schema.
   */
  async fetchDestinationData(slug) {
    const token = await getAmadeusToken();
    if (!token) return null;
    try {
      const searchUrl = new URL("https://test.api.amadeus.com/v1/reference-data/locations");
      searchUrl.searchParams.set("subType", "CITY,AIRPORT");
      searchUrl.searchParams.set("keyword", slug.replace(/-/g, " "));
      const response = await fetch(searchUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) return null;
      const json2 = await response.json();
      const results = json2.data || [];
      if (results.length === 0) return null;
      const best = results[0];
      return {
        slug: slug.toLowerCase(),
        type: best.subType === "CITY" ? "city" : "airport",
        name: best.name,
        iataCode: best.iataCode,
        countryCode: best.address?.countryCode,
        primaryAirports: best.subType === "CITY" ? [best.iataCode] : [],
        cities: [],
        capital: null,
        weatherData: null,
        priceRatio: null,
        highlights: null,
        climate: null
      };
    } catch (error) {
      console.error("[Amadeus] Fetch error:", error);
      return null;
    }
  }
};
async function searchAmadeusLocations(keyword) {
  try {
    const token = await getAmadeusToken();
    if (!token) return getFallbackAirports(keyword);
    const res = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(keyword)}&page[limit]=8`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) {
      console.warn("[Amadeus] Search failed, status:", res.status);
      return getFallbackAirports(keyword);
    }
    const data = await res.json();
    return (data.data ?? []).map((loc) => ({
      code: loc.iataCode,
      name: loc.name,
      city: loc.address?.cityName ?? loc.name,
      country: loc.address?.countryName ?? "",
      type: loc.subType === "AIRPORT" ? "airport" : "city"
    }));
  } catch (error) {
    console.error("[Amadeus] Search catch error:", error);
    return getFallbackAirports(keyword);
  }
}
function getFallbackAirports(q) {
  const LOCAL = [
    { code: "RGN", name: "Yangon Intl", city: "Yangon", country: "Myanmar", type: "airport" },
    { code: "MDL", name: "Mandalay Intl", city: "Mandalay", country: "Myanmar", type: "airport" },
    { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", type: "airport" },
    { code: "DMK", name: "Don Mueang", city: "Bangkok", country: "Thailand", type: "airport" },
    { code: "CNX", name: "Chiang Mai Intl", city: "Chiang Mai", country: "Thailand", type: "airport" },
    { code: "HKT", name: "Phuket Intl", city: "Phuket", country: "Thailand", type: "airport" },
    { code: "SIN", name: "Changi Airport", city: "Singapore", country: "Singapore", type: "airport" },
    { code: "KUL", name: "KLIA", city: "Kuala Lumpur", country: "Malaysia", type: "airport" },
    { code: "SGN", name: "Tan Son Nhat", city: "Ho Chi Minh City", country: "Vietnam", type: "airport" },
    { code: "HAN", name: "Noi Bai Intl", city: "Hanoi", country: "Vietnam", type: "airport" },
    { code: "DAD", name: "Da Nang Intl", city: "Da Nang", country: "Vietnam", type: "airport" },
    { code: "REP", name: "Siem Reap Intl", city: "Siem Reap", country: "Cambodia", type: "airport" },
    { code: "HKG", name: "Hong Kong Intl", city: "Hong Kong", country: "Hong Kong", type: "airport" },
    { code: "TYO", name: "Narita Intl", city: "Tokyo", country: "Japan", type: "airport" },
    { code: "OSA", name: "Kansai Intl", city: "Osaka", country: "Japan", type: "airport" },
    { code: "ICN", name: "Incheon Intl", city: "Seoul", country: "South Korea", type: "airport" },
    { code: "DPS", name: "Ngurah Rai Intl", city: "Bali", country: "Indonesia", type: "airport" },
    { code: "DXB", name: "Dubai Intl", city: "Dubai", country: "UAE", type: "airport" }
  ];
  const lq = q.toLowerCase();
  return LOCAL.filter(
    (a) => a.code.toLowerCase().includes(lq) || a.city.toLowerCase().includes(lq) || a.name.toLowerCase().includes(lq) || a.country.toLowerCase().includes(lq)
  ).slice(0, 6);
}

// server/destinationRouter.ts
var destinationRouter = router({
  /**
   * Resolves a destination by its slug.
   * Logic: Check database -> If missing, fetch from Amadeus API -> Cache in DB -> Return.
   */
  resolveDestination: publicProcedure.input(z2.string().min(1)).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const slug = input.toLowerCase();
    try {
      const result = await db.select().from(destinations).where(eq2(destinations.slug, slug)).limit(1);
      if (result.length > 0) {
        return result[0];
      }
      const apiData = await amadeusAPI.fetchDestinationData(slug);
      if (!apiData) return null;
      await db.insert(destinations).values({
        ...apiData,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      return {
        ...apiData,
        id: 0,
        // ID will be assigned by DB, but we return the object for UI
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.error(`[resolveDestination] Error for ${slug}:`, error);
      return null;
    }
  })
});

// shared/flights/normalizeSearchParams.ts
function normalizeSearchParams(raw) {
  const origin = typeof raw.origin === "string" ? raw.origin.toUpperCase() : "";
  let destination = typeof raw.destination === "string" ? raw.destination : void 0;
  if (!destination) destination = typeof raw.to === "string" ? raw.to : void 0;
  if (!destination) destination = typeof raw.arrival === "string" ? raw.arrival : void 0;
  destination = destination ? destination.toUpperCase() : "";
  let rawTripType = typeof raw.tripType === "string" ? raw.tripType.toLowerCase() : void 0;
  if (!rawTripType) rawTripType = typeof raw.type === "string" ? raw.type.toLowerCase() : void 0;
  let tripType = "roundtrip";
  if (rawTripType === "oneway" || rawTripType === "one-way" || rawTripType === "single" || rawTripType === "one_way") {
    tripType = "oneway";
  } else if (rawTripType === "roundtrip" || rawTripType === "return" || rawTripType === "round-trip" || rawTripType === "round_trip" || rawTripType === "both") {
    tripType = "roundtrip";
  } else if (raw.returnDate || raw.return_date) {
    tripType = "roundtrip";
  } else if (raw.departDate && !raw.returnDate && !raw.return_date) {
    tripType = "oneway";
  }
  const departDate = typeof raw.departDate === "string" ? raw.departDate : typeof raw.depart_date === "string" ? raw.depart_date : "";
  let returnDate = typeof raw.returnDate === "string" ? raw.returnDate : typeof raw.return_date === "string" ? raw.return_date : void 0;
  if (tripType === "oneway") {
    returnDate = void 0;
  } else if (tripType === "roundtrip" && !returnDate) {
  }
  const adults = parseInt(raw.adults, 10);
  const childrenInt = parseInt(raw.children, 10);
  const infantsInt = parseInt(raw.infants, 10);
  const rawCabin = typeof raw.cabin === "string" ? raw.cabin : typeof raw.cabinClass === "string" ? raw.cabinClass : "economy";
  let cabinClass = "economy";
  const normalizedCabin = rawCabin.toLowerCase();
  if (normalizedCabin === "premium" || normalizedCabin === "premium_economy") {
    cabinClass = "premium";
  } else if (normalizedCabin === "business") {
    cabinClass = "business";
  } else if (normalizedCabin === "first") {
    cabinClass = "first";
  }
  return {
    origin,
    destination,
    departDate,
    returnDate,
    tripType,
    adults: Number.isFinite(adults) ? adults : 1,
    children: Number.isFinite(childrenInt) ? childrenInt : 0,
    infants: Number.isFinite(infantsInt) ? infantsInt : 0,
    cabinClass
  };
}

// shared/flights/types.ts
import { z as z3 } from "zod";
var DEFAULT_WEIGHTS = {
  price: 0.32,
  duration: 0.22,
  stops: 0.16,
  departureTime: 0.08,
  airline: 0.08,
  risk: 0.1,
  baggage: 0.04
};
var AirportSchema = z3.object({
  iataCode: z3.string().min(3).max(3),
  name: z3.string().min(1),
  city: z3.string().min(1),
  country: z3.string().min(1),
  terminal: z3.string().optional(),
  timeZone: z3.string().optional()
});
var FlightSegmentSchema = z3.object({
  id: z3.string().min(1),
  departure: z3.object({
    airport: AirportSchema,
    localTime: z3.string().min(1),
    utcTime: z3.string().optional()
  }),
  arrival: z3.object({
    airport: AirportSchema,
    localTime: z3.string().min(1),
    utcTime: z3.string().optional()
  }),
  airline: z3.string().min(1),
  marketingAirline: z3.string().optional(),
  operatingAirline: z3.string().optional(),
  flightNumber: z3.string().min(1),
  aircraft: z3.string().optional(),
  durationMinutes: z3.number().int().positive(),
  cabinClass: z3.enum(["economy", "premium", "business", "first"])
});
var LayoverSchema = z3.object({
  airport: AirportSchema,
  durationMinutes: z3.number().int().nonnegative(),
  isSelfTransfer: z3.boolean(),
  requiresTerminalChange: z3.boolean().optional(),
  requiresAirportChange: z3.boolean().optional(),
  riskLevel: z3.enum(["low", "medium", "high"]),
  warning: z3.string().optional()
});
var LayoverInsightSchema = z3.object({
  layoverCount: z3.number().int().nonnegative(),
  longestLayoverMinutes: z3.number().int().nonnegative().optional(),
  shortestLayoverMinutes: z3.number().int().nonnegative().optional(),
  overnightLayoverCount: z3.number().int().nonnegative().optional(),
  highRiskLayoverCount: z3.number().int().nonnegative().optional(),
  confidence: z3.number().min(0).max(1),
  summary: z3.string().optional()
});
var PriceTrendAnalysisSchema = z3.object({
  trend: z3.enum(["down", "stable", "up", "unknown"]),
  confidence: z3.number().min(0).max(1),
  changeAmount: z3.number().optional(),
  changePercent: z3.number().optional(),
  referencePrice: z3.number().positive().optional(),
  referenceCurrency: z3.string().min(3).max(3).optional(),
  observedAt: z3.string().optional(),
  note: z3.string().optional()
});
var FlightLegSchema = z3.object({
  segments: z3.array(FlightSegmentSchema).min(1),
  totalDurationMinutes: z3.number().int().positive(),
  layovers: z3.array(LayoverSchema)
});
var FlightSchema = z3.object({
  id: z3.string().min(1),
  type: z3.enum(["oneway", "roundtrip", "hacker"]),
  outbound: FlightLegSchema,
  return: FlightLegSchema.optional(),
  price: z3.object({
    total: z3.number().positive(),
    currency: z3.string().min(3).max(3),
    baseFare: z3.number().nonnegative().optional(),
    taxes: z3.number().nonnegative().optional(),
    originalTotal: z3.number().positive().optional(),
    originalCurrency: z3.string().min(3).max(3).optional()
  }),
  totalStops: z3.number().int().nonnegative(),
  warnings: z3.array(z3.string()),
  isSelfTransfer: z3.boolean(),
  bookingProvider: z3.string().optional(),
  sourceType: z3.enum(["amadeus", "travelpayouts", "bot_json", "cache", "manual", "unknown"]).optional(),
  deepLink: z3.string().optional(),
  validatingAirline: z3.string().optional(),
  baggageIncluded: z3.boolean().optional(),
  refundable: z3.boolean().optional(),
  mixedCabin: z3.boolean().optional(),
  lastUpdatedAt: z3.string().optional()
});
var EnrichedFlightSchema = FlightSchema.extend({
  layoverInsight: LayoverInsightSchema.optional(),
  priceTrend: PriceTrendAnalysisSchema.optional(),
  intelligenceVersion: z3.string().optional()
});

// shared/flights/stats.ts
function sanitize(numbers) {
  return numbers.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
}
function getMedian(numbers) {
  const sorted = sanitize(numbers);
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function getPercentile(numbers, percentile) {
  const sorted = sanitize(numbers);
  if (sorted.length === 0) return 0;
  if (percentile <= 0) return sorted[0];
  if (percentile >= 100) return sorted[sorted.length - 1];
  const index = percentile / 100 * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}
function getP95(numbers) {
  return getPercentile(numbers, 95);
}
function clamp01(value) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}
function normalizeLowerIsBetter(value, values) {
  const clean = sanitize(values);
  if (clean.length === 0) return 0.5;
  const min = clean[0];
  const p95 = getP95(clean);
  const denom = p95 - min || 1;
  return clamp01(1 - (value - min) / denom);
}

// shared/flights/layoverAnalysis.ts
function getTotalJourneyMinutes(flight) {
  return flight.outbound.totalDurationMinutes + (flight.return?.totalDurationMinutes ?? 0);
}
function getAllLayovers(flight) {
  return [...flight.outbound.layovers, ...flight.return?.layovers ?? []];
}
function compareByLowerPriceThenDuration(a, b) {
  if (a.price.total !== b.price.total) return a.price.total - b.price.total;
  return getTotalJourneyMinutes(a) - getTotalJourneyMinutes(b);
}
function findBestComparableDirectFlight(targetFlight, comparableFlights) {
  const directOptions = comparableFlights.filter((flight) => flight.id !== targetFlight.id && flight.totalStops === 0).sort(compareByLowerPriceThenDuration);
  return directOptions[0] ?? null;
}
function findBestComparableLowerStopFlight(targetFlight, comparableFlights) {
  const lowerStopOptions = comparableFlights.filter(
    (flight) => flight.id !== targetFlight.id && Number.isFinite(flight.totalStops) && flight.totalStops >= 0 && flight.totalStops < targetFlight.totalStops
  ).sort(compareByLowerPriceThenDuration);
  return lowerStopOptions[0] ?? null;
}
function getLayoverBurdenMinutes(flight) {
  const layovers = getAllLayovers(flight);
  let burden = 0;
  for (const layover of layovers) {
    if (layover.isSelfTransfer) burden += 75;
    if (layover.requiresTerminalChange) burden += 35;
    if (layover.requiresAirportChange) burden += 90;
    if (layover.riskLevel === "high") burden += 70;
    else if (layover.riskLevel === "medium") burden += 30;
  }
  return burden;
}
function formatDuration(minutes) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
function formatMoney(value) {
  const rounded = Math.round(value);
  return `$${rounded.toLocaleString("en-US")}`;
}
function analyzeLayoverWorthIt(targetFlight, comparableFlights) {
  if (targetFlight.totalStops <= 0) {
    return {
      isWorthIt: false,
      moneySaved: 0,
      timeAddedMinutes: 0,
      savingsPerHour: 0,
      reason: "Target itinerary is not layover-heavy.",
      confidence: 0.35
    };
  }
  const directBaseline = findBestComparableDirectFlight(targetFlight, comparableFlights);
  const lowerStopBaseline = findBestComparableLowerStopFlight(targetFlight, comparableFlights);
  const baseline = directBaseline ?? lowerStopBaseline;
  if (!baseline) {
    return {
      isWorthIt: false,
      moneySaved: 0,
      timeAddedMinutes: 0,
      savingsPerHour: 0,
      reason: "No lower-stop baseline was available for a fair comparison.",
      confidence: 0.25
    };
  }
  const moneySaved = Number((baseline.price.total - targetFlight.price.total).toFixed(2));
  const rawTimeAddedMinutes = getTotalJourneyMinutes(targetFlight) - getTotalJourneyMinutes(baseline);
  const riskBurdenMinutes = getLayoverBurdenMinutes(targetFlight);
  const effectiveTimeAddedMinutes = Math.max(0, rawTimeAddedMinutes) + riskBurdenMinutes;
  const savingsPerHour = effectiveTimeAddedMinutes > 0 ? Number((moneySaved / (effectiveTimeAddedMinutes / 60)).toFixed(2)) : Number(moneySaved.toFixed(2));
  if (moneySaved <= 0) {
    return {
      isWorthIt: false,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: "Layover itinerary is not cheaper than lower-stop alternatives.",
      confidence: 0.9
    };
  }
  const hasSevereTransferPenalty = getAllLayovers(targetFlight).some(
    (layover) => layover.isSelfTransfer || layover.requiresAirportChange
  );
  if (effectiveTimeAddedMinutes >= 600 && moneySaved < 250) {
    return {
      isWorthIt: false,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: `Adds ${formatDuration(effectiveTimeAddedMinutes)} for only ${formatMoney(moneySaved)} in savings.`,
      confidence: 0.85
    };
  }
  if (hasSevereTransferPenalty && moneySaved < 150) {
    return {
      isWorthIt: false,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: "Transfer complexity is too high relative to the available savings.",
      confidence: 0.8
    };
  }
  const isStrongSavingsForBurden = savingsPerHour >= 40 && moneySaved >= 50 || savingsPerHour >= 25 && moneySaved >= 80 && effectiveTimeAddedMinutes <= 480 || effectiveTimeAddedMinutes <= 90 && moneySaved >= 60;
  if (isStrongSavingsForBurden) {
    return {
      isWorthIt: true,
      moneySaved,
      timeAddedMinutes: effectiveTimeAddedMinutes,
      savingsPerHour,
      reason: `Saves ${formatMoney(moneySaved)} with a manageable added burden of ${formatDuration(
        effectiveTimeAddedMinutes
      )}.`,
      confidence: clamp01(0.62 + Math.min(0.25, moneySaved / 800))
    };
  }
  return {
    isWorthIt: false,
    moneySaved,
    timeAddedMinutes: effectiveTimeAddedMinutes,
    savingsPerHour,
    reason: "Savings are real, but not strong enough relative to added layover burden.",
    confidence: clamp01(0.45 + Math.min(0.2, effectiveTimeAddedMinutes / 1200))
  };
}

// shared/flights/priceTrend.ts
function sanitizeHistoricalPoints(points = []) {
  return points.filter((point) => Number.isFinite(point.price) && point.price > 0);
}
function calculateDispersionRatio(prices, median) {
  if (!prices.length || median <= 0) return 0;
  const variance = prices.reduce((acc, price) => acc + (price - median) ** 2, 0) / prices.length;
  const stdev = Math.sqrt(variance);
  return stdev / median;
}
function computeConfidenceScore(input) {
  const sizeSignal = Math.min(1, input.sampleSize / 12);
  const stabilitySignal = clamp01(1 - input.dispersionRatio);
  let confidence = 0.2 + sizeSignal * 0.45 + stabilitySignal * 0.35;
  if (input.usedFallback) confidence *= 0.55;
  return Number(clamp01(confidence).toFixed(2));
}
function classifyPricePosition(currentPrice, historicalMin, historicalMedian) {
  if (currentPrice < historicalMin) return "below_min";
  if (currentPrice <= historicalMin * 1.03) return "near_min";
  if (currentPrice <= historicalMedian * 0.95) return "below_median";
  if (currentPrice <= historicalMedian * 1.05) return "near_median";
  if (currentPrice <= historicalMedian * 1.2) return "above_median";
  return "far_above_median";
}
function buildTrendChartPoints(historicalPoints, currentPrice) {
  const points = historicalPoints.slice(-24).map((point, index) => ({
    label: point.observedAt ? point.observedAt.slice(0, 10) : `H${index + 1}`,
    price: Number(point.price.toFixed(2))
  }));
  points.push({
    label: "Now",
    price: Number(currentPrice.toFixed(2))
  });
  return points;
}
function fallbackHeuristicForecast(input) {
  const departurePressure = input.daysToDeparture ?? 30;
  if (departurePressure <= 7) {
    return {
      recommendation: "buy_now",
      confidence: 0.34,
      reason: "Limited history; departure is close, so waiting may be riskier.",
      forecastDelta: void 0
    };
  }
  if (departurePressure >= 45) {
    return {
      recommendation: "neutral",
      confidence: 0.28,
      reason: "Limited history and long horizon; monitor prices before committing.",
      forecastDelta: void 0
    };
  }
  return {
    recommendation: "neutral",
    confidence: 0.3,
    reason: "Historical price depth is insufficient for a reliable directional call.",
    forecastDelta: void 0
  };
}
function estimateForecastDelta(prices) {
  if (prices.length < 4) return void 0;
  const lookback = prices.slice(-6);
  const first = lookback[0];
  const last = lookback[lookback.length - 1];
  const stepDelta = (last - first) / (lookback.length - 1);
  const coarseDelta = stepDelta * 3;
  if (!Number.isFinite(coarseDelta)) return void 0;
  return Number(coarseDelta.toFixed(2));
}
function analyzePriceTrend(input) {
  const historicalPoints = sanitizeHistoricalPoints(input.historicalPrices);
  const currentPrice = Number(input.currentPrice.toFixed(2));
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    return {
      recommendation: "neutral",
      confidence: 0,
      reason: "Current price is invalid for trend analysis.",
      currentPrice
    };
  }
  if (historicalPoints.length < 3) {
    const fallback = fallbackHeuristicForecast(input);
    return {
      ...fallback,
      currentPrice
    };
  }
  const historicalPrices = historicalPoints.map((point) => point.price);
  const historicalMin = Number(Math.min(...historicalPrices).toFixed(2));
  const historicalMedian = Number(getMedian(historicalPrices).toFixed(2));
  const dispersionRatio = calculateDispersionRatio(historicalPrices, historicalMedian);
  const forecastDelta = estimateForecastDelta(historicalPrices);
  const position = classifyPricePosition(currentPrice, historicalMin, historicalMedian);
  let recommendation = "neutral";
  let reason = "Price is in a typical range compared with observed history.";
  if (position === "below_min" || position === "near_min" || position === "below_median") {
    recommendation = "buy_now";
    reason = "Current price is near the lower end of historical observations.";
  } else if (position === "far_above_median" || position === "above_median" && typeof forecastDelta === "number" && forecastDelta <= 0) {
    recommendation = "wait";
    reason = "Current price is elevated relative to history with potential downside.";
  }
  const confidence = computeConfidenceScore({
    sampleSize: historicalPoints.length,
    dispersionRatio,
    usedFallback: false
  });
  const trend = typeof forecastDelta !== "number" ? "unknown" : forecastDelta < -2 ? "down" : forecastDelta > 2 ? "up" : "stable";
  return {
    recommendation,
    confidence,
    reason,
    currentPrice,
    historicalMin,
    historicalMedian,
    forecastDelta,
    points: buildTrendChartPoints(historicalPoints, currentPrice),
    analysis: {
      trend,
      confidence,
      changeAmount: forecastDelta,
      changePercent: typeof forecastDelta === "number" && currentPrice > 0 ? Number((forecastDelta / currentPrice * 100).toFixed(2)) : void 0,
      referencePrice: historicalMedian,
      referenceCurrency: input.currency,
      note: reason
    }
  };
}

// shared/flights/dealTags.ts
var PRIMARY_TAG_PRIORITY = [
  "great_deal",
  "price_drop",
  "red_eye_saver",
  "eco_friendly",
  "worth_it",
  "best",
  "great",
  "typical",
  "expensive"
];
function getPriceStats(allFlights) {
  const prices = allFlights.map((f) => f.price.total).filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return null;
  return {
    prices,
    median: getMedian(prices),
    min: Math.min(...prices)
  };
}
function isRedEyeDeparture(flight) {
  const localIso = flight.outbound.segments[0]?.departure.localTime;
  if (!localIso) return false;
  const hour = new Date(localIso).getHours();
  return hour >= 22 || hour < 5;
}
function computeRelativePricePosition(flight, allFlights) {
  const stats = getPriceStats(allFlights);
  if (!stats) {
    return { ratioToMedian: 1, savingsVsMedian: 0, isCheapest: false };
  }
  const ratioToMedian = flight.price.total / stats.median;
  const savingsVsMedian = (stats.median - flight.price.total) / stats.median;
  return {
    ratioToMedian,
    savingsVsMedian,
    isCheapest: flight.price.total <= stats.min
  };
}
function isEcoFriendlyHeuristic(flight, allFlights) {
  const durations = allFlights.map((f) => f.outbound.totalDurationMinutes).filter((d) => Number.isFinite(d) && d > 0);
  const medianDuration = durations.length ? getMedian(durations) : flight.outbound.totalDurationMinutes;
  const isReasonablyEfficientDuration = flight.outbound.totalDurationMinutes <= medianDuration * 1.1;
  return flight.totalStops <= 1 && !flight.isSelfTransfer && isReasonablyEfficientDuration;
}
function getCompatibilityTag(flight, allFlights) {
  const stats = getPriceStats(allFlights);
  if (!stats) return "typical";
  if (flight.price.total <= stats.min) return "best";
  if (flight.price.total <= stats.median * 0.85) return "great";
  if (flight.price.total <= stats.median * 1.15) return "typical";
  return "expensive";
}
function hasSupportedPriceDropSignal(flight, context) {
  const series = context?.historicalSeriesByFlightId?.[flight.id];
  const simplePoint = context?.historicalPriceByFlightId?.[flight.id];
  if (!series && !simplePoint) return false;
  const historicalPrices = series ? series : [{ price: simplePoint.previousTotal, observedAt: simplePoint.observedAt }];
  const result = analyzePriceTrend({
    currentPrice: flight.price.total,
    currency: flight.price.currency,
    historicalPrices
  });
  const isBuySignal = result.recommendation === "buy_now";
  const isHistoricalDrop = result.currentPrice < (result.historicalMedian ?? result.currentPrice);
  if (!series && simplePoint) {
    const dropRatio = (simplePoint.previousTotal - flight.price.total) / simplePoint.previousTotal;
    const confidence = simplePoint.confidence ?? 0.5;
    return dropRatio >= 0.05 && confidence >= 0.5;
  }
  return isBuySignal && isHistoricalDrop && result.confidence >= 0.4;
}
function hasWorthItSignal(flight, allFlights, context) {
  if (!context?.layoverAnalysisSupported) return false;
  const analysis = analyzeLayoverWorthIt(flight, allFlights);
  return analysis.isWorthIt;
}
function getDealTags(flight, allFlights, context) {
  const tags = [];
  const { savingsVsMedian } = computeRelativePricePosition(flight, allFlights);
  if (savingsVsMedian >= 0.18) {
    tags.push("great_deal");
  }
  if (isEcoFriendlyHeuristic(flight, allFlights)) {
    tags.push("eco_friendly");
  }
  if (hasSupportedPriceDropSignal(flight, context)) {
    tags.push("price_drop");
  }
  if (isRedEyeDeparture(flight) && savingsVsMedian >= 0.12) {
    tags.push("red_eye_saver");
  }
  if (hasWorthItSignal(flight, allFlights, context)) {
    tags.push("worth_it");
  }
  tags.push(getCompatibilityTag(flight, allFlights));
  return [...new Set(tags)];
}
function getPrimaryDealTag(tags) {
  for (const tag of PRIMARY_TAG_PRIORITY) {
    if (tags.includes(tag)) return tag;
  }
  return "typical";
}

// shared/flights/flightScoring.ts
function getDepartureHourScore(localIso) {
  if (!localIso) return 0.6;
  const date = new Date(localIso);
  const hour = date.getHours();
  if (hour >= 7 && hour <= 11) return 1;
  if (hour >= 12 && hour <= 17) return 0.9;
  if (hour >= 18 && hour <= 21) return 0.75;
  if (hour >= 5 && hour < 7) return 0.65;
  return 0.35;
}
function getAirlineScore(flight) {
  const airline = (flight.validatingAirline || flight.outbound.segments[0]?.airline || "").toUpperCase();
  const preferred = /* @__PURE__ */ new Set(["SQ", "TG", "MH", "CX", "QR", "EK", "JL", "NH"]);
  const acceptable = /* @__PURE__ */ new Set(["FD", "AK", "TR", "VZ", "SL", "OD", "PR", "VN"]);
  if (preferred.has(airline)) return 0.95;
  if (acceptable.has(airline)) return 0.75;
  if (airline) return 0.6;
  return 0.5;
}
function getStopsScore(stops) {
  if (stops <= 0) return 1;
  if (stops === 1) return 0.75;
  if (stops === 2) return 0.45;
  return 0.2;
}
function getLayoverPenalty(layovers) {
  if (!layovers.length) return 0;
  let penalty = 0;
  for (const layover of layovers) {
    if (layover.riskLevel === "high") penalty += 0.55;
    else if (layover.riskLevel === "medium") penalty += 0.25;
    if (layover.isSelfTransfer) penalty += 0.15;
    if (layover.requiresTerminalChange) penalty += 0.1;
    if (layover.requiresAirportChange) penalty += 0.4;
  }
  return Math.min(0.9, penalty);
}
function getRiskScore(flight) {
  const outboundPenalty = getLayoverPenalty(flight.outbound.layovers);
  const returnPenalty = flight.return ? getLayoverPenalty(flight.return.layovers) : 0;
  const totalPenalty = Math.min(0.95, outboundPenalty + returnPenalty);
  let score = 1 - totalPenalty;
  if (flight.isSelfTransfer) score -= 0.08;
  if (flight.mixedCabin) score -= 0.05;
  return clamp01(score);
}
function getBaggageScore(flight) {
  if (flight.baggageIncluded === true) return 1;
  if (flight.baggageIncluded === false) return 0.55;
  return 0.7;
}
function calculateSmartMixScore(flight, allFlights, customWeights = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };
  const prices = allFlights.map((f) => f.price.total);
  const durations = allFlights.map((f) => f.outbound.totalDurationMinutes);
  const priceScore = normalizeLowerIsBetter(flight.price.total, prices);
  const durationScore = normalizeLowerIsBetter(
    flight.outbound.totalDurationMinutes,
    durations
  );
  const stopsScore = getStopsScore(flight.totalStops);
  const timeScore = getDepartureHourScore(flight.outbound.segments[0]?.departure.localTime);
  const airlineScore = getAirlineScore(flight);
  const riskScore = getRiskScore(flight);
  const baggageScore = getBaggageScore(flight);
  const weighted = priceScore * weights.price + durationScore * weights.duration + stopsScore * weights.stops + timeScore * weights.departureTime + airlineScore * weights.airline + riskScore * weights.risk + baggageScore * weights.baggage;
  const totalWeight = weights.price + weights.duration + weights.stops + weights.departureTime + weights.airline + weights.risk + weights.baggage;
  const finalScore = totalWeight > 0 ? weighted / totalWeight : weighted;
  const tags = getDealTags(flight, allFlights);
  return {
    ...flight,
    score: Number(finalScore.toFixed(4)),
    priceScore: Number(priceScore.toFixed(4)),
    durationScore: Number(durationScore.toFixed(4)),
    stopsScore: Number(stopsScore.toFixed(4)),
    timeScore: Number(timeScore.toFixed(4)),
    airlineScore: Number(airlineScore.toFixed(4)),
    riskScore: Number(riskScore.toFixed(4)),
    baggageScore: Number(baggageScore.toFixed(4)),
    dealTag: getPrimaryDealTag(tags)
  };
}
function scoreFlights(flights, customWeights = {}) {
  return flights.map((flight) => calculateSmartMixScore(flight, flights, customWeights)).sort((a, b) => b.score - a.score);
}

// shared/flights/flightSorting.ts
var BEST_VALUE_PRICE_WEIGHT = 0.6;
var BEST_VALUE_DURATION_WEIGHT = 0.4;
function sortFlights(flights, sortBy) {
  if (!Array.isArray(flights) || flights.length <= 1) return [...flights ?? []];
  switch (sortBy) {
    case "smartMix":
      return sortBySmartMix(flights);
    case "cheapest":
      return sortByNumeric(flights, (flight) => flight.price.total, "asc");
    case "fastest":
      return sortByNumeric(flights, getTotalTripMinutes, "asc");
    case "earliest":
      return sortByNumeric(flights, getFirstDepartureSortValue, "asc");
    case "latest":
      return sortByNumeric(flights, getFirstDepartureSortValue, "desc");
    case "bestValue":
      return sortByBestValue(flights);
    default:
      return [...flights];
  }
}
function getTotalTripMinutes(flight) {
  const outbound = toSafeNonNegativeNumber(flight.outbound.totalDurationMinutes);
  const inbound = toSafeNonNegativeNumber(flight.return?.totalDurationMinutes ?? 0);
  return outbound + inbound;
}
function getFirstDepartureSortValue(flight) {
  return getIsoSortValue(flight.outbound.segments[0]?.departure.localTime);
}
function sortByNumeric(flights, selector, direction = "asc") {
  return flights.map((flight, index) => ({ flight, index })).sort((a, b) => {
    const rawA = selector(a.flight);
    const rawB = selector(b.flight);
    const aValid = Number.isFinite(rawA);
    const bValid = Number.isFinite(rawB);
    if (!aValid && !bValid) return a.index - b.index;
    if (!aValid) return 1;
    if (!bValid) return -1;
    const delta = direction === "asc" ? rawA - rawB : rawB - rawA;
    if (delta !== 0) return delta;
    return a.index - b.index;
  }).map((entry) => entry.flight);
}
function sortBySmartMix(flights) {
  const hasAnyScore = flights.some(
    (flight) => typeof flight.score === "number" && Number.isFinite(flight.score)
  );
  if (!hasAnyScore) return [...flights];
  return sortByNumeric(
    flights,
    (flight) => typeof flight.score === "number" && Number.isFinite(flight.score) ? flight.score : Number.NaN,
    "desc"
  );
}
function sortByBestValue(flights) {
  if (flights.length <= 1) return [...flights];
  const validPrices = flights.map((flight) => flight.price.total).filter((value) => Number.isFinite(value));
  const validDurations = flights.map(getTotalTripMinutes).filter((value) => Number.isFinite(value));
  if (!validPrices.length || !validDurations.length) {
    return [...flights];
  }
  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);
  const minDuration = Math.min(...validDurations);
  const maxDuration = Math.max(...validDurations);
  return sortByNumeric(
    flights,
    (flight) => {
      const price = flight.price.total;
      const duration = getTotalTripMinutes(flight);
      if (!Number.isFinite(price) || !Number.isFinite(duration)) {
        return Number.NaN;
      }
      const normalizedPrice = normalizeAscending(price, minPrice, maxPrice);
      const normalizedDuration = normalizeAscending(
        duration,
        minDuration,
        maxDuration
      );
      return normalizedPrice * BEST_VALUE_PRICE_WEIGHT + normalizedDuration * BEST_VALUE_DURATION_WEIGHT;
    },
    "asc"
  );
}
function normalizeAscending(value, min, max) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return Number.NaN;
  }
  if (max === min) return 0;
  return (value - min) / (max - min);
}
function getIsoSortValue(localIso) {
  if (!localIso) return Number.NaN;
  const match = localIso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
  );
  if (!match) return Number.NaN;
  const [, year, month, day, hour, minute] = match;
  return Number(`${year}${month}${day}${hour}${minute}`);
}
function toSafeNonNegativeNumber(value) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

// server/_core/amadeus.ts
import Amadeus from "amadeus";
var client = null;
var initFailed = false;
function getClient() {
  if (initFailed) return null;
  if (client) return client;
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.warn("[Amadeus] Credentials not configured, skipping");
    initFailed = true;
    return null;
  }
  try {
    client = new Amadeus({
      clientId,
      clientSecret,
      hostname: process.env.AMADEUS_HOSTNAME || "test"
    });
    console.log("[Amadeus] Client initialized successfully");
    return client;
  } catch (err) {
    console.error("[Amadeus] Init failed:", err);
    initFailed = true;
    return null;
  }
}
var cache = /* @__PURE__ */ new Map();
var CACHE_TTL = 60 * 60 * 1e3;
async function fetchAmadeusCalendarPrices(origin, destination, month, currency = "USD") {
  const amadeus = getClient();
  if (!amadeus) return {};
  const cacheKey = `${origin}-${destination}-${month}-${currency}`;
  const cached2 = cache.get(cacheKey);
  if (cached2 && Date.now() - cached2.ts < CACHE_TTL) {
    console.log(`[Amadeus] Cache hit: ${cacheKey}`);
    return cached2.data;
  }
  try {
    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const sampleDays = [5, 15, Math.min(25, daysInMonth)];
    const sampleDates = sampleDays.filter((d) => d <= daysInMonth).map(
      (d) => `${year}-${String(mon).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
    const results = await Promise.allSettled(
      sampleDates.map(async (departureDate) => {
        try {
          const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate,
            adults: 1,
            currencyCode: currency.toUpperCase(),
            nonStop: false,
            max: 3
          });
          if (response?.data?.length > 0) {
            const offer = response.data[0];
            const price = parseFloat(offer.price?.total || "0");
            const airline = offer.validatingAirlineCodes?.[0] || "";
            const segments = offer.itineraries?.[0]?.segments || [];
            const transfers = Math.max(0, segments.length - 1);
            return {
              date: departureDate,
              price,
              airline,
              transfers,
              currencyCode: offer.price?.currency || currency.toUpperCase()
            };
          }
          return null;
        } catch (err) {
          if (err?.response?.statusCode !== 400) {
            console.warn(
              `[Amadeus] ${departureDate}:`,
              err?.response?.result?.errors?.[0]?.detail || err.message
            );
          }
          return null;
        }
      })
    );
    const samplePrices = [];
    for (const r of results) {
      if (r.status === "fulfilled" && r.value && r.value.price > 0) {
        samplePrices.push(r.value);
      }
    }
    if (samplePrices.length === 0) {
      console.log(`[Amadeus] No prices found for ${origin}\u2192${destination} (${month})`);
      cache.set(cacheKey, { data: {}, ts: Date.now() });
      return {};
    }
    const result = {};
    for (const sp of samplePrices) {
      result[sp.date] = {
        price: sp.price,
        origin,
        destination,
        airline: sp.airline,
        departure_at: `${sp.date}T00:00:00`,
        transfers: sp.transfers,
        is_amadeus: true,
        is_estimated_amadeus: false
      };
    }
    for (const sp of samplePrices) {
      const spDate = /* @__PURE__ */ new Date(`${sp.date}T00:00:00`);
      for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0) continue;
        const nearby = new Date(spDate);
        nearby.setDate(nearby.getDate() + offset);
        if (nearby.getMonth() + 1 !== mon || nearby.getFullYear() !== year) continue;
        const nearbyKey = `${year}-${String(mon).padStart(2, "0")}-${String(
          nearby.getDate()
        ).padStart(2, "0")}`;
        if (result[nearbyKey] && !result[nearbyKey].is_estimated_amadeus) continue;
        const variance = 1 + Math.abs(offset) * 0.02 * (offset > 0 ? 1 : -1);
        result[nearbyKey] = {
          price: Math.round(sp.price * variance * 100) / 100,
          origin,
          destination,
          airline: sp.airline,
          departure_at: `${nearbyKey}T00:00:00`,
          transfers: sp.transfers,
          is_amadeus: true,
          is_estimated_amadeus: true
        };
      }
    }
    const realCount = samplePrices.length;
    const totalCount = Object.keys(result).length;
    console.log(
      `[Amadeus] ${origin}\u2192${destination} (${month}): ${realCount} real + ${totalCount - realCount} interpolated = ${totalCount} prices`
    );
    cache.set(cacheKey, { data: result, ts: Date.now() });
    return result;
  } catch (error) {
    console.error(
      "[Amadeus] Fetch error:",
      error?.response?.result?.errors?.[0]?.detail || error.message
    );
    return {};
  }
}
function toAmadeusTravelClass(cabinClass) {
  if (!cabinClass) return void 0;
  switch (cabinClass) {
    case "economy":
      return "ECONOMY";
    case "premium_economy":
      return "PREMIUM_ECONOMY";
    case "business":
      return "BUSINESS";
    case "first":
      return "FIRST";
    default:
      return void 0;
  }
}
async function searchAmadeusFlightOffers(params) {
  const amadeus = getClient();
  if (!amadeus) return [];
  try {
    const request = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departDate,
      adults: params.adults || 1,
      children: params.children || 0,
      infants: params.infants || 0,
      currencyCode: (params.currency || "USD").toUpperCase(),
      nonStop: params.nonStopOnly ?? false,
      max: 20
    };
    if (params.tripType === "roundtrip" && params.returnDate) {
      request.returnDate = params.returnDate;
    }
    const travelClass = toAmadeusTravelClass(params.cabinClass);
    if (travelClass) {
      request.travelClass = travelClass;
    }
    const response = await amadeus.shopping.flightOffersSearch.get(request);
    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error(
      "[Amadeus] Flight offers error:",
      error?.response?.result?.errors?.[0]?.detail || error.message
    );
    return [];
  }
}

// server/flights/adapters/amadeus.ts
import { randomUUID } from "node:crypto";

// shared/flights/airportMct.ts
var DEFAULT_MCT = {
  domestic: 45,
  international: 90,
  terminalChange: 45,
  airportChange: 180,
  immigrationBuffer: 30
};
var AIRPORT_MCT_CONFIG = {
  BKK: { domestic: 45, international: 110, terminalChange: 75, airportChange: 180, immigrationBuffer: 45 },
  DMK: { domestic: 35, international: 85, terminalChange: 60, airportChange: 180, immigrationBuffer: 30 },
  SIN: { domestic: 30, international: 55, terminalChange: 35, airportChange: 180, immigrationBuffer: 25 },
  KUL: { domestic: 40, international: 80, terminalChange: 50, airportChange: 180, immigrationBuffer: 35 },
  SGN: { domestic: 40, international: 90, terminalChange: 60, airportChange: 180, immigrationBuffer: 40 },
  HAN: { domestic: 45, international: 95, terminalChange: 65, airportChange: 180, immigrationBuffer: 45 },
  MNL: { domestic: 50, international: 100, terminalChange: 70, airportChange: 180, immigrationBuffer: 50 },
  HKT: { domestic: 35, international: 70, terminalChange: 45, airportChange: 180, immigrationBuffer: 30 },
  CNX: { domestic: 30, international: 75, terminalChange: 50, airportChange: 180, immigrationBuffer: 35 },
  RGN: { domestic: 40, international: 90, terminalChange: 60, airportChange: 180, immigrationBuffer: 45 },
  LHR: { domestic: 50, international: 120, terminalChange: 110, airportChange: 210, immigrationBuffer: 60 },
  DXB: { domestic: 45, international: 95, terminalChange: 70, airportChange: 180, immigrationBuffer: 40 }
};
function getAirportMctConfig(airportCode) {
  return AIRPORT_MCT_CONFIG[airportCode.toUpperCase()] ?? DEFAULT_MCT;
}
function getMinimumConnectionTime(params) {
  const {
    airportCode,
    isInternational = true,
    hasTerminalChange = false,
    hasAirportChange = false,
    isSelfTransfer = false
  } = params;
  const config = getAirportMctConfig(airportCode);
  let mct = isInternational ? config.international : config.domestic;
  if (hasTerminalChange) mct += config.terminalChange;
  if (hasAirportChange) mct += config.airportChange;
  if (isSelfTransfer) mct += config.immigrationBuffer + 30;
  return Math.max(mct, 45);
}
function classifyLayoverRisk(params) {
  const required = getMinimumConnectionTime(params);
  const actual = params.layoverMinutes;
  if (actual < required) return "high";
  if (actual < required + 45) return "medium";
  return "low";
}

// server/flights/adapters/amadeus.ts
function toAirport(iataCode, terminal) {
  return {
    iataCode: iataCode || "",
    name: iataCode || "",
    city: iataCode || "",
    country: "",
    terminal
  };
}
function diffMinutes(aIso, bIso) {
  if (!aIso || !bIso) return 0;
  const a = (/* @__PURE__ */ new Date(aIso + "Z")).getTime();
  const b = (/* @__PURE__ */ new Date(bIso + "Z")).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 6e4));
}
function isoDurationToMinutes(input) {
  if (!input) return 0;
  const m = input.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  const days = Number(m[1] || 0);
  const hours = Number(m[2] || 0);
  const mins = Number(m[3] || 0);
  return days * 1440 + hours * 60 + mins;
}
function toCabinClass(value) {
  const normalized = (value || "").toUpperCase();
  switch (normalized) {
    case "ECONOMY":
      return "economy";
    case "PREMIUM_ECONOMY":
      return "premium";
    case "BUSINESS":
      return "business";
    case "FIRST":
      return "first";
    default:
      return "economy";
  }
}
function detectMixedCabin(travelerPricings) {
  const firstTraveler = Array.isArray(travelerPricings) ? travelerPricings[0] : null;
  const fareDetails = firstTraveler?.fareDetailsBySegment;
  if (!Array.isArray(fareDetails) || fareDetails.length === 0) return false;
  const cabins = new Set(
    fareDetails.map((f) => String(f?.cabin || "").toUpperCase()).filter(Boolean)
  );
  return cabins.size > 1;
}
function getFareDetailForSegment(travelerPricings, segmentId) {
  const firstTraveler = Array.isArray(travelerPricings) ? travelerPricings[0] : null;
  const fareDetails = firstTraveler?.fareDetailsBySegment;
  if (!Array.isArray(fareDetails)) return void 0;
  return fareDetails.find((f) => f.segmentId === segmentId);
}
function buildLeg(itinerary, travelerPricings) {
  const rawSegments = Array.isArray(itinerary?.segments) ? itinerary.segments : [];
  const segments = rawSegments.map((seg, index) => {
    const fareDetail = getFareDetailForSegment(travelerPricings, seg.id);
    return {
      id: seg.id || `${seg.carrierCode || "XX"}-${seg.number || index}`,
      departure: {
        airport: toAirport(seg.departure?.iataCode || "", seg.departure?.terminal),
        localTime: seg.departure?.at || ""
      },
      arrival: {
        airport: toAirport(seg.arrival?.iataCode || "", seg.arrival?.terminal),
        localTime: seg.arrival?.at || ""
      },
      airline: seg.carrierCode || "",
      marketingAirline: seg.carrierCode || "",
      operatingAirline: seg.operating?.carrierCode || seg.carrierCode || "",
      flightNumber: seg.number || "",
      aircraft: seg.aircraft?.code || "",
      durationMinutes: isoDurationToMinutes(seg.duration),
      cabinClass: toCabinClass(fareDetail?.cabin)
    };
  });
  const layovers = [];
  for (let i = 0; i < segments.length - 1; i += 1) {
    const current = segments[i];
    const next = segments[i + 1];
    const layoverMinutes = diffMinutes(
      current.arrival.localTime,
      next.departure.localTime
    );
    const sameAirport = current.arrival.airport.iataCode === next.departure.airport.iataCode;
    const requiresTerminalChange = Boolean(current.arrival.airport.terminal) && Boolean(next.departure.airport.terminal) && current.arrival.airport.terminal !== next.departure.airport.terminal;
    const requiresAirportChange = !sameAirport;
    const riskLevel = classifyLayoverRisk({
      airportCode: next.departure.airport.iataCode,
      layoverMinutes,
      isInternational: true,
      hasTerminalChange: requiresTerminalChange,
      hasAirportChange: requiresAirportChange,
      isSelfTransfer: false
    });
    let warning;
    if (requiresAirportChange) {
      warning = "Airport change connection";
    } else if (layoverMinutes < 90) {
      warning = "Tight connection";
    }
    layovers.push({
      airport: next.departure.airport,
      durationMinutes: layoverMinutes,
      isSelfTransfer: false,
      requiresTerminalChange,
      requiresAirportChange,
      riskLevel,
      warning
    });
  }
  return {
    segments,
    totalDurationMinutes: isoDurationToMinutes(itinerary?.duration),
    layovers
  };
}
function extractBaggageIncluded(travelerPricings) {
  if (!Array.isArray(travelerPricings) || travelerPricings.length === 0) {
    return void 0;
  }
  for (const traveler of travelerPricings) {
    const details = traveler?.fareDetailsBySegment;
    if (!Array.isArray(details)) continue;
    for (const detail of details) {
      const qty = detail?.includedCheckedBags?.quantity;
      if (typeof qty === "number") {
        if (qty > 0) return true;
      }
    }
  }
  return false;
}
function collectWarnings(outbound, inbound) {
  const warnings = [
    ...outbound.layovers.map((l) => l.warning).filter((value) => Boolean(value)),
    ...inbound?.layovers.map((l) => l.warning).filter((value) => Boolean(value)) || []
  ];
  return [...new Set(warnings)];
}
function normalizeAmadeusOffer(offer) {
  const outbound = buildLeg(offer.itineraries?.[0], offer.travelerPricings);
  const inbound = offer.itineraries?.[1] ? buildLeg(offer.itineraries[1], offer.travelerPricings) : void 0;
  const baggageIncluded = extractBaggageIncluded(offer.travelerPricings);
  const total = Number(offer.price?.total || 0);
  const base = Number(offer.price?.base || 0);
  return {
    id: offer.id || randomUUID(),
    type: inbound ? "roundtrip" : "oneway",
    outbound,
    return: inbound,
    price: {
      total,
      currency: offer.price?.currency || "USD",
      baseFare: Number.isFinite(base) ? base : void 0,
      taxes: Number.isFinite(total) && Number.isFinite(base) ? total - base : void 0
    },
    totalStops: Math.max(0, outbound.segments.length - 1) + (inbound ? Math.max(0, inbound.segments.length - 1) : 0),
    warnings: collectWarnings(outbound, inbound),
    isSelfTransfer: false,
    bookingProvider: "amadeus",
    sourceType: "amadeus",
    validatingAirline: offer.validatingAirlineCodes?.[0],
    baggageIncluded,
    refundable: offer.pricingOptions?.refundableFare ?? void 0,
    mixedCabin: detectMixedCabin(offer.travelerPricings),
    lastUpdatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function normalizeAmadeusOffers(offers) {
  if (!Array.isArray(offers)) return [];
  return offers.map(normalizeAmadeusOffer).filter((flight) => flight.price.total > 0);
}

// server/flights/searchFlights.ts
var searchCache = /* @__PURE__ */ new Map();
var inflightSearches = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 45e3;
var MAX_OFFERS_TO_SCORE = 80;
var MAX_RESULTS = 30;
var MAX_BUCKET_RESULTS = 15;
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function parseSearchContext(raw) {
  const params = normalizeSearchParams(raw);
  const currency = typeof raw.currency === "string" && raw.currency.trim() ? raw.currency.toUpperCase() : "USD";
  const nonStopOnly = raw.nonStopOnly === true || raw.nonStopOnly === "true" || raw.nonStopOnly === "1";
  return { params, currency, nonStopOnly };
}
async function buildFlightSearchResult(raw) {
  const startedAt = Date.now();
  const { params, currency, nonStopOnly } = parseSearchContext(raw);
  if (!params.origin || !params.destination || !params.departDate) {
    return {
      success: false,
      error: "Missing required search params",
      flights: [],
      best: [],
      cheapest: [],
      fastest: [],
      meta: {
        provider: "amadeus",
        count: 0,
        searchedAt: (/* @__PURE__ */ new Date()).toISOString(),
        durationMs: Date.now() - startedAt
      }
    };
  }
  const offers = await searchAmadeusFlightOffers({
    ...params,
    currency,
    nonStopOnly
  });
  const normalized = normalizeAmadeusOffers(offers);
  const scoreLimit = clamp(Number(process.env.FLIGHT_SEARCH_MAX_OFFERS || MAX_OFFERS_TO_SCORE), 20, 120);
  const normalizedLimited = normalized.slice(0, scoreLimit);
  let droppedInvalid = 0;
  const validFlights = normalizedLimited.filter((flight) => {
    const parsed = FlightSchema.safeParse(flight);
    if (!parsed.success) {
      droppedInvalid += 1;
      return false;
    }
    return true;
  });
  const scoredFlights = scoreFlights(validFlights);
  const bestFlights = sortFlights(scoredFlights, "smartMix");
  const cheapestFlights = sortFlights(scoredFlights, "cheapest");
  const fastestFlights = sortFlights(scoredFlights, "fastest");
  const bestLimited = bestFlights.slice(0, MAX_RESULTS);
  const durationMs = Date.now() - startedAt;
  return {
    success: true,
    flights: bestLimited,
    best: bestLimited,
    cheapest: cheapestFlights.slice(0, MAX_BUCKET_RESULTS),
    fastest: fastestFlights.slice(0, MAX_BUCKET_RESULTS),
    meta: {
      provider: "amadeus",
      count: bestLimited.length,
      returnedCount: bestLimited.length,
      rawOfferCount: Array.isArray(offers) ? offers.length : 0,
      normalizedOfferCount: normalized.length,
      consideredOfferCount: normalizedLimited.length,
      validOfferCount: validFlights.length,
      droppedInvalidOfferCount: droppedInvalid,
      searchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      durationMs,
      currency,
      params: {
        ...params,
        nonStopOnly
      }
    }
  };
}
async function searchFlights(raw) {
  const { params, currency, nonStopOnly } = parseSearchContext(raw);
  const cacheKey = JSON.stringify({ ...params, currency, nonStopOnly });
  const now = Date.now();
  const cached2 = searchCache.get(cacheKey);
  if (cached2 && cached2.expiresAt > now) {
    return {
      ...cached2.value,
      meta: {
        ...cached2.value.meta,
        cacheHit: true
      }
    };
  }
  const running = inflightSearches.get(cacheKey);
  if (running) return running;
  const task = buildFlightSearchResult(raw).then((result) => {
    searchCache.set(cacheKey, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return {
      ...result,
      meta: {
        ...result.meta,
        cacheHit: false
      }
    };
  }).finally(() => {
    inflightSearches.delete(cacheKey);
    if (searchCache.size > 200) {
      const oldestKey = searchCache.keys().next().value;
      if (oldestKey) searchCache.delete(oldestKey);
    }
  });
  inflightSearches.set(cacheKey, task);
  return task;
}

// server/routers.ts
var flightSearchInput = z4.object({
  origin: z4.string().min(3).max(3),
  destination: z4.string().min(3).max(3),
  departDate: z4.string().min(10).max(10),
  returnDate: z4.string().optional(),
  tripType: z4.enum(["oneway", "roundtrip"]).optional(),
  adults: z4.coerce.number().int().min(1).max(9).optional(),
  children: z4.coerce.number().int().min(0).max(8).optional(),
  infants: z4.coerce.number().int().min(0).max(4).optional(),
  travelClass: z4.string().optional(),
  currency: z4.string().min(3).max(3).optional(),
  nonStopOnly: z4.coerce.boolean().optional()
});
var flightsRouter = router({
  airportSearch: publicProcedure.input(z4.object({ query: z4.string().min(1).max(50) })).query(async ({ input }) => {
    const q = input.query.trim();
    if (q.length < 2) return [];
    return await searchAmadeusLocations(q);
  }),
  searchResults: publicProcedure.input(flightSearchInput).query(async ({ input }) => {
    return await searchFlights(input);
  })
});
var appRouter = router({
  system: systemRouter,
  destination: destinationRouter,
  flights: flightsRouter,
  auth: router({
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, {
        maxAge: -1,
        secure: true,
        sameSite: "none",
        httpOnly: true,
        path: "/"
      });
      return { success: true };
    })
  }),
  transport: router({
    search: publicProcedure.input(
      z4.object({
        from: z4.string(),
        to: z4.string(),
        date: z4.string()
      })
    ).query(async ({ input }) => {
      return await searchTransport(input);
    }),
    popularRoutes: publicProcedure.input(z4.object({ destination: z4.string() })).query(({ input }) => {
      return getPopularRoutes(input.destination);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// shared/hotels/cities.ts
var CITIES = [
  { iata: "RGN", slug: "yangon", name: "Yangon", nameMM: "\u101B\u1014\u103A\u1000\u102F\u1014\u103A", country: "Myanmar", cc: "MM", flag: "\u{1F1F2}\u{1F1F2}", agodaCityId: 4611, bookingName: "Yangon", twelveGoName: "Yangon", lat: 16.9074, lng: 96.1297, hub: true, hasHotels: true },
  { iata: "MDL", slug: "mandalay", name: "Mandalay", nameMM: "\u1019\u1014\u1039\u1010\u101C\u1031\u1038", country: "Myanmar", cc: "MM", flag: "\u{1F1F2}\u{1F1F2}", agodaCityId: 4612, bookingName: "Mandalay", twelveGoName: "Mandalay", lat: 21.902, lng: 96.0842, hub: false, hasHotels: true },
  { iata: "BKK", slug: "bangkok", name: "Bangkok", nameMM: "\u1018\u1014\u103A\u1000\u1031\u102C\u1000\u103A", country: "Thailand", cc: "TH", flag: "\u{1F1F9}\u{1F1ED}", agodaCityId: 18056, bookingName: "Bangkok", twelveGoName: "Bangkok", lat: 13.7563, lng: 100.5018, hub: true, hasHotels: true },
  { iata: "CNX", slug: "chiang-mai", name: "Chiang Mai", nameMM: "\u1001\u103B\u1004\u103A\u1038\u1019\u102D\u102F\u1004\u103A", country: "Thailand", cc: "TH", flag: "\u{1F1F9}\u{1F1ED}", agodaCityId: 3458, bookingName: "Chiang Mai", twelveGoName: "Chiang Mai", lat: 18.7883, lng: 98.9853, hub: false, hasHotels: true },
  { iata: "HKT", slug: "phuket", name: "Phuket", nameMM: "\u1016\u1030\u1038\u1001\u1000\u103A", country: "Thailand", cc: "TH", flag: "\u{1F1F9}\u{1F1ED}", agodaCityId: 5533, bookingName: "Phuket", twelveGoName: "Phuket", lat: 7.8804, lng: 98.3923, hub: false, hasHotels: true },
  { iata: "DMK", slug: "bangkok-dmk", name: "Bangkok DMK", nameMM: "\u1018\u1014\u103A\u1000\u1031\u102C\u1000\u103A-\u1012\u103D\u1014\u103A\u1019\u1031\u102C\u1004\u103A\u1038", country: "Thailand", cc: "TH", flag: "\u{1F1F9}\u{1F1ED}", agodaCityId: 18056, bookingName: "Bangkok", twelveGoName: "Bangkok", lat: 13.9126, lng: 100.6068, hub: false, hasHotels: false },
  { iata: "KBV", slug: "krabi", name: "Krabi", nameMM: "\u1000\u101B\u102C\u1018\u102E", country: "Thailand", cc: "TH", flag: "\u{1F1F9}\u{1F1ED}", agodaCityId: 8939, bookingName: "Krabi", twelveGoName: "Krabi", lat: 8.099, lng: 98.9862, hub: false, hasHotels: true },
  { iata: "BJS", slug: "beijing", name: "Beijing", nameMM: "\u1015\u1031\u1000\u103B\u1004\u103A\u1038", country: "China", cc: "CN", flag: "\u{1F1E8}\u{1F1F3}", agodaCityId: 3085, bookingName: "Beijing", twelveGoName: "Beijing", lat: 39.9042, lng: 116.4074, hub: true, hasHotels: true },
  { iata: "SHA", slug: "shanghai", name: "Shanghai", nameMM: "\u101B\u103E\u1014\u103A\u101F\u102D\u102F\u1004\u103A\u1038", country: "China", cc: "CN", flag: "\u{1F1E8}\u{1F1F3}", agodaCityId: 6882, bookingName: "Shanghai", twelveGoName: "Shanghai", lat: 31.2304, lng: 121.4737, hub: true, hasHotels: true },
  { iata: "CAN", slug: "guangzhou", name: "Guangzhou", nameMM: "\u1000\u103D\u1019\u103A\u1000\u103B\u102D\u102F\u1038", country: "China", cc: "CN", flag: "\u{1F1E8}\u{1F1F3}", agodaCityId: 3374, bookingName: "Guangzhou", twelveGoName: "Guangzhou", lat: 23.1291, lng: 113.2644, hub: false, hasHotels: true },
  { iata: "KMG", slug: "kunming", name: "Kunming", nameMM: "\u1000\u1030\u1019\u1004\u103A\u1038", country: "China", cc: "CN", flag: "\u{1F1E8}\u{1F1F3}", agodaCityId: 3686, bookingName: "Kunming", twelveGoName: "Kunming", lat: 24.8801, lng: 102.8329, hub: false, hasHotels: true },
  { iata: "CSX", slug: "changsha", name: "Changsha", nameMM: "\u1001\u103B\u1014\u103A\u101B\u103E\u102C", country: "China", cc: "CN", flag: "\u{1F1E8}\u{1F1F3}", agodaCityId: 11516, bookingName: "Changsha", twelveGoName: "Changsha", lat: 28.2278, lng: 112.9388, hub: false, hasHotels: true },
  { iata: "CKG", slug: "chongqing", name: "Chongqing", nameMM: "\u1001\u103B\u102F\u1036\u1000\u1004\u103A\u1038", country: "China", cc: "CN", flag: "\u{1F1E8}\u{1F1F3}", agodaCityId: 3243, bookingName: "Chongqing", twelveGoName: "Chongqing", lat: 29.563, lng: 106.5516, hub: false, hasHotels: true },
  { iata: "CTU", slug: "chengdu", name: "Chengdu", nameMM: "\u1001\u103B\u1014\u103A\u1012\u1030\u1038", country: "China", cc: "CN", flag: "\u{1F1E8}\u{1F1F3}", agodaCityId: 3227, bookingName: "Chengdu", twelveGoName: "Chengdu", lat: 30.5728, lng: 104.0668, hub: false, hasHotels: true },
  { iata: "CCU", slug: "kolkata", name: "Kolkata", nameMM: "\u1000\u102C\u101C\u103A\u1000\u1010\u1039\u1010\u102C\u1038", country: "India", cc: "IN", flag: "\u{1F1EE}\u{1F1F3}", agodaCityId: 3499, bookingName: "Kolkata", twelveGoName: "Kolkata", lat: 22.5726, lng: 88.3639, hub: false, hasHotels: true },
  { iata: "DEL", slug: "delhi", name: "Delhi", nameMM: "\u1012\u1031\u101C\u102E", country: "India", cc: "IN", flag: "\u{1F1EE}\u{1F1F3}", agodaCityId: 1479, bookingName: "New Delhi", twelveGoName: "Delhi", lat: 28.6139, lng: 77.209, hub: true, hasHotels: true },
  { iata: "MAA", slug: "chennai", name: "Chennai", nameMM: "\u1001\u103B\u1014\u103A\u1014\u102D\u102F\u1004\u103A\u1038", country: "India", cc: "IN", flag: "\u{1F1EE}\u{1F1F3}", agodaCityId: 3383, bookingName: "Chennai", twelveGoName: "Chennai", lat: 13.0827, lng: 80.2707, hub: false, hasHotels: true },
  { iata: "GAY", slug: "gaya", name: "Gaya", nameMM: "\u1002\u102B\u101A\u102C", country: "India", cc: "IN", flag: "\u{1F1EE}\u{1F1F3}", agodaCityId: 47898, bookingName: "Gaya", twelveGoName: "Gaya", lat: 24.7496, lng: 85.0077, hub: false, hasHotels: true },
  { iata: "SEL", slug: "seoul", name: "Seoul", nameMM: "\u1006\u102D\u102F\u1038\u101C\u103A", country: "South Korea", cc: "KR", flag: "\u{1F1F0}\u{1F1F7}", agodaCityId: 6682, bookingName: "Seoul", twelveGoName: "Seoul", lat: 37.5665, lng: 126.978, hub: true, hasHotels: true },
  { iata: "PUS", slug: "busan", name: "Busan", nameMM: "\u1018\u1030\u1006\u1014\u103A", country: "South Korea", cc: "KR", flag: "\u{1F1F0}\u{1F1F7}", agodaCityId: 6745, bookingName: "Busan", twelveGoName: "Busan", lat: 35.1796, lng: 129.0756, hub: false, hasHotels: true },
  { iata: "CJU", slug: "jeju", name: "Jeju", nameMM: "\u1002\u103B\u101A\u103A\u1002\u103B\u1030\u1038", country: "South Korea", cc: "KR", flag: "\u{1F1F0}\u{1F1F7}", agodaCityId: 6788, bookingName: "Jeju City", twelveGoName: "Jeju", lat: 33.4996, lng: 126.5312, hub: false, hasHotels: true },
  { iata: "TYO", slug: "tokyo", name: "Tokyo", nameMM: "\u1010\u102D\u102F\u1000\u103B\u102D\u102F", country: "Japan", cc: "JP", flag: "\u{1F1EF}\u{1F1F5}", agodaCityId: 17277, bookingName: "Tokyo", twelveGoName: "Tokyo", lat: 35.6762, lng: 139.6503, hub: true, hasHotels: true },
  { iata: "OSA", slug: "osaka", name: "Osaka", nameMM: "\u1021\u102D\u102F\u1006\u102C\u1000\u102C", country: "Japan", cc: "JP", flag: "\u{1F1EF}\u{1F1F5}", agodaCityId: 8752, bookingName: "Osaka", twelveGoName: "Osaka", lat: 34.6937, lng: 135.5023, hub: false, hasHotels: true },
  { iata: "KUL", slug: "kuala-lumpur", name: "Kuala Lumpur", nameMM: "\u1000\u103D\u102C\u101C\u102C\u101C\u1019\u103A\u1015\u1030", country: "Malaysia", cc: "MY", flag: "\u{1F1F2}\u{1F1FE}", agodaCityId: 3714, bookingName: "Kuala Lumpur", twelveGoName: "Kuala Lumpur", lat: 3.139, lng: 101.6869, hub: true, hasHotels: true },
  { iata: "BKI", slug: "kota-kinabalu", name: "Kota Kinabalu", nameMM: "\u1000\u102D\u102F\u1010\u102C\u1000\u1004\u103A\u1014\u102C\u1018\u102C\u101C\u1030", country: "Malaysia", cc: "MY", flag: "\u{1F1F2}\u{1F1FE}", agodaCityId: 3719, bookingName: "Kota Kinabalu", twelveGoName: "Kota Kinabalu", lat: 5.9804, lng: 116.0735, hub: false, hasHotels: true },
  { iata: "PEN", slug: "penang", name: "Penang", nameMM: "\u1015\u102E\u1014\u1014\u103A\u1038", country: "Malaysia", cc: "MY", flag: "\u{1F1F2}\u{1F1FE}", agodaCityId: 3717, bookingName: "Penang", twelveGoName: "Penang", lat: 5.4141, lng: 100.3288, hub: false, hasHotels: true },
  { iata: "DAD", slug: "da-nang", name: "Da Nang", nameMM: "\u1012\u102B\u1014\u1014\u103A\u1038", country: "Vietnam", cc: "VN", flag: "\u{1F1FB}\u{1F1F3}", agodaCityId: 3386, bookingName: "Da Nang", twelveGoName: "Da Nang", lat: 16.0544, lng: 108.2022, hub: false, hasHotels: true },
  { iata: "SGN", slug: "ho-chi-minh", name: "Ho Chi Minh", nameMM: "\u101F\u102D\u102F\u1001\u103B\u102E\u1019\u1004\u103A\u1038", country: "Vietnam", cc: "VN", flag: "\u{1F1FB}\u{1F1F3}", agodaCityId: 1349, bookingName: "Ho Chi Minh City", twelveGoName: "Ho Chi Minh City", lat: 10.8231, lng: 106.6297, hub: true, hasHotels: true },
  { iata: "HAN", slug: "hanoi", name: "Hanoi", nameMM: "\u101F\u1014\u103D\u102D\u102F\u1004\u103A\u1038", country: "Vietnam", cc: "VN", flag: "\u{1F1FB}\u{1F1F3}", agodaCityId: 2516, bookingName: "Hanoi", twelveGoName: "Hanoi", lat: 21.0285, lng: 105.8542, hub: false, hasHotels: true },
  { iata: "DPS", slug: "bali", name: "Bali", nameMM: "\u1018\u102C\u101C\u102E", country: "Indonesia", cc: "ID", flag: "\u{1F1EE}\u{1F1E9}", agodaCityId: 2553, bookingName: "Bali", twelveGoName: "Bali", lat: -8.3405, lng: 115.092, hub: false, hasHotels: true },
  { iata: "JKT", slug: "jakarta", name: "Jakarta", nameMM: "\u1002\u103B\u1000\u102C\u1010\u102C", country: "Indonesia", cc: "ID", flag: "\u{1F1EE}\u{1F1E9}", agodaCityId: 3393, bookingName: "Jakarta", twelveGoName: "Jakarta", lat: -6.2088, lng: 106.8456, hub: false, hasHotels: true },
  { iata: "SAI", slug: "siem-reap", name: "Siem Reap", nameMM: "\u1005\u102E\u101A\u1019\u103A\u101B\u102D", country: "Cambodia", cc: "KH", flag: "\u{1F1F0}\u{1F1ED}", agodaCityId: 3271, bookingName: "Siem Reap", twelveGoName: "Siem Reap", lat: 13.3633, lng: 103.856, hub: false, hasHotels: true },
  { iata: "PNH", slug: "phnom-penh", name: "Phnom Penh", nameMM: "\u1016\u1014\u103D\u1019\u103A\u1038\u1015\u1004\u103A", country: "Cambodia", cc: "KH", flag: "\u{1F1F0}\u{1F1ED}", agodaCityId: 3272, bookingName: "Phnom Penh", twelveGoName: "Phnom Penh", lat: 11.5564, lng: 104.9282, hub: false, hasHotels: true },
  { iata: "MNL", slug: "manila", name: "Manila", nameMM: "\u1019\u1014\u102E\u101C\u102C", country: "Philippines", cc: "PH", flag: "\u{1F1F5}\u{1F1ED}", agodaCityId: 3878, bookingName: "Manila", twelveGoName: "Manila", lat: 14.5995, lng: 120.9842, hub: true, hasHotels: true },
  { iata: "CEB", slug: "cebu", name: "Cebu", nameMM: "\u1006\u102E\u1018\u1030\u1038", country: "Philippines", cc: "PH", flag: "\u{1F1F5}\u{1F1ED}", agodaCityId: 3879, bookingName: "Cebu City", twelveGoName: "Cebu", lat: 10.3157, lng: 123.8854, hub: false, hasHotels: true },
  { iata: "SIN", slug: "singapore", name: "Singapore", nameMM: "\u1005\u1004\u103A\u1000\u102C\u1015\u1030", country: "Singapore", cc: "SG", flag: "\u{1F1F8}\u{1F1EC}", agodaCityId: 10307, bookingName: "Singapore", twelveGoName: "Singapore", lat: 1.3521, lng: 103.8198, hub: true, hasHotels: true },
  { iata: "TPE", slug: "taipei", name: "Taipei", nameMM: "\u1010\u102D\u102F\u1004\u103A\u1015\u1031", country: "Taiwan", cc: "TW", flag: "\u{1F1F9}\u{1F1FC}", agodaCityId: 2427, bookingName: "Taipei", twelveGoName: "Taipei", lat: 25.033, lng: 121.5654, hub: false, hasHotels: true },
  { iata: "HKG", slug: "hong-kong", name: "Hong Kong", nameMM: "\u101F\u1031\u102C\u1004\u103A\u1000\u1031\u102C\u1004\u103A", country: "Hong Kong", cc: "HK", flag: "\u{1F1ED}\u{1F1F0}", agodaCityId: 2515, bookingName: "Hong Kong", twelveGoName: "Hong Kong", lat: 22.3193, lng: 114.1694, hub: false, hasHotels: true },
  { iata: "MFM", slug: "macau", name: "Macau", nameMM: "\u1019\u1000\u102C\u1021\u102D\u102F", country: "Macau", cc: "MO", flag: "\u{1F1F2}\u{1F1F4}", agodaCityId: 2609, bookingName: "Macau", twelveGoName: "Macau", lat: 22.1987, lng: 113.5439, hub: false, hasHotels: true },
  { iata: "LPQ", slug: "luang-prabang", name: "Luang Prabang", nameMM: "\u101C\u102C\u1021\u102D\u102F", country: "Laos", cc: "LA", flag: "\u{1F1F1}\u{1F1E6}", agodaCityId: 2594, bookingName: "Luang Prabang", twelveGoName: "Luang Prabang", lat: 19.8845, lng: 102.1348, hub: false, hasHotels: true },
  { iata: "DXB", slug: "dubai", name: "Dubai", nameMM: "\u1012\u1030\u1018\u102D\u102F\u1004\u103A\u1038", country: "UAE", cc: "AE", flag: "\u{1F1E6}\u{1F1EA}", agodaCityId: 11867, bookingName: "Dubai", twelveGoName: "Dubai", lat: 25.2048, lng: 55.2708, hub: false, hasHotels: true },
  { iata: "BWN", slug: "brunei", name: "Brunei", nameMM: "\u1018\u101B\u1030\u1014\u102D\u102F\u1004\u103A\u1038", country: "Brunei", cc: "BN", flag: "\u{1F1E7}\u{1F1F3}", agodaCityId: 3155, bookingName: "Bandar Seri Begawan", twelveGoName: "Brunei", lat: 4.9031, lng: 114.9398, hub: false, hasHotels: true }
];
var cityBySlug = new Map(CITIES.map((city) => [city.slug, city]));
var cityByIata = new Map(CITIES.map((city) => [city.iata, city]));
var cityByAgoda = new Map(CITIES.filter((city) => city.agodaCityId).map((city) => [city.agodaCityId, city]));
var getCityBySlug = (slug) => cityBySlug.get(slug);
var getHotelCities = () => CITIES.filter((city) => city.hasHotels);
var CITIES_BY_COUNTRY = CITIES.reduce((acc, city) => {
  if (!acc[city.country]) acc[city.country] = { flag: city.flag, cc: city.cc, cities: [] };
  acc[city.country].cities.push(city);
  return acc;
}, {});
var HOTEL_CITIES_SORTED = [...getHotelCities()].sort((a, b) => {
  if (a.hub !== b.hub) return b.hub ? 1 : -1;
  if (a.cc === "MM" && b.cc !== "MM") return -1;
  if (b.cc === "MM" && a.cc !== "MM") return 1;
  return a.name.localeCompare(b.name);
});

// shared/hotels/searchParams.ts
var MS_PER_DAY = 864e5;
var DEFAULT_CITY = "yangon";
var DEFAULT_ADULTS = 2;
var DEFAULT_ROOMS = 1;
var DEFAULT_PAGE = 1;
var MAX_ADULTS = 8;
var MAX_ROOMS = 5;
var MAX_PAGE = 100;
var MAX_STAY_NIGHTS = 30;
var HOTEL_SORT_VALUES = [
  "best",
  "rank",
  "price_asc",
  "price_desc",
  "stars_desc",
  "review_desc"
];
function toIsoDate(date) {
  return date.toISOString().split("T")[0];
}
function defaultHotelDates(baseDate = /* @__PURE__ */ new Date()) {
  const checkInDate = new Date(baseDate.getTime() + MS_PER_DAY);
  const checkOutDate = new Date(baseDate.getTime() + 4 * MS_PER_DAY);
  return {
    checkIn: toIsoDate(checkInDate),
    checkOut: toIsoDate(checkOutDate)
  };
}
function validateHotelSearchParams(params) {
  const errors = [];
  if (!params.city) errors.push("City is required.");
  if (!params.checkIn || !isIsoDate(params.checkIn))
    errors.push("Check-in date must use YYYY-MM-DD.");
  if (!params.checkOut || !isIsoDate(params.checkOut))
    errors.push("Check-out date must use YYYY-MM-DD.");
  if (typeof params.adults !== "number" || Number.isNaN(params.adults) || params.adults < 1 || params.adults > MAX_ADULTS) {
    errors.push(`Adults must be between 1 and ${MAX_ADULTS}.`);
  }
  if (typeof params.rooms !== "number" || Number.isNaN(params.rooms) || params.rooms < 1 || params.rooms > MAX_ROOMS) {
    errors.push(`Rooms must be between 1 and ${MAX_ROOMS}.`);
  }
  if (typeof params.page !== "number" || Number.isNaN(params.page) || params.page < 1 || params.page > MAX_PAGE) {
    errors.push(`Page must be between 1 and ${MAX_PAGE}.`);
  }
  if (params.sort && !HOTEL_SORT_VALUES.includes(params.sort)) {
    errors.push("Sort option is invalid.");
  }
  if (params.checkIn && params.checkOut && isIsoDate(params.checkIn) && isIsoDate(params.checkOut)) {
    const checkInDate = /* @__PURE__ */ new Date(`${params.checkIn}T00:00:00Z`);
    const checkOutDate = /* @__PURE__ */ new Date(`${params.checkOut}T00:00:00Z`);
    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / MS_PER_DAY
    );
    if (nights < 1) errors.push("Check-out must be after check-in.");
    if (nights > MAX_STAY_NIGHTS)
      errors.push(`Stay length cannot exceed ${MAX_STAY_NIGHTS} nights.`);
  }
  return errors;
}
function normalizeHotelSearchParams(input) {
  const defaults = defaultHotelDates();
  const normalized = {
    city: sanitizeCity(input.city) ?? DEFAULT_CITY,
    cityName: sanitizeCityName(input.cityName),
    checkIn: isIsoDate(input.checkIn) ? input.checkIn : defaults.checkIn,
    checkOut: isIsoDate(input.checkOut) ? input.checkOut : defaults.checkOut,
    adults: clampInteger(input.adults, DEFAULT_ADULTS, 1, MAX_ADULTS),
    rooms: clampInteger(input.rooms, DEFAULT_ROOMS, 1, MAX_ROOMS),
    page: clampInteger(input.page, DEFAULT_PAGE, 1, MAX_PAGE),
    sort: HOTEL_SORT_VALUES.includes(input.sort) ? input.sort : "best"
  };
  const dateErrors = validateHotelSearchParams({
    city: normalized.city,
    ...normalized.cityName ? { cityName: normalized.cityName } : {},
    checkIn: normalized.checkIn,
    checkOut: normalized.checkOut,
    adults: normalized.adults,
    rooms: normalized.rooms,
    page: normalized.page,
    sort: normalized.sort
  });
  if (dateErrors.includes("Check-out must be after check-in.")) {
    normalized.checkOut = toIsoDate(
      new Date(
        (/* @__PURE__ */ new Date(`${normalized.checkIn}T00:00:00Z`)).getTime() + 3 * MS_PER_DAY
      )
    );
  }
  return normalized;
}
function clampInteger(value, fallback, min, max) {
  const parsed = typeof value === "number" ? value : parseOptionalInt(String(value ?? ""));
  if (typeof parsed !== "number" || Number.isNaN(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
function parseOptionalInt(value) {
  if (!value) return void 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : void 0;
}
function isIsoDate(value) {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
function sanitizeCityName(value) {
  if (!value) return void 0;
  const trimmed = value.trim();
  return trimmed || void 0;
}
function sanitizeCity(value) {
  if (!value) return void 0;
  const trimmed = value.trim().toLowerCase();
  return trimmed || void 0;
}

// server/api/hotels.ts
var AGODA_SITE_ID = process.env.AGODA_SITE_ID ?? "";
var AGODA_API_KEY = process.env.AGODA_API_KEY ?? "";
var AWIN_TOKEN = process.env.AWIN_TOKEN ?? "";
var AWIN_PUB_ID = process.env.AWIN_PUBLISHER_ID ?? "";
var BOOKING_ADV = process.env.BOOKING_AWIN_ADV_ID ?? "5910";
var TRIP_SITE_ID = process.env.TRIP_COM_SITE_ID ?? "";
var KLOOK_ID = process.env.KLOOK_PARTNER_ID ?? "";
var EXPEDIA_CODE = process.env.EXPEDIA_TP_CODE ?? "ZZxDEika";
var PAGE_SIZE = 20;
var cache2 = /* @__PURE__ */ new Map();
var warnedMessages = /* @__PURE__ */ new Set();
async function cached(key, fn, ttlSeconds) {
  const hit = cache2.get(key);
  if (hit && Date.now() < hit.exp) return hit.val;
  const val = await fn();
  cache2.set(key, { val, exp: Date.now() + ttlSeconds * 1e3 });
  return val;
}
function safeWarnOnce(message) {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(`[Hotels] ${message}`);
}
function agodaSearchUrl(cityId, checkIn, checkOut, adults, rooms) {
  const params = new URLSearchParams({
    city: String(cityId),
    checkIn,
    checkOut,
    rooms: String(rooms),
    adults: String(adults),
    cid: AGODA_SITE_ID
  });
  return `https://www.agoda.com/search?${params.toString()}`;
}
function agodaHotelUrl(hotelId, cityId, checkIn, checkOut, adults, rooms) {
  const params = new URLSearchParams({
    hotel_id: hotelId,
    city: String(cityId),
    checkIn,
    checkOut,
    adults: String(adults),
    rooms: String(rooms)
  });
  if (AGODA_SITE_ID) params.set("cid", AGODA_SITE_ID);
  return `https://www.agoda.com/search?${params.toString()}`;
}
function bookingUrl(destinationName, checkIn, checkOut, adults, rooms) {
  const params = new URLSearchParams({
    ss: destinationName,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(adults),
    no_rooms: String(rooms)
  });
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}
function tripUrl(cityName, checkIn, checkOut, adults) {
  const destination = `https://www.trip.com/hotels/list?city=${encodeURIComponent(cityName)}&checkIn=${checkIn}&checkOut=${checkOut}&adult=${adults}`;
  return TRIP_SITE_ID ? `https://www.trip.com/affiliate?site_id=${TRIP_SITE_ID}&url=${encodeURIComponent(destination)}` : destination;
}
function klookUrl(cityName, checkIn, checkOut, adults) {
  const params = new URLSearchParams({
    city: cityName,
    checkin: checkIn,
    checkout: checkOut,
    adults: String(adults)
  });
  if (KLOOK_ID) params.set("aid", KLOOK_ID);
  return `https://www.klook.com/hotels/search/?${params.toString()}`;
}
function expediaUrl(destinationName, checkIn, checkOut, adults) {
  const destination = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(destinationName)}&startDate=${checkIn}&endDate=${checkOut}&adults=${adults}`;
  return `https://expedia.tpx.gr/${EXPEDIA_CODE}?url=${encodeURIComponent(destination)}`;
}
async function awinDeepLink(destinationUrl) {
  const key = `awin:${Buffer.from(destinationUrl).toString("base64").slice(0, 60)}`;
  return cached(
    key,
    async () => {
      if (!AWIN_TOKEN || !AWIN_PUB_ID) return destinationUrl;
      try {
        const response = await fetch(
          `https://api.awin.com/publishers/${AWIN_PUB_ID}/linkbuilder/generate`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${AWIN_TOKEN}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              advertiserId: parseInt(BOOKING_ADV, 10),
              destinationUrl
            })
          }
        );
        const payload = await response.json();
        return payload.url ?? destinationUrl;
      } catch {
        return destinationUrl;
      }
    },
    86400
  );
}
function buildAffiliateLinks(cityName, bookingName, cityId, checkIn, checkOut, adults, rooms) {
  return {
    agoda: agodaSearchUrl(cityId, checkIn, checkOut, adults, rooms),
    booking: bookingUrl(bookingName, checkIn, checkOut, adults, rooms),
    trip: tripUrl(cityName, checkIn, checkOut, adults),
    klook: klookUrl(cityName, checkIn, checkOut, adults),
    expedia: expediaUrl(bookingName, checkIn, checkOut, adults)
  };
}
function buildFallbackCoordinates(city, index) {
  const cityLat = city.lat;
  const cityLng = city.lng;
  if (typeof cityLat !== "number" || typeof cityLng !== "number") {
    return void 0;
  }
  const angle = index * 137.5 * Math.PI / 180;
  const radiusKm = 1.2 + index % 6 * 0.45;
  const latOffset = radiusKm / 111 * Math.cos(angle);
  const lngOffset = radiusKm / (111 * Math.max(0.3, Math.cos(cityLat * Math.PI / 180))) * Math.sin(angle);
  return {
    lat: cityLat + latOffset,
    lng: cityLng + lngOffset,
    isFallback: true
  };
}
function asNonEmptyString(value) {
  if (typeof value !== "string") return void 0;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : void 0;
}
function asPositiveFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
}
function normalizeNeighborhood(rawHotel) {
  return asNonEmptyString(rawHotel.areaName) ?? asNonEmptyString(rawHotel.district) ?? asNonEmptyString(rawHotel.neighborhood) ?? asNonEmptyString(rawHotel.zone) ?? asNonEmptyString(rawHotel.location?.district) ?? asNonEmptyString(rawHotel.location?.neighborhood);
}
function normalizeBreakfastIncluded(rawHotel) {
  if (typeof rawHotel.breakfastIncluded === "boolean") {
    return rawHotel.breakfastIncluded;
  }
  if (typeof rawHotel.mealPlan?.breakfastIncluded === "boolean") {
    return rawHotel.mealPlan.breakfastIncluded;
  }
  if (typeof rawHotel.boardBasis?.breakfastIncluded === "boolean") {
    return rawHotel.boardBasis.breakfastIncluded;
  }
  const planText = asNonEmptyString(rawHotel.mealPlan) ?? asNonEmptyString(rawHotel.mealPlanName) ?? asNonEmptyString(rawHotel.boardBasis) ?? asNonEmptyString(rawHotel.boardType);
  if (!planText) return void 0;
  const normalized = planText.toLowerCase();
  if (!/\bbreakfast\b/.test(normalized)) return void 0;
  if (/\b(no breakfast|without breakfast|breakfast excluded|room only)\b/.test(
    normalized
  )) {
    return false;
  }
  return true;
}
function normalizeFreeCancellation(rawHotel) {
  if (typeof rawHotel.freeCancellation === "boolean") {
    return rawHotel.freeCancellation;
  }
  if (typeof rawHotel.cancellation?.freeCancellation === "boolean") {
    return rawHotel.cancellation.freeCancellation;
  }
  if (typeof rawHotel.refundable === "boolean") {
    return rawHotel.refundable;
  }
  if (typeof rawHotel.isRefundable === "boolean") {
    return rawHotel.isRefundable;
  }
  const policyText = asNonEmptyString(rawHotel.cancellationType) ?? asNonEmptyString(rawHotel.cancellationPolicy) ?? asNonEmptyString(rawHotel.ratePlan?.cancellationPolicy) ?? asNonEmptyString(rawHotel.refundType);
  if (!policyText) return void 0;
  const normalized = policyText.toLowerCase();
  if (/\bnon[- ]?refundable\b/.test(normalized) || /\bno free cancellation\b/.test(normalized)) {
    return false;
  }
  if (/\bfree cancellation\b/.test(normalized) || /\bfully refundable\b/.test(normalized)) {
    return true;
  }
  return void 0;
}
function normalizePayLater(rawHotel) {
  if (typeof rawHotel.payLater === "boolean") {
    return rawHotel.payLater;
  }
  if (typeof rawHotel.payAtHotel === "boolean") {
    return rawHotel.payAtHotel;
  }
  if (typeof rawHotel.payAtProperty === "boolean") {
    return rawHotel.payAtProperty;
  }
  if (typeof rawHotel.payment?.payLater === "boolean") {
    return rawHotel.payment.payLater;
  }
  if (typeof rawHotel.payment?.payAtHotel === "boolean") {
    return rawHotel.payment.payAtHotel;
  }
  const paymentText = asNonEmptyString(rawHotel.paymentType) ?? asNonEmptyString(rawHotel.paymentDescription) ?? asNonEmptyString(rawHotel.ratePlan?.paymentType) ?? asNonEmptyString(rawHotel.ratePlan?.paymentDescription);
  if (!paymentText) return void 0;
  const normalized = paymentText.toLowerCase();
  if (/\bpay later\b/.test(normalized) || /\bpay at hotel\b/.test(normalized) || /\breserve now[, ]*pay later\b/.test(normalized)) {
    return true;
  }
  if (/\bprepaid\b/.test(normalized) || /\bpay now\b/.test(normalized) || /\bfull prepayment\b/.test(normalized)) {
    return false;
  }
  return void 0;
}
function deriveCoordinatesConfidence(hasExactCoordinates, hasFallbackCoordinates) {
  if (hasExactCoordinates) return "exact";
  if (hasFallbackCoordinates) return "fallback";
  return "missing";
}
function calculateStayNights(checkIn, checkOut) {
  const checkInDate = /* @__PURE__ */ new Date(`${checkIn}T00:00:00Z`);
  const checkOutDate = /* @__PURE__ */ new Date(`${checkOut}T00:00:00Z`);
  const msPerNight = 24 * 60 * 60 * 1e3;
  const nights = Math.round(
    (checkOutDate.getTime() - checkInDate.getTime()) / msPerNight
  );
  return nights > 0 ? nights : 0;
}
function formatMoney2(amount, currency) {
  if (!Number.isFinite(amount) || amount < 0) return "";
  if (currency) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
    }
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
    amount
  );
}
function buildPriceDisplay(lowestRate, currency, nights) {
  if (!Number.isFinite(lowestRate) || lowestRate <= 0) return void 0;
  const nightly = formatMoney2(lowestRate, currency);
  if (!nightly) return void 0;
  const priceDisplay = {
    priceLabel: `${nightly} / night`
  };
  if (nights > 0) {
    const total = formatMoney2(lowestRate * nights, currency);
    if (total) {
      priceDisplay.totalStayEstimateLabel = `${total} total (${nights} ${nights === 1 ? "night" : "nights"})`;
    }
  }
  return priceDisplay;
}
function normalizeHotel(rawHotel, city, checkIn, checkOut, adults, rooms, fallbackLinks, index, page) {
  const hotelId = String(
    rawHotel.hotelId ?? rawHotel.propertyId ?? rawHotel.id ?? `${city.agodaCityId}-${index + 1}`
  );
  const imageUrl = asNonEmptyString(rawHotel.imageUrl) ?? asNonEmptyString(rawHotel.imageURL) ?? asNonEmptyString(rawHotel.photoURL) ?? asNonEmptyString(rawHotel.photoUrl) ?? asNonEmptyString(rawHotel.thumbnailURL) ?? asNonEmptyString(rawHotel.thumbnailUrl) ?? asNonEmptyString(rawHotel.mainPhotoUrl) ?? asNonEmptyString(rawHotel.mainPhotoURL) ?? asNonEmptyString(rawHotel.hotelImageUrl) ?? asNonEmptyString(rawHotel.hotelImageURL) ?? asNonEmptyString(rawHotel.images?.[0]?.url) ?? asNonEmptyString(rawHotel.images?.[0]) ?? asNonEmptyString(rawHotel.image?.url) ?? asNonEmptyString(rawHotel.photos?.[0]?.url) ?? asNonEmptyString(rawHotel.photos?.[0]) ?? "";
  const amenities = Array.isArray(rawHotel.amenities) ? rawHotel.amenities.map((amenity) => String(amenity?.name ?? amenity)).filter(Boolean) : [];
  const reviewScore = Number(
    rawHotel.reviewScore ?? rawHotel.reviewScoreRaw ?? rawHotel.review?.score ?? 0
  );
  const reviewCount = Number(
    rawHotel.reviewCount ?? rawHotel.reviewCountRaw ?? rawHotel.review?.count ?? 0
  );
  const stars = Number(
    rawHotel.stars ?? rawHotel.starRating ?? rawHotel.rating ?? 0
  );
  const lowestRate = Number(
    rawHotel.lowestRate ?? rawHotel.price?.amount ?? rawHotel.displayPrice?.amount ?? rawHotel.priceDisplay?.amount ?? rawHotel.dailyRate ?? 0
  );
  const agodaUrl = rawHotel.landingURL ?? (hotelId ? agodaHotelUrl(
    hotelId,
    city.agodaCityId,
    checkIn,
    checkOut,
    adults,
    rooms
  ) : fallbackLinks.agoda);
  const outboundLinks = {
    ...fallbackLinks,
    agoda: agodaUrl
  };
  const lat = Number(
    rawHotel.latitude ?? rawHotel.lat ?? rawHotel.coordinate?.lat ?? rawHotel.coordinates?.lat ?? rawHotel.location?.lat
  );
  const lng = Number(
    rawHotel.longitude ?? rawHotel.lng ?? rawHotel.lon ?? rawHotel.coordinate?.lng ?? rawHotel.coordinates?.lng ?? rawHotel.location?.lng
  );
  const hasExactCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
  const fallbackCoordinates = buildFallbackCoordinates(city, index);
  const coordinates = hasExactCoordinates ? { lat, lng } : fallbackCoordinates;
  const hasFallbackCoordinates = !hasExactCoordinates && Boolean(fallbackCoordinates);
  const coordinatesConfidence = deriveCoordinatesConfidence(
    hasExactCoordinates,
    hasFallbackCoordinates
  );
  const rankingPosition = asPositiveFiniteNumber(rawHotel.rankingPosition) ?? asPositiveFiniteNumber(rawHotel.rank) ?? asPositiveFiniteNumber(rawHotel.ranking) ?? (page - 1) * PAGE_SIZE + index + 1;
  const currency = asNonEmptyString(rawHotel.currency) ?? asNonEmptyString(rawHotel.price?.currency);
  const neighborhood = normalizeNeighborhood(rawHotel);
  const breakfastIncluded = normalizeBreakfastIncluded(rawHotel);
  const freeCancellation = normalizeFreeCancellation(rawHotel);
  const payLater = normalizePayLater(rawHotel);
  const priceDisplay = buildPriceDisplay(
    lowestRate,
    currency,
    calculateStayNights(checkIn, checkOut)
  );
  return {
    hotelId,
    name: String(
      rawHotel.name ?? rawHotel.hotelName ?? rawHotel.propertyName ?? "Hotel"
    ),
    stars,
    reviewScore,
    reviewCount,
    address: String(
      rawHotel.address ?? rawHotel.addressLine1 ?? rawHotel.areaName ?? ""
    ),
    imageUrl,
    amenities,
    lowestRate,
    currency,
    rankingPosition,
    coordinates,
    outboundLinks,
    neighborhood,
    breakfastIncluded,
    freeCancellation,
    payLater,
    provider: "agoda",
    providerPrices: Number.isFinite(lowestRate) && lowestRate > 0 ? { agoda: lowestRate } : void 0,
    coordinatesConfidence,
    priceDisplay
  };
}
async function fetchAgodaHotels(agodaCityId, checkIn, checkOut, adults, rooms, page, sort) {
  const hasAgodaSiteId = Boolean(AGODA_SITE_ID);
  const hasAgodaApiKey = Boolean(AGODA_API_KEY);
  const isProduction = process.env.NODE_ENV === "production";
  const buildDiagnostics = (reason, status) => ({
    reason,
    status,
    hasAgodaSiteId,
    hasAgodaApiKey
  });
  const liveAgodaWarning = "Live Agoda results are temporarily unavailable.";
  const key = `agoda-lt:${agodaCityId}:${checkIn}:${checkOut}:${adults}:${rooms}:${page}:${sort}`;
  return cached(
    key,
    async () => {
      if (!hasAgodaSiteId || !hasAgodaApiKey) {
        safeWarnOnce(
          "Agoda credentials are missing; live results are unavailable."
        );
        const diagnostics = buildDiagnostics("missing_credentials");
        if (isProduction) {
          return {
            source: "agoda",
            hotels: [],
            warning: liveAgodaWarning,
            warnings: [liveAgodaWarning],
            diagnostics,
            totalCount: 0
          };
        }
        return {
          source: "mock",
          hotels: getMockHotels(agodaCityId, page, sort),
          warnings: [
            "Live Agoda credentials are not configured. Showing fallback results."
          ],
          diagnostics
        };
      }
      try {
        const body = {
          criteria: {
            checkInDate: checkIn,
            checkOutDate: checkOut,
            cityId: agodaCityId,
            adults,
            rooms,
            pageNo: page,
            pageSize: PAGE_SIZE
          },
          publisherId: AGODA_SITE_ID
        };
        const response = await fetch(
          "http://affiliateapi7643.agoda.com/affiliateservice/lt_v1",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: AGODA_API_KEY,
              "Accept-Encoding": "gzip,deflate"
            },
            body: JSON.stringify(body)
          }
        );
        if (!response.ok) {
          const responseBody = await response.text();
          const bodySnippet = responseBody.slice(0, 300).replace(/\s+/g, " ");
          console.warn(
            `[Hotels] Agoda lt_v1 non-ok response status=${response.status} body="${bodySnippet}"`
          );
          safeWarnOnce(
            `Agoda lt_v1 search returned status ${response.status}.`
          );
          const diagnostics = buildDiagnostics("non_ok_response", response.status);
          if (isProduction) {
            return {
              source: "agoda",
              hotels: [],
              warning: liveAgodaWarning,
              warnings: [liveAgodaWarning],
              diagnostics,
              totalCount: 0
            };
          }
          return {
            source: "mock",
            hotels: getMockHotels(agodaCityId, page, sort),
            warnings: [
              "Live Agoda search is temporarily unavailable. Showing fallback results."
            ],
            diagnostics
          };
        }
        const payload = await response.json();
        const hotels = Array.isArray(payload.results) ? payload.results : [];
        if (!hotels.length) {
          const diagnostics = buildDiagnostics("empty_results");
          if (isProduction) {
            return {
              source: "agoda",
              hotels: [],
              warning: liveAgodaWarning,
              warnings: [liveAgodaWarning],
              diagnostics,
              totalCount: 0
            };
          }
          return {
            source: "mock",
            hotels: getMockHotels(agodaCityId, page, sort),
            warnings: [
              "No live Agoda hotels were returned for this criteria. Showing fallback results."
            ],
            diagnostics
          };
        }
        return {
          source: "agoda",
          hotels,
          totalCount: payload.totalResults ?? hotels.length
        };
      } catch (err) {
        console.error("[Hotels] Agoda lt_v1 search failed:", err);
        const diagnostics = buildDiagnostics("fetch_error");
        if (isProduction) {
          return {
            source: "agoda",
            hotels: [],
            warning: liveAgodaWarning,
            warnings: [liveAgodaWarning],
            diagnostics,
            totalCount: 0
          };
        }
        return {
          source: "mock",
          hotels: getMockHotels(agodaCityId, page, sort),
          warnings: ["Live Agoda search failed. Showing fallback results."],
          diagnostics
        };
      }
    },
    1800
  );
}
function sortHotels(hotels, sort) {
  const sorted = [...hotels];
  sorted.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return (a.lowestRate || Number.MAX_SAFE_INTEGER) - (b.lowestRate || Number.MAX_SAFE_INTEGER);
      case "price_desc":
        return (b.lowestRate || 0) - (a.lowestRate || 0);
      case "stars_desc":
        return (b.stars || 0) - (a.stars || 0) || (b.reviewScore || 0) - (a.reviewScore || 0);
      case "review_desc":
        return (b.reviewScore || 0) - (a.reviewScore || 0) || (b.reviewCount || 0) - (a.reviewCount || 0);
      case "rank":
      case "best":
      default:
        return (a.rankingPosition || 0) - (b.rankingPosition || 0);
    }
  });
  return sorted;
}
function getMockHotels(cityId, page, sort) {
  const base = [
    {
      hotelId: `${cityId}-1`,
      name: "Grand Palace Hotel",
      stars: 5,
      reviewScore: 9.1,
      reviewCount: 2341,
      address: "City Center",
      imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
      amenities: ["Pool", "Spa", "WiFi", "Gym"],
      lowestRate: 120,
      currency: "USD",
      rankingPosition: 1,
      breakfastIncluded: true,
      freeCancellation: true,
      payLater: true,
      provider: "mock"
    },
    {
      hotelId: `${cityId}-2`,
      name: "Central Riverside",
      stars: 4,
      reviewScore: 8.7,
      reviewCount: 1654,
      address: "Riverside District",
      imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
      amenities: ["Pool", "Restaurant", "WiFi"],
      lowestRate: 78,
      currency: "USD",
      rankingPosition: 2,
      freeCancellation: true,
      provider: "mock"
    },
    {
      hotelId: `${cityId}-3`,
      name: "Ibis Budget City",
      stars: 3,
      reviewScore: 8.2,
      reviewCount: 4102,
      address: "Airport Road",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
      amenities: ["Restaurant", "WiFi"],
      lowestRate: 35,
      currency: "USD",
      rankingPosition: 3,
      payLater: true,
      provider: "mock"
    },
    {
      hotelId: `${cityId}-4`,
      name: "Luxury Boutique Inn",
      stars: 5,
      reviewScore: 9.4,
      reviewCount: 876,
      address: "Old Town",
      imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600",
      amenities: ["Spa", "Bar", "WiFi", "Pool"],
      lowestRate: 185,
      currency: "USD",
      rankingPosition: 4,
      breakfastIncluded: true,
      freeCancellation: true,
      provider: "mock"
    },
    {
      hotelId: `${cityId}-5`,
      name: "The Standard Hotel",
      stars: 4,
      reviewScore: 8.9,
      reviewCount: 1234,
      address: "Downtown",
      imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600",
      amenities: ["Rooftop", "Bar", "WiFi"],
      lowestRate: 95,
      currency: "USD",
      rankingPosition: 5,
      freeCancellation: true,
      payLater: true,
      provider: "mock"
    },
    {
      hotelId: `${cityId}-6`,
      name: "Heritage Garden Hotel",
      stars: 3,
      reviewScore: 7.8,
      reviewCount: 987,
      address: "Heritage Quarter",
      imageUrl: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600",
      amenities: ["Garden", "WiFi", "Breakfast"],
      lowestRate: 42,
      currency: "USD",
      rankingPosition: 6,
      breakfastIncluded: true,
      payLater: true,
      provider: "mock"
    }
  ];
  const pageOffset = (page - 1) * base.length;
  const withLinks = base.map((hotel, index) => ({
    ...hotel,
    hotelId: `${hotel.hotelId}-p${page}`,
    rankingPosition: pageOffset + index + 1,
    outboundLinks: {
      agoda: agodaHotelUrl(
        `${hotel.hotelId}-p${page}`,
        cityId,
        "2026-01-01",
        "2026-01-04",
        2,
        1
      )
    },
    providerPrices: Number.isFinite(hotel.lowestRate) && hotel.lowestRate > 0 ? { agoda: hotel.lowestRate } : void 0
  }));
  return sortHotels(withLinks, sort);
}
async function searchHotels(req, res) {
  const normalized = normalizeHotelSearchParams(req.query);
  const isNumericCityId = /^\d+$/.test(normalized.city);
  let city;
  if (isNumericCityId) {
    const agodaCityId = parseInt(normalized.city, 10);
    if (!Number.isFinite(agodaCityId)) {
      return res.status(400).json({ error: `Invalid Agoda city id: ${normalized.city}` });
    }
    const fallbackName = normalized.cityName?.trim() || `City ${normalized.city}`;
    city = {
      slug: normalized.city,
      name: fallbackName,
      bookingName: fallbackName,
      country: "",
      agodaCityId,
      hasHotels: true
    };
  } else {
    const localCity = getCityBySlug(normalized.city);
    if (!localCity)
      return res.status(404).json({ error: `City not found: ${normalized.city}` });
    if (!localCity.hasHotels)
      return res.status(400).json({ error: `No hotels available for ${localCity.name}` });
    city = localCity;
  }
  try {
    const affiliateLinks = buildAffiliateLinks(
      city.name,
      city.bookingName,
      city.agodaCityId,
      normalized.checkIn,
      normalized.checkOut,
      normalized.adults,
      normalized.rooms
    );
    const [bookingLink, result] = await Promise.all([
      awinDeepLink(
        affiliateLinks.booking ?? bookingUrl(
          city.bookingName,
          normalized.checkIn,
          normalized.checkOut,
          normalized.adults,
          normalized.rooms
        )
      ),
      fetchAgodaHotels(
        city.agodaCityId,
        normalized.checkIn,
        normalized.checkOut,
        normalized.adults,
        normalized.rooms,
        normalized.page,
        normalized.sort
      )
    ]);
    const normalizedHotels = sortHotels(
      result.hotels.map(
        (hotel, index) => normalizeHotel(
          hotel,
          city,
          normalized.checkIn,
          normalized.checkOut,
          normalized.adults,
          normalized.rooms,
          affiliateLinks,
          index,
          normalized.page
        )
      ),
      normalized.sort
    );
    const response = {
      city,
      hotels: normalizedHotels,
      affiliateLinks: { ...affiliateLinks, booking: bookingLink },
      meta: {
        source: result.source,
        checkIn: normalized.checkIn,
        checkOut: normalized.checkOut,
        adults: normalized.adults,
        rooms: normalized.rooms,
        page: normalized.page,
        sort: normalized.sort,
        pageSize: PAGE_SIZE,
        totalCount: result.totalCount ?? normalizedHotels.length,
        totalPages: Math.max(
          1,
          Math.ceil((result.totalCount ?? normalizedHotels.length) / PAGE_SIZE)
        ),
        warning: result.warning,
        warnings: result.warnings,
        diagnostics: result.diagnostics
      }
    };
    return res.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Hotels] Search failed:", message);
    return res.status(500).json({ error: "Search failed" });
  }
}

// server/api/autocomplete.ts
// server/api/autocomplete.ts
var AGODA_UNIFIED_SUGGEST_URL = "https://affiliateapi7643.agoda.com/api/v1/UnifiedSuggest";
var AGODA_TIMEOUT_MS = 2500;
var AGODA_API_KEY2 = process.env.AGODA_API_KEY ?? "";
function normalize(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}
function toStringIfPresent(value) {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : void 0;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return void 0;
}
function parseAgodaCitySuggestions(payload) {
  const collectableCandidates = [];
  if (Array.isArray(payload)) {
    collectableCandidates.push(...payload);
  } else if (payload && typeof payload === "object") {
    const root = payload;
    const buckets = [
      root.suggestions,
      root.data,
      root.data?.suggestions,
      root.result?.items,
      root.results,
      root.items
    ];
    for (const bucket of buckets) {
      if (Array.isArray(bucket)) {
        collectableCandidates.push(...bucket);
      }
    }
  }
  const suggestions = [];
  for (const candidate of collectableCandidates) {
    if (!candidate || typeof candidate !== "object") continue;
    const row = candidate;
    const typeRaw = toStringIfPresent(
      row.type ?? row.locationType ?? row.objectType ?? row.category
    )?.toLowerCase();
    if (typeRaw && !typeRaw.includes("city")) continue;
    const cityId = toStringIfPresent(
      row.cityId ?? row.city_id ?? row.id ?? row.locationId ?? row.objectId
    );
    const cityName = toStringIfPresent(
      row.cityName ?? row.name ?? row.displayName ?? row.label ?? row.title
    );
    if (!cityId || !cityName) continue;
    const subtitle = [
      toStringIfPresent(row.countryName ?? row.country ?? row.countryCode),
      toStringIfPresent(row.regionName ?? row.region ?? row.state)
    ].filter(Boolean).join(" \u2022 ");
    suggestions.push({
      displayName: cityName,
      locationType: "city",
      locationId: cityId,
      subtitle: subtitle || void 0
    });
  }
  return suggestions.slice(0, 10);
}
function fallbackLocalSuggestions(q) {
  return getHotelCities().filter((city) => {
    const haystacks = [
      city.name,
      city.nameMM,
      city.country,
      city.bookingName,
      city.slug,
      city.iata
    ].map(normalize);
    return haystacks.some((value) => value.includes(normalize(q)));
  }).slice(0, 10).map((city) => ({
    displayName: city.name,
    locationType: "city",
    locationId: String(city.agodaCityId),
    subtitle: `${city.country} \u2022 ${city.iata}`
  }));
}
async function fetchAgodaSuggestions(query) {
  if (!AGODA_API_KEY2) return [];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AGODA_TIMEOUT_MS);
  try {
    const response = await fetch(AGODA_UNIFIED_SUGGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AGODA_API_KEY2
      },
      body: JSON.stringify({
        keyword: query,
        query,
        language: "en-us",
        limit: 10
      }),
      signal: controller.signal
    });
    if (!response.ok) return [];
    const payload = await response.json();
    return parseAgodaCitySuggestions(payload);
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
async function searchAutocompleteHotels(req, res) {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) {
    return res.json({ suggestions: [] });
  }
  const agodaSuggestions = await fetchAgodaSuggestions(q);
  if (agodaSuggestions.length > 0) {
    return res.json({ suggestions: agodaSuggestions });
  }
  return res.json({ suggestions: fallbackLocalSuggestions(q) });
}

// server/api/prices.ts
async function searchFrontDoorPrices(req, res) {
  const { month } = req.query;
  if (!month) return res.status(400).json({ error: "Month required (YYYY-MM)" });
  const [year, mn] = String(month).split("-").map(Number);
  const days = new Date(year, mn, 0).getDate();
  const scores = [85, 72, 45, 30, 60, 90, 55, 20, 75, 40, 65, 88, 33, 50, 77];
  const data = Array.from({ length: days }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `${month}-${String(dayNum).padStart(2, "0")}`;
    const score = scores[i % scores.length];
    return {
      date: dateStr,
      score,
      priceHint: score >= 70 ? "cheap" : score >= 40 ? "average" : "expensive"
    };
  });
  res.json(data);
}

// api/_lib/http.ts
var ALLOWED_ORIGINS = [
  "https://gotravel-asia.vercel.app",
  "https://gotravelasia.com",
  "https://www.gotravelasia.com",
  "http://localhost:5173",
  "http://localhost:3000"
];
function setCors(req, res) {
  const origin = req.headers.origin ?? "";
  if (ALLOWED_ORIGINS.some((o) => origin.startsWith(o))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}
function parseRequest(req) {
  const raw = req.query;
  const result = {};
  for (const [k, v] of Object.entries(raw)) {
    result[k] = Array.isArray(v) ? v[0] : v ?? "";
  }
  return result;
}

// api/_lib/authMe.ts
async function handleMe(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const user = await sdk.authenticateRequest(req);
    res.status(200).json(user);
  } catch (error) {
    res.status(200).json(null);
  }
}

// api/_lib/authLogout.ts
async function handleLogout(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const c = getSessionCookieOptions(req);
  let cookieStr = `${COOKIE_NAME}=; Max-Age=0; Path=${c.path ?? "/"}`;
  if (c.sameSite) cookieStr += `; SameSite=${c.sameSite}`;
  if (c.secure) cookieStr += `; Secure`;
  if (c.httpOnly) cookieStr += `; HttpOnly`;
  if (c.domain) cookieStr += `; Domain=${c.domain}`;
  res.setHeader("Set-Cookie", [cookieStr]);
  res.status(200).json({ success: true });
}

// api/_handlers/auth.ts
async function handler(req, res) {
  if (setCors(req, res)) return;
  const { action } = parseRequest(req);
  switch (action) {
    case "me":
      return handleMe(req, res);
    case "logout":
      return handleLogout(req, res);
    default:
      return res.status(400).json({
        error: "Invalid action",
        valid: ["me", "logout"]
      });
  }
}

// api/_lib/calendarPrices.ts
import fs from "fs";
import path from "path";

// api/_lib/amadeusService.ts
var AMADEUS_BASE = "https://api.amadeus.com";
var AMADEUS_AUTH = "https://api.amadeus.com/v1/security/oauth2/token";
var cachedToken = null;
function getCredentials() {
  const clientId = (typeof import.meta !== "undefined" && import.meta.env?.VITE_AMADEUS_CLIENT_ID) ?? process.env.VITE_AMADEUS_CLIENT_ID ?? process.env.AMADEUS_CLIENT_ID;
  const clientSecret = (typeof import.meta !== "undefined" && import.meta.env?.VITE_AMADEUS_CLIENT_SECRET) ?? process.env.VITE_AMADEUS_CLIENT_SECRET ?? process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}
async function getAccessToken() {
  const creds = getCredentials();
  if (!creds) return null;
  if (cachedToken && Date.now() < cachedToken.expiresAt - 6e4) {
    return cachedToken.token;
  }
  try {
    const res = await fetch(AMADEUS_AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: creds.clientId,
        client_secret: creds.clientSecret
      })
    });
    if (!res.ok) return null;
    const json2 = await res.json();
    cachedToken = {
      token: json2.access_token,
      expiresAt: Date.now() + json2.expires_in * 1e3
    };
    return cachedToken.token;
  } catch {
    return null;
  }
}
async function amFetch(path4, params) {
  const token = await getAccessToken();
  if (!token) return null;
  const url = new URL(path4, AMADEUS_BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      console.warn(`[Amadeus] ${path4} \u2192 ${res.status}`);
      return null;
    }
    const json2 = await res.json();
    return json2.data;
  } catch (err) {
    console.error(`[Amadeus] ${path4} fetch error:`, err);
    return null;
  }
}
async function searchFlightOffers(origin, destination, departureDate, opts) {
  return amFetch("/v2/shopping/flight-offers", {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: String(opts?.adults ?? 1),
    currencyCode: opts?.currencyCode ?? "THB",
    max: String(opts?.max ?? 10),
    ...opts?.nonStop ? { nonStop: "true" } : {}
  });
}
async function searchCheapestDates(origin, destination) {
  return amFetch("/v1/shopping/flight-dates", { origin, destination });
}

// shared/flights/calendarLogic.ts
var SOURCE_PRIORITY = {
  v3: 1,
  bot: 2,
  legacy: 3,
  amadeus: 4
};
function getCurrentSource(e) {
  if (e.is_v3) return "v3";
  if (e.is_bot_data) return "bot";
  if (e.is_amadeus) return "amadeus";
  if (e.is_legacy_tp) return "legacy";
  return "legacy";
}
function addPrice(merged, dateStr, price, entry, source) {
  if (!dateStr || price <= 0 || !Number.isFinite(price)) return;
  const current = merged[dateStr];
  const currentSource = current ? getCurrentSource(current) : null;
  const newEntry = {
    ...entry,
    price,
    is_v3: source === "v3",
    is_bot_data: source === "bot",
    is_legacy_tp: source === "legacy",
    is_amadeus: source === "amadeus"
  };
  if (!current || SOURCE_PRIORITY[source] < SOURCE_PRIORITY[currentSource]) {
    merged[dateStr] = newEntry;
    return;
  }
  if (source === currentSource && price < (current.price ?? Number.POSITIVE_INFINITY)) {
    merged[dateStr] = newEntry;
  }
}

// shared/config/fx.ts
var FX_RATES = {
  USD: { THB: 34 },
  THB: { USD: 1 / 34 }
};

// shared/utils/store.ts
import { Redis } from "@upstash/redis";
var MemoryStore = class {
  cache = /* @__PURE__ */ new Map();
  rateLimits = /* @__PURE__ */ new Map();
  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  async set(key, value, ttlSeconds) {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1e3 : Number.MAX_SAFE_INTEGER;
    this.cache.set(key, { value, expiresAt });
  }
  async delete(key) {
    this.cache.delete(key);
  }
  async increment(key, windowMs) {
    const now = Date.now();
    const existing = this.rateLimits.get(key);
    if (!existing || existing.resetAt <= now) {
      const entry = { count: 1, resetAt: now + windowMs };
      this.rateLimits.set(key, entry);
      return entry;
    }
    existing.count++;
    return existing;
  }
};
var RedisStore = class {
  client;
  constructor(url, token) {
    this.client = new Redis({ url, token });
  }
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (e) {
      console.error("[RedisStore:get] Error:", e);
      return null;
    }
  }
  async set(key, value, ttlSeconds) {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, { ex: ttlSeconds });
      } else {
        await this.client.set(key, value);
      }
    } catch (e) {
      console.error("[RedisStore:set] Error:", e);
    }
  }
  async delete(key) {
    try {
      await this.client.del(key);
    } catch (e) {
      console.error("[RedisStore:delete] Error:", e);
    }
  }
  async increment(key, windowMs) {
    try {
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.pexpire(key, windowMs);
      }
      const ttl = await this.client.pttl(key);
      const now = Date.now();
      return {
        count,
        resetAt: now + (ttl > 0 ? ttl : windowMs)
      };
    } catch (e) {
      console.error("[RedisStore:increment] Error:", e);
      return { count: 1, resetAt: Date.now() + windowMs };
    }
  }
};
var store = null;
var IS_PROD = process.env.NODE_ENV === "production" || !!process.env.VERCEL_URL;
function getStore() {
  if (store) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    if (IS_PROD) {
      console.log("[Store] Initializing SharedStore (Production KV/Redis)");
    } else {
      console.log("[Store] Initializing SharedStore (Development Shared)");
    }
    store = new RedisStore(url, token);
  } else {
    if (IS_PROD) {
      console.warn("[Store] WARNING: Shared Store configuration missing in production! Falling back to process-local MemoryStore (Non-persistent).");
    } else {
      console.log("[Store] Initializing MemoryStore (Local Development)");
    }
    store = new MemoryStore();
  }
  return store;
}

// shared/utils/liveFx.ts
var fxCache = /* @__PURE__ */ new Map();
var CACHE_TTL_SECONDS = 24 * 60 * 60;
var CACHE_TTL_MS2 = CACHE_TTL_SECONDS * 1e3;
var pendingRequests = /* @__PURE__ */ new Map();
async function fetchLiveRate(base, quote) {
  const url = `https://open.er-api.com/v6/latest/${base.toUpperCase()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`FX API responded with status ${res.status}`);
    }
    const data = await res.json();
    if (data.result !== "success" || typeof data.rates !== "object") {
      throw new Error("Invalid FX API response format");
    }
    const rate = data.rates[quote.toUpperCase()];
    if (typeof rate !== "number" || rate <= 0) {
      throw new Error(`Invalid rate received for ${quote}`);
    }
    return rate;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
async function getLiveFxRate(baseCurrency = "USD", quoteCurrency = "THB") {
  const base = baseCurrency.toUpperCase();
  const quote = quoteCurrency.toUpperCase();
  const storeKey = `cache:fx:${base}-${quote}`;
  const localKey = `${base}-${quote}`;
  const staticFallbackRate = FX_RATES[base]?.[quote] ?? 34;
  if (base === quote) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: 1,
      source: "fallback_static",
      asOf: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  const now = Date.now();
  const l1Cached = fxCache.get(localKey);
  if (l1Cached && l1Cached.expiresAt > now) {
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: l1Cached.rate,
      source: "live",
      asOf: l1Cached.asOf
    };
  }
  const store2 = getStore();
  try {
    const l2Cached = await store2.get(storeKey);
    if (l2Cached && l2Cached.expiresAt > now) {
      fxCache.set(localKey, l2Cached);
      return {
        baseCurrency: base,
        quoteCurrency: quote,
        rate: l2Cached.rate,
        source: "live",
        asOf: l2Cached.asOf
      };
    }
  } catch (err) {
    console.warn(`[LiveFx] Shared store read failed for ${storeKey}`, err);
  }
  try {
    let fetchPromise = pendingRequests.get(localKey);
    if (!fetchPromise) {
      fetchPromise = fetchLiveRate(base, quote).finally(() => {
        pendingRequests.delete(localKey);
      });
      pendingRequests.set(localKey, fetchPromise);
    }
    const liveRate = await fetchPromise;
    const isoNow = (/* @__PURE__ */ new Date()).toISOString();
    const entry = {
      rate: liveRate,
      expiresAt: now + CACHE_TTL_MS2,
      asOf: isoNow
    };
    fxCache.set(localKey, entry);
    store2.set(storeKey, entry, CACHE_TTL_SECONDS).catch((err) => {
      console.warn(`[LiveFx] Shared store write failed for ${storeKey}`, err);
    });
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: liveRate,
      source: "live",
      asOf: isoNow
    };
  } catch (error) {
    console.warn(`[LiveFx] Failed to fetch live rate for ${localKey}, falling back`, error);
    if (l1Cached) {
      return {
        baseCurrency: base,
        quoteCurrency: quote,
        rate: l1Cached.rate,
        source: "stale_cache",
        asOf: l1Cached.asOf
      };
    }
    return {
      baseCurrency: base,
      quoteCurrency: quote,
      rate: staticFallbackRate,
      source: "fallback_static",
      asOf: null
    };
  }
}

// api/_lib/cache.ts
var l1Cache = /* @__PURE__ */ new Map();
var CACHE_TTL_SECONDS2 = 30 * 60;
var CACHE_TTL_MS3 = CACHE_TTL_SECONDS2 * 1e3;
async function getCached(key) {
  const now = Date.now();
  const entry = l1Cache.get(key);
  if (entry && entry.expiresAt > now) {
    console.log(`[Cache:L1:HIT] ${key}`);
    return entry.data;
  }
  try {
    const store2 = getStore();
    const sharedValue = await store2.get(key);
    if (sharedValue) {
      console.log(`[Cache:L2:HIT] ${key}`);
      l1Cache.set(key, { data: sharedValue, expiresAt: now + CACHE_TTL_MS3 });
      return sharedValue;
    }
    console.log(`[Cache:L2:MISS] ${key}`);
  } catch (err) {
    console.error(`[API:Cache] L2 read failed for ${key}:`, err);
  }
  return null;
}
async function setCache(key, data) {
  const expiresAt = Date.now() + CACHE_TTL_MS3;
  l1Cache.set(key, { data, expiresAt });
  try {
    const store2 = getStore();
    await store2.set(key, data, CACHE_TTL_SECONDS2);
  } catch (err) {
    console.error(`[API:Cache] L2 write failed for ${key}:`, err);
  }
}

// api/_lib/calendarPrices.ts
async function fetchAmadeusCalendarPrices2(origin, destination, month, currency = "usd") {
  try {
    const [year, mon] = month.split("-").map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const sampleDays = [5, 15, Math.min(25, daysInMonth)].filter((d) => d <= daysInMonth);
    const sampleResults = await Promise.allSettled(
      sampleDays.map(async (day) => {
        const departureDate = `${year}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const offers = await searchFlightOffers(origin, destination, departureDate, {
          currencyCode: currency.toUpperCase(),
          max: 3,
          nonStop: false
        });
        const cheapest = offers?.[0];
        if (!cheapest) return null;
        const price = Number.parseFloat(cheapest.price?.total || "0");
        if (!Number.isFinite(price) || price <= 0) return null;
        const segments = cheapest.itineraries?.[0]?.segments || [];
        return {
          date: departureDate,
          price,
          airline: cheapest.validatingAirlineCodes?.[0] || "",
          transfers: Math.max(0, segments.length - 1)
        };
      })
    );
    const samplePrices = sampleResults.filter((r) => r.status === "fulfilled").map((r) => r.value).filter((v) => !!v && v.price > 0);
    if (!samplePrices.length) return {};
    const result = {};
    for (const sp of samplePrices) {
      result[sp.date] = {
        price: sp.price,
        origin,
        destination,
        airline: sp.airline,
        departure_at: `${sp.date}T00:00:00`,
        transfers: sp.transfers,
        is_amadeus: true,
        is_estimated_amadeus: false
      };
    }
    for (const sp of samplePrices) {
      const spDate = /* @__PURE__ */ new Date(`${sp.date}T00:00:00`);
      for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0) continue;
        const nearby = new Date(spDate);
        nearby.setDate(nearby.getDate() + offset);
        if (nearby.getMonth() + 1 !== mon || nearby.getFullYear() !== year) continue;
        const nearbyKey = `${year}-${String(mon).padStart(2, "0")}-${String(nearby.getDate()).padStart(2, "0")}`;
        if (result[nearbyKey] && !result[nearbyKey].is_estimated_amadeus) continue;
        const variance = 1 + Math.abs(offset) * 0.02 * (offset > 0 ? 1 : -1);
        result[nearbyKey] = {
          price: Math.round(sp.price * variance * 100) / 100,
          origin,
          destination,
          airline: sp.airline,
          departure_at: `${nearbyKey}T00:00:00`,
          transfers: sp.transfers,
          is_amadeus: true,
          is_estimated_amadeus: true
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}
function getBotJsonCandidatePaths() {
  const cwd = process.cwd();
  const maybeLambdaRoot = process.env.LAMBDA_TASK_ROOT || "/var/task";
  return [
    path.join(cwd, "client", "public", "data", "flight_data.json"),
    path.join(cwd, "public", "data", "flight_data.json"),
    path.join(maybeLambdaRoot, "client", "public", "data", "flight_data.json"),
    path.join(maybeLambdaRoot, "public", "data", "flight_data.json")
  ];
}
async function loadBotRoutes() {
  for (const p of getBotJsonCandidatePaths()) {
    if (!fs.existsSync(p)) continue;
    const json2 = JSON.parse(fs.readFileSync(p, "utf-8"));
    if (Array.isArray(json2?.routes)) return json2.routes;
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    try {
      const response = await fetch(`https://${vercelUrl}/data/flight_data.json`, { signal: AbortSignal.timeout(3e3) });
      if (response.ok) {
        const json2 = await response.json();
        if (Array.isArray(json2?.routes)) return json2.routes;
      }
    } catch {
    }
  }
  return [];
}
async function handleCalendarPrices(req, res, params) {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    res.status(500).json({ error: "API token not configured" });
    return;
  }
  const { month, currency = "usd" } = params;
  const normalized = normalizeSearchParams(params);
  const orig = normalized.origin;
  const dest = normalized.destination;
  const mo = String(month);
  const cur = String(currency || "usd");
  if (!orig || !dest || !mo) {
    res.status(400).json({ error: "Missing required params: origin, destination, month" });
    return;
  }
  const cacheKey = `cal-${orig}-${dest}-${mo}-${cur}`;
  const cached2 = await getCached(cacheKey);
  if (cached2) {
    res.setHeader("X-Cache", "HIT");
    res.status(200).json(cached2);
    return;
  }
  const [yr, mn] = mo.split("-").map(Number);
  const nextDate = new Date(yr, mn, 1);
  const nextMo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
  const tp = (queryParams, base) => fetch(`${base}?${new URLSearchParams({ token, ...queryParams })}`, { signal: AbortSignal.timeout(8e3) }).then((r) => r.ok ? r.json() : null);
  try {
    const [v3Mo1, v3Mo2, calendarData, matrixData, amadeusMo1, amadeusMo2, fxQuote] = await Promise.allSettled([
      tp({ origin: orig, destination: dest, departure_at: mo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
      tp({ origin: orig, destination: dest, departure_at: nextMo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
      tp({ origin: orig, destination: dest, month: mo, calendar_type: "departure_date", currency: cur }, "https://api.travelpayouts.com/v1/prices/calendar"),
      tp({ origin: orig, destination: dest, month: mo, currency: cur }, "https://api.travelpayouts.com/v2/prices/month-matrix"),
      fetchAmadeusCalendarPrices2(orig, dest, mo, cur),
      fetchAmadeusCalendarPrices2(orig, dest, nextMo, cur),
      getLiveFxRate(cur, "THB")
    ]);
    const merged = {};
    for (const result2 of [v3Mo1, v3Mo2]) {
      const arr = result2.status === "fulfilled" && result2.value?.data;
      if (Array.isArray(arr)) {
        for (const e of arr) {
          addPrice(merged, e.departure_at?.split("T")[0], e.price || 0, {
            origin: e.origin || orig,
            destination: e.destination || dest,
            currency: cur,
            airline: e.airline || "",
            departure_at: e.departure_at,
            return_at: e.return_at || "",
            transfers: e.transfers ?? 0,
            flight_number: e.flight_number || ""
          }, "v3");
        }
      }
    }
    const botRoutes = await loadBotRoutes();
    for (const r of botRoutes) {
      if (r.origin !== orig || r.destination !== dest) continue;
      const dateStr = r.date;
      if (dateStr && (dateStr.startsWith(mo) || dateStr.startsWith(nextMo))) {
        addPrice(merged, dateStr, r.price || 0, {
          origin: r.origin,
          destination: r.destination,
          currency: cur,
          airline: r.airline_code || r.airline || "",
          departure_at: `${r.date}T00:00:00`,
          transfers: r.transfers || 0,
          flight_number: r.flight_num || ""
        }, "bot");
      }
    }
    const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
    if (cal && typeof cal === "object" && !Array.isArray(cal)) {
      for (const [dateStr, entry] of Object.entries(cal)) {
        const e = entry;
        e.currency = cur;
        addPrice(merged, dateStr, e.price || 0, e, "legacy");
      }
    }
    const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
    if (Array.isArray(matrix)) {
      for (const e of matrix) {
        addPrice(merged, e.depart_date, e.value || e.price || 0, {
          origin: e.origin || orig,
          destination: e.destination || dest,
          currency: cur,
          airline: e.airline || e.gate || "",
          departure_at: e.departure_at || `${e.depart_date}T00:00:00`,
          return_at: e.return_date ? `${e.return_date}T00:00:00` : "",
          transfers: e.number_of_changes ?? 0
        }, "legacy");
      }
    }
    for (const result2 of [amadeusMo1, amadeusMo2]) {
      const data = result2.status === "fulfilled" ? result2.value : null;
      if (data && typeof data === "object") {
        for (const [dateStr, entry] of Object.entries(data)) {
          entry.currency = cur;
          addPrice(merged, dateStr, entry.price || 0, entry, "amadeus");
        }
      }
    }
    const fx = fxQuote.status === "fulfilled" ? fxQuote.value : {
      baseCurrency: cur.toUpperCase(),
      quoteCurrency: "THB",
      rate: cur.toUpperCase() === "THB" ? 1 : 34,
      source: "fallback_static",
      asOf: null
    };
    const result = {
      success: true,
      data: merged,
      currency: cur,
      fx
    };
    await setCache(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Calendar prices error:", error);
    res.status(500).json({ error: "Failed to fetch calendar prices" });
  }
}

// api/_lib/cheapPrices.ts
async function handleCheapPrices(req, res, params) {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    res.status(500).json({ error: "API token not configured" });
    return;
  }
  const normalized = normalizeSearchParams(params);
  const origin = normalized.origin || "RGN";
  const currency = String(params.currency || "thb");
  const cacheKey = `cheap-${origin}-${currency}`;
  const cached2 = await getCached(cacheKey);
  if (cached2) {
    res.status(200).json(cached2);
    return;
  }
  try {
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
      token,
      origin,
      currency,
      limit: "30",
      sorting: "price",
      market: "th",
      unique: "false"
    })}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8e3);
    const fxPromise = getLiveFxRate(currency, "THB");
    const response = await fetch(url, { signal: controller.signal });
    const fx = await fxPromise;
    clearTimeout(timeoutId);
    if (!response.ok) {
      res.status(502).json({ error: "Upstream API error" });
      return;
    }
    const data = await response.json();
    const mappedData = {};
    if (data.success && Array.isArray(data.data)) {
      data.data.forEach((deal, index) => {
        const dest = deal.destination;
        if (!mappedData[dest]) {
          mappedData[dest] = {};
        }
        mappedData[dest][String(index)] = {
          price: deal.price,
          airline: deal.airline,
          departure_at: deal.departure_at,
          number_of_changes: deal.transfers,
          flight_number: deal.flight_number
        };
      });
    }
    const result = { success: true, data: mappedData, currency, fx };
    await setCache(cacheKey, result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Cheap prices error:", error);
    res.status(500).json({ error: "Failed to fetch cheap prices" });
  }
}

// api/_lib/specialOffers.ts
async function handleSpecialOffers(req, res, params) {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) {
    res.status(500).json({ error: "Missing token" });
    return;
  }
  const normalized = normalizeSearchParams(params);
  const origin = normalized.origin || "RGN";
  const currency = String(params.currency || "thb");
  const cacheKey = `special-offers-${origin}-${currency}`;
  const cached2 = await getCached(cacheKey);
  if (cached2) {
    res.status(200).json(cached2.data || cached2);
    return;
  }
  const fetchOffers = async (orig) => {
    const url = `https://api.travelpayouts.com/aviasales/v3/get_special_offers?` + new URLSearchParams({
      token,
      origin: orig,
      currency,
      locale: "en"
    });
    const res2 = await fetch(url);
    if (!res2.ok) return [];
    const data = await res2.json();
    return data.data || [];
  };
  try {
    let offers = await fetchOffers(origin);
    if (offers.length < 4) {
      const fallbacks = ["BKK", "KUL", "SIN", "DMK"];
      for (const fb of fallbacks) {
        if (fb === origin) continue;
        if (offers.length >= 4) break;
        const moreOffers = await fetchOffers(fb);
        offers = [...offers, ...moreOffers];
      }
    }
    const result = { success: true, data: offers };
    await setCache(cacheKey, result);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
}

// api/_handlers/flights.ts
async function handler2(req, res) {
  if (setCors(req, res)) return;
  const params = parseRequest(req);
  const { type } = params;
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  switch (type) {
    case "calendar":
      return handleCalendarPrices(req, res, params);
    case "cheap":
      return handleCheapPrices(req, res, params);
    case "special-offers":
      return handleSpecialOffers(req, res, params);
    case "search":
      return res.status(200).json(await searchFlights(params));
    default:
      return res.status(400).json({
        error: "Invalid type",
        valid: ["calendar", "cheap", "special-offers", "search"]
      });
  }
}

// api/_handlers/geo.ts
function handler3(req, res) {
  const country = req.headers["x-vercel-ip-country"] ?? "MM";
  res.setHeader("Cache-Control", "s-maxage=3600");
  res.json({ country });
}

// api/_handlers/newsletter.ts
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";
var ALLOWED_ORIGINS2 = [
  "https://gotravelasia.com",
  "https://www.gotravelasia.com",
  "https://gotravel-asia.vercel.app",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""
].filter(Boolean);
function setCors2(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS2.some((o) => origin.startsWith(o))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
async function handler4(req, res) {
  setCors2(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    let email;
    if (typeof req.body === "string") {
      try {
        email = JSON.parse(req.body).email;
      } catch {
        email = void 0;
      }
    } else if (req.body && typeof req.body === "object") {
      email = req.body.email;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    console.log(`[Newsletter] New subscriber: ${email}`);
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      let dbConn = null;
      try {
        const url = new URL(dbUrl);
        dbConn = await mysql.createConnection({
          host: url.hostname,
          port: parseInt(url.port) || 3306,
          user: decodeURIComponent(url.username),
          password: decodeURIComponent(url.password),
          database: url.pathname.slice(1),
          ssl: { rejectUnauthorized: false },
          connectTimeout: 1e4
        });
        await dbConn.execute(`
                    CREATE TABLE IF NOT EXISTS newsletterSubscribers (
                        id        INT AUTO_INCREMENT PRIMARY KEY,
                        email     VARCHAR(320) NOT NULL UNIQUE,
                        createdAt TIMESTAMP NOT NULL DEFAULT NOW()
                    )
                `);
        await dbConn.execute(
          `INSERT IGNORE INTO newsletterSubscribers (email) VALUES (?)`,
          [email]
        );
        console.log(`[Newsletter] Subscriber saved: ${email}`);
      } catch (dbErr) {
        console.error("[Newsletter] DB save failed:", dbErr);
      } finally {
        if (dbConn) await dbConn.end().catch(() => {
        });
      }
    }
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp-mail.outlook.com",
          port: 587,
          secure: false,
          // true for 465, false for other ports
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `GoTravel Asia <${emailUser}>`,
          to: email,
          subject: "Welcome to GoTravel Asia! \u2708\uFE0F",
          html: `
            <h2>Welcome aboard! \u{1F389}</h2>
            <p>Thanks for subscribing to GoTravel Asia flight deals.</p>
            <p>We'll send you the best flight deals across Southeast Asia 
            \u2014 no spam, just savings.</p>
            <p>\u2014 The GoTravel Team</p>
          `
        });
      } catch (emailErr) {
        console.error("[Newsletter] Email send failed:", emailErr);
      }
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[Newsletter] Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// shared/flights/priceIntelligence.validation.ts
import { z as z5 } from "zod";
var IATA = /^[A-Z]{3}$/;
var ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
var BaseSchema = z5.object({
  origin: z5.string().transform((v) => v.trim().toUpperCase()).refine((v) => IATA.test(v), "Invalid origin IATA"),
  destination: z5.string().transform((v) => v.trim().toUpperCase()).refine((v) => IATA.test(v), "Invalid destination IATA"),
  departStartDate: z5.string().refine((v) => ISO_DATE.test(v), "Invalid departStartDate"),
  departEndDate: z5.string().refine((v) => ISO_DATE.test(v), "Invalid departEndDate"),
  returnDate: z5.string().refine((v) => ISO_DATE.test(v), "Invalid returnDate").optional(),
  cabin: z5.enum(["economy", "premium", "business", "first"]).optional(),
  adults: z5.coerce.number().int().min(1).max(9).optional(),
  children: z5.coerce.number().int().min(0).max(8).optional(),
  infants: z5.coerce.number().int().min(0).max(4).optional(),
  currency: z5.string().default("USD").transform((v) => v.trim().toUpperCase()).refine((v) => /^[A-Z]{3}$/.test(v), "Invalid currency")
});
function validatePriceCalendarRequest(input) {
  const parsed = BaseSchema.superRefine((v, ctx) => {
    if (v.origin === v.destination) {
      ctx.addIssue({ code: "custom", message: "Origin and destination must differ", path: ["destination"] });
    }
    if (v.departEndDate < v.departStartDate) {
      ctx.addIssue({ code: "custom", message: "departEndDate must be >= departStartDate", path: ["departEndDate"] });
    }
    const daySpan = Math.floor((Date.parse(v.departEndDate) - Date.parse(v.departStartDate)) / 864e5) + 1;
    if (daySpan < 1 || daySpan > 62) {
      ctx.addIssue({ code: "custom", message: "Date range must be between 1 and 62 days", path: ["departEndDate"] });
    }
    if (v.returnDate && v.returnDate < v.departStartDate) {
      ctx.addIssue({ code: "custom", message: "returnDate must be >= departStartDate", path: ["returnDate"] });
    }
  }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request" };
  }
  return { ok: true, data: parsed.data };
}
function validatePriceTrendRequest(input) {
  const parsed = BaseSchema.extend({
    windowDays: z5.coerce.number().int().min(3).max(30).optional()
  }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request" };
  }
  const data = parsed.data;
  if (data.departEndDate < data.departStartDate) {
    return { ok: false, message: "departEndDate must be >= departStartDate" };
  }
  return { ok: true, data };
}

// shared/flights/priceIntelligence.cacheKey.ts
function norm(v) {
  return (v ?? "").trim().toUpperCase();
}
function buildPriceCalendarCacheKey(req) {
  return [
    "price-calendar:v1",
    norm(req.origin),
    norm(req.destination),
    req.departStartDate,
    req.departEndDate,
    req.returnDate ?? "-",
    req.cabin ?? "-",
    String(req.adults ?? 1),
    String(req.children ?? 0),
    String(req.infants ?? 0),
    norm(req.currency ?? "USD")
  ].join(":");
}
function buildPriceTrendCacheKey(req) {
  return [
    "price-trend:v1",
    norm(req.origin),
    norm(req.destination),
    req.departStartDate,
    req.departEndDate,
    req.returnDate ?? "-",
    norm(req.currency ?? "USD"),
    String(req.windowDays ?? 7)
  ].join(":");
}

// api/_lib/price-intelligence/sourceOrchestrator.ts
var inflight = /* @__PURE__ */ new Map();
async function fetchWithTimeout(fn, timeoutMs) {
  let timer = null;
  try {
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
    });
    const data = await Promise.race([fn(), timeoutPromise]);
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return { ok: false, timedOut: message === "TIMEOUT", error: message };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
async function fetchAmadeusRecords(input) {
  const response = await fetchWithTimeout(
    () => searchCheapestDates(input.origin, input.destination),
    4e3
  );
  if (!response.ok || !response.data) {
    return { source: "amadeus", ok: false, records: [], error: response.ok ? "no_data" : response.error, timedOut: response.ok ? false : response.timedOut };
  }
  const records = [];
  for (const item of response.data) {
    const amount = Number.parseFloat(item.price?.total ?? "0");
    if (!Number.isFinite(amount) || amount <= 0) continue;
    records.push({
      date: item.departureDate,
      amount,
      currency: input.currency ?? "USD",
      source: "amadeus"
    });
  }
  return { source: "amadeus", ok: true, records };
}
async function fetchTravelPayoutsRecords(input) {
  const qs = new URLSearchParams({
    origin: input.origin,
    destination: input.destination,
    month: input.departStartDate.slice(0, 7),
    currency: (input.currency ?? "USD").toLowerCase()
  });
  const response = await fetchWithTimeout(
    async () => {
      const res = await fetch(`${process.env.INTERNAL_BASE_URL ?? ""}/api/calendar-prices?${qs.toString()}`);
      if (!res.ok) throw new Error(`travelpayouts_proxy_${res.status}`);
      return res.json();
    },
    4500
  );
  if (!response.ok || !response.data?.data) {
    return { source: "travelpayouts", ok: false, records: [], error: response.ok ? "no_data" : response.error, timedOut: response.ok ? false : response.timedOut };
  }
  const records = [];
  for (const [date, entry] of Object.entries(response.data.data)) {
    const amount = entry.price ?? 0;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    records.push({
      date,
      amount,
      currency: (entry.currency ?? input.currency ?? "USD").toUpperCase(),
      source: "travelpayouts"
    });
  }
  return { source: "travelpayouts", ok: true, records };
}
async function fetchCalendarSources(input, dedupKey) {
  if (inflight.has(dedupKey)) return inflight.get(dedupKey);
  const promise = (async () => {
    const [tp, amadeus] = await Promise.all([
      fetchTravelPayoutsRecords(input),
      fetchAmadeusRecords(input)
    ]);
    return [tp, amadeus];
  })();
  inflight.set(dedupKey, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(dedupKey);
  }
}

// api/_lib/price-intelligence/calendarNormalize.ts
var PRECEDENCE = {
  travelpayouts: 1,
  bot_json: 2,
  amadeus: 3
};
function confidenceFor(source, estimated) {
  if (estimated) return { score: 0.45, level: "low", reason: "Estimated from seasonality" };
  if (source === "travelpayouts") return { score: 0.9, level: "high", reason: "Live TP data" };
  if (source === "bot_json") return { score: 0.75, level: "medium", reason: "Bot historical data" };
  return { score: 0.6, level: "medium", reason: "Amadeus fallback live data" };
}
function pickWinningRecord(current, candidate) {
  if (!current) return candidate;
  const currentP = PRECEDENCE[current.source] ?? 99;
  const candidateP = PRECEDENCE[candidate.source] ?? 99;
  if (candidateP < currentP) return candidate;
  if (candidateP > currentP) return current;
  return candidate.amount < current.amount ? candidate : current;
}
function normalizeCalendarWithPrecedence(request, sourceResults) {
  const byDate = /* @__PURE__ */ new Map();
  for (const sourceResult of sourceResults) {
    if (!sourceResult.ok) continue;
    for (const record of sourceResult.records) {
      if (record.date < request.departStartDate || record.date > request.departEndDate) continue;
      byDate.set(record.date, pickWinningRecord(byDate.get(record.date), record));
    }
  }
  const out = [];
  for (let d = /* @__PURE__ */ new Date(`${request.departStartDate}T00:00:00Z`); d <= /* @__PURE__ */ new Date(`${request.departEndDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const best = byDate.get(date);
    if (!best) continue;
    const estimated = !!best.estimated;
    out.push({
      date,
      amount: Math.round(best.amount),
      currency: best.currency,
      kind: estimated ? "estimated" : "live",
      confidence: confidenceFor(best.source, estimated),
      provenance: {
        source: best.source === "travelpayouts" ? "travelpayouts_v3" : best.source === "amadeus" ? "amadeus" : "bot_json",
        precedence: PRECEDENCE[best.source] ?? 99,
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      estimation: {
        estimated,
        interpolated: false,
        seasonalityWeighted: estimated
      }
    });
  }
  return out;
}

// api/_lib/price-intelligence/estimationEngine.ts
function monthWeight(month) {
  const peak = /* @__PURE__ */ new Set([6, 7, 8, 12]);
  const shoulder = /* @__PURE__ */ new Set([4, 5, 9, 10, 11]);
  if (peak.has(month)) return 1.12;
  if (shoulder.has(month)) return 1.04;
  return 0.95;
}
function fillMissingWithSeasonality(input, startDate, endDate) {
  const map = new Map(input.map((p) => [p.date, p]));
  const liveValues = input.filter((p) => p.kind === "live").map((p) => p.amount);
  const baseline = liveValues.length ? liveValues.reduce((a, b) => a + b, 0) / liveValues.length : 0;
  const out = [];
  for (let d = /* @__PURE__ */ new Date(`${startDate}T00:00:00Z`); d <= /* @__PURE__ */ new Date(`${endDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const existing = map.get(date);
    if (existing) {
      out.push(existing);
      continue;
    }
    if (baseline <= 0) {
      out.push({
        date,
        amount: 0,
        currency: input[0]?.currency ?? "USD",
        kind: "fallback",
        confidence: { score: 0.2, level: "low", reason: "No baseline data" },
        provenance: { source: "none", precedence: 99 },
        estimation: { estimated: true, seasonalityWeighted: false, interpolated: false }
      });
      continue;
    }
    const month = d.getUTCMonth() + 1;
    const estimatedAmount = Math.round(baseline * monthWeight(month));
    out.push({
      date,
      amount: estimatedAmount,
      currency: input[0]?.currency ?? "USD",
      kind: "estimated",
      confidence: { score: 0.45, level: "low", reason: "Seasonality-weighted estimate" },
      provenance: { source: "none", precedence: 98 },
      estimation: { estimated: true, seasonalityWeighted: true, interpolated: false }
    });
  }
  return out;
}

// api/_lib/price-intelligence/calendarService.ts
var TTL_SECONDS = 300;
async function getPriceCalendar(request) {
  const key = buildPriceCalendarCacheKey(request);
  const cached2 = await getCached(key);
  if (cached2) {
    return {
      ...cached2,
      cache: { ...cached2.cache, hit: true }
    };
  }
  const sources = await fetchCalendarSources(request, key);
  const sourceSuccesses = sources.filter((s) => s.ok).length;
  const normalized = normalizeCalendarWithPrecedence(request, sources);
  const points = fillMissingWithSeasonality(normalized, request.departStartDate, request.departEndDate);
  const response = {
    request,
    points,
    fallback: {
      used: sourceSuccesses === 0 || points.every((p) => p.kind !== "live"),
      reason: sourceSuccesses === 0 ? "source_error" : points.every((p) => p.kind !== "live") ? "no_live_data" : void 0,
      fallbackSource: points.some((p) => p.kind === "estimated") ? "none" : void 0
    },
    cache: { key, hit: false, ttlSeconds: TTL_SECONDS },
    meta: {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      sourceTimeoutMs: 4500,
      sourceFailures: sources.filter((s) => !s.ok).length,
      sourceSuccesses
    }
  };
  await setCache(key, response);
  return response;
}

// api/_lib/price-intelligence/trendDeriver.ts
function rollingAverage(values, idx, window) {
  const from = Math.max(0, idx - window + 1);
  const slice = values.slice(from, idx + 1);
  if (!slice.length) return 0;
  return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
}
function deriveTrendPoints(calendarPoints, windowDays = 7) {
  const sorted = [...calendarPoints].sort((a, b) => a.date.localeCompare(b.date));
  const amounts = sorted.map((p) => p.amount);
  return sorted.map((p, idx) => {
    const prev = idx > 0 ? sorted[idx - 1].amount : p.amount;
    return {
      date: p.date,
      amount: p.amount,
      currency: p.currency,
      deltaFromPrevious: p.amount - prev,
      rollingAverage: rollingAverage(amounts, idx, windowDays),
      kind: p.kind,
      confidence: p.confidence
    };
  });
}

// api/_lib/price-intelligence/trendService.ts
var TTL_SECONDS2 = 300;
async function getPriceTrend(request) {
  const key = buildPriceTrendCacheKey(request);
  const cached2 = await getCached(key);
  if (cached2) {
    return { ...cached2, cache: { ...cached2.cache, hit: true } };
  }
  const calendar = await getPriceCalendar({
    ...request,
    cabin: void 0,
    adults: void 0,
    children: void 0,
    infants: void 0
  });
  const points = deriveTrendPoints(calendar.points, request.windowDays ?? 7);
  const values = points.map((p) => p.amount).filter((n) => n > 0);
  const average = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const summary = {
    direction: points.length < 2 ? "flat" : points[points.length - 1].rollingAverage > points[0].rollingAverage ? "up" : points[points.length - 1].rollingAverage < points[0].rollingAverage ? "down" : "flat",
    average,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null
  };
  const response = {
    request,
    points,
    summary,
    fallback: calendar.fallback,
    cache: { key, hit: false, ttlSeconds: TTL_SECONDS2 },
    meta: {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      derivedFromCalendar: true
    }
  };
  await setCache(key, response);
  return response;
}

// server/middleware/csp.ts
var cspOpen = (_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *; connect-src 'self' *; img-src 'self' data: blob: *;"
  );
  next();
};

// server/routes/sitemap.ts
import { Router } from "express";
var router2 = Router();
var SITE_URL = process.env.VITE_SITE_URL || "https://gotravel-asia.vercel.app";
var ROUTES = [
  "/",
  "/flights/results",
  "/privacy-policy",
  "/terms-of-service",
  "/destination/bangkok",
  "/destination/chiang-mai",
  "/destination/phuket",
  "/destination/krabi"
];
router2.get("/sitemap.xml", (_req, res) => {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const urls = ROUTES.map((r) => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${now}</lastmod></url>`).join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  );
});
var sitemap_default = router2;

// server/routes/destinationLanding.ts
import { Router as Router2 } from "express";
var router3 = Router2();
router3.get("/", async (req, res) => {
  try {
    const { getDestinationLandingData: getDestinationLandingData2 } = await Promise.resolve().then(() => (init_destination_landing(), destination_landing_exports));
    const { slug } = req.query;
    if (typeof slug !== "string") {
      res.status(400).json({ error: "slug is required" });
      return;
    }
    res.json(await getDestinationLandingData2({ slug }));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});
var destinationLanding_default = router3;

// server/routes/chat.ts
import { Router as Router3 } from "express";

// server/middleware/rateLimit.ts
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "unknown";
  return req.ip || req.socket.remoteAddress || "unknown";
}
function rateLimit(namespace, max, windowMs, msg) {
  return async (req, res, next) => {
    try {
      const ip = getClientIp(req);
      const key = `ratelimit:${namespace}:${ip}`;
      const store2 = getStore();
      const { count, resetAt } = await store2.increment(key, windowMs);
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - count)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1e3)));
      if (count > max) {
        console.warn(`[RateLimit:Hit] ${key} - count: ${count}/${max}`);
        res.status(429).json({ error: msg, retryAfter: Math.ceil((resetAt - Date.now()) / 1e3) });
        return;
      }
      next();
    } catch (err) {
      console.error("[RateLimit:Error] Fallback to allow:", err);
      next();
    }
  };
}

// server/routes/chat.ts
var router4 = Router3();
var MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
router4.post(
  "/",
  rateLimit("chat", 10, 60 * 60 * 1e3, "Rate limit exceeded. Try again in one hour."),
  async (req, res) => {
    try {
      const { contents } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "API key missing" });
        return;
      }
      if (!contents) {
        res.status(400).json({ error: "Missing contents" });
        return;
      }
      let lastError = null;
      for (const model of MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 } })
            }
          );
          if (response.status === 429) continue;
          if (!response.ok) continue;
          res.json(await response.json());
          return;
        } catch (err) {
          lastError = err;
        }
      }
      throw lastError || new Error("All models failed");
    } catch (error) {
      res.status(500).json({ error: "Failed to process chat request" });
    }
  }
);
var chat_default = router4;

// server/routes/cheapPrices.ts
import { Router as Router4 } from "express";

// server/utils/cache.ts
var CACHE_TTL_SECONDS3 = 30 * 60;
async function getCached2(key) {
  try {
    const store2 = getStore();
    const data = await store2.get(key);
    if (data) {
      console.log(`[Cache:HIT] ${key}`);
      return data;
    }
    console.log(`[Cache:MISS] ${key}`);
    return null;
  } catch (err) {
    console.error(`[Cache:Error] getCached failed for ${key}:`, err);
    return null;
  }
}
async function setCache2(key, data) {
  try {
    const store2 = getStore();
    await store2.set(key, data, CACHE_TTL_SECONDS3);
  } catch (err) {
    console.error(`[Cache:Error] setCache failed for ${key}:`, err);
  }
}

// server/routes/cheapPrices.ts
var router5 = Router4();
router5.get(
  "/",
  rateLimit("cheap", 60, 15 * 60 * 1e3, "Too many requests"),
  async (req, res) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) {
        res.status(500).json({ error: "API token not configured" });
        return;
      }
      const normalized = normalizeSearchParams(req.query);
      const origin = normalized.origin || "RGN";
      const currency = String(req.query.currency || "thb");
      const cacheKey = `cheap-${origin}-${currency}`;
      const cached2 = await getCached2(cacheKey);
      if (cached2) {
        res.set("Cache-Control", "public, max-age=1800");
        res.json(cached2);
        return;
      }
      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${new URLSearchParams({
        token,
        origin,
        currency,
        limit: "30",
        sorting: "price",
        market: "th",
        unique: "false"
      })}`;
      const fxPromise = getLiveFxRate(currency, "THB");
      const response = await fetch(url, { signal: AbortSignal.timeout(8e3) });
      const fx = await fxPromise;
      if (!response.ok) {
        res.status(502).json({ error: "Upstream API error" });
        return;
      }
      const data = await response.json();
      const mappedData = {};
      if (data.success && Array.isArray(data.data)) {
        data.data.forEach((deal, index) => {
          const dest = deal.destination;
          if (!mappedData[dest]) {
            mappedData[dest] = {};
          }
          mappedData[dest][String(index)] = {
            price: deal.price,
            airline: deal.airline,
            departure_at: deal.departure_at,
            number_of_changes: deal.transfers,
            flight_number: deal.flight_number
          };
        });
      }
      const result = { success: true, data: mappedData, currency, fx };
      await setCache2(cacheKey, result);
      res.set("Cache-Control", "public, max-age=1800");
      res.json(result);
    } catch (error) {
      console.error("Cheap prices error:", error);
      res.status(500).json({ error: "Failed to fetch cheap prices" });
    }
  }
);
var cheapPrices_default = router5;

// server/routes/calendarPrices.ts
import { Router as Router5 } from "express";
import path2 from "path";
import fs2 from "fs";
var router6 = Router5();
router6.get(
  "/",
  rateLimit("calendar", 100, 15 * 60 * 1e3, "Too many requests"),
  async (req, res) => {
    try {
      const token = process.env.TRAVELPAYOUTS_TOKEN;
      if (!token) {
        res.status(500).json({ error: "API token not configured" });
        return;
      }
      const { month, currency } = req.query;
      const normalized = normalizeSearchParams(req.query);
      const orig = normalized.origin;
      const dest = normalized.destination;
      const mo = String(month);
      const cur = String(currency || "usd");
      if (!orig || !dest || !mo) {
        res.status(400).json({ error: "Missing required params: origin, destination, month" });
        return;
      }
      const cacheKey = `cal-${orig}-${dest}-${mo}-${cur}`;
      const cached2 = await getCached2(cacheKey);
      if (cached2) {
        res.set("Cache-Control", "public, max-age=3600");
        res.json(cached2);
        return;
      }
      const [yr, mn] = mo.split("-").map(Number);
      const nextDate = new Date(yr, mn, 1);
      const nextMo = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
      const tp = (params, base) => fetch(`${base}?${new URLSearchParams({ token, ...params })}`, { signal: AbortSignal.timeout(8e3) }).then((r) => r.ok ? r.json() : null);
      const [v3Mo1, v3Mo2, calendarData, matrixData, amadeusMo1, amadeusMo2, fxQuote] = await Promise.allSettled([
        tp({ origin: orig, destination: dest, departure_at: mo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
        tp({ origin: orig, destination: dest, departure_at: nextMo, sorting: "price", limit: "30", one_way: "true", currency: cur }, "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"),
        tp({ origin: orig, destination: dest, month: mo, calendar_type: "departure_date", currency: cur }, "https://api.travelpayouts.com/v1/prices/calendar"),
        tp({ origin: orig, destination: dest, month: mo, currency: cur }, "https://api.travelpayouts.com/v2/prices/month-matrix"),
        fetchAmadeusCalendarPrices(orig, dest, mo, cur),
        fetchAmadeusCalendarPrices(orig, dest, nextMo, cur),
        getLiveFxRate(cur, "THB")
      ]);
      const merged = {};
      for (const result2 of [v3Mo1, v3Mo2]) {
        const arr = result2.status === "fulfilled" && result2.value?.data;
        if (Array.isArray(arr)) {
          for (const e of arr) {
            addPrice(merged, e.departure_at?.split("T")[0], e.price || 0, {
              origin: e.origin || orig,
              destination: e.destination || dest,
              currency: cur,
              airline: e.airline || "",
              departure_at: e.departure_at,
              return_at: e.return_at || "",
              transfers: e.transfers ?? 0,
              flight_number: e.flight_number || ""
            }, "v3");
          }
        }
      }
      try {
        const botPath = path2.join(process.cwd(), "client", "public", "data", "flight_data.json");
        if (fs2.existsSync(botPath)) {
          const botData = JSON.parse(fs2.readFileSync(botPath, "utf-8"));
          if (Array.isArray(botData.routes)) {
            for (const r of botData.routes) {
              if (r.origin === orig && r.destination === dest) {
                const dateStr = r.date;
                if (dateStr && (dateStr.startsWith(mo) || dateStr.startsWith(nextMo))) {
                  addPrice(merged, dateStr, r.price || 0, {
                    origin: r.origin,
                    destination: r.destination,
                    currency: cur,
                    airline: r.airline_code || r.airline || "",
                    departure_at: `${r.date}T00:00:00`,
                    transfers: r.transfers || 0,
                    flight_number: r.flight_num || ""
                  }, "bot");
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Bot JSON load error:", err);
      }
      const cal = calendarData.status === "fulfilled" && calendarData.value?.data;
      if (cal && typeof cal === "object" && !Array.isArray(cal)) {
        for (const [dateStr, entry] of Object.entries(cal)) {
          const e = entry;
          e.currency = cur;
          addPrice(merged, dateStr, e.price || 0, e, "legacy");
        }
      }
      const matrix = matrixData.status === "fulfilled" && matrixData.value?.data;
      if (Array.isArray(matrix)) {
        for (const e of matrix) {
          addPrice(merged, e.depart_date, e.value || e.price || 0, {
            origin: e.origin || orig,
            destination: e.destination || dest,
            currency: cur,
            airline: e.airline || e.gate || "",
            departure_at: e.departure_at || `${e.depart_date}T00:00:00`,
            return_at: e.return_date ? `${e.return_date}T00:00:00` : "",
            transfers: e.number_of_changes ?? 0
          }, "legacy");
        }
      }
      for (const result2 of [amadeusMo1, amadeusMo2]) {
        const data = result2.status === "fulfilled" ? result2.value : null;
        if (data && typeof data === "object") {
          for (const [dateStr, entry] of Object.entries(data)) {
            entry.currency = cur;
            addPrice(merged, dateStr, entry.price || 0, entry, "amadeus");
          }
        }
      }
      const fx = fxQuote.status === "fulfilled" ? fxQuote.value : {
        baseCurrency: cur.toUpperCase(),
        quoteCurrency: "THB",
        rate: cur.toUpperCase() === "THB" ? 1 : 34,
        source: "fallback_static",
        asOf: null
      };
      const result = { success: true, data: merged, currency: cur, fx };
      await setCache2(cacheKey, result);
      res.set("Cache-Control", "public, max-age=3600");
      res.json(result);
    } catch (error) {
      console.error("Calendar prices error:", error);
      res.status(500).json({ error: "Failed to fetch calendar prices" });
    }
  }
);
var calendarPrices_default = router6;

// server/routes/flightsSearch.ts
import { Router as Router6 } from "express";
var router7 = Router6();
router7.get("/", async (req, res) => {
  try {
    const result = await searchFlights(req.query);
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
        searchedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
});
var flightsSearch_default = router7;

// server/routes/priceAlerts.ts
import { Router as Router7 } from "express";
import { Resend } from "resend";

// server/utils/email.ts
var SITE = process.env.VITE_SITE_URL || "https://gotravel-asia.vercel.app";
var DEALS = [
  { flag: "\u{1F1F9}\u{1F1ED}", from: "Yangon", to: "Bangkok", code: "RGN-BKK", price: 38 },
  { flag: "\u{1F1F8}\u{1F1EC}", from: "Yangon", to: "Singapore", code: "RGN-SIN", price: 89 },
  { flag: "\u{1F1F9}\u{1F1ED}", from: "Yangon", to: "Chiang Mai", code: "RGN-CNX", price: 62 },
  { flag: "\u{1F1F2}\u{1F1FE}", from: "Yangon", to: "Kuala Lumpur", code: "RGN-KUL", price: 95 },
  { flag: "\u{1F1ED}\u{1F1F0}", from: "Yangon", to: "Hong Kong", code: "RGN-HKG", price: 112 }
];
function buildDealRows() {
  return DEALS.map((d) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td style="font-size:20px;width:36px;vertical-align:middle;">${d.flag}</td>
          <td style="vertical-align:middle;">
            <span style="font-weight:700;color:#1e293b;font-size:14px;">${d.from} \u2192 ${d.to}</span><br/>
            <span style="font-size:12px;color:#94a3b8;">${d.code}</span>
          </td>
          <td style="text-align:right;vertical-align:middle;">
            <span style="font-size:11px;color:#94a3b8;text-decoration:line-through;">$${Math.round(d.price * 1.65)}</span><br/>
            <span style="font-size:18px;font-weight:800;color:#16a34a;">$${d.price}</span>
          </td>
        </tr></table>
      </td>
    </tr>`).join("");
}
function buildWelcomeEmailHtml(email) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to GoTravel Asia</title></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;">
<tr><td align="center" style="padding:32px 16px;">
<table cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<tr><td style="background:linear-gradient(135deg,#180840 0%,#2D0558 50%,#5B0EA6 100%);padding:40px 32px 32px;text-align:center;">
  <div style="font-size:32px;margin-bottom:8px;">\u2708\uFE0F</div>
  <h1 style="color:#F5C518;font-size:26px;font-weight:900;margin:0 0 8px;">GoTravel Asia</h1>
  <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">Your flight deal alerts are ready</p>
</td></tr>

<tr><td style="padding:32px 32px 16px;">
  <h2 style="color:#1e293b;font-size:22px;font-weight:800;margin:0 0 12px;">Welcome aboard! \u{1F389}</h2>
  <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0;">
    You're now signed up for <strong style="color:#1e293b;">24/7 price monitoring</strong> across Southeast Asia's best routes.
  </p>
</td></tr>

<tr><td style="padding:0 32px 24px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border-radius:12px;">
    <tr>
      <td style="padding:16px;text-align:center;width:33%;">
        <div style="font-size:22px;font-weight:800;color:#5B0EA6;">50+</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Routes</div>
      </td>
      <td style="padding:16px;text-align:center;width:33%;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
        <div style="font-size:22px;font-weight:800;color:#5B0EA6;">$54</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Avg Saved</div>
      </td>
      <td style="padding:16px;text-align:center;width:33%;">
        <div style="font-size:22px;font-weight:800;color:#5B0EA6;">24/7</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">Monitoring</div>
      </td>
    </tr>
  </table>
</td></tr>

<tr><td style="padding:0 32px 8px;">
  <h3 style="color:#1e293b;font-size:16px;font-weight:800;margin:0;">\u{1F525} Today's Best Deals</h3>
</td></tr>

<tr><td style="padding:0 32px 24px;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#fff;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;">
    ${buildDealRows()}
  </table>
</td></tr>

<tr><td style="padding:0 32px 32px;text-align:center;">
  <a href="${SITE}" style="display:inline-block;background:linear-gradient(135deg,#F5C518 0%,#F59E0B 100%);color:#2D0558;font-size:16px;font-weight:800;padding:16px 40px;border-radius:12px;text-decoration:none;">
    Search Flights Now \u2192
  </a>
</td></tr>

<tr><td style="padding:24px 32px;background:#fefce8;border-top:1px solid #fef08a;">
  <h4 style="color:#854d0e;font-size:13px;font-weight:700;margin:0 0 12px;">\u26A1 How Price Alerts Work</h4>
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:4px 0;color:#92400e;font-size:13px;">1\uFE0F\u20E3 Search any route on GoTravel Asia</td></tr>
    <tr><td style="padding:4px 0;color:#92400e;font-size:13px;">2\uFE0F\u20E3 We monitor prices 24/7 automatically</td></tr>
    <tr><td style="padding:4px 0;color:#92400e;font-size:13px;">3\uFE0F\u20E3 Get notified instantly when prices drop</td></tr>
  </table>
</td></tr>

<tr><td style="padding:24px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
  <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;line-height:1.6;">
    Sent to <strong>${email}</strong> via
    <a href="${SITE}" style="color:#5B0EA6;text-decoration:none;">GoTravel Asia</a>.
  </p>
  <p style="color:#cbd5e1;font-size:10px;margin:0;">Reply to unsubscribe. No spam, ever. \u{1F49C}</p>
</td></tr>

</table></td></tr></table>
</body></html>`;
}

// server/routes/priceAlerts.ts
var router8 = Router7();
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var IATA_RE = /^[A-Z]{3}$/;
var ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidEmail(email) {
  return EMAIL_RE.test(email);
}
function isIsoDate2(value) {
  return ISO_DATE_RE.test(value);
}
function normalizeIata(value) {
  return value.trim().toUpperCase();
}
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}
function parseTargetPrice(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(parsed);
}
function buildPriceAlertConfirmationHtml(params) {
  const siteUrl = process.env.VITE_SITE_URL || "https://gotravel-asia.vercel.app";
  const routeLabel = `${params.origin} \u2192 ${params.destination}`;
  const priceLine = params.targetPrice && params.targetPrice > 0 ? `<p style="margin:0 0 12px;color:#475569;font-size:14px;">
           We\u2019ll monitor this route starting from
           <strong>${params.currency} ${params.targetPrice.toLocaleString()}</strong>.
         </p>` : `<p style="margin:0 0 12px;color:#475569;font-size:14px;">
           We\u2019ll monitor this route and notify you when deals appear.
         </p>`;
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Price Alert Created</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table cellpadding="0" cellspacing="0" border="0" width="520" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg,#180840 0%,#2D0558 55%,#5B0EA6 100%);padding:36px 32px;">
                <div style="font-size:30px;margin-bottom:8px;">\u{1F514}</div>
                <h1 style="margin:0;color:#F5C518;font-size:26px;font-weight:900;">Price Alert Created</h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                  GoTravel Asia is now tracking your route.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 32px 12px;">
                <p style="margin:0 0 12px;color:#0f172a;font-size:18px;font-weight:800;">
                  ${routeLabel}
                </p>
                <p style="margin:0 0 8px;color:#475569;font-size:14px;">
                  Departure: <strong>${params.departDate}</strong>
                </p>
                ${params.returnDate ? `<p style="margin:0 0 8px;color:#475569;font-size:14px;">
                         Return: <strong>${params.returnDate}</strong>
                       </p>` : ""}
                ${priceLine}
                <p style="margin:0;color:#475569;font-size:14px;">
                  Alerts will be sent to <strong>${params.email}</strong>.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 32px 28px;">
                <a
                  href="${siteUrl}"
                  style="display:inline-block;background:linear-gradient(135deg,#F5C518 0%,#F59E0B 100%);color:#2D0558;text-decoration:none;font-weight:800;font-size:15px;padding:14px 28px;border-radius:12px;"
                >
                  Search Flights \u2192
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
                  You\u2019re receiving this because you created a price alert on GoTravel Asia.
                  Future deal emails will arrive automatically when qualifying price drops are detected.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
async function sendPriceAlertConfirmationEmail(params) {
  const subject = `\u{1F514} Price alert created: ${params.origin} \u2192 ${params.destination}`;
  const html = buildPriceAlertConfirmationHtml(params);
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ALERT_FROM_EMAIL || process.env.EMAIL_FROM || "GoTravel Asia <onboarding@resend.dev>";
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: fromEmail,
        to: params.email,
        subject,
        html
      });
      return { sent: true, queued: false };
    } catch (error) {
      console.warn("[price-alerts] Resend confirmation failed:", error);
    }
  }
  try {
    await ensureEmailQueueTable();
    const queued = await enqueueEmail({
      toEmail: params.email,
      subject,
      htmlContent: html
    });
    if (queued) {
      return { sent: false, queued: true };
    }
  } catch (error) {
    console.warn("[price-alerts] Queue confirmation failed:", error);
  }
  return { sent: false, queued: false, error: "email_not_configured_or_failed" };
}
router8.post("/subscribe", async (req, res) => {
  try {
    const body = req.body || {};
    const email = normalizeEmail(String(body.email || ""));
    const origin = normalizeIata(String(body.origin || ""));
    const destination = normalizeIata(String(body.destination || ""));
    const departDate = String(body.departDate || "").trim();
    const returnDate = typeof body.returnDate === "string" && body.returnDate.trim() ? body.returnDate.trim() : null;
    const targetPrice = parseTargetPrice(body.currentPrice);
    const currency = String(body.currency || "THB").trim().toUpperCase();
    const source = String(body.source || "track_button").trim() || "track_button";
    if (!email || !isValidEmail(email)) {
      res.status(400).json({ success: false, error: "Invalid email address." });
      return;
    }
    if (!IATA_RE.test(origin)) {
      res.status(400).json({ success: false, error: "Invalid origin IATA code." });
      return;
    }
    if (!IATA_RE.test(destination)) {
      res.status(400).json({ success: false, error: "Invalid destination IATA code." });
      return;
    }
    if (origin === destination) {
      res.status(400).json({ success: false, error: "Origin and destination must differ." });
      return;
    }
    if (!isIsoDate2(departDate)) {
      res.status(400).json({ success: false, error: "Invalid departure date format." });
      return;
    }
    if (returnDate && !isIsoDate2(returnDate)) {
      res.status(400).json({ success: false, error: "Invalid return date format." });
      return;
    }
    const createResult = await createPriceAlert({
      email,
      origin,
      destination,
      departDate,
      returnDate,
      targetPrice,
      currency,
      source,
      isActive: true
    });
    if (!createResult.success) {
      res.status(503).json({
        success: false,
        error: "Price alert service is temporarily unavailable."
      });
      return;
    }
    if (createResult.alreadyExists) {
      res.status(200).json({
        success: true,
        alreadyExists: true,
        message: "This email is already tracking this route."
      });
      return;
    }
    const emailResult = await sendPriceAlertConfirmationEmail({
      email,
      origin,
      destination,
      departDate,
      returnDate,
      targetPrice: targetPrice > 0 ? targetPrice : void 0,
      currency
    });
    if (emailResult.sent) {
      res.status(200).json({
        success: true,
        alreadyExists: false,
        message: "Price alert created. Check your inbox for confirmation.",
        emailSent: true,
        emailQueued: false
      });
      return;
    }
    if (emailResult.queued) {
      res.status(200).json({
        success: true,
        alreadyExists: false,
        message: "Price alert created. Confirmation email is queued.",
        emailSent: false,
        emailQueued: true
      });
      return;
    }
    res.status(200).json({
      success: true,
      alreadyExists: false,
      message: "Price alert created successfully.",
      emailSent: false,
      emailQueued: false
    });
  } catch (error) {
    console.error("[price-alerts] subscribe error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create price alert."
    });
  }
});
router8.post("/submit", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email || "");
    const email = normalizeEmail(rawEmail);
    const source = String(req.body?.source || "popup");
    if (!email || !isValidEmail(email)) {
      res.status(400).json({ success: false, error: "Valid email is required." });
      return;
    }
    const origin = req.body?.origin ? normalizeIata(String(req.body.origin)) : "";
    const destination = req.body?.destination ? normalizeIata(String(req.body.destination)) : "";
    const departDate = req.body?.departDate ? String(req.body.departDate) : "";
    const targetPrice = parseTargetPrice(req.body?.currentPrice);
    const currency = String(req.body?.currency || "USD").trim().toUpperCase();
    if (origin && destination && departDate) {
      if (!IATA_RE.test(origin) || !IATA_RE.test(destination) || !isIsoDate2(departDate)) {
        res.status(400).json({
          success: false,
          error: "Invalid route tracking payload."
        });
        return;
      }
      const result2 = await createPriceAlert({
        email,
        origin,
        destination,
        departDate,
        returnDate: null,
        targetPrice,
        currency,
        source: "popup_route_submit",
        isActive: true
      });
      if (!result2.success) {
        res.status(503).json({
          success: false,
          error: "Price alert service is temporarily unavailable."
        });
        return;
      }
      res.json({
        success: true,
        flow: "auto-saved",
        alreadyExists: result2.alreadyExists
      });
      return;
    }
    const result = await saveSubscriber({ email, source });
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && !result.alreadyExists) {
      new Resend(resendApiKey).emails.send({
        from: process.env.EMAIL_FROM || "GoTravel Asia <onboarding@resend.dev>",
        to: email,
        subject: "\u2708\uFE0F Welcome to GoTravel Asia!",
        html: buildWelcomeEmailHtml(email)
      }).catch((error) => {
        console.warn("[price-alerts] welcome email failed:", error);
      });
    }
    res.json({
      success: true,
      flow: "welcome-email",
      alreadyExists: result.alreadyExists
    });
  } catch (error) {
    console.error("[price-alerts] submit error:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
});
var priceAlerts_default = router8;

// server/routes/cron.ts
import { Router as Router8 } from "express";
import nodemailer2 from "nodemailer";
var router9 = Router8();
var emailQueueReady = false;
var clamp2 = (value, min, max) => Math.min(max, Math.max(min, value));
function isAlertStale(updatedAt, staleMinutes) {
  if (!updatedAt) return true;
  const updatedMs = new Date(updatedAt).getTime();
  if (!Number.isFinite(updatedMs)) return true;
  return Date.now() - updatedMs >= staleMinutes * 6e4;
}
router9.get("/check-price-alerts", async (req, res) => {
  try {
    const startedAt = Date.now();
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const activeAlerts = await getActivePriceAlerts();
    if (activeAlerts.length === 0) {
      res.json({ message: "No active alerts to check." });
      return;
    }
    const tpToken = process.env.TRAVELPAYOUTS_TOKEN;
    if (!tpToken) {
      res.status(500).json({ error: "TRAVELPAYOUTS_TOKEN not configured" });
      return;
    }
    if (!emailQueueReady) {
      await ensureEmailQueueTable();
      emailQueueReady = true;
    }
    const staleMinutes = clamp2(Number(process.env.PRICE_ALERT_STALE_MINUTES || 360), 15, 1440);
    const workerCount = clamp2(Number(process.env.PRICE_ALERT_WORKERS || 2), 1, 3);
    const maxAlertsPerRun = clamp2(Number(process.env.PRICE_ALERT_MAX_ALERTS_PER_RUN || 30), 1, 100);
    const staleAlerts = activeAlerts.filter((alert) => isAlertStale(alert.updatedAt, staleMinutes)).slice(0, maxAlertsPerRun);
    if (staleAlerts.length === 0) {
      res.status(200).json({
        message: "No stale alerts to check.",
        activeAlerts: activeAlerts.length,
        durationMs: Date.now() - startedAt
      });
      return;
    }
    const touchedAlertIds = [];
    const results = [];
    const queue = [...staleAlerts];
    async function worker() {
      while (queue.length) {
        const alert = queue.shift();
        if (!alert) return;
        const tpRes = await fetch(
          `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?token=${tpToken}&origin=${alert.origin}&destination=${alert.destination}&departure_at=${alert.departDate}&currency=${alert.currency}&one_way=${!alert.returnDate}`
        ).catch(() => null);
        if (!tpRes?.ok) continue;
        const tpData = await tpRes.json();
        if (!tpData?.data?.length) {
          touchedAlertIds.push(alert.id);
          continue;
        }
        const minPrice = Math.min(...tpData.data.map((d) => d.price));
        const referencePrice = alert.lastNotifiedPrice || alert.targetPrice;
        const threshold = referencePrice * 0.95;
        if (minPrice <= threshold) {
          const percent = Math.round((referencePrice - minPrice) / referencePrice * 100);
          await enqueueEmail({
            toEmail: alert.email,
            subject: `\u{1F525} Price Drop Alert: ${alert.origin} to ${alert.destination} (-${percent}%)`,
            htmlContent: `
              <div style="font-family:sans-serif;color:#1e293b;padding:20px;">
                <h2 style="color:#5B0EA6;">Good news! Your flight price dropped.</h2>
                <p>Route <strong>${alert.origin} \u2192 ${alert.destination}</strong> on <strong>${alert.departDate}</strong>
                dropped from ${alert.currency} ${referencePrice} to <strong>${alert.currency} ${minPrice}</strong>.</p>
                <p><a href="https://gotravel-asia.vercel.app/flights/results"
                   style="background:#F5C518;color:#2D0558;padding:12px 24px;text-decoration:none;font-weight:bold;border-radius:8px;">
                   View Deals
                </a></p>
                <hr style="margin-top:40px;border:none;border-top:1px solid #e2e8f0;"/>
                <p style="font-size:11px;color:#94a3b8;">You subscribed to price alerts at GoTravel Asia.</p>
               </div>`
          });
          await updateAlertPrice(alert.id, minPrice);
          results.push({ id: alert.id, old: referencePrice, new: minPrice, queued: true });
        } else {
          touchedAlertIds.push(alert.id);
        }
      }
    }
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    await touchPriceAlerts(touchedAlertIds);
    const durationMs = Date.now() - startedAt;
    console.info("[cron/check-price-alerts]", {
      durationMs,
      activeAlerts: activeAlerts.length,
      checkedAlerts: staleAlerts.length,
      queuedAlerts: results.length,
      workerCount
    });
    res.json({ message: "Cron finished", processedCount: results.length, checkedAlerts: staleAlerts.length, durationMs, results });
  } catch (err) {
    console.error("Cron error:", err);
    res.status(500).json({ error: "Failed to process cron job" });
  }
});
router9.get("/send-alerts", async (req, res) => {
  try {
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      res.status(500).json({ error: "EMAIL_USER or EMAIL_PASS not configured" });
      return;
    }
    const fromEmail = process.env.ALERT_FROM_EMAIL || `GoTravel Asia <${emailUser}>`;
    const batchSize = Number(process.env.EMAIL_BATCH_SIZE || 50);
    const maxAttempts = Number(process.env.EMAIL_MAX_ATTEMPTS || 3);
    const retryDelayMinutes = Number(process.env.EMAIL_RETRY_DELAY_MINUTES || 15);
    await ensureEmailQueueTable();
    const dueItems = await getDueEmailQueueItems(batchSize, maxAttempts);
    if (dueItems.length === 0) {
      res.status(200).json({ message: "No pending emails." });
      return;
    }
    const transporter = nodemailer2.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass }
    });
    const results = [];
    for (const row of dueItems) {
      const claimed = await claimEmailQueueItem(row.id, row.attempts);
      if (!claimed) continue;
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: row.toEmail,
          subject: row.subject,
          html: row.htmlContent
        });
        await markEmailQueueSent(row.id);
        results.push({ id: row.id, ok: true });
      } catch (e) {
        const msg = e?.message || "send_failed";
        await markEmailQueueAttemptFailed({
          id: row.id,
          attempts: row.attempts,
          error: msg,
          maxAttempts,
          retryDelayMinutes
        });
        results.push({ id: row.id, ok: false, error: msg });
      }
    }
    res.status(200).json({
      message: "Send alerts cron finished",
      attempted: dueItems.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results
    });
  } catch (err) {
    console.error("Cron send-alerts error:", err);
    res.status(500).json({ error: "Failed to process send-alerts" });
  }
});
var cron_default = router9;

// server/_core/app.ts
console.log("[APP] Starting app.ts imports...\n");
dotenv.config();
dotenv.config({ path: path3.resolve(process.cwd(), ".env.local"), override: true });
console.log("[APP] Environment loaded.\n");
console.log("[APP] Core deps & handlers loaded.\n");
console.log("[APP] All routes imported.\n");
var app = express();
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerOAuthRoutes(app);
app.use(sitemap_default);
app.use(["/", "/transport", "/hotels", "/flights"], cspOpen);
app.use("/api/destination-landing", destinationLanding_default);
app.use("/api/chat", chat_default);
app.use("/api/cheap-prices", cheapPrices_default);
app.use("/api/calendar-prices", calendarPrices_default);
app.use("/api/flights/search", flightsSearch_default);
app.use("/api/hotels/search", searchHotels);
app.use("/api/autocomplete/hotels", searchAutocompleteHotels);
app.use("/api/frontdoor/prices", searchFrontDoorPrices);
app.use("/api/price-alerts", priceAlerts_default);
app.use("/api/alerts", priceAlerts_default);
app.use("/api/cron", cron_default);
app.use("/api/auth", handler);
app.get("/api/flights/price-calendar", async (req, res) => {
  const validation = validatePriceCalendarRequest(req.query);
  if (!validation.ok) return res.status(400).json({ error: { code: "BAD_REQUEST", message: validation.message } });
  try {
    const response = await getPriceCalendar(validation.data);
    return res.status(200).json(response);
  } catch (error) {
    console.error("price-calendar route error", error);
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch price calendar" } });
  }
});
app.get("/api/flights/price-trend", async (req, res) => {
  const validation = validatePriceTrendRequest(req.query);
  if (!validation.ok) return res.status(400).json({ error: { code: "BAD_REQUEST", message: validation.message } });
  try {
    const response = await getPriceTrend(validation.data);
    return res.status(200).json(response);
  } catch (error) {
    console.error("price-trend route error", error);
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch price trend" } });
  }
});
app.use("/api/flights", handler2);
app.use("/api/geo", handler3);
app.use("/api/newsletter", handler4);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
app.get("/api/ping", (req, res) => res.json({ ok: true }));
console.log("[APP] App setup complete, exporting app.\n");
var app_default = app;

// server/_core/api-entry.ts
var api_entry_default = app_default;
export {
  api_entry_default as default
};
