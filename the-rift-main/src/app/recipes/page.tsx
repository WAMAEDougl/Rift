import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ChefHat, Users, ArrowRight } from "lucide-react";
import { recipes, recipeCategories } from "@/lib/recipes";
import RecipesClient from "./RecipesClient";

export const metadata: Metadata = {
  title: "Recipes from the Rift — Rift & Root",
  description:
    "Heritage African recipes from our kitchen — slow-cooked stews, sun-dried infusions, and pantry staples to make at home.",
  openGraph: {
    title: "Recipes from the Rift — Rift & Root",
    description: "Heritage African recipes — slow-cooked stews, infusions and staples.",
  },
};

export default function RecipesPage() {
  return (
    <>
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <span className="eyebrow inline-flex items-center gap-2">
            <ChefHat className="w-4 h-4" /> Recipes &amp; Videos
          </span>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
            Cook with Rift &amp; Root
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Watch CEO Prisca Kiragu demonstrate our signature dishes, learn about gut health,
            and discover how to use Rift &amp; Root products at home.
          </p>
        </div>
      </section>

      {/* Featured recipe */}
      {(() => {
        const feat = recipes.find((r) => r.featured);
        if (!feat) return null;
        return (
          <section className="mx-auto max-w-7xl px-6 py-20 lg:grid lg:grid-cols-12 lg:gap-12 lg:px-10">
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/11] overflow-hidden rounded-[2rem] bg-muted">
                <span className="absolute left-6 top-6 rounded-full bg-background/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest z-10">
                  Featured · {feat.category.replace("-", " ")}
                </span>
                <div className="flex h-full items-center justify-center text-6xl">
                  🍽️
                </div>
              </div>
            </div>
            <div className="mt-10 lg:col-span-5 lg:mt-0 lg:pt-8">
              <h2 className="font-display text-4xl leading-tight md:text-5xl">
                {feat.title}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {feat.excerpt}
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4 border-y border-border py-6">
                {feat.prepTime && (
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <Clock className="h-4 w-4" /> Time
                    </div>
                    <div className="mt-2 font-display text-xl">{feat.prepTime}</div>
                  </div>
                )}
                {feat.servings && (
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <Users className="h-4 w-4" /> Serves
                    </div>
                    <div className="mt-2 font-display text-xl">{feat.servings}</div>
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Level
                  </div>
                  <div className="mt-2 font-display text-xl">{feat.difficulty}</div>
                </div>
              </div>
              <Link
                href={`/recipes/${feat.slug}`}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-primary"
              >
                Read the recipe <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        );
      })()}

      {/* Interactive grid with category filter */}
      <RecipesClient recipes={recipes} categories={recipeCategories} />
    </>
  );
}
