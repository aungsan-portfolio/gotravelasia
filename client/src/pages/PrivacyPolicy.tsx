import { Link } from "wouter";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/Layout";

export default function TermsAndPrivacy() {
  usePageMeta({
    title: "Privacy Policy & Terms",
    description: "GoTravel Asia privacy policy, terms of service, affiliate disclosure, and cookie policy.",
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 prose prose-lg dark:prose-invert">
        <h1 className="text-4xl font-bold mb-8">Terms of Service & Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last Updated: February 2026</p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Affiliate Disclosure</h2>
          <p>
            GoTravelAsia participates in various affiliate marketing programs, which means we may get paid commissions on editorially chosen products purchased through our links to retailer sites (such as Agoda, Booking.com, Klook).
          </p>
          <p className="font-bold">
            This comes at NO extra cost to you. It helps us maintain this site and provide free travel guides.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. Content Liability</h2>
          <p>
            The information provided on GoTravelAsia is for general informational purposes only. We are not responsible for any booking issues, flight cancellations, or hotel discrepancies. Please verify all details directly with the booking provider.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. Cookies</h2>
          <p>
            We use cookies to ensure you get the best experience on our website and to track affiliate referrals.
          </p>
        </section>

        <p className="text-center mt-12">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </p>
      </div>
    </Layout>
  );
}
