// api/_lib/authMe.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sdk } from "../../server/_core/sdk.js";

export async function handleMe(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const user = await sdk.authenticateRequest(req as any);
    res.status(200).json(user);
  } catch (error) {
    res.status(200).json(null);
  }
}
