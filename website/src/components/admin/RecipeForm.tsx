"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import type { RecipeRow } from "@/lib/types/recipe";
import ImageUploader from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecipeFormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: "cooking-demo" | "beverage" | "how-to" | "health-tip";
  video_url: string;
  video_platform: "youtube" | "facebook" | "instagram" | "tiktok";
  video_thumbnail_url: string;
  prep_time: string;
  servings: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  ingredients: string[];
  tags: string;
  author: string;
  date: string;
  featured: boolean;
  related_product: string;
  is_published: boolean;
};

interface RecipeFormProps {
  initialData?: Partial<RecipeRow>;
  onSubmit: (data: RecipeFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  slugError?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function toDateInputValue(dateStr: string | undefined | null): string {
  if (!dateStr) return "";
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Try to parse ISO timestamp
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// ─── Shared field styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-[#1a1a2e] focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 outline-none transition-all placeholder:text-slate-300";

const inputErrorCls =
  "w-full p-4 rounded-2xl bg-red-50 border border-red-300 text-sm font-medium text-[#1a1a2e] focus:border-red-400 focus:ring-2 focus:ring-red-400/10 outline-none transition-all placeholder:text-slate-300";

const labelCls =
  "block text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 ml-1";

const errorCls = "mt-1.5 ml-1 text-xs font-semibold text-red-500";

// ─── Component ────────────────────────────────────────────────────────────────

export function RecipeForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Recipe",
  slugError = null,
}: RecipeFormProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    !!initialData?.slug
  );

  const [form, setForm] = useState<RecipeFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    cover_image_url: initialData?.cover_image_url ?? "",
    category: initialData?.category ?? "cooking-demo",
    video_url: initialData?.video_url ?? "",
    video_platform: initialData?.video_platform ?? "youtube",
    video_thumbnail_url: initialData?.video_thumbnail_url ?? "",
    prep_time: initialData?.prep_time ?? "",
    servings: initialData?.servings ?? "",
    difficulty: initialData?.difficulty ?? "Easy",
    ingredients: initialData?.ingredients ?? [],
    tags: initialData?.tags?.join(", ") ?? "",
    author: initialData?.author ?? "",
    date: toDateInputValue(initialData?.date),
    featured: initialData?.featured ?? false,
    related_product: initialData?.related_product ?? "",
    is_published: initialData?.is_published ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RecipeFormData, string>>>({});

