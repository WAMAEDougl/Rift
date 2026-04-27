// Static fallback data from the original target project
import {
  products as staticProducts,
  formatKES,
} from "@/data/products";

export { formatKES };

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  longDescription: string;
  price: number;
  size: string;
  image: string;
  features: string[];
  ingredients: string;
  nutritionHighlights: string[];
  badge?: string;
  inStock: boolean;
  // Legacy fields from target's original Product type
  tagline?: string;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  shipsCountrywide?: boolean;
  priceFrom?: number;
}

export const categories: Category[] = [
  {
    slug: "meals",
    name: "Meals",
    tagline: "Healthy, unconventional, delicious",
    icon: "🍽️",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    description:
      "Nutritious meal combos featuring unconventional proteins, heritage ugali, and gut-friendly sides.",
    priceFrom: 1200,
  },
  {
    slug: "beverages",
    name: "Beverages",
    tagline: "Gut health in every sip",
    icon: "🥤",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    description:
      "Fermented drinks and probiotic beverages formulated by a food scientist for digestive health and immunity.",
    priceFrom: 400,
  },
  {
    slug: "breakfast",
    name: "Breakfast",
    tagline: "Start your day right",
    icon: "🍳",
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50",
    description:
      "Healthy breakfast combos and light meal options to fuel your morning the Ayola way.",
    priceFrom: 850,
  },
];

