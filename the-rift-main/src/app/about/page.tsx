import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Users, Leaf, FlaskConical } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import HeroSlideshow from "@/components/HeroSlideshow";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us — Rift & Root",
  description:
    "The story behind Rift & Root — where African culinary heritage meets modern food science.",
};

// ── Types ──────────────────────────────────────────────────────────────────

interface Stat { value: string; label: string; }
interface Milestone { year: string; title: string; body: string; }
interface TeamMember { name: string; role: string; bio: string; image: string; }

interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  missionTitle: string;
  missionBody: string;
  visionTitle: string;
  visionBody: string;
  stats: Stat[];
  milestones: Milestone[];
  team: TeamMember[];
}

// ── Defaults ───────────────────────────────────────────────────────────────

const defaults: AboutContent = {
  heroTitle: "Where the Rift Valley feeds the world.",
  heroSubtitle:
    "We started with a single question: what would African food look like if it never stopped listening to the land? Six years later, we're still answering it.",
  missionTitle: "Make ancestral nutrition accessible to every Kenyan family.",
  missionBody:
    "Sourcing locally, producing responsibly, and building products that make Africa proud — without compromising on taste, science, or integrity.",
  visionTitle: "To be Africa's most trusted heritage food brand.",
  visionBody:
    "Nourishing bodies, celebrating culture, and transforming local food systems — one small batch at a time.",
  stats: [
    { value: "42", label: "Partner Farms" },
    { value: "6+", label: "Years Crafting" },
    { value: "47", label: "Counties Reached" },
    { value: "100%", label: "Natural Ingredients" },
  ],
  milestones: [
    {
      year: "2018",
      title: "The First Pot",
      body: "What started as a weekend supper club in a Nairobi apartment became the seed of something bigger — a mission to bring heritage African nutrition back to modern tables.",
    },
    {
      year: "2020",
      title: "Roots in the Rift Valley",
      body: "We partnered with 12 smallholder farms across the Rift Valley, growing heirloom peppers, sorghum, finger millet, and hibiscus using regenerative practices.",
    },
    {
      year: "2022",
      title: "Packaged for Kenya",
      body: "Our heritage flour blends launched as packaged products, shipping to all 47 counties. For the first time, families across Kenya could access ancestral nutrition at home.",
    },
    {
      year: "2024",
      title: "Science Meets Tradition",
      body: "We introduced Kenya's first plantain probiotic kvass and synbiotic porridge — formulated by a food scientist, rooted in centuries of African fermentation wisdom.",
    },
  ],
  team: [
    {
      name: "Prisca Kiragu",
      role: "Founder & Food Scientist",
      bio: "BSc Food Science & Technology (JKUAT). Specialist in fermentation, gut health, and indigenous grain value addition. Formulates every Rift & Root product personally.",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop&crop=face",
    },
    {
      name: "James Mwangi",
      role: "Head of Sourcing",
      bio: "15 years working with smallholder farmers across the Rift Valley. Manages our network of 42 partner farms and ensures every ingredient meets our regenerative standards.",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop&crop=face",
    },
    {
      name: "Amina Odhiambo",
      role: "Head of Operations",
      bio: "Former supply chain lead at a Nairobi FMCG company. Keeps our kitchen running at full capacity while maintaining the small-batch quality our customers expect.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop&crop=face",
    },
  ],
};

const values = [
  {
    icon: Leaf,
    title: "Regenerative Sourcing",
    body: "Every ingredient is traceable to the farm and the family that grew it. We pay above-market rates and invest in soil health.",
  },
  {
    icon: FlaskConical,
    title: "Science-Backed Nutrition",
    body: "Our products are formulated by a certified food scientist. Real evidence, not wellness marketing.",
  },
  {
    icon: Users,
    title: "Community First",
    body: "We employ locally, source locally, and reinvest 5% of revenue into women-led farming cooperatives across East Africa.",
  },
  {
    icon: Award,
    title: "Uncompromising Quality",
    body: "No preservatives. No artificial flavours. No shortcuts. Every batch is made fresh and tested before it leaves our kitchen.",
  },
];

// ── Data fetch ─────────────────────────────────────────────────────────────

