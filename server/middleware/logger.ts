import type { VercelRequest as VReq } from "@vercel/node";

export function logRequest(req: VReq): void {
  if (process.env.NODE_ENV === "production") {
    console.log(
      JSON.stringify({
        ts:     new Date().toISOString(),
        method: req.method,
        url:    req.url,
        ip:     (req.headers["x-forwarded-for"] as string ?? "").split(",")[0]?.trim(),
        ua:     req.headers["user-agent"] ?? "",
      })
    );
  } else {
    console.log(`[${req.method}] ${req.url}`);
  }
}
