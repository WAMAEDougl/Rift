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
    slug: "packaged",
    name: "Packaged Flour Blends",
    tagline: "Heritage nutrition, shipped countrywide",
    icon: "🌾",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    description:
      "Special ugali and uji flour blends — healthier alternatives to standard flour. Available for countrywide delivery.",
    shipsCountrywide: true,
    priceFrom: 250,
  },
  {
    slug: "meals",
    name: "Ready Meals & Combos",
    tagline: "Healthy, unconventional, delicious",
    icon: "🍽️",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    description:
      "Nutritious meal combos featuring unconventional proteins, heritage ugali, and gut-friendly sides. Dine in at Kahawa Sukari.",
    priceFrom: 500,
  },
  {
    slug: "beverages",
    name: "Probiotic Beverages",
    tagline: "Gut health in every sip",
    icon: "🥤",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
    description:
      "Fermented drinks and probiotic beverages formulated by a food scientist for digestive health and immunity.",
    priceFrom: 120,
  },
  {
    slug: "breakfast",
    name: "Breakfast & Light Meals",
    tagline: "Start your day right",
    icon: "🍳",
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-50",
    description:
      "Healthy breakfast combos and light meal options to fuel your morning the Ayola way.",
    priceFrom: 400,
  },
];

export const products: Product[] = [
  // READY MEALS
  {
    id: "meal-001",
    name: "Pilau — Spiced Up Edition",
    slug: "pilau-spiced-up",
    category: "Ready Meals & Combos",
    categorySlug: "meals",
    description:
      "Our recently reintroduced pilau — richly spiced with Ayola's signature blend. A customer favorite that's back and better than ever.",
    longDescription:
      "Ayola's pilau has been reimagined with a bolder spice profile and premium ingredients. Slow-cooked with aromatic spices, served as a complete combo with your choice of protein. This is pilau the healthy way — all the flavor, better nutrition.",
    price: 600,
    size: "Full combo",
    image: "/images/products/pilau-combo.jpg",
    features: ["Signature Spice Blend", "Full Combo", "Customer Favorite"],
    ingredients: "Basmati rice, spice blend (cumin, cardamom, cinnamon, cloves), minced meat, vegetables, natural seasonings",
    nutritionHighlights: ["High protein", "No MSG", "Natural spices", "Balanced meal"],
    badge: "Back & Better",
    inStock: true,
  },
  {
    id: "meal-002",
    name: "Rabbit Wet Fry Combo",
    slug: "rabbit-wet-fry",
    category: "Ready Meals & Combos",
    categorySlug: "meals",
    description:
      "Tender rabbit wet fry served with fresh greens and Ayola's special ugali blend. Unconventional protein, exceptional nutrition.",
    longDescription:
      "Rabbit is one of the healthiest meats available — high in protein, low in fat, and rich in B-vitamins. Our wet fry preparation brings out incredible flavor, served with traditional greens and our proprietary ugali blend for a meal that's as nutritious as it is delicious.",
    price: 800,
    size: "Full combo",
    image: "/images/products/rabbit-combo.jpg",
    features: ["High Protein", "Low Fat Meat", "With Special Ugali"],
    ingredients: "Farm-raised rabbit, tomatoes, onions, garlic, ginger, bell peppers, traditional greens, Ayola special ugali",
    nutritionHighlights: ["Lean protein (rabbit)", "Low cholesterol", "Iron-rich greens", "Heritage ugali"],
    badge: "Signature Dish",
    inStock: true,
  },
  {
    id: "meal-003",
    name: "Turkey Eggs + Toasted Bread + Afkeido Combo",
    slug: "turkey-eggs-afkeido",
    category: "Ready Meals & Combos",
    categorySlug: "meals",
    description:
      "An unconventional protein powerhouse — turkey eggs paired with toasted bread and our Afkeido mix. Nutrition you won't find anywhere else.",
    longDescription:
      "Turkey eggs are larger, richer, and more nutrient-dense than chicken eggs — packed with protein, B12, and selenium. Paired with artisan toasted bread and our signature Afkeido blend, this combo delivers serious nutrition with bold, satisfying flavors.",
    price: 600,
    size: "Full combo",
    image: "/images/products/turkey-eggs-combo.jpg",
    features: ["Turkey Eggs", "Afkeido Blend", "Unconventional"],
    ingredients: "Turkey eggs, artisan bread, Afkeido blend, vegetables, natural seasonings",
    nutritionHighlights: ["Higher protein than chicken eggs", "Rich in B12", "Selenium-rich", "Unique combo"],
    badge: "Unique",
    inStock: true,
  },
  {
    id: "meal-004",
    name: "Vegetarian / Vegan Combo",
    slug: "vegan-combo",
    category: "Ready Meals & Combos",
    categorySlug: "meals",
    description:
      "A hearty plant-based meal combo with heritage grains, fresh vegetables, and gut-friendly sides. Proof that healthy can be delicious.",
    longDescription:
      "Our vegetarian and vegan options are crafted to be satisfying and nutrient-complete — not an afterthought. Featuring heritage grains, legumes, fresh seasonal vegetables, and our special ugali or porridge, these combos are perfect for plant-based eaters and anyone wanting a lighter, healthier meal.",
    price: 500,
    size: "Full combo",
    image: "/images/products/vegan-combo.jpg",
    features: ["Plant-Based", "Gut-Friendly", "Heritage Grains"],
    ingredients: "Seasonal vegetables, heritage grains, legumes, Ayola special ugali, natural seasonings",
    nutritionHighlights: ["Plant protein", "High fiber", "Rich in vitamins", "Low cholesterol"],
    inStock: true,
  },

  // BEVERAGES
  {
    id: "bev-001",
    name: "Plantain Probiotic Kvass",
    slug: "plantain-kvass",
    category: "Probiotic Beverages",
    categorySlug: "beverages",
    description:
      "Kenya's first plantain-based probiotic beverage — fermented for gut health, immunity, and digestion. Formulated by a food scientist.",
    longDescription:
      "Kvass is a traditional fermented beverage, and Ayola has innovated it using plantain — rich in resistant starch (a powerful prebiotic). Our plantain probiotic kvass is naturally fermented to produce beneficial bacteria that support gut health, improve digestion, and boost immunity. Formulated by founder Prisca Kiragu (Food Scientist, JKUAT) using evidence-based fermentation science.",
    price: 200,
    size: "Per serving",
    image: "/images/products/plantain-kvass.jpg",
    features: ["Probiotic", "Gut Health", "First in Kenya"],
    ingredients: "Plantain, filtered water, natural fermentation cultures, honey",
    nutritionHighlights: ["Live probiotics", "Prebiotic fiber", "Supports immunity", "Aids digestion"],
    badge: "First in Kenya",
    inStock: true,
  },
  {
    id: "bev-002",
    name: "Synbiotic Porridge",
    slug: "synbiotic-porridge",
    category: "Probiotic Beverages",
    categorySlug: "beverages",
    description:
      "Fermented porridge combining probiotics AND prebiotics — a synbiotic powerhouse for gut health and digestive wellness.",
    longDescription:
      "Synbiotics combine probiotics (beneficial bacteria) with prebiotics (food for those bacteria) for maximum gut health impact. Our synbiotic porridge is carefully fermented using heritage grains to create a delicious, drinkable porridge that actively improves your digestive function. This is food as medicine — backed by food science.",
    price: 150,
    size: "Per serving",
    image: "/images/products/synbiotic-porridge.jpg",
    features: ["Synbiotic", "Fermented", "Digestive Wellness"],
    ingredients: "Finger millet, sorghum, fermentation cultures (Lactobacillus), prebiotic fiber, natural sweetener",
    nutritionHighlights: ["Probiotics + prebiotics", "Improves digestion", "Heritage grains", "Immune support"],
    badge: "Science-Backed",
    inStock: true,
  },
  {
    id: "bev-003",
    name: "Goat Milk Tea",
    slug: "goat-milk-tea",
    category: "Probiotic Beverages",
    categorySlug: "beverages",
    description:
      "Fresh goat milk chai — easier to digest than cow's milk, naturally rich in nutrients, and absolutely delicious.",
    longDescription:
      "Goat milk is naturally homogenized (smaller fat globules) making it easier to digest than cow's milk. It's rich in calcium, potassium, and vitamins A and B2. Our goat milk tea combines fresh goat milk with premium Kenyan tea and warming spices for a chai experience that's both comforting and nutritious.",
    price: 150,
    size: "Per cup",
    image: "/images/products/goat-milk-tea.jpg",
    features: ["Easier to Digest", "Fresh Goat Milk", "Nutrient-Rich"],
    ingredients: "Fresh goat milk, Kenyan black tea, ginger, cardamom, cinnamon, honey",
    nutritionHighlights: ["High calcium", "Easy digestion", "Rich in potassium", "Vitamin A & B2"],
    inStock: true,
  },
  {
    id: "bev-004",
    name: "Special Uji (Porridge Drink)",
    slug: "special-uji-drink",
    category: "Probiotic Beverages",
    categorySlug: "beverages",
    description:
      "Ayola's signature porridge drink — made from our special grain blend for sustained energy and great taste.",
    longDescription:
      "Our special uji is more than just porridge — it's a carefully formulated blend of indigenous grains that provides sustained energy, essential minerals, and great taste. Perfect as a morning drink or an afternoon pick-me-up. Made from the same blend we sell as our packaged uji flour.",
    price: 120,
    size: "Per serving",
    image: "/images/products/special-uji.jpg",
    features: ["Heritage Grains", "Sustained Energy", "Great Taste"],
    ingredients: "Ayola special uji blend (finger millet, sorghum, amaranth), milk, honey, cinnamon",
    nutritionHighlights: ["High in iron", "Sustained energy", "B-vitamins", "Multi-grain nutrition"],
    inStock: true,
  },

  // PACKAGED PRODUCTS
  {
    id: "pkg-001",
    name: "Ayola Special Ugali Blend",
    slug: "ayola-ugali-blend",
    category: "Packaged Flour Blends",
    categorySlug: "packaged",
    description:
      "Our proprietary ugali flour blend — healthier than standard maize flour, with a smooth texture and enhanced nutrition. Shipped countrywide.",
    longDescription:
      "Ayola's Special Ugali Blend is a carefully formulated flour mix that produces healthier ugali with enhanced nutritional value. Developed by food scientist Prisca Kiragu, this blend combines traditional maize with nutrient-dense indigenous grains for a ugali that looks, feels, and tastes familiar — but delivers significantly more nutrition. Customers also use it for healthier bread and other baked goods.",
    price: 250,
    size: "Per pack",
    image: "/images/products/ugali-blend.jpg",
    features: ["Enhanced Nutrition", "Ships Countrywide", "Versatile"],
    ingredients: "Proprietary blend of maize flour, indigenous grains, and natural fortification",
    nutritionHighlights: ["More iron than standard ugali", "Added fiber", "Enhanced minerals", "Smooth texture"],
    badge: "Best Seller",
    inStock: true,
  },
  {
    id: "pkg-002",
    name: "Ayola Special Uji Blend",
    slug: "ayola-uji-blend",
    category: "Packaged Flour Blends",
    categorySlug: "packaged",
    description:
      "Premium porridge flour blend — our signature uji mix formulated for gut health, energy, and exceptional taste. Shipped countrywide.",
    longDescription:
      "This is the same blend we use in our restaurant — now available as a packaged product shipped anywhere in Kenya. Our Special Uji Blend is a food scientist-formulated mix of heritage grains optimized for nutrition and taste. Customers love it for morning porridge, and many use it as a base for healthier baking. Each batch is carefully blended to ensure consistency.",
    price: 600,
    size: "Per pack",
    image: "/images/products/uji-blend.jpg",
    features: ["Food Scientist Formulated", "Ships Countrywide", "Gut Health"],
    ingredients: "Proprietary blend of finger millet, sorghum, amaranth, and natural fortification",
    nutritionHighlights: ["High in iron & calcium", "Heritage grains", "Gut-friendly", "Sustained energy"],
    badge: "Premium",
    inStock: true,
  },
  {
    id: "pkg-003",
    name: "Custom Flour Blend",
    slug: "custom-flour-blend",
    category: "Packaged Flour Blends",
    categorySlug: "packaged",
    description:
      "Custom-formulated flour blends for specific health needs — customers use for healthier bread, pancakes, and more.",
    longDescription:
      "Need something specific? Our food scientist can formulate custom flour blends tailored to your dietary needs — whether it's higher protein, more fiber, gluten-free alternatives, or specialized blends for baking healthier bread. Contact us via WhatsApp to discuss your needs.",
    price: 0,
    size: "Custom",
    image: "/images/products/custom-blend.jpg",
    features: ["Custom Formulation", "Health-Specific", "By a Food Scientist"],
    ingredients: "Custom — varies based on client needs",
    nutritionHighlights: ["Tailored nutrition", "Specific health goals", "Expert formulation", "Flexible"],
    badge: "Custom Order",
    inStock: true,
  },

  // BREAKFAST
  {
    id: "bfast-001",
    name: "Healthy Breakfast Combo",
    slug: "healthy-breakfast",
    category: "Breakfast & Light Meals",
    categorySlug: "breakfast",
    description:
      "Start your day the Ayola way — a balanced breakfast combo with protein, whole grains, and fresh ingredients.",
    longDescription:
      "Our breakfast combos are designed to give you sustained energy throughout the morning without the crash that comes from sugary or processed breakfasts. Featuring whole grains, quality protein, fresh vegetables, and our signature beverages, it's the healthiest way to start your day in Kahawa Sukari.",
    price: 400,
    size: "Full breakfast",
    image: "/images/products/breakfast-combo.jpg",
    features: ["Balanced", "Sustained Energy", "Fresh Ingredients"],
    ingredients: "Varies daily — eggs, whole grain bread, vegetables, Ayola beverage",
    nutritionHighlights: ["Balanced macros", "No refined sugar", "Whole grains", "Fresh & local"],
    inStock: true,
  },
  {
    id: "bfast-002",
    name: "Heavy Meal Combo",
    slug: "heavy-meal-combo",
    category: "Breakfast & Light Meals",
    categorySlug: "breakfast",
    description:
      "For those who need a serious meal — our heavy combo packs nutrition and flavor for the hungriest appetite.",
    longDescription:
      "When you need real fuel, our heavy meal combo delivers. Generous portions of protein, our special ugali or grain accompaniment, fresh vegetables, and a beverage — this is a full, satisfying meal that also happens to be healthy. Perfect for lunch or an early dinner.",
    price: 800,
    size: "Heavy combo",
    image: "/images/products/heavy-meal.jpg",
    features: ["Generous Portions", "High Protein", "Full Meal"],
    ingredients: "Premium protein (varies), Ayola special ugali, vegetables, side, beverage",
    nutritionHighlights: ["High protein", "Balanced nutrition", "Satisfying portions", "Quality ingredients"],
    badge: "Full Meal",
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
function mapDBProducts(dbProducts: Record<string, unknown>[]): Product[] {
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
