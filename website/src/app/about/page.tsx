import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Ayola Foods KE",
  description:
    "Learn about Ayola Foods KE — our mission to celebrate Africa's culinary heritage through modern, nutritious food products made with Kenya's finest indigenous ingredients.",
};

const timeline = [
  {
    title: "The Vision — 2024",
    description:
      "Prisca Kiragu, a trained food scientist from JKUAT, saw a gap: Kenya's indigenous superfoods were fading from daily life, replaced by processed imports. She set out to change that.",
  },
  {
    title: "The Kitchen Opens — Kahawa Sukari",
    description:
      "Ayola Foods opened at Ruhan Plaza, Kahawa Sukari — a health-focused restaurant and kitchen serving meals, probiotic beverages, and gut-health drinks formulated with real food science.",
  },
  {
    title: "Packaged Products Go Countrywide",
    description:
      "The Ayola Special Ugali Blend and Uji Blend launched as packaged products, shipped nationwide. Customers across 47 counties could now access heritage nutrition at home.",
  },
  {
    title: "Innovation — Kenya's First Plantain Kvass",
    description:
      "Ayola introduced plantain probiotic kvass — the first branded probiotic beverage in Kenya's food service sector. Synbiotic porridge and goat milk products followed.",
  },
];

const founderCredentials = [
  "BSc Food Science & Technology — JKUAT",
  "Formulates every Ayola product personally",
  "Specialist in fermentation & gut health",
  "JHUB Africa Innovatech recognized",
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              About Ayola Foods
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-earth mt-3 mb-6">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We&apos;re on a mission to prove that Africa&apos;s indigenous foods are
              not just nutritious — they&apos;re delicious, modern, and
              world-class.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-10 text-white">
              <div className="w-14 h-14 rounded-2xl bg-card/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-white/85 leading-relaxed text-lg">
                To be Africa&apos;s most loved heritage food brand — nourishing
                bodies, celebrating culture, and transforming local food systems.
              </p>
            </div>

            <div className="bg-gradient-to-br from-secondary to-emerald-800 rounded-3xl p-10 text-white">
              <div className="w-14 h-14 rounded-2xl bg-card/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-white/85 leading-relaxed text-lg">
                To create delicious, nutritious, and accessible food products
                that celebrate Kenya&apos;s culinary heritage — sourcing locally,
                producing responsibly, and building brands that make Africa
                proud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              How it all began
            </span>
            <h2 className="text-4xl font-bold text-earth mt-3 mb-6">
              The Ayola Journey
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Growing up in Kenya, our founder Prisca Kiragu watched grandmothers
              prepare nourishing meals from indigenous grains — finger millet porridge
              that energized kids for school, sorghum dishes that brought families
              together. These foods carried centuries of nutritional wisdom. But as
              Kenya modernized, these treasures were fading from daily life, replaced
              by processed imports.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Prisca studied food science at JKUAT to understand <em>why</em> these
              traditional foods were so powerful — and how to bring them back. Ayola
              Foods combines her scientific training with ancestral wisdom: probiotic
              beverages, heritage flour blends, and meals that prioritize gut health.
              Real food science, not just marketing.
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-2xl mx-auto">
            {timeline.map((item, idx) => (
              <div key={item.title} className="flex gap-6 mb-10 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  {idx < timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/20 mt-2" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="text-lg font-bold text-earth mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-secondary text-sm font-semibold uppercase tracking-wider">
              What drives us
            </span>
            <h2 className="text-4xl font-bold text-earth mt-3">Our Values</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Heritage (Urithi)",
                desc: "We honor African food traditions and indigenous knowledge, reimagining them for the modern world.",
                icon: "📜",
              },
              {
                name: "Nourishment (Lishe)",
                desc: "Every product must genuinely contribute to the health and wellbeing of our consumers.",
                icon: "💚",
              },
              {
                name: "Quality (Ubora)",
                desc: "We never compromise on ingredient quality, food safety, or product excellence.",
                icon: "⭐",
              },
              {
                name: "Community (Jamii)",
                desc: "We build meaningful relationships with farmers, employees, customers, and communities.",
                icon: "🤝",
              },
              {
                name: "Innovation (Ubunifu)",
                desc: "We continuously evolve, combining ancestral wisdom with modern food science.",
                icon: "💡",
              },
              {
                name: "Integrity (Uaminifu)",
                desc: "We are transparent about our ingredients, processes, and business practices.",
                icon: "🔒",
              },
            ].map((value) => (
              <div
                key={value.name}
                className="bg-sand rounded-2xl p-6 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{value.icon}</span>
                <h3 className="text-lg font-bold text-earth mt-3 mb-2">
                  {value.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-20 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Meet the Founder
            </span>
            <h2 className="text-4xl font-bold text-earth mt-3 mb-4">
              The Scientist Behind the Food
            </h2>
          </div>

          <div className="max-w-3xl mx-auto bg-card rounded-3xl p-8 sm:p-12 shadow-sm">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                PK
              </div>
              <h3 className="text-2xl font-bold text-earth">Prisca Kiragu</h3>
              <p className="text-primary font-medium mt-1">
                Founder & Food Scientist
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed max-w-xl mx-auto">
                A trained food scientist from Jomo Kenyatta University of Agriculture
                and Technology (JKUAT), Prisca founded Ayola Foods to prove that
                Kenya&apos;s indigenous foods deserve to be celebrated — not forgotten.
                She personally formulates every product, combining ancestral ingredients
                with evidence-based food science.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {founderCredentials.map((cred) => (
                  <span
                    key={cred}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium"
                  >
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-earth to-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Ayola Family
          </h2>
          <p className="text-amber-200/80 text-lg mb-8">
            Whether you want to stock our products, partner with us, or simply
            say hello — we&apos;d love to hear from you.
          </p>
          <Link
            href="/contact"
            className="bg-card text-earth px-8 py-3.5 rounded-full font-semibold hover:bg-warm transition-colors inline-block"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
