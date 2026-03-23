"use client";

import { useState } from "react";
import { faqCategories, getFAQsByCategory } from "@/lib/faq";
import { getWhatsAppOrderLink } from "@/lib/constants";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const filtered = getFAQsByCategory(activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Help Center
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold text-earth mt-3 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about Ayola Foods, our products, ordering, and delivery.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-20 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
            {faqCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => { setActiveCategory(cat.slug); setOpenIndex(null); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <div
                key={`${faq.category}-${i}`}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground/60 shrink-0 transition-transform ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 text-center bg-muted/50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-earth mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-5">
              We&apos;re here to help. Reach out on WhatsApp and we&apos;ll respond within minutes.
            </p>
            <a
              href={getWhatsAppOrderLink("Hi, I have a question about Ayola Foods")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
