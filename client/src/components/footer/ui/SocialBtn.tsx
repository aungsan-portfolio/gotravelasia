import type { ReactNode } from "react";

type SocialBtnProps = {
    href: string;
    label: string;
    children: ReactNode;
};

export default function SocialBtn({ href, label, children }: SocialBtnProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className="w-[34px] h-[34px] rounded-lg flex items-center justify-center transition-all no-underline hover:bg-[rgba(245,197,24,0.15)]"
            style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.7)",
            }}
        >
            {children}
        </a>
    );
}
