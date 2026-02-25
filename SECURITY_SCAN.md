# SECURITY SCAN

## Secret exposure check

### Hardcoded Google API key pattern

### Gemini env usage
.env.example:14:GEMINI_API_KEY=
vite.config.ts:155:  if (process.env.NODE_ENV === "production" && !process.env.GEMINI_API_KEY) {
vite.config.ts:156:    throw new Error("Missing required env var: GEMINI_API_KEY");
app/api/gemini/route.ts:36:  const apiKey = process.env.GEMINI_API_KEY;
server/_core/index.ts:131:      const apiKey = process.env.GEMINI_API_KEY;

### Direct Gemini endpoint calls from client
