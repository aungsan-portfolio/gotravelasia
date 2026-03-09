// ── Airport autocomplete dropdown ─────────────────────────────────

import { searchAirports, AIRPORTS } from "./airports";
import { DropPanel } from "./Primitives";

export function AirportDropdown({ inputId, query, onQuery, onPick, selected }: {
    inputId: string; query: string;
    onQuery: (q: string) => void;
    onPick: (a: (typeof AIRPORTS)[number]) => void;
    selected?: string;
}) {
    const results = searchAirports(query).slice(0, 7);
    return (
        <DropPanel left={0} width={282} onClick={e => e.stopPropagation()}>
            {/* Search input */}
            <div className="flex items-center gap-[8px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-[9px] px-[10px] py-[8px] mb-[6px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white/30 flex-shrink-0">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                    id={inputId}
                    autoFocus
                    value={query}
                    onChange={e => onQuery(e.target.value)}
                    placeholder="City or airport code…"
                    className="flex-1 bg-transparent border-none outline-none text-[13px] font-[500] text-white placeholder:text-white/25"
                    style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                />
            </div>
            <div className="text-[10px] font-700 tracking-wider text-white/25 uppercase px-[8px] mb-[4px]">
                {query ? "Results" : "Popular"}
            </div>
            {results.map(a => (
                <div
                    key={a.code}
                    onClick={() => onPick(a)}
                    className={[
                        "flex items-center gap-[10px] px-[10px] py-[9px] rounded-[9px] cursor-pointer transition-all",
                        selected === a.code
                            ? "bg-[rgba(245,197,24,0.1)]"
                            : "hover:bg-[rgba(245,197,24,0.1)]",
                    ].join(" ")}
                >
                    <span className="text-[14px] font-[800] text-[#F5C518] w-[34px] flex-shrink-0">{a.code}</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-[600] text-white truncate">{a.city} — {a.name}</div>
                        <div className="text-[10px] text-[rgba(255,255,255,0.35)]">{a.country}</div>
                    </div>
                </div>
            ))}
        </DropPanel>
    );
}
