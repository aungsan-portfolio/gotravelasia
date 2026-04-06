import { z } from "zod";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";
import { searchTransport, getPopularRoutes } from "./transport.js";
import { destinationRouter } from "./destinationRouter.js";
import { searchAmadeusLocations } from "./amadeusAPI.js";
import { searchFlights } from "./flights/searchFlights.js";
import { COOKIE_NAME } from "../shared/const.js";

const flightSearchInput = z.object({
  origin: z.string().min(3).max(3),
  destination: z.string().min(3).max(3),
  departDate: z.string().min(10).max(10),
  returnDate: z.string().optional(),
  tripType: z.enum(["oneway", "roundtrip"]).optional(),
  adults: z.coerce.number().int().min(1).max(9).optional(),
  children: z.coerce.number().int().min(0).max(8).optional(),
  infants: z.coerce.number().int().min(0).max(4).optional(),
  travelClass: z.string().optional(),
  currency: z.string().min(3).max(3).optional(),
  nonStopOnly: z.coerce.boolean().optional(),
});

const flightsRouter = router({
  airportSearch: publicProcedure
    .input(z.object({ query: z.string().min(1).max(50) }))
    .query(async ({ input }) => {
      const q = input.query.trim();
      if (q.length < 2) return [];
      return await searchAmadeusLocations(q);
    }),

  searchResults: publicProcedure
    .input(flightSearchInput)
    .query(async ({ input }) => {
      return await searchFlights(input);
    }),
});

export const appRouter = router({
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
        path: "/",
      });
      return { success: true };
    }),
  }),

  transport: router({
    search: publicProcedure
      .input(
        z.object({
          from: z.string(),
          to: z.string(),
          date: z.string(),
        })
      )
      .query(async ({ input }) => {
        return await searchTransport(input);
      }),

    popularRoutes: publicProcedure
      .input(z.object({ destination: z.string() }))
      .query(({ input }) => {
        return getPopularRoutes(input.destination);
      }),
  }),
});

export type AppRouter = typeof appRouter;
