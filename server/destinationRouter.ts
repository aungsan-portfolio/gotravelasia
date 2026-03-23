import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, router } from "./_core/trpc.js";
import { getDb } from "./db.js";
import { destinations } from "../drizzle/schema.js";
import { amadeusAPI } from "./amadeusAPI.js";

export const destinationRouter = router({
  /**
   * Resolves a destination by its slug.
   * Logic: Check database -> If missing, fetch from Amadeus API -> Cache in DB -> Return.
   */
  resolveDestination: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const slug = input.toLowerCase();

      try {
        // 1. Check database
        const result = await db
          .select()
          .from(destinations)
          .where(eq(destinations.slug, slug))
          .limit(1);

        if (result.length > 0) {
          return result[0];
        }

        // 2. Not in DB, fetch from Amadeus API
        const apiData = await amadeusAPI.fetchDestinationData(slug);
        if (!apiData) return null;

        // 3. Cache in Database
        await db.insert(destinations).values({
          ...apiData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Return the newly created record
        return {
          ...apiData,
          id: 0, // ID will be assigned by DB, but we return the object for UI
          createdAt: new Date(),
          updatedAt: new Date(),
        };

      } catch (error) {
        console.error(`[resolveDestination] Error for ${slug}:`, error);
        return null;
      }
    }),
});
