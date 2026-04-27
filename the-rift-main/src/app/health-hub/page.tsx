import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Microscope, Wheat, Leaf, Brain, ShieldCheck, ArrowRight } from "lucide-react";
import HeroSlideshow from "@/components/HeroSlideshow";

export const metadata: Metadata = {
  title: "Health Hub — AyolaFoods",
  description:
    "Learn about gut health, probiotics, indigenous grains, and the food science behind Ayola Foods products. Education from a certified food scientist.",
};

const topics = [
  {
    icon: Microscope,
    title: "Gut Health 101",
    description: "Your gut contains trillions of bacteria that affect your digestion, immunity, mood, and energy. A healthy gut microbiome is the foundation of overall health.",
    keyPoints: [
      "70% of your immune system lives in your gut",
      "Gut bacteria influence mental health (gut-brain axis)",
      "Processed foods damage gut bacteria diversity",
      "Fermented foods restore beneficial bacteria",
    ],
    ayolaProduct: "Synbiotic Porridge",
  },
  {
    icon: Heart,
    title: "Why Probiotics Matter",
    description: "Probiotics are live beneficial bacteria that improve your digestive health. They're found in fermented foods — exactly what Ayola specializes in.",
    keyPoints: [
      "Probiotics improve nutrient absorption by up to 30%",
      "They reduce bloating, gas, and digestive discomfort",
      "Regular intake strengthens immune response",
      "Fermented drinks deliver probiotics more effectively than capsules",
    ],
    ayolaProduct: "Plantain Probiotic Kvass",
  },
  {
    icon: Wheat,
    title: "Indigenous Grains of Kenya",
    description: "Finger millet, sorghum, and amaranth were staple foods for generations. Modern Kenyans are rediscovering their incredible nutritional value.",
    keyPoints: [
      "Finger millet has 10x more calcium than wheat",
      "Sorghum is naturally gluten-free and antioxidant-rich",
      "Amaranth is a complete protein (all essential amino acids)",
      "These grains have lower glycemic index than refined flour",
    ],
    ayolaProduct: "Ayola Special Uji Blend",
  },
  {
    icon: Leaf,
    title: "Synbiotics: The Next Level",
    description: "Synbiotics combine probiotics (beneficial bacteria) with prebiotics (food for those bacteria). It's the most effective way to improve gut health.",
    keyPoints: [
      "Prebiotics feed probiotics, helping them survive and multiply",
      "Plantain is rich in resistant starch — a powerful prebiotic",
      "Heritage grains like finger millet are natural prebiotic sources",
      "Synbiotic foods are more effective than taking supplements separately",
    ],
    ayolaProduct: "Synbiotic Porridge",
  },
  {
    icon: Brain,
    title: "Food as Medicine",
    description: "The idea that food can heal isn't new — it's how our grandmothers lived. Modern food science is proving what African traditions always knew.",
    keyPoints: [
      "Fermented porridge has been used in Africa for centuries for health",
      "Goat milk is easier to digest and richer in nutrients than cow milk",
      "Rabbit meat has the lowest fat content of any common meat",
      "Turkey eggs contain more protein and vitamins than chicken eggs",
    ],
    ayolaProduct: "Rabbit Wet Fry Combo",
  },
  {
    icon: ShieldCheck,
    title: "The Food Scientist Difference",
    description: "Every Ayola product is formulated by Prisca Kiragu, a trained food scientist from JKUAT. This means evidence-based formulation, not guesswork.",
    keyPoints: [
      "Controlled fermentation for consistent probiotic counts",
      "Precise grain blending ratios for optimal nutrition",
      "Food safety protocols from ingredient sourcing to serving",
      "Ongoing research into new indigenous ingredient applications",
    ],
    ayolaProduct: "All Ayola Products",
  },
];

const dietaryGuides = [
  { title: "Gut Health Diet", description: "Best Ayola products for improving digestion", products: ["Synbiotic Porridge", "Plantain Kvass", "Uji Blend"] },
  { title: "High Protein", description: "For athletes and fitness enthusiasts", products: ["Rabbit Wet Fry", "Turkey Eggs Combo", "Heavy Meal Combo"] },
  { title: "Vegetarian/Vegan", description: "Complete plant-based nutrition", products: ["Vegan Combo", "Plantain Kvass", "Ugali Blend", "Uji Blend"] },
  { title: "Weight Management", description: "Lower calorie, higher nutrition options", products: ["Synbiotic Porridge", "Vegan Combo", "Goat Milk Tea"] },
];

export default function HealthHubPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden border-b border-border">
        <HeroSlideshow gradient="top" showControls={false} />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <span className="eyebrow text-accent/80 inline-flex items-center gap-2">
            <Heart className="w-4 h-4" /> Health Hub
          </span>
          <h1 className="mt-6 font-display text-5xl sm:text-6xl font-medium text-white">
            The Science of Eating Well
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl text-lg">
            Understand the food science behind our products. Written by food scientist
            Prisca Kiragu (JKUAT) — real knowledge, not marketing hype.
          </p>
        </div>
      </section>

      {/* Topics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {topics.map((topic, i) => (
              <div
                key={topic.title}
                className={`grid lg:grid-cols-2 gap-10 items-center`}
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <topic.icon className="w-8 h-8" />
                  </div>
                  <h2 className="font-display text-3xl font-medium text-foreground mb-3">
                    {topic.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {topic.description}
                  </p>
                  <ul className="space-y-3">
                    {topic.keyPoints.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-foreground/80 text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground/60">
                    Try it:{" "}
                    <span className="text-primary font-semibold">{topic.ayolaProduct}</span>
                  </p>
                </div>
                <div
                  className={`bg-muted rounded-3xl p-12 flex items-center justify-center aspect-square max-h-80 ${i % 2 === 1 ? "lg:order-1" : ""}`}
                >
                  <topic.icon className="w-24 h-24 text-primary/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dietary Guides */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-medium text-foreground mb-3">
              Dietary Guides
            </h2>
            <p className="text-muted-foreground">
              Find the right Ayola products for your health goals.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dietaryGuides.map((guide) => (
              <div key={guide.title} className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-medium text-foreground mb-1">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{guide.description}</p>
                <ul className="space-y-1.5">
                  {guide.products.map((p) => (
                    <li key={p} className="text-sm text-primary font-medium">
                      • {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary text-secondary-foreground text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium mb-4">
            Ready to Eat Healthier?
          </h2>
          <p className="text-secondary-foreground/80 mb-8 text-lg">
            Every Ayola product is designed with your health in mind. Start your journey today.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-background px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-accent"
            >
              Shop Products <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 rounded-full border-2 border-secondary-foreground/30 px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-foreground transition hover:bg-secondary-foreground/10"
            >
              Watch Recipes
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
