"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { RecipeForm, type RecipeFormData } from "@/components/admin/RecipeForm";
import type { RecipeRow } from "@/lib/types/recipe";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/recipes/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setRecipe(json.data as RecipeRow);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(data: RecipeFormData) {
    setSubmitting(true);
    setSlugError(null);

    try {
      const res = await fetch(`/api/admin/recipes/${id}`, {
        method: "PATCH",
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
        toast.error(json.error?.message ?? "Failed to update recipe.");
        setSubmitting(false);
        return;
      }

      // Update local state with the saved data so the form reflects the latest
      if (json.data) {
        setRecipe(json.data as RecipeRow);
      }

      toast.success("Recipe updated successfully.");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 mb-16">
        {/* Header skeleton */}
        <div className="pb-4 border-b border-gray-100 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <Skeleton className="h-3 w-32" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <Skeleton className="h-3 w-32" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-6 mb-16">
        <div className="pb-4 border-b border-gray-100">
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
            Edit Recipe
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">Recipe not found</p>
          <p className="text-sm text-gray-400 mb-6">
            The recipe you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link
            href="/admin/recipes"
            className="px-5 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition-colors"
          >
            Back to Recipes
          </Link>
        </div>
      </div>
    );
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
            Edit Recipe
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Editing: <span className="text-amber-700 font-medium">{recipe?.title}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <RecipeForm
        initialData={recipe ?? undefined}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        submitLabel="Save Changes"
        slugError={slugError}
      />
    </div>
  );
}
