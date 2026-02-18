/**
 * @file gemini.ts
 * @description Gemini API client for GoTravelAsia trip planning.
 * Includes model fallback chain and retry logic for rate limiting.
 */

const GEMINI_API_KEY = "AIzaSyB7o2LVBGvxlmzR3eBc-SkLU-AwDgWZZmA";

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
 * Send message via server-side proxy.
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

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Chat API Error:", err);
            return "Sorry, I'm having trouble connecting to the server. Please try again later. 🙏";
        }

        const data = await response.json();

        if (data?.candidates?.[0]?.finishReason === "SAFETY") {
            return "I can only help with travel-related questions. Could you rephrase? ✈️";
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;

        return "Thinking..."; // Should not happen if API returns text
    } catch (err) {
        console.error("Chat Proxy Fetch Error:", err);
        return "Connection error. Please check your internet. 📶";
    }
}
