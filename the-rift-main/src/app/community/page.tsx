import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart, Camera, Users, ChefHat, Award, ArrowRight,
  MessageCircle, Star, Instagram, Youtube, Facebook, Globe,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import HeroSlideshow from "@/components/HeroSlideshow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community — Rift & Root",
  description:
    "Join the Rift & Root community — recipes, health tips, and exclusive offers from Kenya's leading heritage food brand.",
};

// ── Types ──────────────────────────────────────────────────────────────────

interface Stat { value: string; label: string; }
interface Benefit { title: string; desc: string; }
interface SocialChannel { label: string; handle: string; href: string; followers: string; }

interface CommunityContent {
  heroTitle: string;
  heroSubtitle: string;
  whatsappNumber: string;
  stats: Stat[];
  benefits: Benefit[];
  socialChannels: SocialChannel[];
}

interface DBTestimonial {
  name: string;
  location: string | null;
  quote: string;
  rating: number;
  product: string | null;
  avatar_url: string | null;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const defaults: CommunityContent = {
  heroTitle: "Food is better shared.",
  heroSubtitle:
    "2,400+ members across Kenya eating better, cooking together, and supporting the farmers who grow our food. This is more than a brand — it's a table.",
  whatsappNumber: "254713280550",
  stats: [
    { value: "2,400+", label: "Community Members" },
    { value: "180+", label: "Recipes Shared" },
    { value: "47", label: "Counties Represented" },
    { value: "4.9★", label: "Average Rating" },
  ],
  benefits: [
    { title: "Weekly Recipes", desc: "New heritage recipes every week — fermentation guides, meal prep ideas, and seasonal specials." },
    { title: "Members-Only Offers", desc: "Early access to new products, community-only discounts, and flash sales before anyone else." },
    { title: "Share & Get Featured", desc: "Post your meal photos, tag us, and get featured on our social channels and newsletter." },
    { title: "Health Journeys", desc: "Real stories of gut health transformation, weight management, and better everyday eating." },
  ],
  socialChannels: [
    { label: "Instagram", handle: "@riftandroot", href: "#", followers: "3.2K" },
    { label: "Facebook", handle: "Rift & Root Kenya", href: "#", followers: "1.8K" },
    { label: "YouTube", handle: "Rift & Root", href: "#", followers: "940" },
  ],
};

const fallbackTestimonials = [
  { name: "Wanjiru K.", location: "Westlands, Nairobi", quote: "The fermented porridge blend has completely changed my mornings. I have more energy and my digestion has never been better. This is real food science.", rating: 5, product: "Heritage Porridge Blend", avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80&auto=format&fit=crop&crop=face" },
  { name: "Brian O.", location: "Kilimani, Nairobi", quote: "I started using the ugali blend for bread and my family can't go back to regular flour. The nutty flavour is incredible and I know it's actually nutritious.", rating: 5, product: "Heritage Ugali Blend", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&auto=format&fit=crop&crop=face" },
  { name: "Amina S.", location: "Mombasa", quote: "The probiotic kvass is unlike anything I've tasted. Slightly tangy, naturally fizzy, and I can feel the difference in my gut health after just two weeks.", rating: 5, product: "Plantain Probiotic Kvass", avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&auto=format&fit=crop&crop=face" },
  { name: "David M.", location: "Thika", quote: "As a fitness coach I'm always looking for clean protein sources. The rabbit wet fry combo is my weekly staple — lean, flavourful, and genuinely satisfying.", rating: 5, product: "Rabbit Wet Fry Combo", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&auto=format&fit=crop&crop=face" },
  { name: "Grace N.", location: "Nakuru", quote: "I order the uji blend every month without fail. My children ask for it by name now. Knowing they're getting real heritage nutrition makes every bowl worth it.", rating: 5, product: "Heritage Uji Blend", avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&auto=format&fit=crop&crop=face" },
  { name: "Peter L.", location: "Eldoret", quote: "The goat milk chai is something else entirely. I drove two hours to Nairobi just to try it after seeing it online. Now I order the blend and make it at home.", rating: 5, product: "Goat Milk Chai Blend", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&auto=format&fit=crop&crop=face" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const BENEFIT_ICONS = [ChefHat, Award, Camera, Heart, Star, Users];

function socialIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("instagram")) return Instagram;
  if (l.includes("facebook")) return Facebook;
  if (l.includes("youtube")) return Youtube;
  return Globe;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Data fetch ─────────────────────────────────────────────────────────────

async function getData(): Promise<{ content: CommunityContent; testimonials: DBTestimonial[] }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [contentRes, testimonialsRes] = await Promise.all([
      supabase.from("page_content").select("content").eq("page", "community").single(),
      supabase
        .from("testimonials")
        .select("name, location, quote, rating, product, avatar_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(6),
    ]);

    const db = (contentRes.data?.content ?? {}) as Partial<CommunityContent>;
    const content: CommunityContent = {
      heroTitle: db.heroTitle ?? defaults.heroTitle,
      heroSubtitle: db.heroSubtitle ?? defaults.heroSubtitle,
      whatsappNumber: db.whatsappNumber ?? defaults.whatsappNumber,
      stats: db.stats?.length ? db.stats : defaults.stats,
      benefits: db.benefits?.length ? db.benefits : defaults.benefits,
      socialChannels: db.socialChannels?.length ? db.socialChannels : defaults.socialChannels,
    };

    const testimonials: DBTestimonial[] =
      testimonialsRes.data?.length ? testimonialsRes.data : fallbackTestimonials;

    return { content, testimonials };
  } catch {
    return { content: defaults, testimonials: fallbackTestimonials };
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function CommunityPage() {
  const { content: c, testimonials } = await getData();
  const waHref = `https://wa.me/${c.whatsappNumber}?text=Hi!%20I%20want%20to%20join%20the%20community`;

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden">
        <HeroSlideshow gradient="top" showControls={false} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
          <span className="eyebrow text-accent/80 inline-flex items-center gap-2">
            <Users className="w-4 h-4" /> Our Community
          </span>
          <h1 className="mt-4 font-display text-5xl font-medium leading-tight text-white md:text-7xl max-w-3xl">
            {c.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">{c.heroSubtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90 shadow-soft"
            >
              <MessageCircle className="w-4 h-4" /> Join on WhatsApp
            </a>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl divide-y divide-border md:grid md:grid-cols-4 md:divide-x md:divide-y-0">
          {c.stats.map((s) => (
            <div key={s.label} className="px-8 py-10 text-center">
              <div className="font-display text-4xl font-medium text-primary">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Why join us</span>
              <h2 className="mt-5 font-display text-4xl font-medium md:text-5xl">
                More than a mailing list
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-right">
              Our WhatsApp community is an active, engaged group — not a broadcast channel.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.benefits.map((b, i) => {
              const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
              return (
                <div
                  key={b.title}
                  className="group rounded-2xl border border-border bg-card p-8 hover:shadow-card hover:border-primary/30 transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-medium">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-muted/30 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <span className="eyebrow inline-flex items-center gap-2">
              <Star className="w-4 h-4" /> Real members
            </span>
            <h2 className="mt-5 font-display text-4xl font-medium md:text-5xl">
              What the community says
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-8 hover:shadow-card transition-shadow"
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="h-4 w-4 fill-accent" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="flex-1 text-base leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-6 border-t border-border pt-5 flex items-center gap-3">
                  {t.avatar_url ? (
                    <img
                      src={t.avatar_url}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0"
                      loading="lazy"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {initials(t.name)}
                    </div>
                  )}
                  <div>
                    <div className="font-display text-base font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.location}</div>
                  </div>
                  {t.product && (
                    <span className="ml-auto text-xs font-medium text-primary bg-primary/5 px-2.5 py-1 rounded-full shrink-0">
                      {t.product}
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <span className="eyebrow">Follow along</span>
            <h2 className="mt-5 font-display text-4xl font-medium md:text-5xl">
              Find us on social
            </h2>
            <p className="mt-4 text-muted-foreground max-w-md mx-auto">
              Cooking demos, health tips, farm visits, and behind-the-scenes content.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {c.socialChannels.map((s) => {
              const Icon = socialIcon(s.label);
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 rounded-2xl border border-border bg-card p-8 hover:shadow-card hover:border-primary/30 transition-all"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg font-medium">{s.label}</p>
                    <p className="text-sm text-muted-foreground truncate">{s.handle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display text-xl font-medium text-primary">{s.followers}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">followers</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="ink-gradient relative overflow-hidden rounded-[2.5rem] px-8 py-20 md:px-16 md:py-28">
          <div className="grain absolute inset-0 opacity-20 pointer-events-none" />
          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Ready to join?
              </span>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-white md:text-5xl">
                Pull up a chair. The table is set.
              </h2>
              <p className="mt-4 text-white/50 text-sm">
                Join {c.stats[0]?.value ?? "2,400+"} members who eat better, cook smarter, and support Kenyan farmers.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-white"
              >
                <MessageCircle className="w-4 h-4" /> Join on WhatsApp
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
