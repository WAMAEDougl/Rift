import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { recipeCategories } from "@/lib/recipes";
import { getPublishedRecipeBySlug, getAllRecipeSlugs } from "@/lib/recipes-db";
import { getProductBySlug } from "@/lib/products";
import VideoEmbed from "@/components/recipes/VideoEmbed";
import { Clock, Users, ChefHat, ArrowLeft, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const slugs = await getAllRecipeSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getPublishedRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe Not Found" };
  return {
    title: `${recipe.title} | Ayola Foods KE Recipes`,
    description: recipe.excerpt,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getPublishedRecipeBySlug(slug);

  if (!recipe) notFound();

  const relatedProduct = recipe.relatedProduct
    ? getProductBySlug(recipe.relatedProduct)
    : null;

  const categoryLabel = recipeCategories.find(
    (c) => c.slug === recipe.category
  )?.label;

  const difficultyColor: Record<string, string> = {
    Easy: "bg-green-100 text-green-700",
    Medium: "bg-amber-100 text-amber-700",
    Advanced: "bg-red-100 text-red-700",
  };

  return (
    <>
      {/* Back link */}
      <div className="pt-24 pb-4 bg-sand">
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

      {/* Hero with Video */}
      <section className="pb-8 bg-sand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {categoryLabel}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor[recipe.difficulty]}`}
              >
                {recipe.difficulty}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-earth dark:text-white mb-4">
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

          {/* Video */}
          <VideoEmbed
            url={recipe.video.url}
            platform={recipe.video.platform}
            title={recipe.title}
            thumbnailUrl={recipe.video.thumbnailUrl}
          />
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-earth dark:prose-headings:text-white prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary">
                <ReactMarkdown>{recipe.content}</ReactMarkdown>
              </article>

              {/* Tags */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-2">
                  Tags
                </p>
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
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-transparent dark:border-amber-900/50">
                  <h3 className="text-lg font-bold text-earth dark:text-amber-400 mb-4">
                    Ingredients
                  </h3>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
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
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-transparent dark:border-green-900/50">
                  <h3 className="text-lg font-bold text-earth dark:text-green-400 mb-2">
                    Try This Product
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {relatedProduct.name}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {relatedProduct.description}
                  </p>
                  {relatedProduct.price > 0 && (
                    <p className="text-lg font-bold text-primary mb-3">
                      KES {relatedProduct.price.toLocaleString()}
                    </p>
                  )}
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" /> View Product
                  </Link>
                </div>
              )}

              {/* Share */}
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-earth dark:text-white mb-3">
                  Share This Recipe
                </h3>
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(recipe.title + " — Ayola Foods Kenya")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(recipe.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
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
