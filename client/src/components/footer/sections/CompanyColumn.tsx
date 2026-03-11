import FooterColumn from "../ui/FooterColumn";
import FooterLink from "../ui/FooterLink";

type CompanyColumnProps = {
    airaloUrl: string;
};

export default function CompanyColumn({ airaloUrl }: CompanyColumnProps) {
    return (
        <FooterColumn title="Company">
            <FooterLink href="/blog">Travel Blog</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
            <FooterLink href="/contact">Contact Us</FooterLink>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href={airaloUrl} external>
                Travel eSIM — Airalo
            </FooterLink>
        </FooterColumn>
    );
}
