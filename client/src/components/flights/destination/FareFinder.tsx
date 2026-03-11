import { useMemo, useState } from "react";
import type { DestinationPageVM } from "@/types/destination";
import { AmberBtn, Card, StopBadge, Wrap } from "./ui";

type Props = { data: DestinationPageVM };

function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function FareFinder({ data }: Props) {
    const [originFilter, setOriginFilter] = useState("all");

    const originOptions = useMemo(
        () => Array.from(new Set(data.fareTable.map((row) => row.from1))),
        [data.fareTable],
    );

    const rows = useMemo(() => {
        if (originFilter === "all") return data.fareTable;
        return data.fareTable.filter((row) => row.from1 === originFilter);
    }, [data.fareTable, originFilter]);

    return (
        <Wrap className="pt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white">Flexible fare matrix</h2>
                    <p className="text-sm text-white/60">
                        Compare outbound, return, stops, and booking paths.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-sm ${originFilter === "all"
                            ? "bg-amber-400 text-black font-bold"
                            : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                            }`}
                        onClick={() => setOriginFilter("all")}
                    >
                        All origins
                    </button>
                    {originOptions.map((origin) => (
                        <button
                            key={origin}
                            type="button"
                            className={`rounded-full px-3 py-1.5 text-sm ${originFilter === origin
                                ? "bg-amber-400 text-black font-bold"
                                : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                                }`}
                            onClick={() => setOriginFilter(origin)}
                        >
                            {origin}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {rows.map((row, index) => (
                    <Card
                        key={`${row.airline}-${row.from1}-${row.to1}-${row.d1}-${index}`}
                        className="p-5 text-white"
                    >
                        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
                            <div>
                                <div className="font-semibold">{row.from1} → {row.to1}</div>
                                <div className="text-sm text-white/60">{row.airline}</div>
                            </div>

                            <div>
                                <div className="text-xs text-white/50">Outbound</div>
                                <div className="text-sm">{formatDateTime(row.d1)}</div>
                                <div className="mt-1 text-sm text-white/60">{row.dur1 ?? "—"}</div>
                                <div className="mt-1"><StopBadge stops={row.s1} /></div>
                            </div>

                            <div>
                                <div className="text-xs text-white/50">Return</div>
                                {row.d2 ? (
                                    <>
                                        <div className="text-sm">{formatDateTime(row.d2)}</div>
                                        <div className="mt-1 text-sm text-white/60">{row.dur2 ?? "—"}</div>
                                        <div className="mt-1"><StopBadge stops={row.s2 ?? 0} /></div>
                                    </>
                                ) : (
                                    <div className="text-sm text-white/70">One-way</div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-xs text-white/50">Fare</div>
                                    <div className="text-xl font-bold text-amber-300">
                                        ฿{row.price.toLocaleString()}
                                    </div>
                                </div>
                                {row.bookingUrl ? (
                                    <AmberBtn as="a" href={row.bookingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 text-sm">
                                        Open option
                                    </AmberBtn>
                                ) : (
                                    <AmberBtn className="px-4 py-2 text-sm" disabled>Open option</AmberBtn>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Wrap>
    );
}
