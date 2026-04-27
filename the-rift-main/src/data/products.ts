import jollofImg from "@/assets/dish-jollof.jpg";
import maafeImg from "@/assets/dish-maafe.jpg";
import zoboImg from "@/assets/dish-zobo.jpg";
import egusiImg from "@/assets/dish-egusi.jpg";
import puffsImg from "@/assets/dish-puffs.jpg";
import yamImg from "@/assets/dish-yam.jpg";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: "Meals" | "Beverages" | "Breakfast" | "Seasonal";
  badge?: string;
  price: number; // KES
  image: string;
};

export const products: Product[] = [
  {
    id: "heritage-jollof",
    name: "Heritage Jollof",
    tagline: "Smoky highland pepper rice",
    description:
      "Smoky, slow-cooked rice infused with sun-ripened highland peppers, native bay and a whisper of locust bean.",
    category: "Meals",
    badge: "Vegan",
    price: 1200,
    image: jollofImg.src,
  },
  {
    id: "savanna-maafe",
    name: "Savanna Maafe",
    tagline: "Velvet peanut & root stew",
    description:
      "A velvety extraction of stone-ground peanuts, sweet potato, baobab and savanna spices.",
    category: "Meals",
    badge: "Gluten-Free",
    price: 1450,
    image: maafeImg.src,
  },
  {
    id: "royal-egusi",
    name: "Royal Egusi",
    tagline: "Toasted melon seed broth",
    description:
      "Toasted egusi seeds folded into wild spinach and a slow-simmered palm-fruit broth.",
    category: "Meals",
    badge: "Protein-Rich",
    price: 1800,
    image: egusiImg.src,
  },
  {
    id: "pounded-yam",
    name: "Pounded Yam & Ila",
    tagline: "Hand-pounded with seafood okra",
    description:
      "Smooth, hand-pounded yam paired with a fresh seafood okra broth fragrant with crayfish.",
    category: "Meals",
    price: 1600,
    image: yamImg.src,
  },
  {
    id: "zobo-infusion",
    name: "Zobo Infusion",
    tagline: "Sun-dried hibiscus & ginger",
    description:
      "Sun-dried hibiscus petals steeped with ginger, cloves and a thread of pineapple.",
    category: "Beverages",
    badge: "Natural",
    price: 400,
    image: zoboImg.src,
  },
  {
    id: "golden-puffs",
    name: "Golden Puffs",
    tagline: "Yeasted dough, ginger glaze",
    description:
      "Artisanal yeasted dough balls, fried until amber and finished with a warm ginger glaze.",
    category: "Breakfast",
    price: 850,
    image: puffsImg.src,
  },
];

export const formatKES = (n: number) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
