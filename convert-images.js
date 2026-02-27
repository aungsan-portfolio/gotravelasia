const sharp = require('sharp');
const path = require('path');

const b = "C:\\Users\\Aung San\\.gemini\\antigravity\\brain\\033432cb-0276-483a-9a90-78703719ba67";
const yIn = path.join(b, "yangon_destination_1772186478706.png");
const mIn = path.join(b, "mandalay_destination_1772186497582.png");

const yOut = path.join(__dirname, "client", "public", "images", "destinations", "yangon.webp");
const mOut = path.join(__dirname, "client", "public", "images", "destinations", "mandalay.webp");

async function run() {
    try {
        console.log("Converting Yangon...");
        await sharp(yIn).webp({ quality: 80 }).toFile(yOut);
        console.log("Yangon done:", yOut);

        console.log("Converting Mandalay...");
        await sharp(mIn).webp({ quality: 80 }).toFile(mOut);
        console.log("Mandalay done:", mOut);
    } catch (e) {
        console.error(e);
    }
}
run();
