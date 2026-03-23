import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipes & Videos",
  description: "Watch cooking demos and recipes from Ayola Foods CEO Prisca Kiragu. Learn how to make pilau, synbiotic porridge, plantain kvass, and more with heritage Kenyan ingredients.",
};

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
