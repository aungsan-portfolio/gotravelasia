import { describe, expect, it } from "vitest";

import { searchAutocompleteHotels } from "./autocomplete";

function createRes() {
  return {
    body: undefined as unknown,
    json(payload: unknown) {
      this.body = payload;
      return payload;
    },
  };
}

describe("hotel autocomplete api", () => {
  it("falls back to local hotel cities when Agoda is unavailable", async () => {
    const req = { query: { q: "bang" } };
    const res = createRes();

    await searchAutocompleteHotels(req as any, res as any);

    const suggestions = (res.body as any)?.suggestions as Array<{
      displayName: string;
    }>;
    expect(Array.isArray(suggestions)).toBe(true);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(
      suggestions.some(item => item.displayName.toLowerCase().includes("bang"))
    ).toBe(true);
  });
});
