import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Use Vercel's automatic IP-to-Country mapping
  const country = (req.headers["x-vercel-ip-country"] as string) ?? "MM";
  res.setHeader("Cache-Control", "s-maxage=3600");
  res.json({ country });
}
