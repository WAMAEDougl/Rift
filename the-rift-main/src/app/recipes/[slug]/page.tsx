import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { recipes, getRecipeBySlug, recipeCategories } from "@/lib/recipes";
import { getProductBySlug, formatPrice } from "@/lib/products";
import { Clock, Users, ChefHat, ArrowLeft, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe Not Found" };
  return {
    title: recipe.title,
    description: recipe.excerpt,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) notFound();

  const relatedProduct = recipe.relatedProduct
    ? getProductBySlug(recipe.relatedProduct)
    : null;

  const categoryLabel = recipeCategories.find(
    (c) => c.slug === recipe.category
  )?.label;

  return (
    <>
      {/* Back link */}
      <div className="pt-24 pb-2 bg-muted/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Recipes
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="pb-8 bg-muted/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="eyebrow">{categoryLabel}</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground mb-4">
              {recipe.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{recipe.excerpt}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ChefHat className="w-4 h-4" /> {recipe.author}
              </span>
              {recipe.prepTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {recipe.prepTime}
                </span>
              )}
              {recipe.servings && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {recipe.servings}
                </span>
              )}
              <span className="text-muted-foreground/60">
                {new Date(recipe.date).toLocaleDateString("en-KE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              <article className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-medium prose-a:text-primary">
                <ReactMarkdown>{recipe.content}</ReactMarkdown>
              </article>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="eyebrow mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Ingredients */}
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="bg-muted/50 rounded-2xl p-6">
                  <h3 className="font-display text-lg font-medium text-foreground mb-4">
                    Ingredients
                  </h3>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ing, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Product */}
              {relatedProduct && (
                <div className="bg-secondary/5 rounded-2xl p-6 border border-secondary/20">
                  <h3 className="font-display text-lg font-medium text-foreground mb-2">
                    Try This Product
                  </h3>
                  <p className="text-sm font-medium text-foreground mb-1">
                    {relatedProduct.name}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {relatedProduct.description}
                  </p>
                  {relatedProduct.price > 0 && (
                    <p className="font-display text-lg text-primary mb-3">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  )}
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"
                  >
                    <ShoppingCart className="w-4 h-4" /> View Product
                  </Link>
                </div>
              )}

              {/* Share */}
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="font-display text-lg font-medium text-foreground mb-3">
                  Share This Recipe
                </h3>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(recipe.title + " — Ayola Foods Kenya")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(recipe.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
