import { createServer } from "node:http";
import app from "./app.js";
import { findAvailablePort } from "../utils/port.js";

async function startServer() {
  const server = createServer(app);

  // Treat anything except explicit production as development-like runtime.
  // This prevents local `pnpm exec tsx server/_core/index.ts` from
  // accidentally falling back to static serving.
  if (process.env.NODE_ENV !== "production") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  } else {
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  server.listen(port, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${port}/`));
}

startServer().catch(console.error);
