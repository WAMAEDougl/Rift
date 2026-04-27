import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return & Refund Policy — AyolaFoods",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary">
        <h1>Return &amp; Refund Policy</h1>
        <p className="text-sm text-muted-foreground/60">Last updated: March 2026</p>

        <h2>Our Promise</h2>
        <p>We stand behind the quality of every product we make. If something isn&apos;t right, we&apos;ll make it right.</p>

        <h2>Ready Meals &amp; Beverages</h2>
        <ul>
          <li><strong>Quality issues:</strong> If your meal arrives damaged, incorrect, or doesn&apos;t meet our quality standards, contact us within 2 hours of delivery. We&apos;ll replace it or issue a full M-Pesa refund.</li>
          <li><strong>Late delivery:</strong> If your meal arrives more than 30 minutes after the estimated time, we&apos;ll offer a discount on your next order.</li>
          <li><strong>Wrong order:</strong> We&apos;ll send the correct order immediately at no additional cost.</li>
        </ul>

        <h2>Packaged Products (Flour Blends)</h2>
        <ul>
          <li><strong>Damaged in transit:</strong> If your package arrives damaged, send us a photo via WhatsApp within 24 hours. We&apos;ll ship a replacement immediately.</li>
          <li><strong>Quality concerns:</strong> If you believe the product quality is below standard, contact us within 7 days of delivery. We&apos;ll investigate and offer a replacement or refund.</li>
          <li><strong>Unopened returns:</strong> Sealed, unopened products can be returned within 14 days for a full refund. Return shipping is at your cost.</li>
        </ul>

        <h2>Non-Refundable Items</h2>
        <ul>
          <li>Partially consumed meals or beverages</li>
          <li>Opened packaged products (unless there&apos;s a quality defect)</li>
          <li>Custom flour blends made to your specifications</li>
          <li>Orders cancelled after preparation has begun</li>
        </ul>

        <h2>How to Request a Refund</h2>
        <ol>
          <li>Contact us on WhatsApp: <strong>0713 280 550</strong></li>
          <li>Provide your order number and a brief description of the issue</li>
          <li>Include a photo if applicable (damaged product, wrong item, etc.)</li>
          <li>We&apos;ll respond within 2 hours during operating hours</li>
        </ol>

        <h2>Refund Processing</h2>
        <ul>
          <li><strong>M-Pesa refunds:</strong> Processed within 24-48 hours to the original payment number.</li>
          <li><strong>Cash on Delivery:</strong> Refunded via M-Pesa to the phone number on your order.</li>
        </ul>

        <h2>Contact</h2>
        <p>For returns and refunds: WhatsApp 0713 280 550 or email ayola.foods.kenya@gmail.com. <Link href="/contact">Contact page</Link>.</p>
      </div>
    </div>
  );
}
