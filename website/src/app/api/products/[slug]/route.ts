import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/utils/api";
import { products as fallbackProducts, categories as fallbackCategories } from "@/lib/products";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from("products")
      .select(`*, category:categories(*)`)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      // Fallback to hardcoded data
      const product = fallbackProducts.find((p) => p.slug === slug);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({
        product: {
          ...product,
          category: fallbackCategories.find((c) => c.slug === product.categorySlug),
        },
      });
    }

    return NextResponse.json({ product: data });
  } catch {
    // Fallback to hardcoded data
    const product = fallbackProducts.find((p) => p.slug === slug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({
      product: {
        ...product,
        category: fallbackCategories.find((c) => c.slug === product.categorySlug),
      },
    });
  }
}
