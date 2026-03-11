import { z } from "zod";

const dealSchema = z.object({
  from: z.string(),
  to: z.string(),
  d1: z.string(),
  a1: z.string().nullable(),
  airline: z.string(),
  airlineCode: z.string().optional(),
  logoUrl: z.string().optional(),
  bookingUrl: z.string().optional(),
  stops: z.number(),
  duration: z.string(),
  price: z.number(),
  badge: z.string().optional(),
  tag: z.string().optional(),
});

const fareTableSchema = z.object({
  from1: z.string(),
  to1: z.string(),
  d1: z.string(),
  a1: z.string().nullable(),
  s1: z.number(),
  dur1: z.string().nullable(),

  from2: z.string().nullable().optional(),
  to2: z.string().nullable().optional(),
  d2: z.string().nullable().optional(),
  a2: z.string().nullable().optional(),
  s2: z.number().nullable().optional(),
  dur2: z.string().nullable().optional(),

  airline: z.string(),
  airlineCode: z.string().optional(),
  logoUrl: z.string().optional(),
  bookingUrl: z.string().optional(),
  price: z.number(),
});

const airlineSchema = z.object({
  code: z.string(),
  name: z.string(),
  logoUrl: z.string().optional(),
  dealCount: z.number().optional(),
  commonStops: z.number().optional(),
  tags: z.array(z.string()).optional(),
  confidenceLabel: z.string().optional(),
});

export const destinationLandingApiSchema = z.object({
  meta: z.object({
    origin: z.string(),
    destination: z.string(),
    currency: z.string(),
    updatedAt: z.string(),
  }),
  deals: z.object({
    cheapest: z.array(dealSchema),
    fastest: z.array(dealSchema),
    bestValue: z.array(dealSchema),
    weekend: z.array(dealSchema),
    premium: z.array(dealSchema),
  }),
  fareTable: z.array(fareTableSchema),
  airlines: z.array(airlineSchema),
});

export function parseDestinationLandingResponse(input: unknown) {
  return destinationLandingApiSchema.safeParse(input);
}
