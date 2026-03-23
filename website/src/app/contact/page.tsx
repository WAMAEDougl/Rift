"use client";

import { useState } from "react";
import { BUSINESS, getWhatsAppOrderLink } from "@/lib/constants";

const contactInfo = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Visit Us",
    value: BUSINESS.address,
    subtext: `${BUSINESS.area}, ${BUSINESS.landmark}, ${BUSINESS.road}`,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Email Us",
    value: BUSINESS.email,
    subtext: "We reply within 24 hours",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: "Call / WhatsApp",
    value: `${BUSINESS.phone1} / ${BUSINESS.phone2}`,
    subtext: "WhatsApp available on both lines",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build WhatsApp message from form
    const msg = `Hi Ayola Foods! 👋\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nSubject: ${formData.subject}\n\nMessage: ${formData.message}`;
    window.open(getWhatsAppOrderLink(msg), "_blank");
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Contact Us
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-earth mt-3 mb-4">
            Let&apos;s Connect
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Visit us at Kahawa Sukari, order via WhatsApp, or send us a message.
            We deliver across Nairobi and ship packaged products countrywide.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 -mt-20">
            {contactInfo.map((info) => (
              <div
                key={info.label}
                className="bg-card rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {info.icon}
                </div>
                <h3 className="font-semibold text-earth mb-1">{info.label}</h3>
                <p className="text-primary font-medium text-sm">{info.value}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{info.subtext}</p>
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
              <h2 className="text-3xl font-bold text-earth mb-2">
                Send Us a Message
              </h2>
              <p className="text-muted-foreground mb-8">
                Fill in the form and it will open WhatsApp to send directly to our team.
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <span className="text-5xl block mb-4">✅</span>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Message Sent via WhatsApp!
                  </h3>
                  <p className="text-green-700">
                    Thank you for reaching out. We&apos;ll respond shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-primary font-semibold text-sm hover:underline"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        placeholder="0712 345 678"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                        placeholder="you@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                        Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm bg-card"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="order">Place an Order</option>
                        <option value="delivery">Delivery Question</option>
                        <option value="wholesale">Wholesale / Bulk Order</option>
                        <option value="packaged">Packaged Products / Parcels</option>
                        <option value="custom">Custom Flour Blend</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm inline-flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Send via WhatsApp
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Map */}
              <div className="bg-muted rounded-2xl overflow-hidden h-64">
                <iframe
                  src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.0!2d36.9487!3d-1.1962!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f3ffd56859239%3A0xb5741c3010640f68!2sayolafoodke!5e0!3m2!1sen!2ske!4v1!5m2!1sen!2ske`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ayola Foods Location"
                />
              </div>
              <p className="text-xs text-muted-foreground/60 text-center -mt-2">
                📍 {BUSINESS.fullAddress}
              </p>

              {/* WhatsApp CTA */}
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Quick Order via WhatsApp
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  For fastest service, WhatsApp us directly. We deliver across
                  Nairobi and ship packaged products countrywide.
                </p>
                <a
                  href={getWhatsAppOrderLink("Hi Ayola Foods! I'd like to place an order 🍽️")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>

              {/* How Shipping Works — Persona D */}
              <div className="bg-sand rounded-2xl p-8">
                <h3 className="text-xl font-bold text-earth mb-2">
                  How Countrywide Shipping Works
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Our packaged flour blends ship to all 47 counties in Kenya.
                </p>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Order via WhatsApp", desc: "Tell us what you need — Ugali Blend (KSh 250), Uji Blend (KSh 600), or a custom blend" },
                    { step: "2", title: "Pay via M-Pesa", desc: "We'll send you the payment details. Quick, secure, no fuss" },
                    { step: "3", title: "We Ship", desc: "Your order is packed and dispatched. Nairobi: same day. Countrywide: 1–3 days" },
                    { step: "4", title: "You Receive", desc: "Delivered to your door or nearest pickup point. We'll send tracking info" },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-earth">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href={getWhatsAppOrderLink("Hi Ayola Foods! I'd like to order packaged products for delivery")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors text-sm"
                >
                  Order Packaged Products
                </a>
              </div>

              {/* Social */}
              <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: "#78350F" }}>
                <h3 className="text-xl font-bold text-white mb-4">Follow Us</h3>
                <div className="space-y-3">
                  <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">F</div>
                    <div>
                      <p className="text-sm font-medium text-white">Facebook</p>
                      <p className="text-xs text-white/50">Ayola Foods Kenya &bull; {BUSINESS.facebookLikes}+ likes</p>
                    </div>
                  </a>
                  <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">I</div>
                    <div>
                      <p className="text-sm font-medium text-white">Instagram</p>
                      <p className="text-xs text-white/50">{BUSINESS.instagramHandle}</p>
                    </div>
                  </a>
                  <a href={BUSINESS.tiktok} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm">T</div>
                    <div>
                      <p className="text-sm font-medium text-white">TikTok</p>
                      <p className="text-xs text-white/50">{BUSINESS.tiktokHandle}</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
