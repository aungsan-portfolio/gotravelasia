import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationBySlug } from "./lib/destinationRegistry";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const record = getDestinationBySlug("bangkok");
    return res.status(200).json({ 
      msg: "Registry import worked in test file", 
      found: !!record,
      city: record?.dest.city
    });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
