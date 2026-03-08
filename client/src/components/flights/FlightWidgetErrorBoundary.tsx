import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import posthog from "posthog-js";
import { B } from "./flightWidget.data";

export class FlightWidgetErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean; msg: string }
> {
    state = { hasError: false, msg: "" };

    static getDerivedStateFromError(e: Error) {
        return { hasError: true, msg: e.message };
    }

    componentDidCatch(e: Error, info: ErrorInfo) {
        console.error("[FlightWidget]", e, info);
        if (typeof posthog !== "undefined" && posthog.__loaded) {
            posthog.capture("flight_widget_error", { message: e.message });
        }
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        return (
            <div
                role="alert"
                className="flex flex-col items-center justify-center gap-4 py-12 px-6 rounded-2xl text-center"
                style={{ background: B.glassBase, border: `1.5px solid ${B.glassBorder}` }}
            >
                <AlertTriangle className="w-10 h-10" style={{ color: B.gold }} />
                <div>
                    <p className="font-bold text-white text-lg mb-1">Widget failed to load</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>{this.state.msg}</p>
                </div>
                <button
                    onClick={() => this.setState({ hasError: false, msg: "" })}
                    className="px-5 py-2 rounded-xl font-bold text-sm active:scale-[0.97] transition-all"
                    style={{ background: B.gold, color: B.purpleDeep }}
                >
                    Try Again
                </button>
            </div>
        );
    }
}
