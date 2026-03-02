import Layout from "@/components/Layout";
import FAQSection from "@/components/FAQSection";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FAQ() {
    usePageMeta({
        title: "FAQ - GoTravel Asia | Frequently Asked Questions",
        description:
            "Find answers to common questions about booking flights in Southeast Asia, baggage allowances, visa requirements, and how GoTravel Asia helps you find the cheapest fares.",
        path: "/faq",
    });

    return (
        <Layout>
            <div className="py-16 bg-background">
                <FAQSection />
            </div>
        </Layout>
    );
}
