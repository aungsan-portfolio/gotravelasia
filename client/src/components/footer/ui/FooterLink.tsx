import { Link } from "wouter";
import type { MouseEventHandler, ReactNode } from "react";

type FooterLinkProps = {
    href: string;
    children: ReactNode;
    external?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Footer link — uses wouter Link for internal routes (SPA navigation),
 * plain <a> for external links (opens in new tab).
 */
export default function FooterLink({
    href,
    children,
    external,
    onClick,
}: FooterLinkProps) {
    const cls = "text-[13px] no-underline transition-colors hover:text-white";
    const style = { color: "rgba(255,255,255,0.6)" };

    if (external) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
                style={style}
                onClick={onClick}
            >
                <span className="text-[10px] mr-1" style={{ color: "#F5C518", opacity: 0.7 }}>
                    ↗
                </span>
                {children}
            </a>
        );
    }

    // Internal links use wouter Link for SPA navigation (no full page reload)
    return (
        <Link href={href} className={cls} style={style} onClick={onClick}>
            {children}
        </Link>
    );
}
