import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  try {
    const { getDestinationLandingData } = await import("../api/destination-landing");
    const { slug } = req.query;
    if (typeof slug !== "string") { res.status(400).json({ error: "slug is required" }); return; }
    res.json(await getDestinationLandingData({ slug }));
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

export default router;
