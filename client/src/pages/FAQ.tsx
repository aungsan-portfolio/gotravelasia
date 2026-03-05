import Layout from "@/components/Layout";
import FAQSection from "@/components/FAQSection";
import SEO from "@/seo/SEO";

export default function FAQ() {
    return (
        <Layout>
            <SEO path="/faq" />
            <div className="py-16 bg-background">
                <FAQSection />
            </div>
        </Layout>
    );
}
