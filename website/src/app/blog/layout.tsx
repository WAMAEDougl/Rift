import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Health tips, recipes, nutrition guides, and company news from Ayola Foods Kenya. Learn about gut health, indigenous grains, and heritage nutrition.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
