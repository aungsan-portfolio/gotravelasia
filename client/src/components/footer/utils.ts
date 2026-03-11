/** "Chiang Mai" → "chiang-mai" */
export function toSlug(str: string) {
    return str.toLowerCase().replace(/\s+/g, "-");
}

/** Newsletter API call */
export async function subscribeNewsletter(email: string): Promise<boolean> {
    try {
        const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return res.ok;
    } catch {
        return false;
    }
}
