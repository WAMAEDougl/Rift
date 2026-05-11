"use client";

import { useState } from "react";
import { getWhatsAppOrderLink } from "@/lib/constants";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface Category {
  slug: string;
  label: string;
}

interface FAQClientProps {
  faqs: FAQ[];
  categories: Category[];
}

export default function FAQClient({ faqs, categories }: FAQClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = activeCategory === "all"
    ? faqs
    : faqs.filter((f) => f.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden border-b border-border">
        <HeroSlideshow gradient="top" showControls={false} />
        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pb-16">
          <span className="eyebrow text-accent/80 inline-flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Help Center
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl font-medium text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-white/70 text-lg">
            Everything you need to know about our products, ordering, and delivery.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <button key={cat.slug}
                onClick={() => { setActiveCategory(cat.slug); setOpenIndex(null); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No questions in this category yet.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((faq, i) => (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground/60 shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
                  </button>
                  {openIndex === i && (
                    <div className="px-5 pb-5">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Still have questions */}
          <div className="mt-12 text-center bg-muted/50 rounded-2xl p-8">
            <h3 className="font-display text-xl font-medium text-foreground mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-5">
              We&apos;re here to help. Reach out on WhatsApp and we&apos;ll respond within minutes.
            </p>
            <a href={getWhatsAppOrderLink("Hi, I have a question about Rift & Root")}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground transition hover:opacity-90">
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
