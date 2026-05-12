"use client";

import { useState, useEffect } from "react";
import { getWhatsAppOrderLink, BUSINESS } from "@/lib/constants";
import { fetchPublicSettings, type PublicSettings } from "@/lib/use-settings";
import { Building2, School, Hotel, ShoppingBag, Package, TrendingUp, ArrowRight, Check, MessageCircle } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";

const buyerTypes = [
  { icon: ShoppingBag, label: "Supermarkets & Retail", description: "Stock Rift & Root products on your shelves" },
  { icon: School, label: "Schools & Institutions", description: "Nutritious meals and flour for school feeding" },
  { icon: Hotel, label: "Hotels & Restaurants", description: "Premium flour blends for your kitchen" },
  { icon: Building2, label: "Corporate & Events", description: "Catering and bulk orders for events" },
];

const wholesaleProducts = [
  { name: "Special Ugali Blend", retail: 250, wholesale: "Contact for pricing", minOrder: "50 units" },
  { name: "Special Uji Blend", retail: 600, wholesale: "Contact for pricing", minOrder: "50 units" },
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

export default function WholesalePage() {
  const [formData, setFormData] = useState({
    businessName: "", contactName: "", phone: "", email: "",
    businessType: "", products: "", quantity: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [siteSettings, setSiteSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    fetchPublicSettings().then(setSiteSettings);
  }, []);

  const contactEmail = siteSettings?.support_email ?? BUSINESS.email;
  const contactPhone = siteSettings?.support_phone ?? BUSINESS.phone1;
  const waNumber = siteSettings?.whatsapp_number ?? BUSINESS.whatsapp;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setFormError("Enter a valid phone number e.g. 0712 345 678");
      return;
    }

    const msg = `WHOLESALE INQUIRY\n\nBusiness: ${formData.businessName}\nContact: ${formData.contactName}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nType: ${formData.businessType}\nProducts: ${formData.products}\nQuantity: ${formData.quantity}\n\n${formData.message}`;
    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    const popup = window.open(url, "_blank");
    if (popup === null) {
      setPopupBlocked(true);
      setWhatsappUrl(url);
    } else {
      setSubmitted(true);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm placeholder:text-muted-foreground/50";

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <HeroSlideshow gradient="top" showControls={false} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <span className="eyebrow text-accent/80 inline-flex items-center gap-2">
            <Package className="w-4 h-4" /> Wholesale &amp; B2B
          </span>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl font-medium text-white">
            Partner with Rift &amp; Root
          </h1>
          <p className="mt-4 text-white/70 text-lg leading-relaxed max-w-2xl">
            We supply supermarkets, schools, hotels, restaurants, and corporate events with
            premium heritage flour blends and catering services.
          </p>
        </div>
      </section>

      {/* Buyer Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium text-foreground mb-8 text-center">
            Who We Supply
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {buyerTypes.map((bt) => (
              <div key={bt.label} className="bg-card rounded-2xl border border-border p-6 text-center hover:shadow-card transition-all">
                <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <bt.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-1">{bt.label}</h3>
                <p className="text-sm text-muted-foreground">{bt.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products & Pricing */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium text-foreground mb-8 text-center">
            Wholesale Products
          </h2>
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
                  <tr key={p.name} className="border-b border-border/50 hover:bg-muted/30">
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
              <span className="eyebrow inline-flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Why Partner with Us
              </span>
              <h2 className="mt-6 font-display text-3xl font-medium text-foreground mb-6">
                Built for Business Growth
              </h2>
              <ul className="space-y-4">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ink-gradient rounded-3xl p-10 text-background">
              <h3 className="font-display text-2xl font-medium mb-3">Quick Contact</h3>
              <p className="text-background/70 mb-6">For wholesale inquiries:</p>
              <div className="space-y-3 text-sm text-background/85">
                <p><strong>Phone:</strong> {contactPhone}</p>
                <p><strong>Email:</strong> {contactEmail}</p>
                <p><strong>WhatsApp:</strong> {contactPhone}</p>
              </div>
              <a
                href={`mailto:${contactEmail}?subject=Wholesale Inquiry — Rift & Root`}
                className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-foreground mt-6 transition hover:bg-accent"
              >
                Email Us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium text-foreground mb-8 text-center">
            Request a Quote
          </h2>

          {submitted ? (
            <div className="bg-secondary/10 rounded-2xl p-8 text-center border border-secondary/20">
              <Check className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="font-display text-xl font-medium text-foreground mb-2">Inquiry Sent!</h3>
              <p className="text-muted-foreground">We&apos;ll get back to you within 24 hours with a quote.</p>
              <button onClick={() => { setSubmitted(false); setFormData({ businessName: "", contactName: "", phone: "", email: "", businessType: "", products: "", quantity: "", message: "" }); }}
                className="mt-4 text-primary font-semibold text-sm hover:underline">
                Submit Another Inquiry
              </button>
            </div>
          ) : popupBlocked ? (
            <div className="bg-accent/10 rounded-2xl p-8 text-center border border-accent/20">
              <MessageCircle className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-display text-xl font-medium text-foreground mb-2">Popup Blocked</h3>
              <p className="text-muted-foreground mb-4">Your browser blocked the WhatsApp popup. Open it manually below.</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90">
                Open WhatsApp
              </a>
              <button onClick={() => { setPopupBlocked(false); setSubmitted(true); }}
                className="block mt-3 mx-auto text-sm text-muted-foreground hover:underline">
                I&apos;ve sent the inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Business Name *" required value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} className={inputCls} />
                <input type="text" placeholder="Contact Person *" required value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} className={inputCls} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="tel" placeholder="Phone Number *" required value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputCls} />
                <input type="email" placeholder="Email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
              </div>
              <select value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className={`${inputCls} appearance-none`}>
                <option value="">Select Business Type</option>
                <option value="supermarket">Supermarket / Retail</option>
                <option value="school">School / Institution</option>
                <option value="hotel">Hotel / Restaurant</option>
                <option value="corporate">Corporate / Events</option>
                <option value="other">Other</option>
              </select>
              <input type="text" placeholder="Products interested in" value={formData.products}
                onChange={(e) => setFormData({ ...formData, products: e.target.value })} className={inputCls} />
              <input type="number" placeholder="Estimated monthly quantity (units)" min="1" value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className={inputCls} />
              <textarea placeholder="Additional details..." rows={3} value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={inputCls} />
              {formError && (
                <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{formError}</p>
              )}
              <button type="submit"
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 transition-colors shadow-soft">
                Send Inquiry via WhatsApp
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
