import { getServiceClient, apiSuccess } from "@/lib/utils/api";
import { categories as fallbackCategories } from "@/lib/products";

export async function GET() {
  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return apiSuccess({ categories: data }, 300);
  } catch {
    return apiSuccess({ categories: fallbackCategories });
  }
}
