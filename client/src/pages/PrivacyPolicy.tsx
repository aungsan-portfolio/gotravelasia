import { useEffect } from "react";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "Privacy Policy — GoTravel Asia";
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="bg-primary/5 border-b border-border py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
              Legal
            </span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: March 6, 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 prose prose-slate dark:prose-invert">
        <p>
          At GoTravel Asia, we take your privacy seriously. This privacy policy describes
          how we collect, use, and protect your personal information when you use our website.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We only collect information that is necessary to provide our services. This includes:
        </p>
        <ul>
          <li><strong>Email Addresses:</strong> When you subscribe to our newsletter or price alerts, we store your email address securely.</li>
          <li><strong>Usage Data:</strong> We collect anonymous data on how visitors interact with our site to improve the user experience.</li>
          <li><strong>Cookies:</strong> We use cookies to manage sessions and store your preferences. You can manage these in our <a href="/cookies">Cookie Settings</a>.</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>Your information is used strictly to:</p>
        <ul>
          <li>Send you the newsletters and customized travel alerts you requested.</li>
          <li>Improve the functionality and performance of our website.</li>
        </ul>
        <p>We <strong>do not</strong> sell your personal data to third parties.</p>

        <h2>3. Third-Party Services</h2>
        <p>
          Our application integrates with third-party providers such as Travelpayouts and 12Go Asia to provide flight and transport searches.
          When you interact with these widgets, you are subject to the privacy policies of those respective services.
        </p>

        <h2>4. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information.
          Our backend limits data exposure and follows secure coding practices.
        </p>

        <h2>5. Your Rights</h2>
        <p>
          If you wish to access, correct, or delete any personal information we hold about you, please
          contact us.
        </p>

        <h2>6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please reach out to us at
          <a href="mailto:contact@gotravelasia.com"> contact@gotravelasia.com</a>.
        </p>
      </div>
    </div>
  );
}
