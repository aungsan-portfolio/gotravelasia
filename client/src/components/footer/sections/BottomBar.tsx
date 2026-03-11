import { LEGAL_LINKS } from "../data";

export default function BottomBar() {
    return (
        <div className="border-t border-white/[0.08] relative z-10">
            <div className="container max-w-[1100px] mx-auto py-5 px-6 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center flex-wrap" style={{ gap: 0 }}>
                    {LEGAL_LINKS.map((link, i, arr) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-xs no-underline transition-colors hover:text-white/70"
                            style={{
                                color: "rgba(255,255,255,0.4)",
                                padding: "0 12px",
                                paddingLeft: i === 0 ? 0 : 12,
                                borderRight:
                                    i < arr.length - 1
                                        ? "1px solid rgba(255,255,255,0.15)"
                                        : "none",
                                textDecoration: "none",
                                fontSize: 12,
                                lineHeight: 1,
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    © 2026 GoTravel Asia. All rights reserved. | Made with ♥ for Asian travelers.
                </span>
            </div>
        </div>
    );
}
