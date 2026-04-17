/**
 * Server-side Supabase data-fetching helpers for public recipe pages.
 * Uses the public (anon key) server client — read-only queries on published recipes.
 */

import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Recipe } from "@/lib/recipes";
import type { Database } from "@/lib/supabase/types";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
type RecipeCategory = Database["public"]["Tables"]["recipes"]["Row"]["category"];

/** Map a DB row (snake_case) to the Recipe interface (camelCase nested shape). */
function mapRowToRecipe(row: RecipeRow): Recipe {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    ...(row.cover_image_url != null ? { coverImageUrl: row.cover_image_url } : {}),
    category: row.category,
    // video is optional — only include if video_url is present
    ...(row.video_url != null ? {
      video: {
        url: row.video_url,
        platform: row.video_platform,
        ...(row.video_thumbnail_url != null
          ? { thumbnailUrl: row.video_thumbnail_url }
          : {}),
      },
    } : {}),
    ...(row.prep_time != null ? { prepTime: row.prep_time } : {}),
    ...(row.servings != null ? { servings: row.servings } : {}),
    difficulty: row.difficulty,
    ...(row.ingredients != null ? { ingredients: row.ingredients } : {}),
    tags: row.tags,
    author: row.author,
    date: row.date,
    ...(row.featured ? { featured: row.featured } : {}),
    ...(row.related_product != null
      ? { relatedProduct: row.related_product }
      : {}),
  };
}

/**
 * Fetch all published recipes, optionally filtered by category.
 * Ordered by date descending (newest first).
 *
 * Satisfies Requirements 8.1, 8.3
 */
export async function getPublishedRecipes(category?: string): Promise<Recipe[]> {
  const supabase = await createClient();

  let query = supabase
    .from("recipes")
    .select("*")
    .eq("is_published", true)
    .order("date", { ascending: false });

  if (category && category !== "all") {
    query = query.eq("category", category as RecipeCategory);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[recipes-db] getPublishedRecipes error:", error.message);
    return [];
  }

  return ((data ?? []) as RecipeRow[]).map(mapRowToRecipe);
}

/**
 * Fetch a single published recipe by slug.
 * Returns null if not found or not published.
 *
 * Satisfies Requirements 8.2, 8.3
 */
export async function getPublishedRecipeBySlug(
  slug: string
): Promise<Recipe | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) {
    // PGRST116 = no rows found — not an unexpected error
    if (error.code !== "PGRST116") {
      console.error(
        "[recipes-db] getPublishedRecipeBySlug error:",
        error.message
      );
    }
    return null;
  }

  return data ? mapRowToRecipe(data as RecipeRow) : null;
}

/**
 * Return all recipe slugs for use with generateStaticParams.
 * Uses the browser (anon) client — no cookies needed, safe at build time.
 *
 * Satisfies Requirement 8.4
 */
export async function getAllRecipeSlugs(): Promise<string[]> {
  // Use the browser client here — generateStaticParams runs at build time
  // outside a request scope, so cookies() cannot be called.
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("slug")
    .eq("is_published", true);

  if (error) {
    console.error("[recipes-db] getAllRecipeSlugs error:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.slug);
}
