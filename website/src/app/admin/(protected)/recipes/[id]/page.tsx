"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  BookOpen,
  ExternalLink,
  Star,
  Globe,
  Clock,
  Users,
  Tag,
  User,
  Calendar,
  Package,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecipeRow } from "@/lib/types/recipe";

const CATEGORY_LABELS: Record<RecipeRow["category"], string> = {
  "cooking-demo": "Cooking Demo",
  beverage: "Beverage",
  "how-to": "How-To",
  "health-tip": "Health Tip",
};

const CATEGORY_COLORS: Record<RecipeRow["category"], string> = {
  "cooking-demo": "bg-orange-50 text-orange-600 border-orange-100",
  beverage: "bg-blue-50 text-blue-600 border-blue-100",
  "how-to": "bg-purple-50 text-purple-600 border-purple-100",
  "health-tip": "bg-green-50 text-green-600 border-green-100",
};

const DIFFICULTY_COLORS: Record<RecipeRow["difficulty"], string> = {
  Easy: "bg-green-50 text-green-600 border-green-100",
  Medium: "bg-amber-50 text-amber-600 border-amber-100",
  Advanced: "bg-red-50 text-red-600 border-red-100",
};

const PLATFORM_LABELS: Record<RecipeRow["video_platform"], string> = {
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
      <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

  if (loading) {
    return (
      <div className="space-y-6 mb-16">
        {/* Header skeleton */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
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
            Recipe Detail
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen size={40} className="text-gray-200 mb-4" />
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

  if (!recipe) return null;

  return (
    <div className="space-y-6 mb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
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
            {recipe.title}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{recipe.slug}</p>
        </div>
        <Link
          href={`/admin/recipes/${recipe.id}/edit`}
          className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shrink-0"
        >
          <Pencil size={14} />
          Edit
        </Link>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — core content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Info */}
          <SectionCard title="Core Info">
            <div className="space-y-4">
              <Field label="Title">
                <span className="font-medium">{recipe.title}</span>
              </Field>
              <Field label="Slug">
                <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                  {recipe.slug}
                </span>
              </Field>
              <Field label="Excerpt">
                <p className="text-gray-600 leading-relaxed">{recipe.excerpt}</p>
              </Field>
              <Field label="Content">
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-gray-600 leading-relaxed whitespace-pre-wrap text-xs max-h-64 overflow-y-auto">
                  {recipe.content}
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* Video */}
          <SectionCard title="Video">
            <div className="space-y-4">
              <Field label="Platform">
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={13} className="text-gray-400" />
                  {PLATFORM_LABELS[recipe.video_platform]}
                </span>
              </Field>
              <Field label="Video URL">
                <a
                  href={recipe.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 hover:underline transition-colors break-all"
                >
                  <ExternalLink size={13} className="shrink-0" />
                  <span>
                    {PLATFORM_LABELS[recipe.video_platform]} — {recipe.video_url}
                  </span>
                </a>
              </Field>
              {recipe.video_thumbnail_url && (
                <Field label="Thumbnail">
                  <a
                    href={recipe.video_thumbnail_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 hover:underline transition-colors break-all"
                  >
                    <ExternalLink size={13} className="shrink-0" />
                    {recipe.video_thumbnail_url}
                  </a>
                </Field>
              )}
            </div>
          </SectionCard>

          {/* Ingredients */}
          <SectionCard title="Ingredients">
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic">No ingredients listed.</p>
            )}
          </SectionCard>

          {/* Tags */}
          <SectionCard title="Tags">
            {recipe.tags && recipe.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No tags.</p>
            )}
          </SectionCard>
        </div>

        {/* Right column — metadata */}
        <div className="space-y-6">
          {/* Classification */}
          <SectionCard title="Classification">
            <div className="space-y-4">
              <Field label="Category">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[recipe.category]}`}
                >
                  {CATEGORY_LABELS[recipe.category]}
                </span>
              </Field>
              <Field label="Difficulty">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[recipe.difficulty]}`}
                >
                  {recipe.difficulty}
                </span>
              </Field>
              {recipe.prep_time && (
                <Field label="Prep Time">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-gray-400" />
                    {recipe.prep_time}
                  </span>
                </Field>
              )}
              {recipe.servings && (
                <Field label="Servings">
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={13} className="text-gray-400" />
                    {recipe.servings}
                  </span>
                </Field>
              )}
            </div>
          </SectionCard>

          {/* Authorship */}
          <SectionCard title="Authorship">
            <div className="space-y-4">
              <Field label="Author">
                <span className="inline-flex items-center gap-1.5">
                  <User size={13} className="text-gray-400" />
                  {recipe.author}
                </span>
              </Field>
              <Field label="Publish Date">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={13} className="text-gray-400" />
                  {new Date(recipe.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </Field>
              <Field label="Created">
                <span className="text-xs text-gray-500">
                  {new Date(recipe.created_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Field>
              <Field label="Last Updated">
                <span className="text-xs text-gray-500">
                  {new Date(recipe.updated_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </Field>
            </div>
          </SectionCard>

          {/* Visibility */}
          <SectionCard title="Visibility">
            <div className="space-y-4">
              <Field label="Published">
                {recipe.is_published ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                    Live
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                    Draft
                  </span>
                )}
              </Field>
              <Field label="Featured">
                {recipe.featured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                    <Star size={10} />
                    Featured
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                    No
                  </span>
                )}
              </Field>
              {recipe.related_product && (
                <Field label="Related Product">
                  <span className="inline-flex items-center gap-1.5">
                    <Package size={13} className="text-gray-400" />
                    {recipe.related_product}
                  </span>
                </Field>
              )}
            </div>
          </SectionCard>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Actions
            </h2>
            <div className="space-y-2">
              <Link
                href={`/admin/recipes/${recipe.id}/edit`}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <Pencil size={14} />
                Edit Recipe
              </Link>
              <Link
                href="/admin/recipes"
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
