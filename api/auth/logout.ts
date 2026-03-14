import type { VercelRequest, VercelResponse } from "@vercel/node";
import { COOKIE_NAME } from "../../shared/const";
import { getSessionCookieOptions } from "../../server/_core/cookies";

// Local interface to ensure properties are recognized by Vercel's TS compiler
interface CookieOptions {
    path?: string;
    sameSite?: "none" | "lax" | "strict";
    secure?: boolean;
    httpOnly?: boolean;
    domain?: string;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const cookieOptions = getSessionCookieOptions(req as any) as CookieOptions;

    let cookieStr = `${COOKIE_NAME}=; Max-Age=0; Path=${cookieOptions.path || "/"}`;
    if (cookieOptions.sameSite) cookieStr += `; SameSite=${cookieOptions.sameSite}`;
    if (cookieOptions.secure) cookieStr += `; Secure`;
    if (cookieOptions.httpOnly) cookieStr += `; HttpOnly`;

    res.setHeader("Set-Cookie", cookieStr);
    return res.status(200).json({ success: true });
}
