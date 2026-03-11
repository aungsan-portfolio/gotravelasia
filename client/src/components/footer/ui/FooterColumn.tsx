import { useEffect, useState, type ReactNode } from "react";

type FooterColumnProps = {
    title: string;
    children: ReactNode;
};

/**
 * Mobile accordion, always open on desktop.
 * Uses matchMedia for efficient breakpoint detection.
 */
export default function FooterColumn({ title, children }: FooterColumnProps) {
    const [open, setOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia("(max-width: 639px)");
        setIsMobile(mql.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    const isOpen = !isMobile || open;

    return (
        <div>
            <div
                className="text-[11px] font-bold uppercase tracking-[2px] mb-5 pb-3 border-b border-white/[0.08] flex items-center justify-between"
                style={{
                    color: "#F5C518",
                    cursor: isMobile ? "pointer" : "default",
                }}
                onClick={() => isMobile && setOpen((p) => !p)}
            >
                {title}
                {isMobile && (
                    <span
                        className="text-[10px] transition-transform duration-200"
                        style={{
                            display: "inline-block",
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            color: "rgba(255,255,255,0.4)",
                        }}
                    >
                        ▼
                    </span>
                )}
            </div>

            <div
                style={{
                    maxHeight: isOpen ? "500px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {children}
            </div>
        </div>
    );
}
