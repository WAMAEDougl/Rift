"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, Pencil, Trash2, Loader2, Search,
  Star, Clock, Users, ChevronDown, ChevronUp, Save, X,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { recipes as staticRecipes, type Recipe } from "@/lib/recipes";

const CATEGORIES = [
  { value: "cooking-demo", label: "Cooking Demo" },
  { value: "beverage", label: "Beverage" },
  { value: "how-to", label: "How-To Guide" },
  { value: "health-tip", label: "Health Tip" },
];

const DIFFICULTIES = ["Easy", "Medium", "Advanced"] as const;
const PLATFORMS = ["youtube", "facebook", "instagram", "tiktok"] as const;

const CAT_COLORS: Record<string, string> = {
  "cooking-demo": "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  "beverage":     "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  "how-to":       "bg-green-500/10 text-green-600 border border-green-500/20",
  "health-tip":   "bg-purple-500/10 text-purple-600 border border-purple-500/20",
};

const DIFF_COLORS: Record<string, string> = {
  Easy:     "bg-green-500/10 text-green-600",
  Medium:   "bg-amber-500/10 text-amber-600",
  Advanced: "bg-destructive/10 text-destructive",
};

const emptyForm = {
  slug: "", title: "", excerpt: "", content: "",
  category: "cooking-demo" as Recipe["category"],
  videoUrl: "", videoPlatform: "youtube" as typeof PLATFORMS[number],
  prepTime: "", servings: "", difficulty: "Easy" as typeof DIFFICULTIES[number],
  ingredients: "", tags: "", author: "Prisca Kiragu",
  date: new Date().toISOString().slice(0, 10),
  featured: false, relatedProduct: "",
};

