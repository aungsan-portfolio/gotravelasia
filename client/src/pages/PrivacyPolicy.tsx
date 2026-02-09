import Layout from "@/components/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <section className="py-24 bg-background">
        <div className="container max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-12">Last updated: February 8, 2026</p>
          
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to GoTravelAsia ("we," "our," or "us"). We are committed to protecting your personal information 
                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you visit our website gotravelasia.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We may collect information about you in various ways:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Personal Data:</strong> Email address when you subscribe to our newsletter</li>
                <li><strong>Usage Data:</strong> Information about how you use our website (pages visited, time spent)</li>
                <li><strong>Cookies:</strong> Small data files stored on your device for analytics and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To send you travel deals and newsletter updates (with your consent)</li>
                <li>To analyze website usage and improve our content</li>
                <li>To respond to your inquiries and provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our website contains affiliate links to third-party services including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Kiwi.com (Flight bookings)</li>
                <li>Traveloka (Hotel bookings)</li>
                <li>Klook (Tours and activities)</li>
                <li>12Go.asia (Transport bookings)</li>
                <li>Airalo (eSIM services)</li>
                <li>EKTA (Travel insurance)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                When you click these links and make purchases, we may earn a commission. 
                Each third-party service has its own privacy policy governing data collection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience. You can choose to disable cookies 
                through your browser settings, though this may affect certain website features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate security measures to protect your personal information. 
                However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access the personal data we hold about you</li>
                <li>Request correction or deletion of your data</li>
                <li>Unsubscribe from our newsletter at any time</li>
                <li>Opt-out of cookie tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:<br />
                <strong>Email:</strong> privacy@gotravelasia.com
              </p>
            </section>
          </div>
        </div>
      </section>
    </Layout>
  );
}
