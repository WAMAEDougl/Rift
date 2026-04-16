"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Upload, Link as LinkIcon, ImageIcon, X, Loader2, ArrowLeft } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { RecipeFormData } from "@/components/admin/RecipeForm";

//  Shared styles 

const inputCls =
  "w-full p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-gray-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 outline-none transition-all placeholder:text-slate-300";

const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";
const errorCls = "mt-1 text-xs font-semibold text-red-500";

//  Helpers 

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

//  Step indicator 

const STEPS = [
  { label: "Basics" },
  { label: "Cover & Excerpt" },
  { label: "Content" },
  { label: "Video & Ingredients" },
  { label: "Review & Publish" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 w-full mb-8 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  done
                    ? "bg-amber-700 border-amber-700 text-white"
                    : active
                    ? "bg-white border-amber-600 text-amber-700"
                    : "bg-white border-slate-200 text-slate-400",
                ].join(" ")}
              >
                {done ? <Check size={14} /> : <span>{i + 1}</span>}
              </div>
              <span
                className={[
                  "mt-1.5 text-[10px] font-semibold whitespace-nowrap",
                  done
                    ? "text-amber-700"
                    : active
                    ? "text-amber-600"
                    : "text-slate-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-0.5 mx-2 mt-[-14px] transition-all",
                  i < current ? "bg-amber-600" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

//  Inline cover image picker 

function CoverImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value.startsWith("http") ? value : "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "recipes");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Upload failed"); return; }
      onChange(json.data.url);
      toast.success("Cover image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function applyUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) { toast.error("Enter a URL"); return; }
    if (!/^https?:\/\/.+/.test(trimmed)) { toast.error("Enter a valid URL"); return; }
    onChange(trimmed);
    toast.success("Cover image set");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      {/* 128x96 preview */}
      <div className="w-32 h-24 shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Cover preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { onChange(""); setUrlInput(""); }}
              className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow transition-colors"
            >
              <X size={11} />
            </button>
          </>
        ) : (
          <div className="text-center">
            <ImageIcon size={20} className="text-slate-200 mx-auto mb-1" />
            <p className="text-[10px] text-slate-300">No image</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === "upload" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Upload size={11} /> Upload
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === "url" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LinkIcon size={11} /> URL
          </button>
        </div>

        {tab === "upload" ? (
          <>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all"
            >
              {uploading
                ? <Loader2 size={16} className="text-amber-600 mx-auto animate-spin" />
                : <p className="text-xs text-slate-400 hover:text-amber-600 transition-colors">Click to choose a file</p>
              }
              <p className="text-[10px] text-slate-300 mt-0.5">JPG, PNG, WebP  max 5MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
              placeholder="https://example.com/image.jpg"
              className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-gray-900 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10 outline-none transition-all placeholder:text-slate-300 min-w-0"
            />
            <button
              type="button"
              onClick={applyUrl}
              className="px-3 py-2.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold transition-colors shrink-0"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Toggle component ─────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? "bg-amber-600" : "bg-slate-200"}`} />
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{label}</p>
        {description && <p className="text-[10px] text-slate-400">{description}</p>}
      </div>
    </label>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const INITIAL_FORM: RecipeFormData = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  category: "cooking-demo",
  video_url: "",
  video_platform: "youtube",
  video_thumbnail_url: "",
  prep_time: "",
  servings: "",
  difficulty: "Easy",
  ingredients: [],
  tags: "",
  author: "",
  date: "",
  featured: false,
  related_product: "",
  is_published: true,
};

export default function NewRecipePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<RecipeFormData>({ ...INITIAL_FORM, date: today() });
  const [errors, setErrors] = useState<Partial<Record<keyof RecipeFormData, string>>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  // ── Field helpers ────────────────────────────────────────────────────────────

  const set = useCallback(<K extends keyof RecipeFormData>(field: K, value: RecipeFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      setForm((prev) => ({
        ...prev,
        title,
        slug: slugManuallyEdited ? prev.slug : generateSlug(title),
      }));
      setErrors((prev) => ({ ...prev, title: undefined, slug: undefined }));
    },
    [slugManuallyEdited]
  );

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setSlugError(null);
    set("slug", e.target.value);
  }, [set]);

  // ── Ingredients ──────────────────────────────────────────────────────────────

  const addIngredient = () => setForm((p) => ({ ...p, ingredients: [...p.ingredients, ""] }));

  const updateIngredient = (i: number, v: string) =>
    setForm((p) => {
      const arr = [...p.ingredients];
      arr[i] = v;
      return { ...p, ingredients: arr };
    });

  const removeIngredient = (i: number) =>
    setForm((p) => ({ ...p, ingredients: p.ingredients.filter((_, idx) => idx !== i) }));

  // ── Per-step validation ──────────────────────────────────────────────────────

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof RecipeFormData, string>> = {};

    if (s === 0) {
      if (!form.title.trim()) errs.title = "Title is required";
      if (!form.slug.trim()) errs.slug = "Slug is required";
      else if (!/^[a-z0-9-]+$/.test(form.slug)) errs.slug = "Slug may only contain lowercase letters, numbers, and hyphens";
      if (!form.category) errs.category = "Category is required";
      if (!form.difficulty) errs.difficulty = "Difficulty is required";
      if (!form.author.trim()) errs.author = "Author is required";
      if (!form.date) errs.date = "Date is required";
    }

    if (s === 2) {
      if (!stripHtml(form.content)) errs.content = "Content is required";
    }

    if (s === 3) {
      if (!form.video_url.trim()) errs.video_url = "Video URL is required";
      else if (!/^https?:\/\/.+/.test(form.video_url)) errs.video_url = "Must be a valid URL";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (validateStep(step)) setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    setSubmitting(true);
    setSlugError(null);
    try {
      // Convert comma-separated tags string → array before sending to API
      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch("/api/admin/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.status === 409) {
        setSlugError("This slug is already taken. Please choose a different one.");
        setStep(0);
        toast.error("Slug conflict — please update the slug on step 1.");
        return;
      }
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to create recipe");
        return;
      }
      toast.success("Recipe created successfully!");
      router.push("/admin/recipes");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6 w-full">
      {/* Back link */}
      <Link
        href="/admin/recipes"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft size={13} /> Back to Recipes
      </Link>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
          New Recipe
        </h1>
        <p className="text-xs text-gray-400 mt-1">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

        {/* ── Step 1: Basics ─────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-700">Basic Information</h2>

            {/* Title */}
            <div>
              <label className={labelCls}>Title <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Mango Smoothie Bowl"
                className={errors.title ? inputCls.replace("border-slate-100", "border-red-300 bg-red-50") : inputCls}
              />
              {errors.title && <p className={errorCls}>{errors.title}</p>}
            </div>

            {/* Slug */}
            <div>
              <label className={labelCls}>Slug <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={form.slug}
                onChange={handleSlugChange}
                placeholder="auto-generated-from-title"
                className={(errors.slug || slugError) ? inputCls.replace("border-slate-100", "border-red-300 bg-red-50") : inputCls}
              />
              {errors.slug && <p className={errorCls}>{errors.slug}</p>}
              {!errors.slug && slugError && <p className={errorCls}>{slugError}</p>}
              {!errors.slug && !slugError && (
                <p className="mt-1 text-[10px] text-slate-400">Auto-generated from title. Edit to customise.</p>
              )}
            </div>

            {/* Category + Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as RecipeFormData["category"])}
                  className={errors.category ? inputCls.replace("border-slate-100", "border-red-300 bg-red-50") : inputCls}
                >
                  <option value="cooking-demo">Cooking Demo</option>
                  <option value="beverage">Beverage</option>
                  <option value="how-to">How-To</option>
                  <option value="health-tip">Health Tip</option>
                </select>
                {errors.category && <p className={errorCls}>{errors.category}</p>}
              </div>
              <div>
                <label className={labelCls}>Difficulty <span className="text-red-400">*</span></label>
                <select
                  value={form.difficulty}
                  onChange={(e) => set("difficulty", e.target.value as RecipeFormData["difficulty"])}
                  className={errors.difficulty ? inputCls.replace("border-slate-100", "border-red-300 bg-red-50") : inputCls}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Advanced">Advanced</option>
                </select>
                {errors.difficulty && <p className={errorCls}>{errors.difficulty}</p>}
              </div>
            </div>

            {/* Author + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Author <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="e.g. Ayola Kitchen"
                  className={errors.author ? inputCls.replace("border-slate-100", "border-red-300 bg-red-50") : inputCls}
                />
                {errors.author && <p className={errorCls}>{errors.author}</p>}
              </div>
              <div>
                <label className={labelCls}>Date <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className={errors.date ? inputCls.replace("border-slate-100", "border-red-300 bg-red-50") : inputCls}
                />
                {errors.date && <p className={errorCls}>{errors.date}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Cover Image & Excerpt ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-700">Cover Image &amp; Excerpt</h2>

            {/* Cover image */}
            <div>
              <label className={labelCls}>Cover Image</label>
              <CoverImagePicker
                value={form.cover_image_url}
                onChange={(url) => set("cover_image_url", url)}
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className={labelCls}>Excerpt</label>
              <RichTextEditor
                value={form.excerpt}
                onChange={(html) => set("excerpt", html)}
                placeholder="Short description shown in recipe cards…"
                minHeight="min-h-[120px]"
              />
              <p className="mt-1 text-[10px] text-slate-400">Optional but recommended for recipe cards.</p>
            </div>
          </div>
        )}

        {/* ── Step 3: Content ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-700">Recipe Content</h2>
            <div>
              <label className={labelCls}>Content <span className="text-red-400">*</span></label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                placeholder="Full recipe content, instructions, tips… Use the toolbar to format text and insert images."
                hasError={!!errors.content}
                minHeight="min-h-[300px]"
              />
              {errors.content && <p className={errorCls}>{errors.content}</p>}
            </div>
          </div>
        )}

        {/* ── Step 4: Video & Ingredients ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-700">Video &amp; Ingredients</h2>

            {/* Video platform + URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Platform</label>
                <select
                  value={form.video_platform}
                  onChange={(e) => set("video_platform", e.target.value as RecipeFormData["video_platform"])}
                  className={inputCls}
                >
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Video URL <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.video_url}
                  onChange={(e) => set("video_url", e.target.value)}
                  placeholder="https://youtube.com/watch?v=…"
                  className={errors.video_url ? inputCls.replace("border-slate-100", "border-red-300 bg-red-50") : inputCls}
                />
                {errors.video_url && <p className={errorCls}>{errors.video_url}</p>}
              </div>
            </div>

            {/* Video thumbnail */}
            <div>
              <label className={labelCls}>Video Thumbnail URL <span className="text-slate-300">(optional)</span></label>
              <input
                type="text"
                value={form.video_thumbnail_url}
                onChange={(e) => set("video_thumbnail_url", e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </div>

            {/* Prep time + Servings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Prep Time <span className="text-slate-300">(optional)</span></label>
                <input
                  type="text"
                  value={form.prep_time}
                  onChange={(e) => set("prep_time", e.target.value)}
                  placeholder="e.g. 15 minutes"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Servings <span className="text-slate-300">(optional)</span></label>
                <input
                  type="text"
                  value={form.servings}
                  onChange={(e) => set("servings", e.target.value)}
                  placeholder="e.g. 4 servings"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls + " mb-0"}>Ingredients</label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              {form.ingredients.length === 0 && (
                <p className="text-sm text-slate-300 italic">No ingredients added yet.</p>
              )}
              <div className="space-y-2">
                {form.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ing}
                      onChange={(e) => updateIngredient(i, e.target.value)}
                      placeholder={`Ingredient ${i + 1}`}
                      className={inputCls + " flex-1"}
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className={labelCls}>Tags <span className="text-slate-300">(comma-separated)</span></label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="healthy, quick, vegan"
                className={inputCls}
              />
              <p className="mt-1 text-[10px] text-slate-400">Separate tags with commas.</p>
            </div>
          </div>
        )}

        {/* ── Step 5: Review & Publish ───────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-700">Review &amp; Publish</h2>
            <p className="text-xs text-slate-400">Review your recipe before publishing. Go back to any step to make changes.</p>

            {/* Summary cards */}
            <div className="space-y-3">
              {/* Basics */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Basics</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div><span className="text-slate-400">Title: </span><span className="font-semibold text-gray-800">{form.title || <em className="text-slate-300">—</em>}</span></div>
                  <div><span className="text-slate-400">Slug: </span><span className="font-mono text-gray-700">{form.slug || <em className="text-slate-300">—</em>}</span></div>
                  <div><span className="text-slate-400">Category: </span><span className="font-semibold text-gray-800">{form.category}</span></div>
                  <div><span className="text-slate-400">Difficulty: </span><span className="font-semibold text-gray-800">{form.difficulty}</span></div>
                  <div><span className="text-slate-400">Author: </span><span className="font-semibold text-gray-800">{form.author || <em className="text-slate-300">—</em>}</span></div>
                  <div><span className="text-slate-400">Date: </span><span className="font-semibold text-gray-800">{form.date || <em className="text-slate-300">—</em>}</span></div>
                </div>
              </div>

              {/* Cover & Excerpt */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cover &amp; Excerpt</p>
                <div className="flex items-start gap-3">
                  {form.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.cover_image_url} alt="Cover" className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                      <ImageIcon size={14} className="text-slate-400" />
                    </div>
                  )}
                  <div className="text-xs text-slate-500 line-clamp-3">
                    {stripHtml(form.excerpt) || <em className="text-slate-300">No excerpt</em>}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Content</p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {stripHtml(form.content) || <em className="text-slate-300">No content</em>}
                </p>
              </div>

              {/* Video */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                  <div><span className="text-slate-400">Platform: </span><span className="font-semibold text-gray-800 capitalize">{form.video_platform}</span></div>
                  <div className="col-span-2"><span className="text-slate-400">URL: </span><span className="font-mono text-gray-700 break-all">{form.video_url || <em className="text-slate-300">—</em>}</span></div>
                  {form.prep_time && <div><span className="text-slate-400">Prep: </span><span className="font-semibold text-gray-800">{form.prep_time}</span></div>}
                  {form.servings && <div><span className="text-slate-400">Servings: </span><span className="font-semibold text-gray-800">{form.servings}</span></div>}
                </div>
              </div>

              {/* Ingredients */}
              {form.ingredients.length > 0 && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingredients ({form.ingredients.length})</p>
                  <ul className="text-xs text-gray-700 space-y-0.5 list-disc list-inside">
                    {form.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                    {form.ingredients.length > 5 && (
                      <li className="text-slate-400">+{form.ingredients.length - 5} more…</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {form.tags && (
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visibility toggles */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visibility</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Toggle
                  checked={form.featured}
                  onChange={(v) => set("featured", v)}
                  label="Featured"
                  description="Show in featured section on the homepage"
                />
                <Toggle
                  checked={form.is_published}
                  onChange={(v) => set("is_published", v)}
                  label="Published"
                  description="Visible on the public recipes page"
                />
              </div>
            </div>
          </div>
        )}

      </div>{/* end step card */}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft size={15} /> Back
            </button>
          )}
        </div>
        <div>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-bold hover:bg-amber-800 transition-colors shadow-sm shadow-amber-700/20"
            >
              Next <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-bold hover:bg-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-700/20"
            >
              {submitting ? (
                <><Loader2 size={15} className="animate-spin" /> Publishing…</>
              ) : (
                <><Check size={15} /> Publish Recipe</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
