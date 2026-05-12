"use client";

import { useState, useEffect } from "react";
import { BUSINESS, getWhatsAppOrderLink } from "@/lib/constants";
import { fetchPublicSettings, type PublicSettings } from "@/lib/use-settings";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", subject: "general", message: "",
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
  const contactPhone = siteSettings?.support_phone ?? `${BUSINESS.phone1} / ${BUSINESS.phone2}`;
  const contactAddress = siteSettings?.address ?? BUSINESS.address;
  const contactArea = siteSettings?.city ?? `${BUSINESS.area}, ${BUSINESS.landmark}`;
  const contactFullAddress = siteSettings?.address
    ? `${siteSettings.address}, ${siteSettings.city ?? BUSINESS.city}`
    : BUSINESS.fullAddress;
  const waNumber = siteSettings?.whatsapp_number ?? BUSINESS.whatsapp;
  const facebookUrl = siteSettings?.facebook_url ?? BUSINESS.facebook;
  const instagramUrl = siteSettings?.instagram_url ?? BUSINESS.instagram;
  const tiktokUrl = siteSettings?.tiktok_url ?? BUSINESS.tiktok;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      setFormError("Enter a valid phone number e.g. 0712 345 678");
      return;
    }
    if (!formData.message.trim()) {
      setFormError("Please enter a message before submitting");
      return;
    }

    const msg = `Hi Rift & Root! 👋\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nMessage: ${formData.message.trim()}`;
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
      <section className="relative min-h-[50vh] flex items-end overflow-hidden border-b border-border">
        <HeroSlideshow gradient="top" showControls={false} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <span className="eyebrow text-accent/80">Contact Us</span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl font-medium text-white">
            Let&apos;s Connect
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl text-lg">
            Visit us at Kahawa Sukari, order via WhatsApp, or send us a message.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: "Visit Us", value: contactAddress, sub: contactArea },
              { icon: Mail, label: "Email Us", value: contactEmail, sub: "We reply within 24 hours" },
              { icon: Phone, label: "Call / WhatsApp", value: contactPhone, sub: "WhatsApp available on both lines" },
            ].map((info) => (
              <div key={info.label} className="bg-muted/40 rounded-2xl p-6 text-center hover:shadow-card transition-all">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-1">{info.label}</h3>
                <p className="text-primary font-medium text-sm">{info.value}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{info.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map + Form */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="font-display text-3xl font-medium text-foreground mb-2">
                Send Us a Message
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill in the form and it will open WhatsApp to send directly to our team.
              </p>

              {submitted ? (
                <div className="bg-secondary/10 border border-secondary/20 rounded-2xl p-8 text-center">
                  <span className="text-5xl block mb-4">✅</span>
                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    Message Sent via WhatsApp!
                  </h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We&apos;ll respond shortly.
                  </p>
                  <button onClick={() => setSubmitted(false)}
                    className="mt-4 text-primary font-semibold text-sm hover:underline">
                    Send Another Message
                  </button>
                </div>
              ) : popupBlocked ? (
                <div className="bg-accent/10 border border-accent/20 rounded-2xl p-8 text-center">
                  <span className="text-5xl block mb-4">⚠️</span>
                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    Popup Blocked
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your browser blocked the WhatsApp popup. Click the button below to open it manually.
                  </p>
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground transition hover:opacity-90">
                    <MessageCircle className="w-4 h-4" /> Open WhatsApp
                  </a>
                  <button onClick={() => { setPopupBlocked(false); setSubmitted(true); }}
                    className="block mt-3 mx-auto text-sm text-muted-foreground hover:underline">
                    I&apos;ve sent the message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">Full Name *</label>
                      <input type="text" required value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputCls} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">Phone Number *</label>
                      <input type="tel" required value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={inputCls} placeholder="0712 345 678" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">Email</label>
                      <input type="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={inputCls} placeholder="you@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">Subject</label>
                      <select value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={`${inputCls} appearance-none`}>
                        <option value="general">General Inquiry</option>
                        <option value="order">Place an Order</option>
                        <option value="delivery">Delivery Question</option>
                        <option value="wholesale">Wholesale / Bulk Order</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">Message *</label>
                    <textarea required rows={5} value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`${inputCls} resize-none`} placeholder="Tell us how we can help..." />
                  </div>
                  {formError && (
                    <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                      {formError}
                    </p>
                  )}
                  <button type="submit"
                    className="w-full bg-secondary text-secondary-foreground py-3.5 rounded-xl font-bold hover:opacity-90 transition-colors text-sm inline-flex items-center justify-center gap-2 shadow-soft">
                    <MessageCircle className="w-5 h-5" /> Send via WhatsApp
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-muted rounded-2xl overflow-hidden h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.0!2d36.9487!3d-1.1962!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3ffd56859239%3A0xb5741c3010640f68!2sayolafoodke!5e0!3m2!1sen!2ske!4v1"
                  width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" title="Rift & Root Location"
                />
              </div>
              <p className="text-xs text-muted-foreground/60 text-center">
                📍 {contactFullAddress}
              </p>

              <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-8">
                <h3 className="font-display text-xl font-medium text-foreground mb-2">
                  Quick Order via WhatsApp
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  For fastest service, WhatsApp us directly. We deliver across Nairobi and ship
                  packaged products countrywide.
                </p>
                <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Hi Rift & Root! I'd like to place an order 🍽️")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground transition hover:opacity-90">
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              </div>

              <div className="ink-gradient rounded-2xl p-8 text-background">
                <h3 className="font-display text-xl font-medium mb-4">Follow Us</h3>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: "Facebook", href: facebookUrl },
                    { label: "Instagram", href: instagramUrl },
                    { label: "TikTok", href: tiktokUrl },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="rounded-full border border-background/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-background/10">
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
