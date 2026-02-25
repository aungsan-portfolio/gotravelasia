type GeminiPart = { text: string };
type GeminiMessage = { role: "user" | "model"; parts: GeminiPart[] };

type GeminiRateWindow = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;
const memoryRateLimit = new Map<string, GeminiRateWindow>();

function consumeLimit(ip: string): boolean {
  const now = Date.now();
  const current = memoryRateLimit.get(ip);

  if (!current || current.resetAt <= now) {
    memoryRateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
}

export async function POST(req: Request): Promise<Response> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!consumeLimit(ip)) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server misconfiguration: API key missing" }, { status: 500 });
  }

  const body = await req.json().catch(() => null) as { contents?: GeminiMessage[] } | null;
  if (!body?.contents?.length) {
    return Response.json({ error: "Missing contents" }, { status: 400 });
  }

  for (const model of ["gemini-2.0-flash", "gemini-2.0-flash-lite"]) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: body.contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (response.ok) {
      return Response.json(await response.json());
    }

    if (response.status !== 429) {
      continue;
    }
  }

  return Response.json({ error: "Failed to process chat request" }, { status: 500 });
}
