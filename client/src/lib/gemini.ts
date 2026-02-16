/**
 * @file gemini.ts
 * @description Gemini 2.0 Flash API client for GoTravelAsia trip planning.
 * Streams responses for a natural chat experience.
 */

const GEMINI_API_KEY = "AIzaSyBn5El-oSWpBBSSAcfNI6YjBb_vCAOIADI";
const GEMINI_MODEL = "gemini-2.0-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── Thailand travel system prompt ──
const SYSTEM_PROMPT = `You are GoTravel AI — a friendly, expert Thailand travel assistant for Myanmar and international travelers.

PERSONALITY:
- Warm, helpful, concise (not too wordy)
- Use emoji sparingly for warmth 🌴✈️
- Always answer in the same language the user writes in (Burmese, English, Thai, etc.)

KNOWLEDGE:
- Deep expertise on Thailand destinations: Bangkok, Chiang Mai, Phuket, Krabi, Pai, Chiang Rai
- Transport: flights (Yangon→Bangkok ~$80-150), buses, trains, ferries
- Budget: backpacker ($20-30/day), mid-range ($50-80/day), luxury ($150+/day)
- Visa: Myanmar citizens need visa, most ASEAN countries visa-exempt
- Best seasons: Nov-Feb (cool), Mar-May (hot), Jun-Oct (rainy but cheaper)
- Popular routes: Yangon→Bangkok, Yangon→Chiang Mai, Bangkok→Phuket

BOOKING LINKS (always include when relevant):
- Flights: "Search flights on GoTravel → https://www.gotravelasia.com"
- Hotels: "Compare hotels → https://www.gotravelasia.com"
- Transport: "Check bus/train schedules → https://www.gotravelasia.com"

RULES:
- Keep responses under 300 words unless user asks for detailed itinerary
- Always suggest specific budget estimates in USD
- For itineraries, use day-by-day format with bullet points
- If unsure about current prices, give ranges and recommend checking GoTravel
- Never make up specific flight times or hotel names`;

export interface ChatMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

/**
 * Send a chat message to Gemini and get a response.
 * Uses the multi-turn conversation format.
 */
export async function sendChatMessage(
    history: ChatMessage[],
    userMessage: string
): Promise<string> {
    const contents: ChatMessage[] = [
        // System instruction as first "user" turn (Gemini convention)
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        {
            role: "model",
            parts: [
                {
                    text: "Understood! I'm GoTravel AI, ready to help with Thailand travel planning. How can I assist you today? 🌴",
                },
            ],
        },
        // Previous conversation
        ...history,
        // New user message
        { role: "user", parts: [{ text: userMessage }] },
    ];

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.9,
                    topK: 40,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Gemini API error:", error);
            return "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏";
        }

        const data = await response.json();
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I didn't get a response. Could you try rephrasing your question?";
        return text;
    } catch (error) {
        console.error("Gemini fetch error:", error);
        return "Sorry, there was a network error. Please check your connection and try again.";
    }
}
