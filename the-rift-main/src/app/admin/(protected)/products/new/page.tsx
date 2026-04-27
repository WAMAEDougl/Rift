"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface Category { id: string; name: string; }

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category_id: "",
    description: "",
    long_description: "",
    price: "",
    size: "",
    image_url: "",
    badge: "",
    in_stock: true,
    is_active: true,
    sort_order: "0",
    features: "",
    ingredients: "",
    nutrition_highlights: "",
  });

  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => { if (j.data) setCategories(j.data); });
  }, []);

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    set("name", name);
    if (!slugManual) set("slug", slugify(name));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Upload failed"); return; }
      set("image_url", json.data.url);
      setImagePreview(json.data.url);
      toast.success("Image uploaded");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category_id: form.category_id,
        description: form.description.trim() || null,
        long_description: form.long_description.trim() || null,
        price: parseInt(form.price, 10),
        size: form.size.trim() || null,
        image_url: form.image_url.trim() || null,
        badge: form.badge.trim() || null,
        in_stock: form.in_stock,
        is_active: form.is_active,
        sort_order: parseInt(form.sort_order, 10) || 0,
        features: form.features ? form.features.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        ingredients: form.ingredients.trim() || null,
        nutrition_highlights: form.nutrition_highlights
          ? form.nutrition_highlights.split("\n").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Failed to create product"); return; }
      toast.success(`"${form.name}" created`);
      router.push("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
  const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">New Product</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Add a product to the catalogue</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — main fields */}
          <div className="lg:col-span-2 space-y-6">

            {/* Basic info */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-display text-base font-medium text-foreground">Basic Information</h2>

              <div>
                <label className={labelCls}>Product Name *</label>
                <input type="text" value={form.name} onChange={handleNameChange} required
                  placeholder="e.g. Heritage Ugali Blend" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Slug *</label>
                <input type="text" value={form.slug}
                  onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
                  required pattern="[a-z0-9-]+" title="Lowercase letters, numbers and hyphens only"
                  placeholder="heritage-ugali-blend" className={inputCls} />
                <p className="text-xs text-muted-foreground mt-1">Used in the product URL. Auto-generated from name.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select value={form.category_id} onChange={(e) => set("category_id", e.target.value)} required
                    className={inputCls}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Price (KES) *</label>
                  <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                    required min="1" placeholder="450" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Size / Variant</label>
                  <input type="text" value={form.size} onChange={(e) => set("size", e.target.value)}
                    placeholder="e.g. 500g, 1L" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Badge</label>
                  <input type="text" value={form.badge} onChange={(e) => set("badge", e.target.value)}
                    placeholder="e.g. New, Bestseller" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Short Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder="A brief description shown on product cards..."
                  className={inputCls + " resize-none"} />
              </div>

              <div>
                <label className={labelCls}>Full Description</label>
                <textarea value={form.long_description} onChange={(e) => set("long_description", e.target.value)}
                  rows={5} placeholder="Detailed product description for the product page..."
                  className={inputCls + " resize-none"} />
              </div>
            </div>

            {/* Details */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-display text-base font-medium text-foreground">Product Details</h2>

              <div>
                <label className={labelCls}>Features</label>
                <textarea value={form.features} onChange={(e) => set("features", e.target.value)}
                  rows={4} placeholder={"One feature per line:\nHigh in fibre\nGluten-free\nNo preservatives"}
                  className={inputCls + " resize-none font-mono text-xs"} />
              </div>

              <div>
                <label className={labelCls}>Ingredients</label>
                <textarea value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)}
                  rows={3} placeholder="Maize flour, finger millet, sorghum..."
                  className={inputCls + " resize-none"} />
              </div>

              <div>
                <label className={labelCls}>Nutrition Highlights</label>
                <textarea value={form.nutrition_highlights} onChange={(e) => set("nutrition_highlights", e.target.value)}
                  rows={3} placeholder={"One highlight per line:\nHigh protein\nRich in iron"}
                  className={inputCls + " resize-none font-mono text-xs"} />
              </div>
            </div>
          </div>

          {/* Right column — image + status */}
          <div className="space-y-6">

            {/* Image */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-display text-base font-medium text-foreground">Product Image</h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer overflow-hidden bg-muted/30 flex items-center justify-center group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); set("image_url", ""); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-background/90 rounded-full flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors">
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    {uploading
                      ? <Loader2 size={28} className="text-muted-foreground/40 mx-auto animate-spin" />
                      : <>
                          <Upload size={28} className="text-muted-foreground/30 mx-auto mb-2 group-hover:text-primary/50 transition-colors" />
                          <p className="text-xs text-muted-foreground">Click to upload</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG up to 5MB</p>
                        </>
                    }
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              <div>
                <label className={labelCls}>Or paste image URL</label>
                <input type="url" value={form.image_url}
                  onChange={(e) => { set("image_url", e.target.value); setImagePreview(e.target.value || null); }}
                  placeholder="https://..." className={inputCls} />
              </div>
            </div>

            {/* Status */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="font-display text-base font-medium text-foreground">Status</h2>

              {[
                { field: "in_stock", label: "In Stock", desc: "Product is available to purchase" },
                { field: "is_active", label: "Active / Visible", desc: "Show on the storefront" },
              ].map(({ field, label, desc }) => (
                <div key={field} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <button type="button"
                    onClick={() => set(field, !form[field as keyof typeof form])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${form[field as keyof typeof form] ? "bg-primary" : "bg-muted"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform duration-200 ${form[field as keyof typeof form] ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              ))}

              <div>
                <label className={labelCls}>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)}
                  min="0" placeholder="0" className={inputCls} />
                <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-3">
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-3 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50">
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Package size={15} /> Create Product</>}
              </button>
              <Link href="/admin/products"
                className="w-full flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
