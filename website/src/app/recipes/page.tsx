"use client";

import { useState } from "react";
import Link from "next/link";
import AnimatedSection from "@/components/AnimatedSection";
import VideoEmbed from "@/components/recipes/VideoEmbed";
import { recipes, recipeCategories, getRecipesByCategory } from "@/lib/recipes";
import { Clock, ChefHat, Users, ArrowRight } from "lucide-react";

export default function Recipes() {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = getRecipesByCategory(activeCategory);

  const difficultyColor: Record<string, string> = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-amber-100 text-amber-700",
    Advanced: "bg-red-100 text-red-700",
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-sand via-warm to-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider inline-flex items-center gap-2">
              <ChefHat className="w-4 h-4" /> Recipes & Videos
            </span>
            <h1 className="text-5xl sm:text-6xl font-bold text-earth mt-3 mb-4">
              Cook with Ayola
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Watch CEO Prisca Kiragu demonstrate our signature dishes, learn about
              gut health, and discover how to use Ayola products at home.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-20 z-30 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4 overflow-x-auto no-scrollbar">
            {recipeCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
                  activeCategory === cat.slug
                    ? "bg-primary text-white shadow-md"
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

      {/* Featured Video (first featured recipe) */}
      {activeCategory === "all" && (
        <section className="py-12 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              {(() => {
                const feat = recipes.find((r) => r.featured);
                if (!feat) return null;
                return (
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <VideoEmbed
                      url={feat.video.url}
                      platform={feat.video.platform}
                      title={feat.title}
                      thumbnailUrl={feat.video.thumbnailUrl}
                    />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Featured Recipe
                      </span>
                      <h2 className="text-3xl font-bold text-earth mt-2 mb-3">
                        {feat.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {feat.excerpt}
                      </p>
                      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                        {feat.prepTime && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {feat.prepTime}
                          </span>
                        )}
                        {feat.servings && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-4 h-4" /> {feat.servings}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            difficultyColor[feat.difficulty]
                          }`}
                        >
                          {feat.difficulty}
                        </span>
                      </div>
                      <Link
                        href={`/recipes/${feat.slug}`}
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
                      >
                        Full Recipe <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })()}
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Recipe Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((recipe, i) => (
              <AnimatedSection key={recipe.slug} delay={i * 0.05}>
                <article className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group">
                  {/* Video Thumbnail */}
                  <div className="relative">
                    <VideoEmbed
                      url={recipe.video.url}
                      platform={recipe.video.platform}
                      title={recipe.title}
                      thumbnailUrl={recipe.video.thumbnailUrl}
                      className="rounded-none"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          difficultyColor[recipe.difficulty]
                        }`}
                      >
                        {recipe.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground/60">
                        {recipeCategories.find((c) => c.slug === recipe.category)?.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
                      <Link href={`/recipes/${recipe.slug}`}>
                        {recipe.title}
                      </Link>
                    </h3>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {recipe.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                        {recipe.prepTime && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {recipe.prepTime}
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" /> {recipe.servings}
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
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
