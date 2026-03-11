import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FormEvent,
} from "react";
import type { NlStatus } from "../types";
import { subscribeNewsletter } from "../utils";

export function useNewsletter() {
    const [nlStatus, setNlStatus] = useState<NlStatus>("idle");
    const [nlEmail, setNlEmail] = useState("");
    const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const handleNewsletter = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (!nlEmail.trim() || nlStatus === "sending") return;

            clearTimeout(resetTimer.current);

            setNlStatus("sending");
            const ok = await subscribeNewsletter(nlEmail.trim());
            setNlStatus(ok ? "done" : "error");

            // Always reset after 3s — both done AND error
            resetTimer.current = setTimeout(() => {
                setNlStatus("idle");
                if (ok) setNlEmail("");
            }, 3000);
        },
        [nlEmail, nlStatus]
    );

    // Cleanup timer on unmount
    useEffect(() => {
        return () => clearTimeout(resetTimer.current);
    }, []);

    const ui = useMemo(() => {
        const bg =
            nlStatus === "done"
                ? "#00cc88"
                : nlStatus === "error"
                    ? "#ff4444"
                    : "#FFD700";

        const color = nlStatus === "done" || nlStatus === "error" ? "#fff" : "#2a0050";

        const text =
            nlStatus === "sending"
                ? "..."
                : nlStatus === "done"
                    ? "✓ Done!"
                    : nlStatus === "error"
                        ? "Try again"
                        : "Subscribe";

        return { bg, color, text };
    }, [nlStatus]);

    return {
        nlStatus,
        nlEmail,
        setNlEmail,
        handleNewsletter,
        nlBtnBg: ui.bg,
        nlBtnColor: ui.color,
        nlBtnText: ui.text,
    };
}
