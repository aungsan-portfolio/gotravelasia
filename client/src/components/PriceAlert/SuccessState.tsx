"use client";

import { CheckCircle2, Mail } from "lucide-react";

export default function SuccessState({
    step,
    email,
    toastMessage,
    onClose,
}: {
    step: "auto-saved" | "email-sent";
    email: string;
    toastMessage: string;
    detectedRoute?: any;
    onClose: () => void;
}) {
    return (
        <div className="flex flex-col items-center text-center gap-1.5 py-4">
            <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                style={{
                    background:
                        step === "auto-saved"
                            ? "linear-gradient(135deg, rgba(52,211,153,.1), rgba(16,185,129,.05))"
                            : "linear-gradient(135deg, rgba(251,191,36,.1), rgba(245,158,11,.05))",
                    border: step === "auto-saved" ? "1px solid rgba(52,211,153,.2)" : "1px solid rgba(251,191,36,.2)",
                }}
            >
                {step === "auto-saved" ? (
                    <CheckCircle2 size={32} className="text-emerald-400" strokeWidth={1.5} />
                ) : (
                    <Mail size={28} className="text-amber-400" strokeWidth={1.5} />
                )}
            </div>
            
            <h3 className="gt-head text-white text-[22px] font-bold">
                {step === "auto-saved" ? "Alert Created!" : "Check Your Email"}
            </h3>
            
            <p className="text-white/60 text-[14px] leading-relaxed max-w-[280px]">
                {toastMessage}
            </p>
            
            <div className="w-full h-px my-4" style={{ background: "rgba(255,255,255,.05)" }} />
            
            <button
                onClick={onClose}
                className="w-full rounded-xl py-3 font-medium text-[14px] transition-all hover:bg-white/10 active:scale-[0.98]"
                style={{
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.1)",
                    color: "rgba(255,255,255,.9)",
                }}
            >
                Got it, thanks
            </button>
        </div>
    );
}

