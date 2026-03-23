"use client";

import { useState } from "react";
import { getWhatsAppOrderLink, BUSINESS } from "@/lib/constants";
import { Building2, School, Hotel, ShoppingBag, Package, TrendingUp, ArrowRight, Check } from "lucide-react";

const buyerTypes = [
  { icon: <ShoppingBag className="w-6 h-6" />, label: "Supermarkets & Retail", description: "Stock Ayola products on your shelves" },
  { icon: <School className="w-6 h-6" />, label: "Schools & Institutions", description: "Nutritious meals and flour for school feeding" },
  { icon: <Hotel className="w-6 h-6" />, label: "Hotels & Restaurants", description: "Premium flour blends for your kitchen" },
  { icon: <Building2 className="w-6 h-6" />, label: "Corporate & Events", description: "Catering and bulk orders for events" },
];

const wholesaleProducts = [
  { name: "Ayola Special Ugali Blend", retail: 250, wholesale: "Contact for pricing", minOrder: "50 units" },
  { name: "Ayola Special Uji Blend", retail: 600, wholesale: "Contact for pricing", minOrder: "50 units" },
  { name: "Custom Flour Blend", retail: 0, wholesale: "Custom quote", minOrder: "100 units" },
  { name: "Catering (Ready Meals)", retail: 0, wholesale: "Per-event pricing", minOrder: "20 servings" },
];

const benefits = [
  "Competitive wholesale pricing with volume discounts",
  "Consistent product quality — food scientist formulated",
  "Custom formulations available for your brand",
  "Reliable supply with flexible delivery schedules",
  "Marketing support (product training, point-of-sale materials)",
  "KEBS-compliant products with proper labeling",
];

export default function Wholesale() {
  const [formData, setFormData] = useState({
    businessName: "", contactName: "", phone: "", email: "",
    businessType: "", products: "", quantity: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `WHOLESALE INQUIRY\n\nBusiness: ${formData.businessName}\nContact: ${formData.contactName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nType: ${formData.businessType}\nProducts: ${formData.products}\nQuantity: ${formData.quantity}\n\n${formData.message}`;
    window.open(getWhatsAppOrderLink(msg), "_blank");
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
              <Package className="w-4 h-4" /> Wholesale & B2B
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-earth mt-3 mb-4">
              Partner with Ayola Foods
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Bring Kenya&apos;s healthiest food products to your customers. We supply
              supermarkets, schools, hotels, restaurants, and corporate events with
              premium heritage flour blends and catering services.
            </p>
          </div>
        </div>
      </section>

      {/* Buyer Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-earth mb-8 text-center">Who We Supply</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {buyerTypes.map((bt) => (
              <div key={bt.label} className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {bt.icon}
                </div>
                <h3 className="font-bold text-foreground mb-1">{bt.label}</h3>
                <p className="text-sm text-muted-foreground">{bt.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products & Pricing */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-earth mb-8 text-center">Wholesale Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-2xl border border-border overflow-hidden">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Product</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Retail Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Wholesale</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">Min. Order</th>
                </tr>
              </thead>
              <tbody>
                {wholesaleProducts.map((p) => (
                  <tr key={p.name} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{p.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.retail > 0 ? `KES ${p.retail}` : "Custom"}</td>
                    <td className="px-6 py-4 text-primary font-semibold">{p.wholesale}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.minOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" /> Why Partner with Us
              </span>
              <h2 className="text-3xl font-bold text-earth mt-3 mb-6">
                Built for Business Growth
              </h2>
              <ul className="space-y-4">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-10 text-white">
              <h3 className="text-2xl font-bold mb-3">Quick Contact</h3>
              <p className="text-white/70 mb-6">For wholesale inquiries:</p>
              <div className="space-y-3 text-sm">
                <p><strong>Phone:</strong> {BUSINESS.phone2}</p>
                <p><strong>Email:</strong> {BUSINESS.email}</p>
                <p><strong>WhatsApp:</strong> {BUSINESS.phone1}</p>
              </div>
              <a
                href={`mailto:${BUSINESS.email}?subject=Wholesale Inquiry — Ayola Foods`}
                className="inline-flex items-center gap-2 bg-card text-primary px-6 py-3 rounded-xl font-bold mt-6 hover:bg-card/90 transition-colors"
              >
                Email Us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-earth mb-8 text-center">Request a Quote</h2>

          {submitted ? (
            <div className="bg-green-50 rounded-2xl p-8 text-center">
              <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Inquiry Sent!</h3>
              <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours with a quote.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Business Name *" required value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                <input type="text" placeholder="Contact Person *" required value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="tel" placeholder="Phone Number *" required value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                <input type="email" placeholder="Email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <select value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground/80">
                <option value="">Select Business Type</option>
                <option value="supermarket">Supermarket / Retail</option>
                <option value="school">School / Institution</option>
                <option value="hotel">Hotel / Restaurant</option>
                <option value="corporate">Corporate / Events</option>
                <option value="other">Other</option>
              </select>
              <input type="text" placeholder="Products interested in" value={formData.products}
                onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              <input type="text" placeholder="Estimated monthly quantity" value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              <textarea placeholder="Additional details..." rows={3} value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              <button type="submit" className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-dark transition-colors">
                Send Inquiry via WhatsApp
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
