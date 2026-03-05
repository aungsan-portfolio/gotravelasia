import { useState, useRef, useEffect } from "react";

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
    /** true = load immediately (above-fold hero images) */
    priority?: boolean;
    /** Object-fit style */
    fit?: "cover" | "contain" | "fill";
    /** Called when image loads successfully */
    onLoad?: () => void;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Tiny 4×3 gray LQIP placeholder (base64) */
const PLACEHOLDER_BLUR =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAADAAQDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEB//EABsQAAMBAQEBAAAAAAAAAAAAAAABAgMEBf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCw4Fxt3lgbNZFhsRCBgKoBtqCgAAP/2Q==";

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
    const [visible, setVisible] = useState(priority); // priority = load immediately
    const imgRef = useRef<HTMLImageElement>(null);

    // IntersectionObserver — start loading when near viewport
    useEffect(() => {
        if (priority || visible) return;
        const el = imgRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: "200px" } // start loading 200px before entering viewport
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [priority, visible]);

    const wrapStyle: React.CSSProperties = {
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#e8e0f0",
        ...style,
    };

    return (
        <div style={wrapStyle} className={className}>
            {/* Blur placeholder — shown until real image loads */}
            {!loaded && !errored && (
                <img
                    src={PLACEHOLDER_BLUR}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: fit,
                        filter: "blur(8px)",
                        transform: "scale(1.05)",
                        transition: "opacity 0.3s",
                    }}
                />
            )}

            {/* Real image */}
            {visible && !errored && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? "eager" : "lazy"}
                    decoding={priority ? "sync" : "async"}
                    fetchPriority={priority ? "high" : "low"}
                    className={imgClassName}
                    style={{
                        position: "absolute", inset: 0,
                        width: "100%", height: "100%",
                        objectFit: fit,
                        opacity: loaded ? 1 : 0,
                        transition: "opacity 0.4s ease",
                    }}
                    onLoad={() => { setLoaded(true); onLoad?.(); }}
                    onError={() => setErrored(true)}
                />
            )}

            {/* Error fallback */}
            {errored && (
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    background: "#e8e0f0", color: "#9d80c0",
                    fontSize: 28,
                }}>
                    ✈
                </div>
            )}

            {/* CLS prevention — invisible spacer maintains aspect ratio */}
            <div style={{ paddingBottom: `${(height / width) * 100}%` }} />
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
