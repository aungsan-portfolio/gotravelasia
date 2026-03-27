import type { Request, Response } from "express";

export async function searchFrontDoorPrices(req: Request, res: Response) {
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
      priceHint: score >= 70 ? "cheap" : score >= 40 ? "average" : "expensive",
    };
  });

  res.json(data);
}
