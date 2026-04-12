"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { useFlightSearch } from "@/contexts/FlightSearchContext";

const B = {
  purpleDeep: "#2D0558",
  gold: "#F5C518",
  text: "#1e293b",
} as const;

interface TrackPricesButtonProps {
  currentPrice?: number | null;
  currency?: string;
}

type ModalState = "idle" | "open" | "loading" | "success" | "duplicate" | "error";

interface SubscribeResponse {
  success?: boolean;
  alreadyExists?: boolean;
  message?: string;
  error?: string;
  emailSent?: boolean;
  emailQueued?: boolean;
}

export function TrackPricesButton({
  currentPrice,
  currency = "THB",
}: TrackPricesButtonProps) {
  const { origin, destination, departDate, returnDate } = useFlightSearch();

  const [modalState, setModalState] = useState<ModalState>("idle");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canTrack = origin && destination && departDate;
  if (!canTrack) return null;

  const hasTrackablePrice =
    typeof currentPrice === "number" &&
    Number.isFinite(currentPrice) &&
    currentPrice > 0;

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email";
    return "";
  };

  const openModal = () => {
    setServerMessage("");
    setEmailError("");
    setModalState("open");
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const normalizedEmail = email.trim().toLowerCase();
    const err = validateEmail(normalizedEmail);

    if (err) {
      setEmailError(err);
      return;
    }

    setEmail(normalizedEmail);
    setEmailError("");
    setServerMessage("");
    setIsSubmitting(true);
    setModalState("loading");

    try {
      const res = await fetch("/api/price-alerts/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          origin: origin.code,
          destination: destination.code,
          departDate,
          returnDate: returnDate || null,
          currentPrice: hasTrackablePrice ? currentPrice : null,
          currency,
          source: "track_button",
        }),
      });

      const data: SubscribeResponse = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        setServerMessage(
          data.message ||
            data.error ||
            "Couldn't create your alert. Please try again.",
        );
        setModalState("error");
        return;
      }

      if (data.alreadyExists) {
        setServerMessage(
          data.message || "This email is already tracking this route.",
        );
        setModalState("duplicate");
        return;
      }

      setServerMessage(
        data.message || "Price alert created successfully.",
      );
      setModalState("success");
    } catch {
      setServerMessage("Network error. Please try again.");
      setModalState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setModalState("idle");
    setEmail("");
    setEmailError("");
    setServerMessage("");
    setIsSubmitting(false);
  };

  return (
    <>
      <button
        onClick={openModal}
        className="w-full lg:w-auto mt-3 flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl border text-sm font-bold transition-all duration-150 shadow-sm hover:shadow active:scale-[0.98]"
        style={{
          borderColor: "rgba(245,197,24,0.3)",
          color: B.gold,
          background: "rgba(245,197,24,0.08)",
        }}
      >
        <Bell className="w-4 h-4" />
        Track Prices — Get alerted when this drops
      </button>

      {modalState !== "idle" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto overscroll-contain animate-in zoom-in-95 duration-200"
            style={{
              maxHeight: "calc(100dvh - 2rem)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <div className="px-6 py-5 relative" style={{ background: B.purpleDeep }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-black text-xl flex items-center gap-2">
                    <Bell className="w-5 h-5" style={{ color: B.gold }} />
                    Track This Route
                  </h2>
                  <p
                    className="text-sm mt-1"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {origin.code} → {destination.code}
                    {departDate && (
                      <span className="ml-2 opacity-80">· {departDate}</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-6">
              {modalState === "loading" && (
                <div className="text-center py-8">
                  <Loader2
                    className="w-10 h-10 animate-spin mx-auto mb-4"
                    style={{ color: B.gold }}
                  />
                  <p className="text-gray-500 font-medium">
                    Setting up your alert...
                  </p>
                </div>
              )}

              {modalState === "success" && (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="font-black text-gray-900 text-xl">
                    Alert Created!
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {serverMessage ||
                      `We've saved your route for ${email}.`}
                  </p>

                  {hasTrackablePrice ? (
                    <div className="mt-4 bg-emerald-50 rounded-xl px-4 py-3 inline-block border border-emerald-100">
                      <p className="text-emerald-800 text-sm font-bold">
                        Tracking from {currency} {currentPrice!.toLocaleString()}
                      </p>
                    </div>
                  ) : null}

                  <button
                    onClick={handleClose}
                    className="mt-6 w-full py-3 text-white rounded-xl font-bold transition-transform active:scale-[0.98]"
                    style={{ background: B.purpleDeep }}
                  >
                    Got it!
                  </button>
                </div>
              )}

              {modalState === "duplicate" && (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h3 className="font-black text-gray-900 text-xl">
                    Already Tracking!
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {serverMessage ||
                      `${email} is already set up to receive alerts for this route.`}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold transition-all hover:bg-gray-200 active:scale-[0.98]"
                  >
                    Close
                  </button>
                </div>
              )}

              {modalState === "error" && (
                <div className="text-center py-6">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-black text-gray-900 text-xl">
                    Something Went Wrong
                  </h3>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {serverMessage ||
                      "Couldn't create your alert. Please try again."}
                  </p>
                  <button
                    onClick={() => setModalState("open")}
                    className="mt-6 w-full py-3 text-white rounded-xl font-bold transition-transform active:scale-[0.98]"
                    style={{ background: B.purpleDeep }}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {modalState === "open" && (
                <>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                    Enter your email and we'll save this route. You'll be
                    notified when deals become available.
                  </p>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const nextEmail = e.target.value;
                        setEmail(nextEmail);
                        if (emailError) {
                          setEmailError(validateEmail(nextEmail));
                        }
                        if (serverMessage) {
                          setServerMessage("");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void handleSubmit();
                        }
                      }}
                      placeholder="you@example.com"
                      className={`
                        w-full px-4 py-3 rounded-xl border text-sm font-medium
                        focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all
                        ${
                          emailError
                            ? "border-red-400 bg-red-50 focus:ring-red-500 text-red-900"
                            : "border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-400 focus:ring-indigo-500 text-gray-900"
                        }
                      `}
                      autoFocus
                    />
                    {emailError && (
                      <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {emailError}
                      </p>
                    )}
                  </div>

                  {hasTrackablePrice ? (
                    <div className="mt-4 flex items-start gap-3 bg-amber-50/50 border border-amber-200/60 rounded-xl px-4 py-3">
                      <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Current lowest observed price is{" "}
                        <strong>
                          {currency} {currentPrice!.toLocaleString()}
                        </strong>
                        . You'll be alerted when it drops.
                      </p>
                    </div>
                  ) : null}

                  <button
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    aria-disabled={isSubmitting}
                    className="mt-6 w-full min-h-[44px] min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
                    style={{ background: B.gold, color: B.purpleDeep }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Alert...
                      </>
                    ) : (
                      "Start Tracking"
                    )}
                  </button>

                  <p className="mt-4 text-center text-xs font-medium text-gray-400">
                    No spam. Unsubscribe anytime in one click.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TrackPricesButton;
