import { notFound } from "next/navigation";
import Link from "next/link";
import { recipeCategories } from "@/lib/recipes";
import { getPublishedRecipeBySlug, getAllRecipeSlugs } from "@/lib/recipes-db";
import { getProductBySlug } from "@/lib/products";
import VideoEmbed from "@/components/recipes/VideoEmbed";
import { Clock, Users, ChefHat, ArrowLeft, ShoppingCart, ExternalLink } from "lucide-react";
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
    openGraph: recipe.coverImageUrl
      ? { images: [{ url: recipe.coverImageUrl }] }
      : undefined,
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

      {/* Hero — cover image or video */}
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
            {/* Excerpt rendered as HTML */}
            {recipe.excerpt && (
              <div
                className="text-lg text-muted-foreground mb-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: recipe.excerpt }}
              />
            )}
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

          {/* Cover image (if no video) */}
          {!recipe.video && recipe.coverImageUrl && (
            <div className="rounded-2xl overflow-hidden aspect-video bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={recipe.coverImageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Video embed */}
          {recipe.video && (
            <VideoEmbed
              url={recipe.video.url}
              platform={recipe.video.platform}
              title={recipe.title}
              thumbnailUrl={recipe.video.thumbnailUrl ?? recipe.coverImageUrl}
            />
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Render content as HTML (admin uses rich text editor) */}
              <article
                className="prose prose-lg max-w-none prose-headings:text-earth prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: recipe.content }}
              />

              {/* Tags */}
              {recipe.tags.length > 0 && (
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
              )}
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

              {/* Related Product — proper link to product page */}
              {relatedProduct && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">
                    Featured in this recipe
                  </p>
                  <h3 className="text-base font-bold text-earth mb-2">
                    {relatedProduct.name}
                  </h3>
                  {relatedProduct.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {relatedProduct.description}
                    </p>
                  )}
                  {relatedProduct.price > 0 && (
                    <p className="text-lg font-bold text-primary mb-4">
                      KES {relatedProduct.price.toLocaleString()}
                    </p>
                  )}
                  <Link
                    href={`/products/${relatedProduct.slug}`}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors w-full justify-center"
                  >
                    <ShoppingCart className="w-4 h-4" /> View Product
                  </Link>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-2 justify-center w-full"
                  >
                    Browse all products <ExternalLink className="w-3 h-3" />
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
                    className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors text-center"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(recipe.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors text-center"
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
