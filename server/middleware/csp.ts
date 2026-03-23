import type { RequestHandler } from "express";

export const cspOpen: RequestHandler = (_req: any, res: any, next: any) => {
  res.setHeader("Content-Security-Policy",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *; connect-src 'self' *; img-src 'self' data: blob: *;"
  );
  next();
};
