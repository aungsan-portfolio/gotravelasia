// api/_handlers/wishlist.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors, parseRequest } from "../_lib/http.js";
import { 
  handleGetWishlist, 
  handleSaveToWishlist, 
  handleRemoveFromWishlist 
} from "../_lib/wishlist.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  switch (req.method) {
    case "GET":
      return handleGetWishlist(req, res);
    case "POST":
      return handleSaveToWishlist(req, res);
    case "DELETE":
      return handleRemoveFromWishlist(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
