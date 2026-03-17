// client/src/lib/flights/resolveFlightsRedirect.test.ts

import { describe, expect, it } from "vitest";
import { resolveFlightsRedirectPath } from "./resolveFlightsRedirect";

const singapore = {
  slug: "singapore",
  dest: { code: "SIN" },
};

const hcmc = {
  slug: "ho-chi-minh-city",
  dest: { code: "SGN" },
};

const thailand = {
  slug: "thailand",
  dest: { code: "BKK" },
};

const mockDeps = {
  findByCode: (code: string) => {
    if (code === "SIN") return singapore;
    if (code === "SGN") return hcmc;
    if (code === "BKK") return thailand;
    return undefined;
  },
  findBySlug: (slug: string) => {
    if (slug === "singapore") return singapore;
    if (slug === "ho-chi-minh-city") return hcmc;
    if (slug === "thailand") return thailand;
    return undefined;
  },
  findByCountrySlug: (countrySlug: string) => {
    if (countrySlug === "thailand") return [thailand];
    return [];
  },
  listRecords: () => [singapore, hcmc, thailand],
};

describe("resolveFlightsRedirectPath", () => {
  it("redirects known destination code to destination landing page", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "SIN" },
      mockDeps
    );
    expect(result).toBe("/flights/to/singapore?origin=BKK&destination=SIN");
  });

  it("redirects known destination slug to destination landing page", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "CNX", destination: "singapore", adults: "2" },
      mockDeps
    );
    expect(result).toBe("/flights/to/singapore?origin=CNX&destination=SIN&adults=2");
  });

  it("resolves dashed permutations (ho-chi-minh)", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "ho-chi-minh" },
      mockDeps
    );
    expect(result).toBe("/flights/to/ho-chi-minh-city?origin=BKK&destination=SGN");
  });

  it("resolves spaced permutations (ho chi minh)", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "ho chi minh" },
      mockDeps
    );
    expect(result).toBe("/flights/to/ho-chi-minh-city?origin=BKK&destination=SGN");
  });

  it("resolves mapped aliases (saigon)", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "saigon" },
      mockDeps
    );
    expect(result).toBe("/flights/to/ho-chi-minh-city?origin=BKK&destination=SGN");
  });

  it("resolves exact string aliases (sin city)", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "sin city" },
      mockDeps
    );
    expect(result).toBe("/flights/to/singapore?origin=BKK&destination=SIN");
  });

  it("resolves safe prefix matching for common partials", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "singapo" },
      mockDeps
    );
    expect(result).toBe("/flights/to/singapore?origin=BKK&destination=SIN");
  });

  it("resolves country slug group when a single country route exists", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "CNX", destination: "thailand" },
      mockDeps
    );
    expect(result).toBe("/flights/to/thailand?origin=CNX&destination=BKK");
  });

  it("does not guess when prefix is ambiguous", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "thai" },
      {
        findByCode: () => undefined,
        findBySlug: () => undefined,
        listRecords: () => [
          { slug: "thailand", dest: { code: "BKK" } },
          { slug: "thaila", dest: { code: "XYZ" } },
        ],
      }
    );
    expect(result).toBe("/flights/bkk/thai");
  });

  it("falls back to generic flight route for unknown destination codes", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "BKK", destination: "XYZ" },
      mockDeps
    );
    expect(result).toBe("/flights/bkk/xyz");
  });

  it("falls back to home when query is incomplete", () => {
    const result = resolveFlightsRedirectPath(
      { origin: "", destination: "" },
      mockDeps
    );
    expect(result).toBe("/");
  });

  it("redirects to /flights/results when depart is present (search intent)", () => {
    const result = resolveFlightsRedirectPath(
      {
        origin: "BKK",
        destination: "SIN",
        depart: "2026-04-10",
        returnAt: "2026-04-17",
        tripType: "return",
        adults: "2",
      },
      {
        findByCode: (code) => (code === "SIN" ? singapore : undefined),
        findBySlug: () => undefined,
      }
    );

    const url = new URL("https://example.com" + result);

    expect(url.pathname).toBe("/flights/results");

    const flightSearch = url.searchParams.get("flightSearch");
    expect(flightSearch).toBeTruthy();

    const inner = new URLSearchParams(flightSearch ?? "");
    expect(inner.get("origin")).toBe("BKK");
    expect(inner.get("destination")).toBe("SIN");
    expect(inner.get("depart")).toBe("2026-04-10");
    expect(inner.get("return")).toBe("2026-04-17");
    expect(inner.get("tripType")).toBe("return");
    expect(inner.get("adults")).toBe("2");
  });

  it("extracts clean date from full ISO datetime strings", () => {
    const result = resolveFlightsRedirectPath(
      {
        origin: "BKK",
        destination: "SIN",
        depart: "2026-04-10T15:30:00.000Z",
        returnAt: "2026-04-17T09:00:00.000Z",
      },
      mockDeps
    );

    const url = new URL("https://example.com" + result);
    const inner = new URLSearchParams(url.searchParams.get("flightSearch") ?? "");

    expect(inner.get("depart")).toBe("2026-04-10");
    expect(inner.get("return")).toBe("2026-04-17");
  });
});
