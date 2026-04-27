"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Users, ArrowRight } from "lucide-react";
import type { Recipe } from "@/lib/recipes";

interface RecipesClientProps {
  recipes: Recipe[];
  categories: { slug: string; label: string; icon: string }[];
}

export default function RecipesClient({ recipes, categories }: RecipesClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? recipes
      : recipes.filter((r) => r.category === activeCategory);

  return (
    <>
      {/* Category Filter */}
      <section className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recipe Grid */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <article
              key={recipe.slug}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-card transition-all"
            >
              <div className="relative aspect-[4/3] bg-muted flex items-center justify-center text-5xl">
                {recipe.category === "beverage"
                  ? "🥤"
                  : recipe.category === "health-tip"
                    ? "💚"
                    : recipe.category === "how-to"
                      ? "📖"
                      : "🍽️"}
                <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                  {recipe.difficulty}
                </span>
              </div>

              <div className="p-5">
                <h3 className="font-display text-xl leading-tight group-hover:text-primary transition-colors">
                  <Link href={`/recipes/${recipe.slug}`}>{recipe.title}</Link>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {recipe.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {recipe.prepTime && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {recipe.prepTime}
                      </span>
                    )}
                    {recipe.servings && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" /> {recipe.servings}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/recipes/${recipe.slug}`}
                    className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
