import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import { Suspense } from "react";
import App from "./App";
import { getLoginUrl } from "./const";
import "./i18n"; // Initialize i18next
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import { trackWebVitals } from "@/seo/performance";
import { initSentry } from "@/lib/sentry";

initSentry();
trackWebVitals();

// Eagerly load the Thai webfont for the Baht (฿, U+0E3F) glyph. Latin body
// fonts (DM Sans / Inter) lack this glyph, and browsers don't reliably fetch
// a webfont that only appears as a fallback — without this, prices like
// "(฿3,672)" render as tofu (□) boxes.
//
// Even once the font loads, browsers often do NOT re-render text that was
// already painted with the tofu fallback, so we force a one-time repaint
// after the Thai font is ready.
if (typeof document !== "undefined" && "fonts" in document) {
  const forceRepaint = () => {
    const root = document.documentElement;
    const prev = root.style.webkitFontSmoothing;
    // Toggling an inherited, paint-affecting property nudges a full re-render
    // of glyphs without any visible layout shift.
    root.style.webkitFontSmoothing = "subpixel-antialiased";
    void root.offsetHeight; // flush
    root.style.webkitFontSmoothing = prev;
  };

  Promise.all([
    document.fonts.load('400 1rem "Noto Sans Thai"', "฿"),
    document.fonts.load('600 1rem "Noto Sans Thai"', "฿"),
    document.fonts.load('700 1rem "Noto Sans Thai"', "฿"),
  ])
    .then(forceRepaint)
    .catch(() => {});
}

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </QueryClientProvider>
    </trpc.Provider>
  </Suspense>
);
