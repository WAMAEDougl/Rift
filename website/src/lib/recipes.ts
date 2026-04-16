export interface Recipe {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category: "cooking-demo" | "beverage" | "how-to" | "health-tip";
  video?: {
    url: string;
    platform: "youtube" | "facebook" | "instagram" | "tiktok";
    thumbnailUrl?: string;
  };
  prepTime?: string;
  servings?: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  ingredients?: string[];
  tags: string[];
  author: string;
  date: string;
  featured?: boolean;
  relatedProduct?: string;
}

export const recipeCategories = [
  { slug: "all", label: "All Recipes", icon: "🍽️" },
  { slug: "cooking-demo", label: "Cooking Demos", icon: "👩‍🍳" },
  { slug: "beverage", label: "Beverages", icon: "🥤" },
  { slug: "how-to", label: "How-To Guides", icon: "📖" },
  { slug: "health-tip", label: "Health Tips", icon: "💚" },
];

export const recipes: Recipe[] = [
  {
    slug: "ceo-making-pilau",
    title: "CEO Making Pilau — Ayola's Signature Spiced Rice",
    excerpt:
      "Watch Prisca Kiragu prepare Ayola's signature pilau from scratch — richly spiced, healthy, and absolutely delicious.",
    content: `
## Ayola's Signature Pilau

Our pilau is one of the most requested dishes at Ayola Foods. In this video, CEO and food scientist Prisca Kiragu takes you through the preparation — from toasting the whole spices to the final plating.

### What Makes Ayola Pilau Different

Unlike regular pilau, we use:
- **Whole spices** (cumin seeds, cardamom pods, cinnamon sticks, cloves) — no pre-ground shortcuts
- **Premium basmati rice** for that perfect grain separation
- **Natural seasonings only** — zero MSG
- **Balanced protein** with quality minced meat and vegetables

### Tips from Chef Prisca

1. Always toast your whole spices in hot oil first — this releases their essential oils
2. Use basmati rice and wash it 3 times before cooking
3. The water-to-rice ratio is key: 1.5 cups water per 1 cup rice for pilau
4. Let it steam on low heat for the last 10 minutes — don't lift the lid!

*Come try the real thing at our restaurant in Kahawa Sukari, or order for delivery!*
`,
    category: "cooking-demo",
    video: {
      url: "https://www.youtube.com/watch?v=0RmZ4vwpAME",
      platform: "youtube",
    },
    prepTime: "45 mins",
    servings: "4-6 servings",
    difficulty: "Medium",
    ingredients: [
      "2 cups basmati rice",
      "300g minced meat",
      "2 onions, sliced",
      "3 tomatoes, diced",
      "Cumin seeds, cardamom, cinnamon, cloves",
      "Garlic and ginger paste",
      "Salt to taste",
      "3 cups water",
      "Cooking oil",
    ],
    tags: ["pilau", "rice", "main course", "signature"],
    author: "Prisca Kiragu",
    date: "2026-02-15",
    featured: true,
    relatedProduct: "pilau-spiced-up",
  },
  {
    slug: "synbiotic-porridge-benefits",
    title: "Synbiotic Porridge — Why Your Gut Needs This",
    excerpt:
      "Learn how our fermented synbiotic porridge combines probiotics and prebiotics to transform your digestive health.",
    content: `
## What is Synbiotic Porridge?

**Synbiotic** means combining **probiotics** (beneficial live bacteria) with **prebiotics** (food for those bacteria). When you consume both together, the probiotics survive better and work harder in your gut.

### Why Fermented Porridge?

Traditional Kenyan fermented porridge (uji wa kuchemsha) has been around for generations. At Ayola, we've taken this ancestral wisdom and applied modern food science:

1. **Controlled fermentation** using specific Lactobacillus strains
2. **Heritage grains** — finger millet and sorghum provide natural prebiotic fiber
3. **Optimal fermentation time** — 24-48 hours for maximum probiotic count
4. **No artificial preservatives** — fresh-made daily at our kitchen

### Health Benefits

- **Improved digestion** — probiotics break down food more efficiently
- **Stronger immunity** — 70% of your immune system is in your gut
- **Better nutrient absorption** — fermentation makes minerals more bioavailable
- **Reduced bloating** — balanced gut flora reduces gas and discomfort

### How to Enjoy It

Our synbiotic porridge is served warm at the restaurant, or you can use our **Ayola Special Uji Blend** at home and ferment it yourself following our method.

*Available daily at Ayola Foods, Ruhan Plaza, Kahawa Sukari.*
`,
    category: "health-tip",
    video: {
      url: "https://www.instagram.com/reel/ayolafoods/",
      platform: "instagram",
    },
    prepTime: "24-48 hours (fermentation)",
    servings: "6-8 servings",
    difficulty: "Easy",
    ingredients: [
      "1 cup Ayola Special Uji Blend",
      "3 cups warm water",
      "Natural fermentation starter (or previous batch)",
      "Honey to taste",
      "Warm milk for serving",
    ],
    tags: ["porridge", "gut health", "probiotics", "fermented", "synbiotic"],
    author: "Prisca Kiragu",
    date: "2026-01-20",
    featured: true,
    relatedProduct: "synbiotic-porridge",
  },
  {
    slug: "plantain-probiotic-kvass",
    title: "How We Make Plantain Probiotic Kvass",
    excerpt:
      "A behind-the-scenes look at Kenya's first plantain-based probiotic beverage — from raw plantain to fermented goodness.",
    content: `
## Plantain Kvass: Innovation Meets Tradition

Kvass is a traditional fermented beverage originating from Eastern Europe. At Ayola Foods, we've reimagined it using **plantain** — a fruit rich in resistant starch, which acts as a powerful prebiotic.

### Why Plantain?

Plantain is an overlooked superfood in Kenya:
- **Rich in resistant starch** — feeds beneficial gut bacteria
- **High in potassium** — supports heart health
- **Good source of vitamin B6** — essential for brain function
- **Naturally sweet when ripe** — reduces the need for added sugar

### The Fermentation Process

1. **Select ripe plantains** — they should be yellow with some black spots
2. **Peel and slice** into thin rounds
3. **Add to filtered water** with a small amount of honey
4. **Introduce fermentation cultures** — we use a proprietary blend of Lactobacillus strains
5. **Ferment for 48-72 hours** at controlled room temperature
6. **Strain and bottle** — serve chilled

### The Result

A slightly tangy, naturally fizzy, refreshing beverage packed with live probiotics. No artificial flavors, no preservatives, no added sugar beyond the natural plantain sweetness.

*This is the first branded plantain probiotic beverage in Kenya's food service sector.*
`,
    category: "beverage",
    video: {
      url: "https://www.instagram.com/reel/ayolafoods/",
      platform: "instagram",
    },
    prepTime: "48-72 hours",
    servings: "8-10 servings",
    difficulty: "Advanced",
    ingredients: [
      "4 ripe plantains",
      "1 liter filtered water",
      "2 tbsp raw honey",
      "Fermentation cultures (Lactobacillus blend)",
      "Glass jar with breathable cover",
    ],
    tags: ["kvass", "plantain", "probiotic", "fermented", "beverage"],
    author: "Prisca Kiragu",
    date: "2026-02-01",
    featured: true,
    relatedProduct: "plantain-kvass",
  },
  {
    slug: "ayola-ugali-bread-recipe",
    title: "Healthier Bread Using Ayola Ugali Blend",
    excerpt:
      "Our customers discovered that Ayola's ugali blend makes incredible bread. Here's how to do it at home.",
    content: `
## Bread from Ugali Flour? Yes!

One of the most exciting discoveries from our customers: **Ayola Special Ugali Blend makes fantastic bread**. The indigenous grains in our blend add nutrition, fiber, and a subtle nutty flavor that regular wheat bread can't match.

### Why It Works

Our ugali blend contains a carefully balanced mix of maize flour and indigenous grains. When combined with wheat flour, it creates a bread that is:
- **Higher in fiber** than standard white bread
- **Richer in iron and minerals** from the indigenous grains
- **Lower glycemic index** — more sustained energy
- **Unique in flavor** — a subtle nuttiness that customers love

### Recipe: Ayola Blend Bread

**Ingredients:**
- 2 cups wheat flour
- 1 cup Ayola Special Ugali Blend
- 1 packet instant yeast (10g)
- 1 tsp salt
- 1 tbsp sugar
- 2 tbsp vegetable oil
- 1.5 cups warm water

**Method:**
1. Mix dry ingredients (both flours, yeast, salt, sugar)
2. Add oil and warm water, knead for 10 minutes until smooth
3. Cover and let rise for 1 hour (until doubled)
4. Punch down, shape into a loaf
5. Place in a greased loaf pan, let rise 30 more minutes
6. Bake at 180°C for 35-40 minutes until golden

*Order Ayola Special Ugali Blend online — we ship countrywide!*
`,
    category: "how-to",
    video: {
      url: "https://www.facebook.com/100087278121034/videos/",
      platform: "facebook",
    },
    prepTime: "2 hours",
    servings: "1 loaf",
    difficulty: "Medium",
    ingredients: [
      "2 cups wheat flour",
      "1 cup Ayola Special Ugali Blend",
      "1 packet instant yeast (10g)",
      "1 tsp salt",
      "1 tbsp sugar",
      "2 tbsp vegetable oil",
      "1.5 cups warm water",
    ],
    tags: ["bread", "ugali blend", "baking", "healthy"],
    author: "Prisca Kiragu",
    date: "2026-03-01",
    relatedProduct: "ayola-ugali-blend",
  },
  {
    slug: "goat-milk-chai-perfect",
    title: "The Perfect Goat Milk Chai",
    excerpt:
      "Why goat milk makes better chai — easier to digest, creamier texture, and richer flavor. Here's our method.",
    content: `
## Why Goat Milk Chai?

At Ayola Foods, our goat milk tea is one of the most popular beverages. Here's why:

### Goat Milk vs Cow Milk

| Property | Goat Milk | Cow Milk |
|----------|-----------|----------|
| Fat globules | Smaller (easier to digest) | Larger |
| A2 casein | Naturally A2 | Often A1 |
| Calcium | Higher | Standard |
| Potassium | Higher | Standard |
| Vitamin A | Higher | Standard |

### Our Recipe

1. **Start with fresh goat milk** — quality matters
2. **Add Kenyan black tea** (we use loose leaf, not bags)
3. **Crush the spices fresh**: ginger, cardamom, cinnamon
4. **Simmer, don't boil** — boiling changes the flavor
5. **Sweeten with honey** — not sugar

### The Method

- Bring 2 cups water to a simmer
- Add 2 tsp loose black tea and crushed ginger
- Simmer for 3 minutes
- Add 2 cups fresh goat milk and spices
- Heat until just before boiling (you'll see tiny bubbles)
- Strain and add honey to taste

*Visit us at Ruhan Plaza, Kahawa Sukari for a cup!*
`,
    category: "beverage",
    video: {
      url: "https://www.tiktok.com/@priscakiragu",
      platform: "tiktok",
    },
    prepTime: "10 mins",
    servings: "2 cups",
    difficulty: "Easy",
    ingredients: [
      "2 cups fresh goat milk",
      "2 cups water",
      "2 tsp loose Kenyan black tea",
      "1 inch fresh ginger, crushed",
      "3 cardamom pods, crushed",
      "1 small cinnamon stick",
      "Honey to taste",
    ],
    tags: ["chai", "goat milk", "tea", "beverage", "easy"],
    author: "Prisca Kiragu",
    date: "2026-02-20",
    relatedProduct: "goat-milk-tea",
  },
  {
    slug: "rabbit-wet-fry-tutorial",
    title: "How to Make Rabbit Wet Fry — The Ayola Way",
    excerpt:
      "Rabbit is one of the healthiest meats available. Watch how we prepare our signature rabbit wet fry combo.",
    content: `
## Rabbit: The Underrated Superfood Meat

Most Kenyans haven't tried rabbit — but those who have keep coming back. Here's why:

### Nutritional Profile (per 100g)

| Nutrient | Rabbit | Chicken | Beef |
|----------|--------|---------|------|
| Protein | 29g | 27g | 26g |
| Fat | 3.5g | 14g | 15g |
| Cholesterol | 57mg | 75mg | 90mg |
| Iron | 1.6mg | 0.9mg | 2.6mg |

**Rabbit is the leanest commonly available meat** — more protein, less fat, less cholesterol.

### Ayola's Wet Fry Method

1. **Clean and portion** the rabbit into serving pieces
2. **Marinate** with garlic, ginger, salt, and lemon juice for 30 minutes
3. **Sear** in hot oil until golden on all sides
4. **Add aromatics** — onions, tomatoes, bell peppers
5. **Simmer in sauce** with a splash of water for 25-30 minutes until tender
6. **Finish** with fresh coriander and serve with Ayola Special Ugali

### Why We Love Rabbit at Ayola

It aligns perfectly with our "eat healthy, enjoy life" philosophy — it's unconventional, nutritious, and absolutely delicious when prepared properly.

*Our rabbit wet fry combo is available daily at the restaurant — KES 800 with greens and special ugali.*
`,
    category: "cooking-demo",
    video: {
      url: "https://www.instagram.com/reel/ayolafoods/",
      platform: "instagram",
    },
    prepTime: "1 hour",
    servings: "3-4 servings",
    difficulty: "Medium",
    ingredients: [
      "1 whole rabbit, portioned",
      "4 tomatoes, diced",
      "2 onions, sliced",
      "2 bell peppers, sliced",
      "4 cloves garlic, minced",
      "1 inch ginger, grated",
      "Fresh coriander",
      "Salt, lemon juice",
      "Cooking oil",
    ],
    tags: ["rabbit", "wet fry", "main course", "high protein", "low fat"],
    author: "Prisca Kiragu",
    date: "2026-03-10",
    featured: true,
    relatedProduct: "rabbit-wet-fry",
  },
];

export function getRecipesByCategory(category: string): Recipe[] {
  if (category === "all") return recipes;
  return recipes.filter((r) => r.category === category);
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((r) => r.slug === slug);
}

export function getFeaturedRecipes(): Recipe[] {
  return recipes.filter((r) => r.featured);
}
