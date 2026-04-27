import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import farmer from "@/assets/story-farmer.jpg";
import hands from "@/assets/story-hands.jpg";

export const metadata: Metadata = {
  title: "Our Story — AyolaFoods",
  description:
    "From a single grandmother's kitchen in Nairobi to a movement for regenerative African food. Meet the farmers, makers and soil behind AyolaFoods.",
  openGraph: {
    title: "Our Story — AyolaFoods",
    description: "From one grandmother's kitchen to a movement for regenerative African food.",
    images: [{ url: farmer.src }],
  },
  twitter: {
    images: [farmer.src],
  },
};

const milestones = [
  { year: "2018", title: "A grandmother's kitchen", body: "Ayola starts as a weekend supper club out of a Kilimani apartment, cooking for friends from a single recipe book." },
  { year: "2020", title: "First farm partnerships", body: "Twelve smallholder farms across the Rift Valley join us, growing heirloom peppers, sorghum and hibiscus." },
  { year: "2022", title: "Hands beyond Kenya", body: "Our pantry goods reach Kampala, Lagos and London — always shipped within seven days of harvest." },
  { year: "2024", title: "Earth-first promise", body: "100% of our packaging becomes compost-ready and our farms transition to fully regenerative practices." },
];

export default function StoryPage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:px-10 lg:py-32">
          <div className="lg:col-span-6">
            <span className="eyebrow">Our Story</span>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] md:text-7xl">
              The earth remembers
              <br />
              <em className="font-normal italic text-primary">every hand that tends it.</em>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              AyolaFoods was born from a question: what would a modern African kitchen look like
              if it never stopped listening to the land? Six years later, we&apos;re still answering.
            </p>
          </div>
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft">
              <img
                src={farmer.src}
                alt="Founding farmer holding a basket of heirloom vegetables in the Kenyan highlands"
                className="h-full w-full object-cover"
                loading="lazy"
                width={1200}
                height={1400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
        <span className="eyebrow">Our manifesto</span>
        <p className="mt-8 font-display text-3xl leading-snug md:text-5xl">
          We believe food should be a love letter to the soil it came from — written in the hands
          of farmers, sealed with patience, and opened at your table.
        </p>
        <div className="divider mx-auto mt-16 max-w-md" />
      </section>

      {/* Pillars */}
      <section className="bg-muted/40 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:gap-16 lg:px-10">
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] overflow-hidden rounded-[2rem]">
              <img
                src={hands.src}
                alt="Hands kneading dough on a floured wooden board"
                className="h-full w-full object-cover"
                loading="lazy"
                width={1200}
                height={900}
              />
            </div>
          </div>
          <div className="lg:col-span-7 lg:pl-6">
            <span className="eyebrow">Three pillars</span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl">How we work, every day.</h2>
            <div className="mt-12 space-y-10">
              {[
                {
                  num: "01",
                  title: "Source from the source.",
                  body: "Every ingredient is traceable to the farm and the family that grew it. No middlemen, no commodity blends.",
                },
                {
                  num: "02",
                  title: "Cook the patient way.",
                  body: "Slow ferments, sun-curing, long simmers. Heritage techniques are the recipe — speed is never the goal.",
                },
                {
                  num: "03",
                  title: "Return more than we take.",
                  body: "We invest 5% of revenue into regenerative agriculture and women-led farming cooperatives across East Africa.",
                },
              ].map((p) => (
                <div key={p.num} className="flex gap-6 border-t border-border pt-8">
                  <span className="font-display text-2xl text-primary">{p.num}</span>
                  <div>
                    <h3 className="font-display text-2xl">{p.title}</h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow">The journey</span>
            <h2 className="mt-4 font-display text-4xl md:text-6xl">A slow rise.</h2>
          </div>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {milestones.map((m) => (
            <div key={m.year} className="bg-card p-8">
              <div className="font-display text-5xl text-primary">{m.year}</div>
              <h3 className="mt-6 font-display text-xl">{m.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <div className="ink-gradient flex flex-col gap-8 rounded-[2.5rem] px-8 py-16 text-background md:flex-row md:items-center md:justify-between md:px-16 md:py-20">
          <h2 className="max-w-xl font-display text-3xl leading-tight text-background md:text-5xl">
            Taste the difference patience makes.
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-background md:self-auto"
          >
            Browse the catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
