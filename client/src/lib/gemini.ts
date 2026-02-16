/**
 * @file gemini.ts
 * @description Gemini API client for GoTravelAsia trip planning.
 * Includes model fallback chain and retry logic for rate limiting.
 */

const GEMINI_API_KEY = "AIzaSyDhSgXLnfbBiy7R46Du1Qtg6PjnvsLxcD4";

// Model fallback chain — try flash first, fallback to flash-lite
const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

function getApiUrl(model: string) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

// ── Thailand travel system prompt ──
const SYSTEM_PROMPT = `You are GoTravel AI — a friendly Thailand travel assistant for Myanmar and international travelers.

RULES:
- Warm, helpful, concise. Use emoji sparingly.
- Answer in the same language the user writes in.
- Thailand destinations: Bangkok, Chiang Mai, Phuket, Krabi, Pai, Chiang Rai.
- Budget: backpacker $20-30/day, mid-range $50-80/day, luxury $150+/day.
- Flights: Yangon to Bangkok ~$80-150.
- Best seasons: Nov-Feb cool, Mar-May hot, Jun-Oct rainy but cheaper.
- Include GoTravel booking links: https://www.gotravelasia.com
- Keep responses under 250 words unless asked for detailed itinerary.
- For itineraries, use day-by-day bullet points with budget estimates.`;

export interface ChatMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

/**
 * Send message with model fallback + retry on rate limits.
 */
export async function sendChatMessage(
    history: ChatMessage[],
    userMessage: string
): Promise<string> {
    const contents: ChatMessage[] = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        {
            role: "model",
            parts: [{ text: "I'm GoTravel AI, ready to help with Thailand travel! How can I assist you?" }],
        },
        ...history,
        { role: "user", parts: [{ text: userMessage }] },
    ];

    const body = JSON.stringify({
        contents,
        generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 1024,
        },
    });

    // Try each model in the fallback chain
    for (const model of MODELS) {
        // Up to 2 retries per model
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await fetch(getApiUrl(model), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body,
                });

                if (response.status === 429) {
                    // Rate limited — wait and retry or try next model
                    const waitMs = (attempt + 1) * 2000; // 2s, 4s
                    console.log(`Rate limited on ${model}. Waiting ${waitMs}ms...`);
                    await new Promise((r) => setTimeout(r, waitMs));
                    continue;
                }

                if (!response.ok) {
                    console.error(`Gemini ${model} error (${response.status})`);
                    break; // Try next model
                }

                const data = await response.json();

                if (data?.candidates?.[0]?.finishReason === "SAFETY") {
                    return "I can only help with travel-related questions. Could you rephrase? ✈️";
                }

                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            } catch (err) {
                console.error(`Gemini ${model} fetch error:`, err);
                break; // Try next model
            }
        }
    }

    // All models failed
    return "Our AI is currently busy. Please try again in about 30 seconds — the free tier has per-minute limits. 🙏";
}
