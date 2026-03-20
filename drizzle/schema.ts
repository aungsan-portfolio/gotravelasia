import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Newsletter subscribers — existing table from api/newsletter.ts.
 * Added to schema to prevent drizzle-kit from deleting it.
 */
export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// TODO: Add your tables here

export const flightPriceAlerts = mysqlTable("flightPriceAlerts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  origin: varchar("origin", { length: 3 }).notNull(),
  destination: varchar("destination", { length: 3 }).notNull(),
  departDate: varchar("departDate", { length: 10 }).notNull(), // YYYY-MM-DD
  returnDate: varchar("returnDate", { length: 10 }), // YYYY-MM-DD
  targetPrice: int("targetPrice").notNull(),
  lastNotifiedPrice: int("lastNotifiedPrice"),
  currency: varchar("currency", { length: 3 }).default("THB").notNull(),
  routeId: varchar("routeId", { length: 20 }),          // e.g. "RGN-BKK"
  source: varchar("source", { length: 20 }).default("track_button").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FlightPriceAlert = typeof flightPriceAlerts.$inferSelect;
export type InsertFlightPriceAlert = typeof flightPriceAlerts.$inferInsert;

/**
 * Subscribers — email-only signups from PriceAlertPopup (ခ flow).
 * When a user signs up from the homepage (no route context),
 * their email is stored here for welcome email + future alerts.
 */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).default("popup"),   // popup, google, etc.
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

/**
 * Destinations table for curated and dynamic (API-cached) content.
 */
export const destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["country", "city", "airport"]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  iataCode: varchar("iataCode", { length: 5 }),
  countryCode: varchar("countryCode", { length: 2 }),
  primaryAirports: json("primaryAirports").$type<string[]>(),
  cities: json("cities").$type<Array<{ name: string; code: string }>>(),
  capital: varchar("capital", { length: 255 }),
  weatherData: json("weatherData").$type<Record<string, any>>(),
  priceRatio: json("priceRatio").$type<number>(),
  highlights: text("highlights"),
  climate: text("climate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

/**
 * Hotel deals found by the bot or cached from API calls.
 */
export const hotelDeals = mysqlTable("hotelDeals", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: varchar("hotelId", { length: 64 }).notNull(),
  hotelName: text("hotelName").notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  price: int("price").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  discountPercentage: int("discountPercentage").default(0),
  imageUrl: text("imageUrl"),
  bookingUrl: text("bookingUrl").notNull(),
  checkIn: varchar("checkIn", { length: 10 }),   // YYYY-MM-DD
  checkOut: varchar("checkOut", { length: 10 }),  // YYYY-MM-DD
  isBotVerified: boolean("isBotVerified").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HotelDeal = typeof hotelDeals.$inferSelect;
export type InsertHotelDeal = typeof hotelDeals.$inferInsert;