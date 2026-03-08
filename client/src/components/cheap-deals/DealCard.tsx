// ─── Single deal card sub-component ──────────────────────────────────────
import { memo } from "react";
import OptimizedImage from "@/seo/OptimizedImage";
import { USD_TO_THB_RATE } from "@/const";
import type { EnhancedDealCard } from "./types";
import {
    getPriceLabel,
    formatDateRange,
    buildSearchUrl,
    formatPrice,
} from "./utils";

type DealCardProps = {
    deal: EnhancedDealCard;
};

export default memo(function DealCard({ deal }: DealCardProps) {
    const { label, isStale } = getPriceLabel(deal);

    return (
        <a
            href={buildSearchUrl(deal.originCode, deal.destinationCode)}
            className="flex flex-col bg-white border border-[#e4e7ec] rounded-xl overflow-hidden
        shadow-[0_2px_8px_rgba(0,0,0,0.08),_0_1px_3px_rgba(0,0,0,0.05)]
        hover:-translate-y-[3px]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.13),_0_2px_8px_rgba(0,0,0,0.07)]
        transition-all duration-[220ms] group no-underline text-inherit"
        >
            {/* Image */}
            <div className="relative w-full h-[180px] lg:h-[168px] overflow-hidden rounded-t-[10px] shrink-0 bg-gray-100">
                <OptimizedImage
                    src={deal.imageUrl}
                    alt={`Flights to ${deal.destination}`}
                    width={400}
                    height={180}
                    imgClassName="object-center transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
                />
                {deal.isDirect && (
                    <span className="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-700 shadow-sm z-10" aria-label="Direct Flight">
                        Direct
                    </span>
                )}
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col flex-1">
                {/* Destination */}
                <div className="text-[18px] font-[700] text-[#101828] mb-1.5 leading-[1.2]">
                    {deal.destination}
                </div>

                {/* Airline & Duration */}
                <div className="text-[14px] text-[#667085] leading-[1.5] mb-0.5">
                    {deal.airline} · {deal.duration}
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-[14px] text-[#667085] mb-3">
                    {formatDateRange(deal.departDate, deal.returnDate)}
                </div>

                {/* Spacer */}
                <div className="flex-1 min-h-[4px]" />

                {/* Dual Price & Freshness */}
                <div className="mt-auto">
                    <span className="block text-[14px] text-[#667085] leading-[1.2] mb-[2px]">
                        from
                    </span>
                    <div className="flex items-baseline gap-2 mb-[3px]">
                        <span className="text-[20px] font-[800] text-[#101828] leading-none tracking-[-0.3px]">
                            {formatPrice(deal.price, "USD")}
                        </span>
                        <span className="text-[15px] font-[600] text-[#667085] leading-none">
                            ({formatPrice(deal.price * USD_TO_THB_RATE, "THB")})
                        </span>
                    </div>
                    <p className={`text-[12px] font-medium transition-colors ${isStale ? "text-amber-500" : "text-emerald-600"}`}>
                        {label}
                    </p>
                </div>
            </div>
        </a>
    );
});
