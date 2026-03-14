import type { VercelRequest, VercelResponse } from "@vercel/node";
import { COOKIE_NAME } from "../../shared/const.js";
import { getSessionCookieOptions } from "../../server/_core/cookies.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Use a local plain object cast to ensure property access works in all environments
    const c = getSessionCookieOptions(req as any) as {
        domain?: string;
        path?: string;
        sameSite?: "none" | "lax" | "strict" | boolean;
        secure?: boolean;
        httpOnly?: boolean;
    };

    let cookieStr = `${COOKIE_NAME}=; Max-Age=0; Path=${c.path ?? "/"}`;
    if (c.sameSite) cookieStr += `; SameSite=${c.sameSite}`;
    if (c.secure)   cookieStr += `; Secure`;
    if (c.httpOnly) cookieStr += `; HttpOnly`;
    if (c.domain)   cookieStr += `; Domain=${c.domain}`;

    res.setHeader("Set-Cookie", [cookieStr]);
    return res.status(200).json({ success: true });
}
