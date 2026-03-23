import { Router } from "express";

const router = Router();
const SITE_URL = process.env.VITE_SITE_URL || "https://gotravel-asia.vercel.app";
const ROUTES = ["/", "/flights/results", "/privacy-policy", "/terms-of-service",
  "/destination/bangkok", "/destination/chiang-mai", "/destination/phuket", "/destination/krabi"];

router.get("/sitemap.xml", (_req: any, res: any) => {
  const now  = new Date().toISOString();
  const urls = ROUTES.map(r => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${now}</lastmod></url>`).join("\n");
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  );
});

export default router;
