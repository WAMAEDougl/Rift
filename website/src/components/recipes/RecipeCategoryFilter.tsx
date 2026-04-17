"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { recipeCategories } from "@/lib/recipes";

export default function RecipeCategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "all";

  function handleSelect(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/recipes?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 py-4 overflow-x-auto no-scrollbar">
      {recipeCategories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => handleSelect(cat.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all inline-flex items-center gap-1.5 ${
            activeCategory === cat.slug
              ? "bg-primary text-white shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
