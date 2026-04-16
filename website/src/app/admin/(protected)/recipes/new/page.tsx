"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { RecipeForm, type RecipeFormData } from "@/components/admin/RecipeForm";

export default function NewRecipePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  async function handleSubmit(data: RecipeFormData) {
    setSubmitting(true);
    setSlugError(null);

    try {
      const res = await fetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.status === 409) {
        setSlugError(json.error?.message ?? "A recipe with this slug already exists.");
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to create recipe.");
        setSubmitting(false);
        return;
      }

      toast.success("Recipe created successfully.");
      router.push("/admin/recipes");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <Link
            href="/admin/recipes"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft size={13} /> Back to Recipes
          </Link>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            New Recipe
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Fill in the details below to add a recipe to your catalogue
          </p>
        </div>
      </div>

      {/* Form */}
      <RecipeForm
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitLabel="Create Recipe"
        slugError={slugError}
      />
    </div>
  );
}
