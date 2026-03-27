import type { Request, Response } from "express";

export async function searchAutocompleteHotels(req: Request, res: Response) {
  const q = String(req.query.q || "").toLowerCase();
  
  const suggestions = [
    { displayName: "Bangkok", locationType: "city", locationId: "604", subtitle: "Thailand" },
    { displayName: "Phuket", locationType: "city", locationId: "12080", subtitle: "Thailand" },
    { displayName: "Chiang Mai", locationType: "city", locationId: "7401", subtitle: "Thailand" },
    { displayName: "Yangon", locationType: "city", locationId: "2464", subtitle: "Myanmar" },
    { displayName: "Mandalay", locationType: "city", locationId: "2465", subtitle: "Myanmar" },
    { displayName: "Grand Palace Hotel", locationType: "hotel", locationId: "12345", subtitle: "Bangkok, Thailand" },
  ].filter(s => s.displayName.toLowerCase().includes(q) || (s.subtitle && s.subtitle.toLowerCase().includes(q)));

  res.json({ suggestions });
}
