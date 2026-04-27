"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Pencil, Trash2, Loader2, X, Package } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  sort_order: number;
  product_count: number;
}

const emptyForm = { slug: "", name: "", tagline: "", description: "", sort_order: "0" };

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.data) setCategories(json.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setSlugManual(false);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setForm({
      slug: cat.slug,
      name: cat.name,
      tagline: cat.tagline ?? "",
      description: cat.description ?? "",
      sort_order: String(cat.sort_order),
    });
    setSlugManual(true);
    setModalOpen(true);
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    set("name", name);
    if (!slugManual) set("slug", slugify(name));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        tagline: form.tagline.trim() || undefined,
        description: form.description.trim() || undefined,
        sort_order: parseInt(form.sort_order, 10) || 0,
      };

      const url = editTarget ? `/api/admin/categories/${editTarget.id}` : "/api/admin/categories";
      const method = editTarget ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Save failed"); return; }
      toast.success(editTarget ? "Category updated" : "Category created");
      setModalOpen(false);
      fetchCategories();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    setDeleteLoading(false);
    if (!res.ok) { toast.error(json.error?.message ?? "Delete failed"); setDeleteTarget(null); return; }
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
    fetchCategories();
  }

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">Categories</h1>
          <p className="text-xs text-muted-foreground mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                {["Category", "Slug", "Products", "Sort", "Actions"].map((h) => (
                  <th key={h} className={`px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-10 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-8 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto rounded-xl" /></td>
                    </tr>
                  ))
                : categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Tag size={15} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{cat.name}</p>
                            {cat.tagline && <p className="text-xs text-muted-foreground mt-0.5">{cat.tagline}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">{cat.slug}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Package size={13} className="text-muted-foreground/60" />
                          <span className="text-sm text-foreground font-medium">{cat.product_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{cat.sort_order}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(cat)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(cat)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Tag size={36} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No categories yet</p>
            <button onClick={openCreate} className="mt-4 text-primary text-sm font-medium hover:underline">
              Add your first category
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) setModalOpen(false); }}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-medium text-foreground">
              {editTarget ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className={labelCls}>Name *</label>
              <input type="text" value={form.name} onChange={handleNameChange} required
                placeholder="e.g. Beverages" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input type="text" value={form.slug}
                onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
                required pattern="[a-z0-9-]+" title="Lowercase letters, numbers and hyphens only"
                placeholder="beverages" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tagline</label>
              <input type="text" value={form.tagline} onChange={(e) => set("tagline", e.target.value)}
                placeholder="Short description shown on category cards" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                rows={3} placeholder="Longer description..." className={inputCls + " resize-none"} />
            </div>
            <div>
              <label className={labelCls}>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)}
                min="0" className={inputCls} />
            </div>
            <DialogFooter className="flex-row gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : editTarget ? "Save Changes" : "Create Category"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="font-display text-lg font-medium text-foreground">Delete Category?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Delete <span className="font-semibold text-foreground">&ldquo;{deleteTarget?.name}&rdquo;</span>?
                {(deleteTarget?.product_count ?? 0) > 0 && (
                  <span className="block mt-1 text-destructive font-medium">
                    This category has {deleteTarget?.product_count} product(s). Reassign them first.
                  </span>
                )}
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleteLoading || (deleteTarget?.product_count ?? 0) > 0}
              className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90">
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
