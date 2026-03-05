/**
 * @file SEO.tsx
 * @description Reusable SEO component using react-helmet-async.
 *              Replaces usePageMeta on pages that adopt it.
 */

import { Helmet } from "react-helmet-async";

// ─────────────────────────────────────────────────────────────
// SITE CONSTANTS
// ─────────────────────────────────────────────────────────────

const SITE = {
    name: "GoTravel Asia",
    url: "https://gotravel-asia.vercel.app",
    defaultDesc: "Compare cheap flights across Southeast Asia. Find the best deals from Myanmar to Bangkok, Singapore, Tokyo and more.",
    twitterHandle: "@gotravelasia",
    defaultImage: "/images/og-default.webp", // [Fix 3]
    themeColor: "#2a0050",
} as const;

// ─────────────────────────────────────────────────────────────
// PER-PAGE META MAP
// ─────────────────────────────────────────────────────────────

export const PAGE_META: Record<string, { title: string; description: string }> = {
    "/": {
        title: "GoTravel Asia — Cheap Flights from Myanmar & Southeast Asia",
        description: "Compare cheap flights from Myanmar to Bangkok, Singapore, Tokyo, Bali and 30+ destinations. Best prices from AirAsia, Thai Airways, MAI and more.",
    },
    "/blog": {
        title: "Travel Blog — Flight Tips & Guides | GoTravel Asia",
        description: "Flight booking tips, destination guides, and travel hacks for Southeast Asia travelers.",
    },
    "/faq": {
        title: "FAQ — Frequently Asked Questions | GoTravel Asia",
        description: "Everything you need to know about using GoTravel Asia to find cheap flights across Southeast Asia.",
    },
    "/contact": {
        title: "Contact Us | GoTravel Asia",
        description: "Get in touch with the GoTravel Asia team. We respond within 24 hours.",
    },
    "/about": {
        title: "About GoTravel Asia — Flight Comparison for Southeast Asia",
        description: "GoTravel Asia helps 50,000+ travelers find affordable flights across Southeast Asia.",
    },
    "/privacy": {
        title: "Privacy Policy | GoTravel Asia",
        description: "How GoTravel Asia collects, uses, and protects your personal data.",
    },
    "/terms": {
        title: "Terms of Use | GoTravel Asia",
        description: "Terms and conditions for using the GoTravel Asia flight comparison platform.",
    },
    "/cookies": {
        title: "Cookie Settings | GoTravel Asia",
        description: "Manage your cookie preferences for GoTravel Asia.",
    },
};

// ─────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────

interface SEOProps {
    /** Route path — used to look up PAGE_META. e.g. "/faq" */
    path?: string;
    /** Override title from PAGE_META */
    title?: string;
    /** Override description from PAGE_META */
    description?: string;
    /** Override OG image — absolute URL or /public path */
    image?: string;
    /** Additional JSON-LD schema(s) — merged with org+website defaults */
    schema?: object | object[];
    /** Set true for pages that should not be indexed by Google */
    noIndex?: boolean;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function SEO({
    path = "/",
    title,
    description,
    image,
    schema,
    noIndex = false,
}: SEOProps) {
    const pageMeta = PAGE_META[path] ?? {};
    const finalTitle = title ?? pageMeta.title ?? SITE.name;
    const finalDesc = description ?? pageMeta.description ?? SITE.defaultDesc;
    const canonical = `${SITE.url}${path}`;
    const ogImage = (image ?? SITE.defaultImage).startsWith("http")
        ? (image ?? SITE.defaultImage)
        : `${SITE.url}${image ?? SITE.defaultImage}`;

    // Note: Org & Website schemas are already handled globally in App.tsx -> <WebsiteJsonLd />
    // [Fix 2] Only push page-specific schemas here to avoid duplication
    const schemas: object[] = [];
    if (schema) {
        Array.isArray(schema) ? schemas.push(...schema) : schemas.push(schema);
    }

    return (
        <Helmet>
            {/* ── Basic ───────────────────────────────────── */}
            <title>{finalTitle}</title>
            <meta name="description" content={finalDesc} />
            <link rel="canonical" href={canonical} />
            <meta name="theme-color" content={SITE.themeColor} />
            {noIndex && <meta name="robots" content="noindex,nofollow" />}

            {/* ── Open Graph ──────────────────────────────── */}
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE.name} />
            <meta property="og:title" content={finalTitle} />
            <meta property="og:description" content={finalDesc} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="en_US" />

            {/* ── Twitter Card ────────────────────────────── */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={SITE.twitterHandle} />
            <meta name="twitter:title" content={finalTitle} />
            <meta name="twitter:description" content={finalDesc} />
            <meta name="twitter:image" content={ogImage} />

            {/* ── JSON-LD ─────────────────────────────────── */}
            {schemas.map((s, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
                />
            ))}
        </Helmet>
    );
}
