import type { Metadata } from "next";
import { getProductsFromDB } from "@/lib/products";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop — Rift & Root",
  description:
    "Browse heritage African meals, beverages and pantry essentials, hand-crafted in small batches in Nairobi.",
};

export default async function ShopPage() {
  const products = await getProductsFromDB();
  return <ShopClient products={products} />;
}
