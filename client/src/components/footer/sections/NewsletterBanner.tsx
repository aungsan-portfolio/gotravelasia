import type {
    Dispatch,
    FormEventHandler,
    SetStateAction,
} from "react";
import type { NlStatus } from "../types";

type NewsletterBannerProps = {
    nlStatus: NlStatus;
    nlEmail: string;
    setNlEmail: Dispatch<SetStateAction<string>>;
    handleNewsletter: FormEventHandler<HTMLFormElement>;
    nlBtnBg: string;
    nlBtnColor: string;
    nlBtnText: string;
};

export default function NewsletterBanner({
    nlStatus,
    nlEmail,
    setNlEmail,
    handleNewsletter,
    nlBtnBg,
    nlBtnColor,
    nlBtnText,
}: NewsletterBannerProps) {
    return (
        <div
            className="border-b border-white/[0.08]"
            style={{ background: "linear-gradient(135deg,#5a0099 0%,#7000bb 100%)" }}
        >
            <div className="container max-w-[1100px] mx-auto py-7 px-6 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h3
                        className="text-[18px] font-bold mb-1"
                        style={{ fontFamily: "'Playfair Display',serif", color: "#FFD700" }}
                    >
                        ✈ Get flight deals first
                    </h3>
                    <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                        Join 50,000+ travelers — we send only the best deals, no spam.
                    </p>
                </div>

                <form
                    onSubmit={handleNewsletter}
                    className="flex rounded-lg overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                >
                    <input
                        type="email"
                        placeholder="your@email.com"
                        value={nlEmail}
                        onChange={(e) => setNlEmail(e.target.value)}
                        required
                        className="py-[11px] px-[18px] border-none outline-none text-sm text-white w-[200px] sm:w-[240px] placeholder:text-white/40"
                        style={{
                            background: "rgba(255,255,255,0.12)",
                            fontFamily: "'DM Sans',sans-serif",
                        }}
                    />
                    <button
                        type="submit"
                        disabled={nlStatus === "sending"}
                        className={`py-[11px] px-[22px] border-none text-[13px] font-bold tracking-wide transition-colors ${nlStatus === "sending" ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                            }`}
                        style={{
                            background: nlBtnBg,
                            color: nlBtnColor,
                            fontFamily: "'DM Sans',sans-serif",
                        }}
                    >
                        {nlBtnText}
                    </button>
                </form>
            </div>
        </div>
    );
}
