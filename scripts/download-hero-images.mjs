/**
 * download-hero-images.mjs
 * Run once:  node scripts/download-hero-images.mjs
 *
 * Downloads 5 hero porthole images → public/images/hero/
 * Then converts each to .webp with sharp (80% quality, smallest file).
 *
 * Requirements:
 *   npm install --save-dev sharp   (if not already installed)
 */

import { createWriteStream, mkdirSync, existsSync } from "fs";
import { pipeline } from "stream/promises";
import { get as httpsGet } from "https";
import path from "path";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────────────────
const OUT_DIR = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../client/public/images/hero"
);

const IMAGES = [
    {
        name: "bali",
        ext: "jpg",
        url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80",
    },
    {
        name: "bangkok",
        ext: "jpg",
        url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=500&q=80",
    },
    {
        name: "vietnam",
        ext: "jpg",
        url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=500&q=80",
    },
    {
        name: "shwedagon",
        ext: "jpg",
        url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=500&q=80",
    },
    {
        name: "singapore",
        ext: "jpg",
        url: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=500&q=80",
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(dest);
        httpsGet(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                // follow redirect
                httpsGet(res.headers.location, (res2) => {
                    pipeline(res2, file).then(resolve).catch(reject);
                }).on("error", reject);
            } else {
                pipeline(res, file).then(resolve).catch(reject);
            }
        }).on("error", reject);
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    // Create output dir if needed
    if (!existsSync(OUT_DIR)) {
        mkdirSync(OUT_DIR, { recursive: true });
        console.log(`📁  Created ${OUT_DIR}`);
    }

    // Dynamically import sharp (dev dependency)
    let sharp;
    try {
        sharp = (await import("sharp")).default;
    } catch {
        console.error("❌  sharp not found — run:  npm install --save-dev sharp");
        process.exit(1);
    }

    for (const img of IMAGES) {
        const rawPath = path.join(OUT_DIR, `${img.name}.${img.ext}`);
        const webpPath = path.join(OUT_DIR, `${img.name}.webp`);

        // 1. Download original
        process.stdout.write(`⬇️   Downloading ${img.name}... `);
        await download(img.url, rawPath);
        console.log("done");

        // 2. Convert → .webp  (quality 80, strip metadata)
        process.stdout.write(`🔄  Converting  ${img.name}.${img.ext} → .webp ... `);
        await sharp(rawPath)
            .resize({ width: 520, withoutEnlargement: true }) // cap at 520px — porthole max display is 260px @2x
            .webp({ quality: 80, effort: 6 })                 // effort 6 = better compression, still fast
            .toFile(webpPath);
        console.log("done");
    }

    console.log(`
✅  All images saved to ${OUT_DIR}
    ├── bali.webp
    ├── bangkok.webp
    ├── vietnam.webp
    ├── shwedagon.webp
    └── singapore.webp

Next step — add to .gitignore if you don't want to commit large files:
    echo "client/public/images/hero/*.jpg" >> .gitignore
`);
}

main().catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
