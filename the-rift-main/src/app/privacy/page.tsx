import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Rift & Root",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-muted-foreground/60">Last updated: March 2026</p>

        <h2>1. Who We Are</h2>
        <p>Rift &amp; Root Limited (&ldquo;Rift &amp; Root&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates this website and the Rift &amp; Root restaurant at Ruhan Plaza, Kahawa Sukari, Nairobi. Contact: ayola.foods.kenya@gmail.com, 0713 280 550.</p>

        <h2>2. Information We Collect</h2>
        <ul>
          <li><strong>Order information:</strong> Name, phone number, email, delivery address when you place an order.</li>
          <li><strong>Payment information:</strong> M-Pesa transaction details (processed by Safaricom, not stored by us).</li>
          <li><strong>Contact form data:</strong> Name, email, phone, and message when you reach out.</li>
          <li><strong>Newsletter:</strong> Email address if you subscribe to our newsletter.</li>
          <li><strong>Website usage:</strong> Pages visited, browser type, and device information via cookies.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>Process and deliver your orders</li>
          <li>Communicate order status updates via SMS, email, or WhatsApp</li>
          <li>Send marketing communications (only with your consent)</li>
          <li>Improve our products and services</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not sell your personal data. We share information only with:</p>
        <ul>
          <li>Delivery partners (to fulfill your order)</li>
          <li>Payment processors (Safaricom M-Pesa)</li>
          <li>Communication services (for SMS/email notifications)</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>We implement reasonable security measures to protect your information. Payment processing is handled by Safaricom&apos;s secure M-Pesa platform — we never store your M-Pesa PIN or full payment details.</p>

        <h2>6. Your Rights</h2>
        <p>Under the Kenya Data Protection Act (2019), you have the right to access, correct, or delete your personal data, and to withdraw consent for marketing communications. Contact ayola.foods.kenya@gmail.com to exercise these rights.</p>

        <h2>7. Cookies</h2>
        <p>We use essential cookies to remember your cart and preferences. We do not use advertising tracking cookies.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this policy from time to time. Changes will be posted on this page.</p>

        <h2>9. Contact</h2>
        <p>For privacy inquiries: ayola.foods.kenya@gmail.com or <Link href="/contact">contact us</Link>.</p>
      </div>
    </div>
  );
}
