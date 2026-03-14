import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sdk } from "../../server/_core/sdk.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const user = await sdk.authenticateRequest(req as any);
        return res.status(200).json(user);
    } catch (error) {
        // ForbiddenError expected if not authenticated
        return res.status(200).json(null);
    }
}
