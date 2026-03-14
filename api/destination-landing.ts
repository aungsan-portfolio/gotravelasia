import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationWithLiveData } from "../server/destinationService";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Support both slug and origin/destination query params
  const slug = String(req.query.slug || "");
  const origin = String(req.query.origin || "").toUpperCase();
  const destination = String(req.query.destination || "").toUpperCase();

  let targetSlug = slug;

  // Fallback: If no slug, try to find slug by destination code
  if (!targetSlug && destination) {
     // We'll import registry to find slug if needed
     const { getDestinationByCode } = await import("../client/src/data/destinationRegistry");
     const record = getDestinationByCode(destination);
     if (record) targetSlug = record.slug;
  }

  if (!targetSlug) {
    return res.status(400).json({ error: "slug or destination code is required" });
  }

  try {
    const vm = await getDestinationWithLiveData(targetSlug);
    
    if (!vm) {
      return res.status(404).json({ error: `Destination not found for slug: ${targetSlug}` });
    }

    // Return the full ViewModel
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    return res.status(200).json(vm);

  } catch (error) {
    console.error("[api/destination-landing] Error:", error);
    return res.status(500).json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
