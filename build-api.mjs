import { build } from "esbuild";
import { unlinkSync } from "fs";

await build({
  entryPoints: ["server/_core/api-entry.ts"],
  outfile: "api/index.js",
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  // Keep node_modules external — Vercel provides them at runtime
  packages: "external",
  sourcemap: false,
  banner: {
    js: '// Auto-generated — do not edit. Source: server/_core/api-entry.ts',
  },
});

console.log("✅ api/index.js built successfully");
