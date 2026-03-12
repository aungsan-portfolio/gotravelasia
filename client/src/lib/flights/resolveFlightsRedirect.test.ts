// client/src/lib/flights/resolveFlightsRedirect.test.ts

import { describe, expect, it } from "vitest";
import { resolveFlightsRedirectPath } from "./resolveFlightsRedirect";

const singapore = {
  slug: "singapore",
  dest: { code: "SIN" },
};

describe("resolveFlightsRedirectPath", () => {
  it("redirects known destination code to destination landing page", () => {
    const result = resolveFlightsRedirectPath(
      {
        origin: "BKK",
        destination: "SIN",
      },
      {
        findByCode: (code) => (code === "SIN" ? singapore : undefined),
        findBySlug: () => undefined,
      }
    );

    expect(result).toBe("/flights/to/singapore?origin=BKK&destination=SIN");
  });

  it("redirects known destination slug to destination landing page", () => {
    const result = resolveFlightsRedirectPath(
      {
        origin: "CNX",
        destination: "singapore",
        adults: "2",
      },
      {
        findByCode: () => undefined,
        findBySlug: (slug) => (slug === "singapore" ? singapore : undefined),
      }
    );

    expect(result).toBe(
      "/flights/to/singapore?origin=CNX&destination=SIN&adults=2"
    );
  });

  it("falls back to generic flight route for unknown destination codes", () => {
    const result = resolveFlightsRedirectPath(
      {
        origin: "BKK",
        destination: "XYZ",
      },
      {
        findByCode: () => undefined,
        findBySlug: () => undefined,
      }
    );

    expect(result).toBe("/flights/bkk/xyz");
  });

  it("falls back to home when query is incomplete", () => {
    const result = resolveFlightsRedirectPath(
      {
        origin: "",
        destination: "",
      },
      {
        findByCode: () => undefined,
        findBySlug: () => undefined,
      }
    );

    expect(result).toBe("/");
  });
});
