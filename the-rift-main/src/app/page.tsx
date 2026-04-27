import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Leaf, Flame, Wheat, ShieldCheck } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";

export const metadata: Metadata = {
  title: "Rift & Root — Earth-First African Nourishment",
  description:
    "Artisanal African meals, beverages and pantry goods. Heritage recipes hand-crafted in Nairobi from organic, regenerative ingredients.",
  openGraph: {
    title: "Rift & Root — Earth-First African Nourishment",
    description:
      "Heritage African cuisine, hand-crafted in Nairobi from regenerative ingredients.",
  },
  twitter: {},
};

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Slideshow background */}
        <HeroSlideshow />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
          <div className="max-w-2xl">
            <span className="eyebrow text-accent/80">Earth-first · Est. 2018</span>

            <h1 className="mt-5 font-display text-6xl font-medium leading-[1.0] tracking-tight text-white md:text-7xl lg:text-[6rem]">
              Where the Rift
              <br />
              <em className="font-normal italic text-accent">feeds the table.</em>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-white/70">
              Heritage African cooking, hand-crafted in small batches from the volcanic
              soils of the Rift Valley. Delivered to your door with care.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90 shadow-soft"
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/story"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                Our Story
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 flex items-center gap-10 border-t border-white/15 pt-8">
              {[
                { value: "100%", label: "Organic Heritage" },
                { value: "42", label: "Partner Farms" },
                { value: "6+", label: "Years Crafting" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-10">
                  {i > 0 && <div className="h-8 w-px bg-white/20" />}
                  <div>
                    <div className="font-display text-3xl font-medium text-white">
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-white/50">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating badge */}
        <div className="absolute bottom-16 right-10 hidden rounded-2xl bg-card/95 backdrop-blur-sm p-5 shadow-card lg:block max-w-[200px]">
          <div className="eyebrow text-[10px]">Hand-crafted</div>
          <p className="mt-2 font-display text-base leading-snug text-foreground">
            Small batch. Every week. Never shortcut.
          </p>
        </div>
      </section>

      {/* ── PILLARS ── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl divide-y divide-border md:grid md:grid-cols-4 md:divide-x md:divide-y-0">
          {[
            {
              Icon: Leaf,
              title: "Regenerative",
              body: "Every ingredient traceable to the farm and family that grew it.",
              href: "/about",
            },
            {
              Icon: Flame,
              title: "Slow-Cooked",
              body: "We ferment, sun-cure, and simmer the way grandmothers always have.",
              href: "/recipes",
            },
            {
              Icon: Wheat,
              title: "Small Batch",
              body: "Made fresh weekly. Never warehoused. Never shortcut.",
              href: "/shop",
            },
            {
              Icon: ShieldCheck,
              title: "Science-Backed",
              body: "Formulated by a food scientist. Real nutrition, not marketing.",
              href: "/health-hub",
            },
          ].map(({ Icon, title, body, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-start gap-4 px-6 py-10 transition-colors hover:bg-muted/50 lg:px-8"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:gap-2">
                  Learn more <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {/* ── STORY / MANIFESTO ── */}
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-2">

          {/* Left — full-height image panel */}
          <div className="relative min-h-[500px] lg:min-h-[700px]">
            <img
              src="https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&q=85&auto=format&fit=crop&crop=top"
              alt="African farmer and cook with fresh harvest ingredients"
              className="absolute inset-0 h-full w-full object-cover object-top"
              loading="lazy"
              width={1200}
              height={1400}
            />
            {/* Subtle gradient at bottom for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />

            {/* Floating stat cards */}
            <div className="absolute bottom-8 left-8 right-8 flex gap-4">
              <div className="flex-1 rounded-2xl bg-card/90 backdrop-blur-sm p-5 shadow-card">
                <div className="font-display text-3xl font-medium text-foreground">42</div>
                <div className="mt-0.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">Partner Farms</div>
              </div>
              <div className="flex-1 rounded-2xl bg-primary p-5 shadow-card">
                <div className="font-display text-3xl font-medium text-primary-foreground">6+</div>
                <div className="mt-0.5 text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Years Crafting</div>
              </div>
            </div>
          </div>

          {/* Right — content panel */}
          <div className="flex flex-col justify-center bg-muted/30 px-8 py-20 lg:px-16 lg:py-24">

            {/* Label */}
            <span className="eyebrow">The Rift &amp; Root Promise</span>

            {/* Heading */}
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] md:text-5xl">
              A bridge between ancestral wisdom
              <em className="font-normal italic text-primary"> and modern wellness.</em>
            </h2>

            {/* Divider */}
            <div className="my-8 h-px w-16 bg-primary" />

            {/* Body */}
            <p className="text-lg leading-relaxed text-muted-foreground">
              Every ingredient is hand-selected, honoring the rhythms of nature and the
              generations of farmers who have tended this land. We believe true nourishment
              is found in the simplicity of the earth — unprocessed, unhurried, unapologetically pure.
            </p>

            {/* Three pillars */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-y border-border py-8">
              {[
                { value: "100%", label: "Organic" },
                { value: "0", label: "Preservatives" },
                { value: "Daily", label: "Fresh-Made" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-2xl font-medium text-foreground">{stat.value}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mt-8 pl-5 border-l-2 border-primary font-display text-lg italic leading-snug text-foreground/75">
              &ldquo;We cook the way our grandmothers did — slowly, with reverence, and with
              peppers that still remember the sun.&rdquo;
            </blockquote>

            {/* CTA */}
            <Link
              href="/story"
              className="mt-10 self-start inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-primary"
            >
              Learn more about our roots <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center mb-16">
            <span className="eyebrow">Kind Words</span>
            <h2 className="mt-4 font-display text-4xl font-medium md:text-5xl">
              The community harvest
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "The quality is unlike anything in supermarkets. You can taste the care and the sunshine in every bite.",
                name: "Sarah J.",
                role: "Nairobi",
                stars: 5,
              },
              {
                quote: "Rift & Root transformed my mornings. The Zobo infusion is my new daily ritual — pure refreshment.",
                name: "David M.",
                role: "Wellness Coach",
                stars: 5,
              },
              {
                quote: "Supporting local farmers while eating this well feels like the ultimate luxury.",
                name: "Elena R.",
                role: "Art Curator",
                stars: 5,
              },
            ].map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-8 hover:shadow-card transition-shadow"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-accent text-accent" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="flex-1 text-base leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-6 border-t border-border pt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-medium text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-display text-base font-medium">{t.name}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {t.role}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER / CTA ── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="ink-gradient relative overflow-hidden rounded-[2.5rem] px-8 py-20 md:px-16 md:py-28">
          {/* Decorative grain overlay */}
          <div className="grain absolute inset-0 opacity-30 pointer-events-none" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Join the Harvest
              </span>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-white md:text-5xl">
                Seasonal recipes, early crop drops &amp; 10% off your first order.
              </h2>
              <p className="mt-4 text-sm text-white/50">
                We respect your inbox as much as we respect our land.
              </p>
            </div>

            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-base text-white placeholder:text-white/40 focus:border-accent focus:outline-none transition"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-white hover:text-foreground"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
