// api/auth.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { setCors, parseRequest } from "./_lib/http.js";
import { handleMe }     from "./_lib/authMe.js";
import { handleLogout } from "./_lib/authLogout.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (setCors(req, res)) return;

  const { action } = parseRequest(req);

  switch (action) {
    case "me":
      return handleMe(req, res);
    case "logout":
      return handleLogout(req, res);
    default:
      return res.status(400).json({
        error: "Invalid action",
        valid: ["me", "logout"],
      });
  }
}
