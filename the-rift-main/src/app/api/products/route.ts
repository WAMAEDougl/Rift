import { getServiceClient, apiSuccess } from "@/lib/utils/api";
import { products as fallbackProducts, categories as fallbackCategories } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const supabase = getServiceClient();

    let categoryId: string | null = null;
    if (category) {
      const { data: cats } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category)
        .limit(1);
      categoryId = cats?.[0]?.id ?? null;
    }

    let query = supabase
      .from("products")
      .select(`*, category:categories(*)`)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return apiSuccess({ products: data }, 60);
  } catch {
    // Fallback to static data
    let filtered = fallbackProducts;
    if (category) {
      filtered = fallbackProducts.filter((p) => p.categorySlug === category);
    }

    return apiSuccess({
      products: filtered.map((p) => ({
        ...p,
        category: fallbackCategories.find((c) => c.slug === p.categorySlug),
      })),
    });
  }
}
