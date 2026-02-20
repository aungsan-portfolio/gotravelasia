const fs = require('fs');
const glob = require('glob'); // Note: we'll just read predefined files to avoid dependency issues if glob isn't present, but we know the exact files.

const targets = [
    "client/src/pages/destinations/Phuket.tsx",
    "client/src/pages/destinations/Pai.tsx",
    "client/src/pages/destinations/Krabi.tsx",
    "client/src/pages/destinations/ChiangRai.tsx",
    "client/src/pages/destinations/ChiangMai.tsx",
    "client/src/pages/destinations/Bangkok.tsx",
    "client/src/pages/blog/BestEsimThailand.tsx",
    "client/src/components/StickyCTA.tsx",
    "client/src/components/MobileNav.tsx"
];

for (const path of targets) {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');

        // Replace thailand-esim link
        content = content.replace(
            /https:\/\/www\.airalo\.com\/thailand-esim/g,
            "https://invol.co/aff_m?aff_id=1072854&source=gotravel&url=https%3A%2F%2Fwww.airalo.com%2Fthailand-esim"
        );

        // Replace root airalo link
        content = content.replace(
            /"https:\/\/www\.airalo\.com\/"/g,
            '"https://invol.co/aff_m?aff_id=1072854&source=gotravel&url=https%3A%2F%2Fwww.airalo.com%2F"'
        );

        fs.writeFileSync(path, content, 'utf8');
        console.log(`Updated ${path}`);
    } else {
        console.error(`Missing file: ${path}`);
    }
}
