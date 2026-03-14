import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDestinationWithLiveData } from "../server/destinationService";

console.log("[api/destination-landing] Module loaded at top level");

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  console.log("[api/destination-landing] Request received:", req.query);

  // Support both slug and origin/destination query params
  const slug = String(req.query.slug || "");
  const destination = String(req.query.destination || "").toUpperCase();

  let targetSlug = slug;

  // Fallback: If no slug, try to find slug by destination code
  if (!targetSlug && destination) {
     try {
       const { getDestinationByCode } = await import("../client/src/data/destinationRegistry");
       const record = getDestinationByCode(destination);
       if (record) targetSlug = record.slug;
     } catch (err) {
       console.error("[api/destination-landing] Dynamic import error:", err);
     }
  }

  if (!targetSlug) {
    return res.status(400).json({ error: "slug or destination code is required" });
  }

  try {
    console.log("[api/destination-landing] Calling getDestinationWithLiveData for:", targetSlug);
    const vm = await getDestinationWithLiveData(targetSlug);
    
    if (!vm) {
      console.warn("[api/destination-landing] VM not found for:", targetSlug);
      return res.status(404).json({ error: `Destination not found for slug: ${targetSlug}` });
    }

    // Return the full ViewModel
    res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");
    console.log("[api/destination-landing] Success for:", targetSlug);
    return res.status(200).json(vm);

  } catch (error) {
    console.error("[api/destination-landing] Caught Error:", error);
    const msg = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";
    
    return res.status(500).json({ 
      error: "Internal server error",
      details: msg,
      stack: stack
    });
  }
}
