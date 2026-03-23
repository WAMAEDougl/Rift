import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products & Menu",
  description: "Browse Ayola Foods Kenya products — ready meals, probiotic beverages, heritage flour blends, and breakfast combos. Formulated by a food scientist. Order online or visit Kahawa Sukari.",
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
