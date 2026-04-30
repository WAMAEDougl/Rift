"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trash2, Search, Package, TrendingUp, AlertCircle, ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES } from "@/lib/admin/formatters";
import { adminFetch } from "@/lib/admin/fetch";

interface Product {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  category_name: string | null;
  price: number;
  size: string | null;
  image_url: string | null;
  in_stock: boolean;
  is_active: boolean;
  sort_order: number;
}

interface Category { id: string; name: string; }
interface PaginationMeta { page: number; per_page: number; total: number; total_pages: number; }

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-muted"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    const res = await adminFetch("/api/admin/categories");
    const json = await res.json();
    if (json.data) setCategories(json.data as Category[]);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "20");
    if (search) params.set("q", search);
    if (categoryFilter) params.set("category_id", categoryFilter);
    if (stockFilter === "in_stock") params.set("in_stock", "true");
    if (stockFilter === "out_of_stock") params.set("in_stock", "false");

    const res = await adminFetch(`/api/admin/products?${params.toString()}`);
    const json = await res.json();
    if (json.data) {
      setProducts(json.data.items as Product[]);
      setPagination(json.data.pagination as PaginationMeta);
    }
    setLoading(false);
  }, [page, search, categoryFilter, stockFilter]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleToggle(product: Product, field: "in_stock" | "is_active") {
    const value = !product[field];
    const res = await adminFetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (!res.ok) { toast.error("Update failed"); return; }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, [field]: value } : p)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await adminFetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    setDeleteLoading(false);
    if (!res.ok) { toast.error(json.error?.message ?? "Delete failed"); setDeleteTarget(null); return; }
    toast.success(`"${deleteTarget.name}" deleted`);
    setDeleteTarget(null);
    fetchProducts();
  }

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return [];
    const { total_pages } = pagination;
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", total_pages];
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages];
    return [1, "...", page, "...", total_pages];
  };

  const totalValuation = products.reduce((acc, p) => acc + (p.price || 0), 0);
  const stockAlerts = products.filter((p) => !p.in_stock).length;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">Products</h1>
          <p className="text-xs text-muted-foreground mt-1">{pagination?.total.toLocaleString()} total</p>
        </div>
        <Link href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-border rounded-xl px-3 py-2">
          <Search size={15} className="text-muted-foreground/40 shrink-0" />
          <input type="text" placeholder="Product name, slug..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent border-none p-0 text-sm text-foreground focus:ring-0 placeholder:text-muted-foreground/50 outline-none" />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-primary focus:border-primary outline-none">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div className="flex items-center bg-muted/30 rounded-xl p-1 gap-1">
          {(["", "in_stock", "out_of_stock"] as const).map((v) => (
            <button key={v} onClick={() => { setStockFilter(v); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stockFilter === v ? (v === "out_of_stock" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground") : "text-muted-foreground hover:text-foreground"}`}>
              {v === "" ? "All" : v === "in_stock" ? "In Stock" : "Out"}
            </button>
          ))}
        </div>
        <button onClick={() => { setSearch(""); setCategoryFilter(""); setStockFilter(""); setPage(1); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                {["Product","Category","Price","In Stock","Active","Actions"].map((h) => (
                  <th key={h} className={`px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${["In Stock","Active","Actions"].includes(h) ? "text-center" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-xl shrink-0" /><Skeleton className="h-4 w-36 rounded" /></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-10 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-10 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto rounded-xl" /></td>
                    </tr>
                  ))
                : products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border shrink-0 flex items-center justify-center">
                            {product.image_url
                              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              : <Package size={20} className="text-muted-foreground/40" />}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {product.category_name ?? "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground text-sm">{formatKES(product.price)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{product.size ?? "Default"}</p>
                      </td>
                      <td className="px-6 py-4"><div className="flex justify-center"><ToggleSwitch checked={product.in_stock} onChange={() => handleToggle(product, "in_stock")} /></div></td>
                      <td className="px-6 py-4"><div className="flex justify-center"><ToggleSwitch checked={product.is_active} onChange={() => handleToggle(product, "is_active")} /></div></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Pencil size={15} />
                          </Link>
                          <button onClick={() => setDeleteTarget(product)}
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

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={36} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No products found</p>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Showing <span className="text-foreground font-medium">{products.length}</span> of{" "}
              <span className="text-foreground font-medium">{pagination.total.toLocaleString()}</span> products
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-foreground/80 hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground/80 hover:bg-muted"}`}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))} disabled={page >= pagination.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-foreground/80 hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center"><TrendingUp size={16} className="text-secondary" /></div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Catalog Value</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{formatKES(totalValuation)}</p>
        </div>
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Package size={16} className="text-primary" /></div>
            <p className="text-xs text-primary font-medium uppercase tracking-wide">Live Products</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{products.length}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"><AlertCircle size={16} className="text-destructive" /></div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Stock Alerts</p>
          </div>
          <p className="font-display text-2xl font-medium text-destructive">{stockAlerts}</p>
        </div>
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto"><Trash2 size={22} /></div>
            <div className="text-center space-y-1">
              <DialogTitle className="font-display text-lg font-medium text-foreground">Delete Product?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Delete <span className="font-semibold text-foreground">&ldquo;{deleteTarget?.name}&rdquo;</span>? This cannot be undone.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleteLoading}
              className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90">
              {deleteLoading ? "Deleting..." : "Delete Product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