async function getAboutContent(): Promise<AboutContent> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data, error } = await supabase
      .from("page_content")
      .select("content")
      .eq("page", "about")
      .single();

    if (error || !data?.content || Object.keys(data.content).length === 0) return defaults;

    const db = data.content as Partial<AboutContent>;
    return {
      heroTitle: db.heroTitle ?? defaults.heroTitle,
      heroSubtitle: db.heroSubtitle ?? defaults.heroSubtitle,
      missionTitle: db.missionTitle ?? defaults.missionTitle,
      missionBody: db.missionBody ?? defaults.missionBody,
      visionTitle: db.visionTitle ?? defaults.visionTitle,
      visionBody: db.visionBody ?? defaults.visionBody,
      stats: db.stats?.length ? db.stats : defaults.stats,
      milestones: db.milestones?.length ? db.milestones : defaults.milestones,
      team: db.team?.length ? db.team : defaults.team,
    };
  } catch {
    return defaults;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function AboutPage() {
  const c = await getAboutContent();

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden">
        <HeroSlideshow gradient="top" showControls={false} />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 lg:px-10">
          <span className="eyebrow text-accent/80">Our Story</span>
          <h1 className="mt-4 font-display text-5xl font-medium leading-tight text-white md:text-7xl max-w-3xl">
            {c.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">{c.heroSubtitle}</p>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl divide-y divide-border md:grid md:grid-cols-4 md:divide-x md:divide-y-0">
          {c.stats.map((s) => (
            <div key={s.label} className="px-8 py-10 text-center">
              <div className="font-display text-5xl font-medium text-primary">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION / VISION ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Vision */}
            <div className="ink-gradient rounded-3xl p-10 lg:p-14">
              <span className="eyebrow text-accent/70">Our Vision</span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-snug text-white md:text-4xl">
                {c.visionTitle}
              </h2>
              <p className="mt-5 text-white/60 leading-relaxed">{c.visionBody}</p>
            </div>

            {/* Mission */}
            <div className="rounded-3xl border border-border bg-muted/30 p-10 lg:p-14">
              <span className="eyebrow">Our Mission</span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-snug md:text-4xl">
                {c.missionTitle}
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">{c.missionBody}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="bg-muted/30 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">How it all began</span>
              <h2 className="mt-5 font-display text-4xl font-medium leading-tight md:text-5xl">
                The Rift &amp; Root journey
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-right">
              From a single pot in Nairobi to kitchens across 47 counties — six years of
              slow, deliberate growth.
            </p>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden">
            {c.milestones.map((m, i) => (
              <div
                key={m.year}
                className="relative flex flex-col bg-card p-8 hover:bg-muted/40 transition-colors group"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-primary transition-all duration-300 group-hover:h-1.5"
                  style={{ opacity: 0.4 + i * 0.2 }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/50 mb-4">
                  0{i + 1}
                </span>
                <div className="font-display text-5xl font-medium text-primary/80 leading-none mb-6">
                  {m.year}
                </div>
                <div className="h-px w-8 bg-primary/30 mb-6" />
                <h3 className="font-display text-xl font-medium text-foreground mb-3">{m.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground flex-1">{m.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 text-center">
            <span className="eyebrow">What drives us</span>
            <h2 className="mt-5 font-display text-4xl font-medium md:text-5xl">Our values</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border border-border bg-card p-8 hover:shadow-card hover:border-primary/30 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="bg-muted/30 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16">
            <span className="eyebrow">The people behind the food</span>
            <h2 className="mt-5 font-display text-4xl font-medium md:text-5xl">Meet the team</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-start">
            {c.team.map((member) => (
              <div key={member.name} className="group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105"
                      loading="lazy"
                      width={400}
                      height={533}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-display text-4xl font-medium">
                      {initials(member.name)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="font-display text-xl font-medium text-white leading-tight">{member.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60 mt-1">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="ink-gradient relative overflow-hidden rounded-[2.5rem] px-8 py-20 md:px-16 md:py-28">
            <div className="grain absolute inset-0 opacity-20 pointer-events-none" />
            <div className="relative max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Work with us
              </span>
              <h2 className="mt-4 font-display text-4xl font-medium leading-tight text-white md:text-5xl">
                Join the Rift &amp; Root family.
              </h2>
              <p className="mt-5 text-white/60 text-lg">
                Whether you want to stock our products, partner with us, or simply say hello —
                we&apos;d love to hear from you.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-white"
                >
                  Get in Touch <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
                >
                  Wholesale Enquiry
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