export const products: Product[] = [
  {
    id: "heritage-jollof",
    name: "Heritage Jollof",
    slug: "heritage-jollof",
    tagline: "Smoky highland pepper rice",
    category: "Meals",
    categorySlug: "meals",
    description:
      "Smoky, slow-cooked rice infused with sun-ripened highland peppers, native bay and a whisper of locust bean.",
    longDescription:
      "Our Heritage Jollof is a celebration of West African culinary tradition — slow-cooked rice infused with sun-ripened highland peppers, native bay leaf, and a whisper of locust bean. Every grain absorbs the deep, smoky flavors of our signature spice blend.",
    price: 1200,
    size: "Full serving",
    image: "/images/products/heritage-jollof.jpg",
    features: ["Vegan", "Slow-Cooked", "Signature Spice Blend"],
    ingredients: "Basmati rice, highland peppers, native bay leaf, locust bean, natural spices",
    nutritionHighlights: ["Plant-based", "No MSG", "Rich in antioxidants"],
    badge: "Vegan",
    inStock: true,
  },
  {
    id: "savanna-maafe",
    name: "Savanna Maafe",
    slug: "savanna-maafe",
    tagline: "Velvet peanut & root stew",
    category: "Meals",
    categorySlug: "meals",
    description:
      "A velvety extraction of stone-ground peanuts, sweet potato, baobab and savanna spices.",
    longDescription:
      "Savanna Maafe is a rich, velvety peanut stew rooted in West African tradition. Stone-ground peanuts are combined with sweet potato, baobab, and a blend of savanna spices to create a deeply satisfying, nutrient-dense meal.",
    price: 1450,
    size: "Full serving",
    image: "/images/products/savanna-maafe.jpg",
    features: ["Gluten-Free", "High Protein", "Heritage Recipe"],
    ingredients: "Stone-ground peanuts, sweet potato, baobab, savanna spice blend, vegetables",
    nutritionHighlights: ["High protein", "Gluten-free", "Rich in healthy fats"],
    badge: "Gluten-Free",
    inStock: true,
  },
  {
    id: "royal-egusi",
    name: "Royal Egusi",
    slug: "royal-egusi",
    tagline: "Toasted melon seed broth",
    category: "Meals",
    categorySlug: "meals",
    description:
      "Toasted egusi seeds folded into wild spinach and a slow-simmered palm-fruit broth.",
    longDescription:
      "Royal Egusi is a West African classic elevated to its finest form. Toasted melon seeds are folded into wild spinach and a slow-simmered palm-fruit broth, creating a deeply flavored, protein-rich dish that has nourished generations.",
    price: 1800,
    size: "Full serving",
    image: "/images/products/royal-egusi.jpg",
    features: ["Protein-Rich", "Iron-Rich", "Traditional Recipe"],
    ingredients: "Egusi (melon seeds), wild spinach, palm-fruit broth, traditional spices",
    nutritionHighlights: ["High protein", "Iron-rich", "Rich in vitamins A & C"],
    badge: "Protein-Rich",
    inStock: true,
  },
  {
    id: "pounded-yam",
    name: "Pounded Yam & Ila",
    slug: "pounded-yam",
    tagline: "Hand-pounded with seafood okra",
    category: "Meals",
    categorySlug: "meals",
    description:
      "Smooth, hand-pounded yam paired with a fresh seafood okra broth fragrant with crayfish.",
    longDescription:
      "Pounded Yam & Ila is a beloved West African comfort food. Smooth, hand-pounded yam is paired with a fresh seafood okra broth fragrant with crayfish — a combination that is both deeply satisfying and nutritionally complete.",
    price: 1600,
    size: "Full serving",
    image: "/images/products/pounded-yam.jpg",
    features: ["Seafood", "Hand-Pounded", "Traditional"],
    ingredients: "Yam, okra, seafood (crayfish, fish), traditional spices",
    nutritionHighlights: ["High in potassium", "Good source of fiber", "Seafood protein"],
    inStock: true,
  },
  {
    id: "zobo-infusion",
    name: "Zobo Infusion",
    slug: "zobo-infusion",
    tagline: "Sun-dried hibiscus & ginger",
    category: "Beverages",
    categorySlug: "beverages",
    description:
      "Sun-dried hibiscus petals steeped with ginger, cloves and a thread of pineapple.",
    longDescription:
      "Zobo Infusion is a vibrant, naturally refreshing beverage made from sun-dried hibiscus petals steeped with ginger, cloves, and a thread of pineapple. Rich in antioxidants and vitamin C, it is as beautiful as it is delicious.",
    price: 400,
    size: "Per serving",
    image: "/images/products/zobo-infusion.jpg",
    features: ["Natural", "Antioxidant-Rich", "No Added Sugar"],
    ingredients: "Sun-dried hibiscus petals, ginger, cloves, pineapple, water",
    nutritionHighlights: ["Rich in antioxidants", "High in vitamin C", "No artificial additives"],
    badge: "Natural",
    inStock: true,
  },
  {
    id: "golden-puffs",
    name: "Golden Puffs",
    slug: "golden-puffs",
    tagline: "Yeasted dough, ginger glaze",
    category: "Breakfast",
    categorySlug: "breakfast",
    description:
      "Artisanal yeasted dough balls, fried until amber and finished with a warm ginger glaze.",
    longDescription:
      "Golden Puffs are artisanal yeasted dough balls, fried until perfectly amber and finished with a warm ginger glaze. A beloved breakfast treat that combines the comfort of fresh-fried dough with the warmth of ginger.",
    price: 850,
    size: "Per serving",
    image: "/images/products/golden-puffs.jpg",
    features: ["Artisanal", "Fresh-Made", "Ginger Glaze"],
    ingredients: "Wheat flour, yeast, ginger, natural sweetener, cooking oil",
    nutritionHighlights: ["Fresh ingredients", "No preservatives", "Artisanal quality"],
    inStock: true,
  },
];

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function formatPrice(price: number): string {
  if (price === 0) return "Contact Us";
  return `KES ${price.toLocaleString()}`;
}

// ============================================
// Database fetch functions (Supabase)
// Falls back to hardcoded data if DB is unavailable
// ============================================

export async function getProductsFromDB(): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/products`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return mapDBProducts(data.products);
  } catch {
    return products;
  }
}

export async function getCategoriesFromDB(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/categories`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    return data.categories;
  } catch {
    return categories;
  }
}

// Map DB product shape to frontend Product interface
export function mapDBProducts(dbProducts: Record<string, unknown>[]): Product[] {
  return dbProducts.map((p) => ({
    id: (p.legacy_id as string) || (p.id as string),
    name: p.name as string,
    slug: p.slug as string,
    category: ((p.category as Record<string, unknown>)?.name as string) || "",
    categorySlug: ((p.category as Record<string, unknown>)?.slug as string) || "",
    description: (p.description as string) || "",
    longDescription: (p.long_description as string) || "",
    price: p.price as number,
    size: (p.size as string) || "",
    image: (p.image_url as string) || "",
    features: (p.features as string[]) || [],
    ingredients: (p.ingredients as string) || "",
    nutritionHighlights: (p.nutrition_highlights as string[]) || [],
    badge: p.badge as string | undefined,
    inStock: p.in_stock as boolean,
  }));
}

// Re-export static products for use as fallback elsewhere
export { staticProducts };
