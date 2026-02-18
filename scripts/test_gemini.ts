
const GEMINI_API_KEY = "AIzaSyB7o2LVBGvxlmzR3eBc-SkLU-AwDgWZZmA";
const MODEL = "gemini-2.0-flash";

async function testGemini() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const body = JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hello, are you awake? Reply 'Yes' if you are." }] }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
        },
    });

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Details:", text);
            return;
        }

        const data = await response.json();
        console.log("Success!");
        console.log("Response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testGemini();
