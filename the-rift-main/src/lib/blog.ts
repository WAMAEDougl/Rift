export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: "recipe" | "news" | "health" | "behind-the-scenes";
  image: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
}

export const blogCategories = [
  { slug: "all", label: "All Posts" },
  { slug: "recipe", label: "Recipes" },
  { slug: "news", label: "Company News" },
  { slug: "health", label: "Health & Nutrition" },
  { slug: "behind-the-scenes", label: "Behind the Scenes" },
];

export const blogPosts: BlogPost[] = [
  {
    slug: "perfect-finger-millet-porridge",
    title: "How to Make the Perfect Finger Millet Porridge",
    excerpt:
      "Master the art of creamy, lump-free wimbi porridge with our step-by-step guide. Plus, 3 delicious topping ideas your family will love.",
    content: `
## The Secret to Perfect Wimbi Porridge

Finger millet porridge (wimbi/uji) is one of Kenya's most beloved breakfast foods — and for good reason. It's incredibly nutritious, naturally rich in iron and calcium, and has a uniquely satisfying taste that nothing else can match.

But let's be honest — many of us have struggled with lumpy porridge at some point. Here's our tested method for consistently smooth, creamy results every time.

### What You'll Need

- 1 cup Ayola Finger Millet & Amaranth Blend
- 3 cups water
- 1 cup milk (dairy or plant-based)
- Honey or sugar to taste
- Pinch of salt

### Step-by-Step Method

**Step 1: The Cold Water Mix**
This is the most important step. Mix your porridge flour with 1 cup of COLD water in a bowl. Stir until completely smooth with no lumps. This is the secret — never add flour directly to hot water.

**Step 2: Boil the Remaining Water**
Bring 2 cups of water to a rolling boil in a medium saucepan.

**Step 3: The Slow Pour**
Reduce heat to medium. Slowly pour your flour mixture into the boiling water while stirring continuously with a wooden spoon. Keep stirring!

**Step 4: Cook and Stir**
Continue stirring over medium heat for 8-10 minutes until the porridge thickens to your desired consistency. Add milk gradually while stirring.

**Step 5: Season and Serve**
Add a pinch of salt and sweeten with honey to taste. Serve hot.

### 3 Delicious Topping Ideas

1. **Tropical Morning**: Sliced banana, a drizzle of honey, and toasted coconut flakes
2. **Nutty Power**: Crushed peanuts, a spoon of peanut butter, and a sprinkle of cinnamon
3. **Berry Burst**: Fresh or frozen mixed berries with a swirl of yogurt

### Nutrition Tip

Our Finger Millet & Amaranth Blend is fortified with iron and essential vitamins, making it an excellent breakfast choice especially for children, pregnant women, and anyone looking to boost their iron intake naturally.

*Share your porridge creations with us on Instagram @AyolaFoodsKE!*
    `,
    category: "recipe",
    image: "/images/blog/porridge-recipe.jpg",
    author: "Ayola Kitchen",
    date: "2026-03-15",
    readTime: "5 min read",
    tags: ["recipe", "porridge", "finger millet", "breakfast"],
    featured: true,
  },
  {
    slug: "why-indigenous-grains-matter",
    title: "Why Indigenous Grains Matter: The Nutritional Powerhouses Kenya Forgot",
    excerpt:
      "Finger millet, sorghum, and amaranth were staples for generations. Science is now proving what our grandmothers always knew — these grains are superfoods.",
    content: `
## Rediscovering Africa's Original Superfoods

Long before quinoa and chia seeds became global health food trends, Kenyan communities thrived on indigenous grains that packed extraordinary nutritional profiles. Finger millet (wimbi), sorghum (mtama), and amaranth (terere) were the backbone of African diets for thousands of years.

### Finger Millet: The Iron Champion

Finger millet contains **3-5 times more iron** than wheat and rice. It's also one of the richest plant sources of calcium, making it essential for bone health. For a country where iron deficiency affects over 30% of women and children, this humble grain is nothing short of medicine.

**Key benefits:**
- 344mg calcium per 100g (vs 29mg in rice)
- Rich in methionine, an amino acid absent in most cereals
- Naturally gluten-free
- Low glycemic index — excellent for diabetics

### Sorghum: The Climate-Resilient Wonder

Sorghum is not just nutritious — it's one of the most drought-resistant crops on earth. As climate change threatens food security, sorghum's importance will only grow.

**Key benefits:**
- High in antioxidants (some varieties contain more than blueberries)
- Rich in B-vitamins and magnesium
- Naturally gluten-free
- Excellent source of dietary fiber

### Amaranth: The Complete Protein

Amaranth is rare among plant foods because it contains all essential amino acids, making it a "complete protein." This makes it invaluable for vegetarians and anyone looking to increase protein intake naturally.

**Key benefits:**
- 13-15% protein content (higher than most grains)
- Rich in lysine (usually lacking in grains)
- High in iron and magnesium
- Contains squalene, which has anti-cancer properties

### Why Did We Stop Eating Them?

Colonization and subsequent agricultural policies promoted wheat, rice, and maize over indigenous crops. Western-style diets were marketed as "modern" and "aspirational," while traditional foods were stigmatized as backward.

The result? A nutrition crisis. Kenya now faces rising rates of diabetes, obesity, and malnutrition — often in the same communities simultaneously.

### The Renaissance

The good news is that indigenous grains are making a comeback. At Ayola Foods, we're proud to be part of this movement — making these incredible grains accessible, convenient, and delicious for modern Kenyan families.

When you choose Ayola, you're not just choosing better nutrition. You're choosing to honor generations of African food wisdom.

*Sources: FAO, Kenya Agricultural Research Institute, Journal of Agricultural and Food Chemistry*
    `,
    category: "health",
    image: "/images/blog/indigenous-grains.jpg",
    author: "Dr. Wanjiku Mwangi",
    date: "2026-03-10",
    readTime: "7 min read",
    tags: ["health", "nutrition", "finger millet", "sorghum", "amaranth"],
    featured: true,
  },
  {
    slug: "ayola-foods-expands-to-mombasa",
    title: "Ayola Foods Now Available in Mombasa! Celebrating Our Coastal Expansion",
    excerpt:
      "We're thrilled to announce that Ayola Foods products are now available in select stores across Mombasa. Here's where to find us.",
    content: `
## Karibu Mombasa!

We're excited to share that Ayola Foods products are now available in Mombasa! This expansion to the coast is a major milestone for us, and we couldn't be more grateful to the Mombasa community for the warm reception.

### Where to Find Us

You can now find Ayola Foods products at select supermarkets and specialty stores across Mombasa. We're starting with our full range of Heritage Porridge Mixes and Ready Meal Sauces.

### Why Mombasa?

Mombasa has always held a special place in our hearts. The coast's rich culinary traditions — from biryani to pilau to amazing seafood — inspired several of our products, including our Coastal Spice Blend and Coconut Curry Simmer Sauce.

It feels like coming home.

### Launch Celebrations

To celebrate, we'll be hosting tasting events at select locations throughout the month. Follow us on social media for dates and locations!

### What's Next?

After Mombasa, we're setting our sights on Kisumu, Nakuru, and Eldoret. Our goal is to make Ayola Foods available to families across Kenya by the end of the year.

Thank you for being part of our journey. Every purchase supports Kenyan farmers and preserves our food heritage.

*Asante sana, Mombasa! 🌴*
    `,
    category: "news",
    image: "/images/blog/mombasa-launch.jpg",
    author: "Ayola Foods Team",
    date: "2026-03-05",
    readTime: "3 min read",
    tags: ["news", "expansion", "mombasa"],
  },
  {
    slug: "quick-pilau-recipe",
    title: "30-Minute Chicken Pilau Using Ayola Pilau Masala Sauce",
    excerpt:
      "Restaurant-quality pilau in under 30 minutes? Yes, it's possible. Here's our quick recipe using Ayola Pilau Masala Cooking Sauce.",
    content: `
## Quick Chicken Pilau

Pilau is one of Kenya's most beloved dishes — but traditionally it takes over an hour to prepare all those spices and slow-cook to perfection. Our Pilau Masala Cooking Sauce cuts that time in half while delivering authentic flavor.

### Ingredients

- 2 cups basmati rice
- 500g chicken pieces
- 1 jar Ayola Pilau Masala Cooking Sauce (350ml)
- 1 large potato, cubed
- 3 cups chicken stock or water
- Salt to taste
- Fresh coriander for garnish

### Method

1. **Sear the chicken** in a hot pot with a little oil until golden (5 minutes)
2. **Add the sauce** — pour the entire jar of Ayola Pilau Masala over the chicken. Stir and cook for 3 minutes
3. **Add stock and potatoes** — bring to a boil
4. **Add washed rice** — stir once, then cover and reduce to lowest heat
5. **Steam for 18-20 minutes** until rice is fluffy and liquid absorbed
6. **Fluff with a fork** and garnish with fresh coriander

### Pro Tips

- Don't stir the rice once you've covered the pot — let it steam
- Use aged basmati rice for the best results
- Let it rest covered for 5 minutes after cooking for fluffier rice
- Serve with kachumbari and a squeeze of lemon

Serves 4-6 people. Total time: 30 minutes.

*Tag us @AyolaFoodsKE when you make this!*
    `,
    category: "recipe",
    image: "/images/blog/pilau-recipe.jpg",
    author: "Ayola Kitchen",
    date: "2026-02-28",
    readTime: "4 min read",
    tags: ["recipe", "pilau", "chicken", "quick meals"],
  },
  {
    slug: "meeting-our-farmers",
    title: "From Farm to Table: Meeting the Farmers Behind Ayola's Ingredients",
    excerpt:
      "We visited finger millet farms in Western Kenya to meet the incredible farmers who grow our key ingredient. Their stories will inspire you.",
    content: `
## The Hands That Feed Us

Last month, our team traveled to Bungoma County in Western Kenya to visit the farming cooperatives that grow our finger millet. What we found was inspiring — dedicated farmers preserving traditional farming practices while embracing innovation.

### Mary's Story

Mary Nekesa, 58, has been growing finger millet on her family's land for over 30 years. When many of her neighbors switched to maize monoculture, she kept her wimbi fields.

"People laughed at me," she says. "They said wimbi was old-fashioned. But I knew it was special. My children grew up strong because of this grain."

Today, Mary supplies finger millet to Ayola Foods and leads a women's cooperative of 45 farmers. Her income has grown significantly since partnering with us.

### Why Direct Sourcing Matters

At Ayola Foods, we buy directly from farmer cooperatives at fair prices — typically 20-30% above market rate. This ensures:

- Farmers receive fair compensation for their work
- Traditional crops remain economically viable to grow
- Quality is maintained from seed to shelf
- Communities benefit directly from the value chain

### Preserving Biodiversity

By creating market demand for indigenous grains, we're helping preserve crop biodiversity. Kenya's agricultural future depends on maintaining a diverse range of crops — especially climate-resilient ones like finger millet and sorghum.

### Our Commitment

Every bag of Ayola porridge mix you buy directly supports Kenyan farming families. We're committed to expanding our farmer partnerships and ensuring that the people who grow our ingredients share in our success.

*Want to learn more about our sourcing? Contact us at info@ayolafoods.co.ke*
    `,
    category: "behind-the-scenes",
    image: "/images/blog/farmer-story.jpg",
    author: "Ayola Foods Team",
    date: "2026-02-20",
    readTime: "6 min read",
    tags: ["farmers", "sourcing", "community", "sustainability"],
    featured: true,
  },
  {
    slug: "iron-deficiency-kenya",
    title: "Iron Deficiency in Kenya: How Indigenous Foods Can Help",
    excerpt:
      "Iron deficiency affects millions of Kenyans, especially women and children. Here's how traditional foods offer a natural, delicious solution.",
    content: `
## A Hidden Health Crisis

Iron deficiency is the most common nutritional deficiency in Kenya, affecting an estimated 36% of children under 5 and 42% of pregnant women. The consequences are severe: fatigue, impaired cognitive development, weakened immunity, and in extreme cases, life-threatening complications.

### The Irony of Iron Deficiency

Here's the paradox: Kenya grows some of the most iron-rich foods on earth — yet iron deficiency remains rampant. Why? Because many families have shifted from traditional, iron-rich diets to processed, nutrient-poor alternatives.

### Indigenous Foods to the Rescue

| Food | Iron per 100g | Daily Value (%) |
|------|--------------|----------------|
| Finger millet | 3.9mg | 22% |
| Amaranth leaves | 5.4mg | 30% |
| Cowpeas | 8.3mg | 46% |
| White rice | 0.8mg | 4% |
| White bread | 1.2mg | 7% |

The difference is dramatic. A single serving of finger millet porridge provides more iron than three servings of white rice.

### What Ayola Is Doing

All our porridge mixes are additionally fortified with iron and Vitamin C (which enhances iron absorption). This means a bowl of Ayola porridge can provide up to 45% of your daily iron needs.

We believe that solving nutritional deficiencies shouldn't require expensive supplements — just a return to the foods that nourished Africa for millennia.

### Simple Steps to Boost Iron Intake

1. Start your day with finger millet porridge
2. Add lemon juice or orange to meals (Vitamin C boosts iron absorption)
3. Cook in cast iron pots when possible
4. Include amaranth leaves (terere) in your diet regularly
5. Avoid tea with meals (tannins reduce iron absorption)

*Consult a healthcare provider if you suspect iron deficiency. This article is for informational purposes only.*
    `,
    category: "health",
    image: "/images/blog/iron-health.jpg",
    author: "Dr. Wanjiku Mwangi",
    date: "2026-02-15",
    readTime: "5 min read",
    tags: ["health", "iron", "nutrition", "finger millet"],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((p) => p.featured);
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === "all") return blogPosts;
  return blogPosts.filter((p) => p.category === category);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
