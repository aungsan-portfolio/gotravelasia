import { PARTNER_LINKS } from "../data";

export default function PartnerBar() {
    return (
        <div className="border-t border-white/[0.08] relative z-10">
            <div className="container max-w-[1100px] mx-auto py-6 px-6 sm:px-12 flex items-center gap-4 flex-wrap">
                <span
                    className="text-[11px] font-semibold uppercase tracking-wide shrink-0"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                >
                    Trusted partners
                </span>

                <div className="flex items-center gap-3 flex-wrap">
                    {PARTNER_LINKS.map(([name, url]) => (
                        <a
                            key={name}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-xs font-bold rounded-md px-3 py-1.5 no-underline transition-all cursor-pointer hover:border-[rgba(245,197,24,0.4)] hover:text-white/60"
                            style={{
                                color: "rgba(255,255,255,0.35)",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}
                        >
                            {name}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
