"use client";

import { useEffect, useRef } from "react";

export interface GoogleSignInButtonProps {
    googleReady: boolean;
    googleClientId?: string;
    width?: number;
    className?: string;
}

export default function GoogleSignInButton({
    googleReady,
    googleClientId,
    width = 314,
    className = "",
}: GoogleSignInButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!googleReady || !googleClientId || !containerRef.current) return;

        const google = (window as any).google;
        const googleId = google?.accounts?.id;
        if (!googleId) return;

        // Clear existing button to prevent duplicate render
        containerRef.current.innerHTML = "";

        googleId.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            width,
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
        });
    }, [googleReady, googleClientId, width]);

    return (
        <div
            className={`w-full flex justify-center min-h-[44px] ${className}`}
            style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,.28))" }}
        >
            <div ref={containerRef} className="w-full flex justify-center min-h-[44px]" />
        </div>
    );
}
