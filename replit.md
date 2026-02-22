# GoTravel - Thailand Travel Planning App

## Overview
GoTravel is a full-stack travel planning application for Thailand. It helps users compare flights, hotels, and transport options across Thai destinations like Chiang Mai, Bangkok, Phuket, and Krabi.

## Project Architecture
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui components
- **Backend**: Express.js + tRPC (served from same process)
- **Database**: MySQL via Drizzle ORM (optional - app runs without DB)
- **Language**: TypeScript throughout
- **Package Manager**: pnpm

## Directory Structure
```
client/           - React frontend (Vite)
  src/            - React components, hooks, pages
  public/         - Static assets
server/           - Express backend
  _core/          - Core server utilities (auth, vite, trpc, etc.)
  routers.ts      - tRPC router definitions
  transport.ts    - Transport search logic
  db.ts           - Database connection & queries
shared/           - Shared types/constants between client and server
drizzle/          - Database schema and migrations
patches/          - pnpm patches
scripts/          - Utility scripts
```

## Key Configuration
- The server entry point is `server/_core/index.ts`
- In development, the server runs Vite as middleware (single port)
- PORT is set to 5000 for Replit compatibility
- Server binds to 0.0.0.0 for external access
- Vite config allows all hosts for Replit proxy

## Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Run production server
- `pnpm db:push` - Generate and run database migrations

## Environment Variables
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - MySQL connection string (optional)
- `GEMINI_API_KEY` - Google Gemini API key for chat features
- `JWT_SECRET` - Cookie/session secret
- `OAUTH_SERVER_URL` - OAuth server URL for authentication
- `VITE_WEB3FORMS_KEY` - Web3Forms API key for contact/newsletter forms
- Various `VITE_*` variables for frontend analytics

## Recent Changes (Feb 2026)
- **Image Optimization**: All destination images converted from JPG/PNG (6-8MB each) to WebP (~130-195KB each, ~97% reduction). Logo compressed.
- **Security**: Hardcoded WEB3FORMS_KEY moved to `VITE_WEB3FORMS_KEY` env var. Centralized config in `client/src/lib/config.ts`.
- **SEO**: Added `usePageMeta` hook (`client/src/hooks/usePageMeta.ts`) for per-page dynamic title and meta description on all routes.
- **Affiliate Fixes**: Replaced all untracked Kiwi.com/Traveloka links with tracked Aviasales (marker 697202) and Agoda (CID 1959281) links across StickyCTA, MobileNav, and all destination pages.
- **Newsletter Fix**: Both newsletter forms now properly show error messages on submission failure instead of silently showing success.
- **Dead Code Cleanup**: Removed 5 unused component files (FlightSearchWidget, TravelSearchWidget, ComponentShowcase, DashboardLayout, DashboardLayoutSkeleton) and 37 unused shadcn UI components.
- **Flight Data Caching**: Created `useFlightData` hook to fetch flight_data.json once and share across Home, FlightWidget, and RecentSearches (was fetched 3x per page load).
- **Home.tsx Split**: Extracted HeroSection and DealsCarousel into separate components, reducing Home.tsx from 782 to 557 lines.
- **UI/UX Polish**: Privacy Policy wrapped in Layout (header/footer visible). CookieConsent/StickyCTA overlap fixed on mobile. "Sign In" renamed to "Get Price Alerts". Duplicate homepage newsletter removed.
- **Partners Marquee**: Extracted partner logos into `Partners.tsx` with CSS-only infinite scroll, GPU-accelerated (`translate3d` + `will-change`), gradient edge masks, greyscale-to-color hover, pause-on-hover. Agoda logo switched to local SVG.
- **SEO Optimization (Feb 2026)**: Enhanced `usePageMeta` hook to set OG tags, Twitter cards, canonical URLs, and keywords per page. Added JSON-LD structured data (WebSite, TravelAgency, FAQPage, BreadcrumbList). All page titles/descriptions optimized for "Travel Asia" / "Southeast Asia" keywords. Sitemap updated with `<lastmod>` dates and missing pages. `robots.txt` and `index.html` base tags updated.
- **Performance Fix (Feb 2026)**: Removed `useTransition` from TransportScheduleWidget (was causing potential re-fetch loop via `[startTransition]` dependency). Fixed "Maximum update depth exceeded" by memoizing `useFlightPriceMap` and removing unnecessary `useEffect`/`useState` chains in FlightWidget.
- **Performance Optimization (Feb 2026)**: 
  - React.lazy code splitting for all 18 route pages (only loads page code when visited)
  - Converted 5 remaining JPG destination images to WebP. Removed unused 426KB logo.png
  - Removed 22 unused packages (framer-motion, recharts, AWS SDK, 13 Radix UI, cmdk, input-otp, etc.)
  - Added image loading/decoding/fetchPriority attributes for above-fold hero images
  - Vite manualChunks: vendor (react), router (wouter), query (tanstack/trpc), ui (radix), i18n bundles

- **UX Competitive Improvements (Feb 2026)**:
  - Search-first hero layout: search bar moved above hero images, centered compact heading
  - TrustBar component (`client/src/components/TrustBar.tsx`): 4 trust signal stats (500+ routes, 6 partners, 6hr updates, 0% markup)
  - FlightWidget mobile tap targets increased to min-h-[52px], hotel form inputs to min-h-[48px] with rounded-xl styling
  - Popular Routes section: 2-column card grid (blue flights / green transport) with categorized affiliate links
  - "Why GoTravelAsia" section: detailed cards with colored icon badges and verified stat chips

- **Floating Search & Trust Features (Feb 2026)**:
  - FloatingSearchBar (`client/src/components/FloatingSearchBar.tsx`): Compact search strip that appears below header on scroll (z-40), with route dropdown, Hotels/Transport quick links
  - DealsCarousel enhanced with "From $XX" price badge, star ratings with review counts, "Price starting from" label
  - TrustReviews section (`client/src/components/TrustReviews.tsx`): 3 traveler testimonials + partner logo grid with role labels
  - Featured Destinations: "Hotels from $XX/night" price badges, star ratings, rounded-2xl cards with hover shadows

## Key Patterns
- `client/src/hooks/usePageMeta.ts` - Hook for dynamic SEO: title, description, OG tags, Twitter cards, canonical URL, keywords per route
- `client/src/hooks/useFlightData.ts` - Shared flight data fetching hook (single fetch, cached in memory)
- `client/src/lib/config.ts` - Centralized config for API keys and affiliate IDs
- `client/src/components/JsonLd.tsx` - JSON-LD structured data components (WebsiteJsonLd, BreadcrumbJsonLd, FAQJsonLd)
- `client/src/components/TrustBar.tsx` - Trust signals bar (500+ routes, 6 partners, 6hr updates, 0% markup)
- `client/src/components/HeroSection.tsx` - Hero + tabbed search section (renders Partners + TrustBar)
- `client/src/components/Partners.tsx` - GPU-accelerated infinite marquee of partner logos
- `client/src/components/FloatingSearchBar.tsx` - Floating search bar that appears on scroll (Cheapflights-style)
- `client/src/components/TrustReviews.tsx` - Traveler testimonials + partner logo grid with roles
- `client/src/components/DealsCarousel.tsx` - Trending flights carousel with price badges, star ratings, and route cards
- `client/src/components/DestinationPage.tsx` - Shared component for all destination pages (auto-sets SEO + breadcrumbs)
- `client/src/components/MoneyPage.tsx` - Shared component for all blog/review pages (auto-sets SEO + breadcrumbs)
