/**
 * RecipeRow represents a single row from the Supabase `recipes` table.
 * All column names use snake_case to match the database schema.
 */
export interface RecipeRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: "cooking-demo" | "beverage" | "how-to" | "health-tip";
  video_url: string;
  video_platform: "youtube" | "facebook" | "instagram" | "tiktok";
  video_thumbnail_url: string | null;
  prep_time: string | null;
  servings: string | null;
  difficulty: "Easy" | "Medium" | "Advanced";
  ingredients: string[] | null;
  tags: string[];
  author: string;
  date: string;
  featured: boolean;
  related_product: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
