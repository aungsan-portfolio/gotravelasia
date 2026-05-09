// api/_lib/wishlist.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sdk } from "../../server/_core/sdk.js";
import * as db from "../../server/db.js";

export async function handleGetWishlist(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await sdk.authenticateRequest(req as any);
    const items = await db.getWishlistItems(user.id);
    return res.status(200).json(items);
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export async function handleSaveToWishlist(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await sdk.authenticateRequest(req as any);
    const item = req.body;

    if (!item.hotelId || !item.provider) {
      return res.status(400).json({ error: "Missing hotelId or provider" });
    }

    await db.saveWishlistItem({
      ...item,
      userId: user.id,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

export async function handleRemoveFromWishlist(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await sdk.authenticateRequest(req as any);
    const { hotelId, provider } = req.query;

    if (!hotelId || !provider) {
      return res.status(400).json({ error: "Missing hotelId or provider query parameters" });
    }

    await db.removeWishlistItem(user.id, String(hotelId), String(provider));

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
