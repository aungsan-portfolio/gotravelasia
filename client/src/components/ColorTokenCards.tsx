/*
 * Swiss/Editorial — Interactive Color Token Cards
 * Hover to preview hover state, click to copy hex codes
 */
import { motion } from "framer-motion";
import { useState } from "react";

interface PricingToken {
    tier: string;
    bgColor: string;
    textColor: string;
    bgHex: string;
    textHex: string;
    cssVar: string;
    hoverBg: string;
    hoverHex: string;
    description: string;
}

const TOKENS: PricingToken[] = [
    {
        tier: "Cheapest",
        bgColor: "#b3f9c2",
        textColor: "#054d14",
        bgHex: "#b3f9c2",
        textHex: "#054d14",
        cssVar: "--color-component-calendar-background-cheapest-default",
        hoverBg: "#8df4a4",
        hoverHex: "#8df4a4",
        description: "Indicates the most affordable dates. Applied when the estimated price falls below the lower threshold.",
    },
    {
        tier: "Average",
        bgColor: "#fcb773",
        textColor: "#5b2601",
        bgHex: "#fcb773",
        textHex: "#5b2601",
        cssVar: "--color-component-calendar-background-average-default",
        hoverBg: "#fca64f",
        hoverHex: "#fca64f",
        description: "Represents mid-range pricing. Applied when the estimated price falls between the lower and upper thresholds.",
    },
    {
        tier: "Expensive",
        bgColor: "#fba09d",
        textColor: "#680d08",
        bgHex: "#fba09d",
        textHex: "#680d08",
        cssVar: "--color-component-calendar-background-expensive-default",
        hoverBg: "#f97f7b",
        hoverHex: "#f97f7b",
        description: "Highlights the most expensive dates. Applied when the estimated price exceeds the upper threshold.",
    },
];

export default function ColorTokenCards() {
    const [copied, setCopied] = useState<string | null>(null);
    const [hoveredTier, setHoveredTier] = useState<string | null>(null);

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            setTimeout(() => setCopied(null), 1800);
        } catch (err) {
            console.error("Copy failed", err);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TOKENS.map((token, i) => {
                const currentBg = hoveredTier === token.tier ? token.hoverBg : token.bgColor;

                return (
                    <motion.div
                        key={token.tier}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="rounded-xl overflow-hidden border border-gray-200 group"
                    >
                        {/* Interactive Preview */}
                        <div
                            className="p-6 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer relative min-h-[140px]"
                            style={{ backgroundColor: currentBg }}
                            onMouseEnter={() => setHoveredTier(token.tier)}
                            onMouseLeave={() => setHoveredTier(null)}
                            onClick={() => copyToClipboard(token.bgHex, `${token.tier}-bg`)}
                        >
                            <span className="text-2xl font-bold" style={{ color: token.textColor }}>
                                {token.tier}
                            </span>
                            <span className="text-sm mt-1 opacity-80 font-mono" style={{ color: token.textColor }}>
                                {token.bgHex}
                            </span>

                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] px-2 py-0.5 rounded bg-black/70 text-white font-mono">
                                    {copied === `${token.tier}-bg` ? "✅ ကူးပြီး" : "ကလစ်နှိပ် → copy"}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 bg-stone-50">
                            <p className="text-sm mb-4 leading-relaxed text-gray-700">
                                {token.description}
                            </p>

                            {/* Swatches with Copy */}
                            <div className="space-y-3">
                                {[
                                    { label: "bg", color: token.bgColor, hex: token.bgHex, key: `${token.tier}-bg` },
                                    { label: "text", color: token.textColor, hex: token.textHex, key: `${token.tier}-text` },
                                    { label: "hover", color: token.hoverBg, hex: token.hoverHex, key: `${token.tier}-hover` },
                                ].map((swatch) => (
                                    <div key={swatch.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-5 h-5 rounded border border-gray-200"
                                                style={{ backgroundColor: swatch.color }}
                                            />
                                            <span className="text-xs font-mono text-gray-500">{swatch.label}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(swatch.hex, swatch.key)}
                                            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors font-mono"
                                        >
                                            {copied === swatch.key ? "✅ ကူးပြီး" : `📋 ${swatch.hex}`}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* CSS Variable */}
                            <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                                <code className="text-[10px] leading-tight break-all font-mono text-gray-400">
                                    {token.cssVar}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(token.cssVar, token.cssVar)}
                                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors shrink-0 ml-2"
                                >
                                    {copied === token.cssVar ? "✅" : "📋"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
