import type { Request, Response } from "express";

import { getHotelCities } from "../../shared/hotels/cities.js";

export async function searchAutocompleteHotels(req: Request, res: Response) {
  const q = String(req.query.q || "").trim().toLowerCase();

  if (q.length < 2) {
    return res.json({ suggestions: [] });
  }

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");

  const suggestions = getHotelCities()
    .filter((city) => {
      const haystacks = [
        city.name,
        city.nameMM,
        city.country,
        city.bookingName,
        city.slug,
        city.iata,
      ].map(normalize);

      return haystacks.some((value) => value.includes(normalize(q)));
    })
    .slice(0, 10)
    .map((city) => ({
      displayName: city.name,
      locationType: "city",
      locationId: String(city.agodaCityId),
      subtitle: `${city.country} • ${city.iata}`,
    }));

  return res.json({ suggestions });
}
