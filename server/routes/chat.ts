import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";

const router = Router();
const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

router.post("/", rateLimit("chat", 10, 60 * 60 * 1000, "Rate limit exceeded. Try again in one hour."),
  async (req: any, res: any) => {
    try {
      const { contents } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) { res.status(500).json({ error: "API key missing" }); return; }
      if (!contents) { res.status(400).json({ error: "Missing contents" }); return; }

      let lastError: unknown = null;
      for (const model of MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            { method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 } }) }
          );
          if (response.status === 429) continue;
          if (!response.ok) continue;
          res.json(await response.json());
          return;
        } catch (err) { lastError = err; }
      }
      throw lastError || new Error("All models failed");
    } catch (error) {
      res.status(500).json({ error: "Failed to process chat request" });
    }
  }
);

export default router;
