import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — AyolaFoods",
};

export default function TermsOfServicePage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
        <h1>Terms of Service</h1>
        <p className="text-sm text-muted-foreground/60">Last updated: March 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By using the Ayola Foods Kenya website and services, you agree to these terms. If you do not agree, please do not use our services.</p>

        <h2>2. Products &amp; Services</h2>
        <p>Ayola Foods offers ready meals (dine-in and delivery), probiotic beverages, and packaged flour blends. All products are prepared in our commercial kitchen at Ruhan Plaza, Kahawa Sukari.</p>
        <ul>
          <li>Product images are for illustration. Actual presentation may vary.</li>
          <li>Prices are in Kenya Shillings (KES) and may change without notice.</li>
          <li>Products are subject to availability.</li>
        </ul>

        <h2>3. Orders</h2>
        <ul>
          <li>Orders are confirmed once payment is received (M-Pesa) or acknowledged (Cash on Delivery).</li>
          <li>We reserve the right to refuse or cancel orders due to product unavailability, pricing errors, or suspected fraud.</li>
          <li>Order modifications must be requested within 15 minutes via WhatsApp (0713 280 550).</li>
        </ul>

        <h2>4. Payment</h2>
        <ul>
          <li>M-Pesa: Processed instantly via Safaricom&apos;s STK Push. You&apos;ll receive a confirmation SMS.</li>
          <li>Cash on Delivery: Available for Nairobi delivery orders only.</li>
        </ul>

        <h2>5. Delivery</h2>
        <ul>
          <li>Ready meals: Delivered within Nairobi (30-90 minutes depending on location).</li>
          <li>Packaged products: Shipped countrywide via courier (1-3 business days).</li>
          <li>Delivery fees apply as shown at checkout. Free delivery on Nairobi orders over KES 2,000.</li>
          <li>Risk of loss passes to you upon delivery.</li>
        </ul>

        <h2>6. Allergens &amp; Dietary Information</h2>
        <p>We provide allergen information for each product on our website. However, our kitchen handles multiple ingredients including wheat, dairy, eggs, and nuts. If you have severe allergies, please inform us before ordering.</p>

        <h2>7. Intellectual Property</h2>
        <p>All content on this website — text, images, logos, recipes — is owned by Ayola Foods Limited. You may not reproduce or distribute our content without written permission.</p>

        <h2>8. Limitation of Liability</h2>
        <p>Ayola Foods is not liable for indirect, incidental, or consequential damages. Our maximum liability is limited to the value of the order in question.</p>

        <h2>9. Governing Law</h2>
        <p>These terms are governed by the laws of Kenya. Any disputes shall be resolved through the courts of Nairobi.</p>

        <h2>10. Contact</h2>
        <p>Questions about these terms? Contact us at ayola.foods.kenya@gmail.com or <Link href="/contact">visit our contact page</Link>.</p>
      </div>
    </div>
  );
}
