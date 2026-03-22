import type { RequestHandler } from "express";

export const cspOpen: RequestHandler = (_req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' *; connect-src 'self' *; img-src 'self' data: blob: *;"
  );
  next();
};