  // ── Field handlers ──────────────────────────────────────────────────────────

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      setForm((prev) => ({
        ...prev,
        title,
        slug: slugManuallyEdited ? prev.slug : generateSlug(title),
      }));
      if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
    },
    [slugManuallyEdited, errors.title]
  );

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSlugManuallyEdited(true);
      setForm((prev) => ({ ...prev, slug: e.target.value }));
      if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
    },
    [errors.slug]
  );

  const handleChange = useCallback(
    <K extends keyof RecipeFormData>(field: K, value: RecipeFormData[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [errors]
  );

  // ── Ingredients ─────────────────────────────────────────────────────────────

  const addIngredient = () => {
    setForm((prev) => ({ ...prev, ingredients: [...prev.ingredients, ""] }));
  };

  const updateIngredient = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.ingredients];
      updated[index] = value;
      return { ...prev, ingredients: updated };
    });
  };

  const removeIngredient = (index: number) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const requiredFields: (keyof RecipeFormData)[] = [
    "title",
    "slug",
    "excerpt",
    "content",
    "category",
    "video_url",
    "video_platform",
    "difficulty",
    "author",
    "date",
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RecipeFormData, string>> = {};

    for (const field of requiredFields) {
      const val = form[field];
      if (typeof val === "string" && val.trim() === "") {
        newErrors[field] = "This field is required";
      }
    }

    // Slug format
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
      newErrors.slug =
        "Slug may only contain lowercase letters, numbers, and hyphens";
    }

    // URL format for video_url
    if (form.video_url && !/^https?:\/\/.+/.test(form.video_url)) {
      newErrors.video_url = "Must be a valid URL (starting with http/https)";
    }

    // Date format
    if (form.date && !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      newErrors.date = "Date must be in YYYY-MM-DD format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* ── Section: Core Info ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Core Information
        </h2>

        {/* Title */}
        <div>
          <label className={labelCls}>
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="e.g. Mango Smoothie Bowl"
            className={errors.title ? inputErrorCls : inputCls}
          />
          {errors.title && <p className={errorCls}>{errors.title}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className={labelCls}>
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={handleSlugChange}
            placeholder="auto-generated-from-title"
            className={errors.slug || slugError ? inputErrorCls : inputCls}
          />
          {errors.slug && <p className={errorCls}>{errors.slug}</p>}
          {!errors.slug && slugError && (
            <p className={errorCls}>{slugError}</p>
          )}
          {!errors.slug && !slugError && (
            <p className="mt-1.5 ml-1 text-[10px] text-slate-400">
              Auto-generated from title. Edit to customise.
            </p>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label className={labelCls}>
            Excerpt <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.excerpt}
            onChange={(e) => handleChange("excerpt", e.target.value)}
            placeholder="Short description shown in recipe cards…"
            rows={3}
            className={`${errors.excerpt ? inputErrorCls : inputCls} resize-none`}
          />
          {errors.excerpt && <p className={errorCls}>{errors.excerpt}</p>}
        </div>

        {/* Content */}
        <div>
          <label className={labelCls}>
            Content <span className="text-red-400">*</span>
          </label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => handleChange("content", html)}
            placeholder="Full recipe content, instructions, tips… Use the toolbar to format text and insert images."
            hasError={!!errors.content}
          />
          {errors.content && <p className={errorCls}>{errors.content}</p>}
        </div>
      </div>

      {/* ── Section: Cover Image ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Cover Image
        </h2>
        <p className="text-[10px] text-slate-400 -mt-2">
          Shown as the recipe card thumbnail on the public recipes page.
        </p>
        <ImageUploader
          imageUrl={form.cover_image_url}
          onImageUrl={(url) => handleChange("cover_image_url", url)}
        />
      </div>

      {/* ── Section: Classification ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Classification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className={labelCls}>
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                handleChange(
                  "category",
                  e.target.value as RecipeFormData["category"]
                )
              }
              className={errors.category ? inputErrorCls : inputCls}
            >
              <option value="cooking-demo">Cooking Demo</option>
              <option value="beverage">Beverage</option>
              <option value="how-to">How-To</option>
              <option value="health-tip">Health Tip</option>
            </select>
            {errors.category && <p className={errorCls}>{errors.category}</p>}
          </div>

          {/* Difficulty */}
          <div>
            <label className={labelCls}>
              Difficulty <span className="text-red-400">*</span>
            </label>
            <select
              value={form.difficulty}
              onChange={(e) =>
                handleChange(
                  "difficulty",
                  e.target.value as RecipeFormData["difficulty"]
                )
              }
              className={errors.difficulty ? inputErrorCls : inputCls}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Advanced">Advanced</option>
            </select>
            {errors.difficulty && (
              <p className={errorCls}>{errors.difficulty}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prep Time */}
          <div>
            <label className={labelCls}>Prep Time</label>
            <input
              type="text"
              value={form.prep_time}
              onChange={(e) => handleChange("prep_time", e.target.value)}
              placeholder="e.g. 15 minutes"
              className={inputCls}
            />
          </div>

          {/* Servings */}
          <div>
            <label className={labelCls}>Servings</label>
            <input
              type="text"
              value={form.servings}
              onChange={(e) => handleChange("servings", e.target.value)}
              placeholder="e.g. 4 servings"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* ── Section: Video ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Video
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Platform */}
          <div>
            <label className={labelCls}>
              Platform <span className="text-red-400">*</span>
            </label>
            <select
              value={form.video_platform}
              onChange={(e) =>
                handleChange(
                  "video_platform",
                  e.target.value as RecipeFormData["video_platform"]
                )
              }
              className={errors.video_platform ? inputErrorCls : inputCls}
            >
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
            {errors.video_platform && (
              <p className={errorCls}>{errors.video_platform}</p>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label className={labelCls}>
              Video URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={form.video_url}
              onChange={(e) => handleChange("video_url", e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className={errors.video_url ? inputErrorCls : inputCls}
            />
            {errors.video_url && (
              <p className={errorCls}>{errors.video_url}</p>
            )}
          </div>
        </div>

        {/* Video Thumbnail URL */}
        <div>
          <label className={labelCls}>Thumbnail URL (optional)</label>
          <input
            type="url"
            value={form.video_thumbnail_url}
            onChange={(e) =>
              handleChange("video_thumbnail_url", e.target.value)
            }
            placeholder="https://…"
            className={inputCls}
          />
        </div>
      </div>

      {/* ── Section: Ingredients ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
            Ingredients
          </h2>
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
          >
            <Plus size={13} /> Add
          </button>
        </div>

        {form.ingredients.length === 0 && (
          <p className="text-sm text-slate-300 italic">
            No ingredients added yet.
          </p>
        )}

        <div className="space-y-2">
          {form.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => updateIngredient(index, e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                aria-label="Remove ingredient"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section: Tags ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Tags
        </h2>
        <div>
          <label className={labelCls}>Tags (comma-separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            placeholder="healthy, quick, vegan"
            className={inputCls}
          />
          <p className="mt-1.5 ml-1 text-[10px] text-slate-400">
            Separate tags with commas.
          </p>
        </div>
      </div>

      {/* ── Section: Authorship ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Authorship &amp; Date
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Author */}
          <div>
            <label className={labelCls}>
              Author <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => handleChange("author", e.target.value)}
              placeholder="e.g. Ayola Kitchen"
              className={errors.author ? inputErrorCls : inputCls}
            />
            {errors.author && <p className={errorCls}>{errors.author}</p>}
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>
              Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className={errors.date ? inputErrorCls : inputCls}
            />
            {errors.date && <p className={errorCls}>{errors.date}</p>}
          </div>
        </div>

        {/* Related Product */}
        <div>
          <label className={labelCls}>Related Product (optional)</label>
          <input
            type="text"
            value={form.related_product}
            onChange={(e) => handleChange("related_product", e.target.value)}
            placeholder="e.g. ayola-moringa-powder"
            className={inputCls}
          />
        </div>
      </div>

      {/* ── Section: Visibility ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
          Visibility
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => handleChange("featured", e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  form.featured ? "bg-amber-600" : "bg-slate-200"
                }`}
              />
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.featured ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a2e]">Featured</p>
              <p className="text-[10px] text-slate-400">
                Show in featured section on the homepage
              </p>
            </div>
          </label>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) =>
                  handleChange("is_published", e.target.checked)
                }
                className="sr-only"
              />
              <div
                className={`w-10 h-6 rounded-full transition-colors ${
                  form.is_published ? "bg-amber-600" : "bg-slate-200"
                }`}
              />
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  form.is_published ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a2e]">Published</p>
              <p className="text-[10px] text-slate-400">
                Visible on the public recipes page
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* ── Submit ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-700 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-700/20"
        >
          <Save size={15} />
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
