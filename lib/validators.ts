export const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const ALLOWED_ORIGINS = [
    "https://gotravelasia.com",
    "https://www.gotravelasia.com",
    "https://gotravel-asia.vercel.app",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
].filter(Boolean);
