import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env.local"), override: true });

console.log("DEBUG START");
console.log("CWD:", process.cwd());
console.log("AGODA_API_KEY exists:", !!process.env.AGODA_API_KEY);
if (process.env.AGODA_API_KEY) {
    console.log("AGODA_API_KEY length:", process.env.AGODA_API_KEY.length);
}
console.log("VITE_AGODA_CID:", process.env.VITE_AGODA_CID);
console.log("DEBUG END");