const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function RecipesPage() {
  // Recipes are stored in src/lib/recipes.ts (static file)
  // Admin can view, edit (shows form pre-filled), and the changes are shown as a diff
  // In production these would be stored in DB; for now we show the static list
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(staticRecipes);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Recipe | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const filtered = allRecipes.filter((r) => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.tags.some((t) => t.includes(search.toLowerCase()));
    const matchCat = !catFilter || r.category === catFilter;
    return matchSearch && matchCat;
  });

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(r: Recipe) {
    setEditTarget(r);
    setForm({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      category: r.category,
      videoUrl: r.video.url,
      videoPlatform: r.video.platform,
      prepTime: r.prepTime ?? "",
      servings: r.servings ?? "",
      difficulty: r.difficulty,
      ingredients: (r.ingredients ?? []).join("\n"),
      tags: r.tags.join(", "),
      author: r.author,
      date: r.date,
      featured: r.featured ?? false,
      relatedProduct: r.relatedProduct ?? "",
    });
    setModalOpen(true);
  }

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "title" && !editTarget) {
      setForm((prev) => ({ ...prev, slug: slugify(value as string) }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated: Recipe = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        category: form.category,
        video: { url: form.videoUrl.trim(), platform: form.videoPlatform },
        prepTime: form.prepTime.trim() || undefined,
        servings: form.servings.trim() || undefined,
        difficulty: form.difficulty,
        ingredients: form.ingredients ? form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean) : [],
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        author: form.author.trim(),
        date: form.date,
        featured: form.featured,
        relatedProduct: form.relatedProduct.trim() || undefined,
      };

      if (editTarget) {
        setAllRecipes((prev) => prev.map((r) => r.slug === editTarget.slug ? updated : r));
        toast.success("Recipe updated — remember to update src/lib/recipes.ts to persist changes");
      } else {
        setAllRecipes((prev) => [...prev, updated]);
        toast.success("Recipe added — remember to update src/lib/recipes.ts to persist changes");
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setAllRecipes((prev) => prev.filter((r) => r.slug !== deleteTarget.slug));
    toast.success(`"${deleteTarget.title}" removed`);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">Recipes</h1>
          <p className="text-xs text-muted-foreground mt-1">{allRecipes.length} recipes · Manage cooking guides and health tips</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90">
          <Plus size={16} /> Add Recipe
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: allRecipes.length, color: "bg-primary/10 text-primary" },
          { label: "Featured", value: allRecipes.filter((r) => r.featured).length, color: "bg-amber-500/10 text-amber-600" },
          { label: "Cooking Demos", value: allRecipes.filter((r) => r.category === "cooking-demo").length, color: "bg-orange-500/10 text-orange-600" },
          { label: "Health Tips", value: allRecipes.filter((r) => r.category === "health-tip").length, color: "bg-purple-500/10 text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <BookOpen size={16} />
            </div>
            <p className="font-display text-2xl font-medium text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-border rounded-xl px-3 py-2">
          <Search size={15} className="text-muted-foreground/40 shrink-0" />
          <input type="text" placeholder="Search recipes or tags..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none p-0 text-sm text-foreground focus:ring-0 placeholder:text-muted-foreground/50 outline-none" />
        </div>
        <div className="flex items-center bg-muted/30 rounded-xl p-1 gap-1">
          <button onClick={() => setCatFilter("")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!catFilter ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setCatFilter(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${catFilter === c.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <BookOpen size={36} className="text-muted-foreground/20" />
            <p className="text-sm font-medium text-muted-foreground">No recipes found</p>
          </div>
        ) : filtered.map((r) => (
          <div key={r.slug} className="p-5 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${CAT_COLORS[r.category] ?? "bg-muted text-muted-foreground"}`}>
                    {CATEGORIES.find((c) => c.value === r.category)?.label ?? r.category}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${DIFF_COLORS[r.difficulty]}`}>
                    {r.difficulty}
                  </span>
                  {r.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600">
                      <Star size={9} /> Featured
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.excerpt}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {r.prepTime && <span className="flex items-center gap-1"><Clock size={11} /> {r.prepTime}</span>}
                  {r.servings && <span className="flex items-center gap-1"><Users size={11} /> {r.servings}</span>}
                  <span className="font-mono">{r.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setExpandedSlug(expandedSlug === r.slug ? null : r.slug)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  {expandedSlug === r.slug ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <button onClick={() => openEdit(r)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleteTarget(r)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {expandedSlug === r.slug && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {r.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-lg bg-muted text-foreground">{t}</span>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">Video</p>
                    <p className="text-foreground font-mono truncate">{r.video.url}</p>
                    <p className="text-muted-foreground capitalize">{r.video.platform}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) setModalOpen(false); }}>
        <DialogContent className="max-w-3xl rounded-2xl p-6 bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-medium text-foreground">
              {editTarget ? "Edit Recipe" : "New Recipe"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-4 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className={labelCls}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} required className={inputCls} placeholder="Recipe title" />
              </div>
              <div>
                <label className={labelCls}>Slug *</label>
                <input type="text" value={form.slug} onChange={(e) => set("slug", e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Category *</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className={labelCls}>Excerpt *</label>
                <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} required rows={2} className={inputCls + " resize-none"} placeholder="Short description shown on recipe cards" />
              </div>
              <div className="lg:col-span-2">
                <label className={labelCls}>Full Content (Markdown)</label>
                <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={10} className={inputCls + " resize-none font-mono text-xs"} placeholder="Full recipe content in Markdown..." />
              </div>
              <div>
                <label className={labelCls}>Video URL</label>
                <input type="url" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} className={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label className={labelCls}>Video Platform</label>
                <select value={form.videoPlatform} onChange={(e) => set("videoPlatform", e.target.value)} className={inputCls}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Prep Time</label>
                <input type="text" value={form.prepTime} onChange={(e) => set("prepTime", e.target.value)} className={inputCls} placeholder="e.g. 45 mins" />
              </div>
              <div>
                <label className={labelCls}>Servings</label>
                <input type="text" value={form.servings} onChange={(e) => set("servings", e.target.value)} className={inputCls} placeholder="e.g. 4-6 servings" />
              </div>
              <div>
                <label className={labelCls}>Difficulty</label>
                <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={inputCls}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Author</label>
                <input type="text" value={form.author} onChange={(e) => set("author", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Related Product Slug</label>
                <input type="text" value={form.relatedProduct} onChange={(e) => set("relatedProduct", e.target.value)} className={inputCls} placeholder="e.g. plantain-kvass" />
              </div>
              <div className="lg:col-span-2">
                <label className={labelCls}>Ingredients (one per line)</label>
                <textarea value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} rows={5} className={inputCls + " resize-none font-mono text-xs"} placeholder={"2 cups basmati rice\n300g minced meat\n..."} />
              </div>
              <div className="lg:col-span-2">
                <label className={labelCls}>Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)} className={inputCls} placeholder="pilau, rice, main course" />
              </div>
              <div className="lg:col-span-2 flex items-center gap-3">
                <button type="button" onClick={() => set("featured", !form.featured)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.featured ? "bg-amber-500" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${form.featured ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm font-medium text-foreground">Featured recipe</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              Changes are previewed here. To persist them permanently, update <code className="font-mono">src/lib/recipes.ts</code> with the new data.
            </div>

            <DialogFooter className="flex-row gap-3 pt-2 border-t border-border">
              <button type="button" onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {editTarget ? "Save Changes" : "Add Recipe"}</>}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-card">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="font-display text-lg font-medium text-foreground">Remove Recipe?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Remove <span className="font-semibold text-foreground">&ldquo;{deleteTarget?.title}&rdquo;</span> from the list?
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors hover:opacity-90">
              Remove
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
