import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface OptimizedImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    /** Tailwind classes to apply directly to the inner <img> (e.g., hover effects) */
    imgClassName?: string;
    style?: React.CSSProperties;
    /** true = load immediately, fetchpriority=high (hero/LCP images only) */
    priority?: boolean;
    /** CSS object-fit */
    fit?: "cover" | "contain" | "fill";
    onLoad?: () => void;
}

// Tiny gray LQIP placeholder shown while real image loads
const LQIP =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAARCAADAAQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EABsQAAMBAQEBAAAAAAAAAAAAAAABAgMEBf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCw4Fxt3lgbNZFhsRCBgKoBtqCgAAP/2Q==";

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    imgClassName,
    style,
    priority = false,
    fit = "cover",
    onLoad,
}: OptimizedImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [errored, setErrored] = useState(false);

    if (errored) {
        return (
            <div
                className={className}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e8e0f0",
                    color: "#9d80c0",
                    fontSize: 32,
                    ...style,
                }}
            >
                ✈
            </div>
        );
    }

    return (
        <div
            className={className}
            style={{ position: "relative", overflow: "hidden", ...style }}
        >
            {/* LQIP blur — shown until real image fades in */}
            {!loaded && (
                <img
                    src={LQIP}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: fit,
                        filter: "blur(12px)",
                        transform: "scale(1.08)",
                    }}
                />
            )}

            {/* Real image — native lazy loading, no IO race condition */}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? "eager" : "lazy"}
                decoding={priority ? "sync" : "async"}
                // @ts-expect-error — fetchpriority not yet in all TS DOM types
                fetchpriority={priority ? "high" : "auto"}
                className={`${loaded ? "opacity-100" : "opacity-0"} transition-all duration-500 ease-out ${imgClassName || ""}`}
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: fit,
                }}
                onLoad={() => { setLoaded(true); onLoad?.(); }}
                onError={() => setErrored(true)}
            />
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// PRELOAD HELPER — call in page component for LCP images
// ─────────────────────────────────────────────────────────────

/**
 * Preload a critical image (hero/LCP).
 * Call at the top of your page component.
 *
 * Usage:
 *   preloadImage("/images/hero.jpg");
 */
export function preloadImage(src: string) {
    if (typeof document === "undefined") return;
    const existing = document.querySelector(`link[rel="preload"][href="${src}"]`);
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
}

