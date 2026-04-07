"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Trash2,
  ChevronRight,
  Search,
  Package,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { formatKES } from "@/lib/admin/formatters"

interface Product {
  id: string
  slug: string
  name: string
  category_id: string
  category_name: string | null
  price: number
  size: string | null
  image_url: string | null
  in_stock: boolean
  is_active: boolean
  sort_order: number
}

interface Category {
  id: string
  name: string
}

interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-500 shadow-inner group ${
        checked ? "bg-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.4)]" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-all duration-500 ${
          checked ? "translate-x-6 scale-110" : "translate-x-1"
        }`}
      />
    </button>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [stockFilter, setStockFilter] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/admin/categories")
    const json = await res.json()
    if (json.data) setCategories(json.data as Category[])
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("per_page", "20")
    if (search) params.set("q", search)
    if (categoryFilter) params.set("category_id", categoryFilter)
    if (stockFilter === "in_stock") params.set("in_stock", "true")
    if (stockFilter === "out_of_stock") params.set("in_stock", "false")

    const res = await fetch(`/api/admin/products?${params.toString()}`)
    const json = await res.json()
    if (json.data) {
      setProducts(json.data.items as Product[])
      setPagination(json.data.pagination as PaginationMeta)
    }
    setLoading(false)
  }, [page, search, categoryFilter, stockFilter])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  async function handleToggle(product: Product, field: "in_stock" | "is_active") {
    const value = !product[field]
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    if (!res.ok) {
      const json = await res.json()
      toast.error(json.error?.message ?? "Update failed")
      return
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, [field]: value } : p))
    )
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
      method: "DELETE",
    })
    const json = await res.json()
    setDeleteLoading(false)
    if (!res.ok) {
      toast.error(json.error?.message ?? "Delete failed")
      setDeleteTarget(null)
      return
    }
    if (json.data?.soft_deleted) {
      toast.success(`"${deleteTarget.name}" was deactivated (has order history)`)
    } else {
      toast.success(`"${deleteTarget.name}" was deleted`)
    }
    setDeleteTarget(null)
    fetchProducts()
  }

  const clearFilters = () => {
    setSearch("")
    setCategoryFilter("")
    setStockFilter("")
    setPage(1)
  }

  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.price || 0), 0)
  }, [products])

  const stockAlerts = useMemo(() => {
    return products.filter((p) => !p.in_stock).length
  }, [products])

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return []
    const { total_pages } = pagination
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, "...", total_pages]
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages]
    return [1, "...", page, "...", total_pages]
  }

  const showingFrom = pagination ? (pagination.page - 1) * pagination.per_page + 1 : 0
  const showingTo = pagination ? Math.min(pagination.page * pagination.per_page, pagination.total) : 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <p className="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.4em] animate-in slide-in-from-left duration-500">Catalog</p>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Products
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
               {pagination?.total.toLocaleString()} Total Products
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">View and manage all products</p>
          </div>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#1a1a2e] text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-3 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
        >
           <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-700">add_circle</span>
           <span className="relative z-10">Add New Product</span>
        </Link>
      </div>

      {/* ── Sophisticated Filter Rows ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="md:col-span-12 lg:col-span-8 bg-white p-2 rounded-[32px] border border-slate-50 shadow-[0_10px_40px_-10px_rgba(26,26,46,0.04)] flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-slate-50 relative group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="flex-1 flex items-center gap-4 px-6 py-4 relative z-10">
            <span className="material-symbols-outlined text-slate-300 text-lg">search</span>
             <div className="flex flex-col w-full">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Search Products</span>
              <input
                type="text"
                placeholder="Product name, slug..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="bg-transparent border-none p-0 text-sm font-bold text-[#1a1a2e] focus:ring-0 w-full placeholder:text-slate-200 outline-none leading-none"
              />
            </div>
          </div>

          <div className="flex-1 flex items-center gap-4 px-6 py-4 relative z-10">
            <span className="material-symbols-outlined text-slate-300 text-lg">category</span>
            <div className="flex flex-col w-full">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#22c55e] mb-1">Category</span>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
                className="bg-transparent border-none p-0 text-sm font-black text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none capitalize leading-none w-full"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center px-6 py-4 relative z-10">
            <button
              onClick={clearFilters}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-300 hover:text-[#1a1a2e] transition-all group/reset"
            >
              <span className="material-symbols-outlined group-active/reset:rotate-180 transition-transform duration-500">restart_alt</span>
            </button>
          </div>
        </div>

        {/* Dynamic Availability Toggles */}
        <div className="md:col-span-12 lg:col-span-4 bg-[#fcf8ff] p-2 rounded-[32px] border border-white shadow-sm flex items-center">
           <div className="flex w-full bg-white/50 p-1 rounded-[24px] shadow-inner">
             <button
               onClick={() => setStockFilter("")}
               className={`flex-1 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-[20px] transition-all ${
                 stockFilter === "" ? "bg-[#1a1a2e] text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
               }`}
             >
               All
             </button>
             <button
               onClick={() => setStockFilter("in_stock")}
               className={`flex-1 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-[20px] transition-all ${
                 stockFilter === "in_stock" ? "bg-[#22c55e] text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
               }`}
             >
               In Stock
             </button>
             <button
               onClick={() => setStockFilter("out_of_stock")}
               className={`flex-1 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-[20px] transition-all ${
                 stockFilter === "out_of_stock" ? "bg-red-500 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
               }`}
             >
               Out
             </button>
           </div>
        </div>
      </section>

      {/* ── Products Data Catalog ── */}
      <section className="bg-white rounded-[60px] overflow-hidden shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] border border-slate-50/50">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100/50">
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Product Details</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Price</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">In Stock</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Live Status</th>
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-10">
                         <div className="flex items-center gap-6">
                            <Skeleton className="w-20 h-20 rounded-[28px]" />
                            <div className="space-y-3">
                               <Skeleton className="h-5 w-40 rounded-lg" />
                               <Skeleton className="h-3 w-56 rounded-lg opacity-40" />
                            </div>
                         </div>
                      </td>
                      <td className="p-8"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-20 rounded-lg" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-12 mx-auto rounded-full" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-12 mx-auto rounded-full" /></td>
                      <td className="p-10 text-right"><Skeleton className="h-10 w-24 ml-auto rounded-2xl" /></td>
                    </tr>
                  ))
                : products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#fcf8ff] transition-all duration-300 group border-b border-slate-50 last:border-0 relative">
                      <td className="p-10">
                        <div className="flex items-center gap-6 transition-transform group-hover:translate-x-2 duration-500">
                          <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-2 shadow-inner">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-slate-200 text-3xl">package_2</span>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-lg text-[#1a1a2e] tracking-tight">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[9px] font-black uppercase tracking-widest text-[#22c55e] bg-[#22c55e]/5 px-2 py-0.5 rounded-md">SKU</span>
                               <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{product.slug}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-blue-50/50 text-blue-600 border border-blue-100/50">
                          {product.category_name ?? "General"}
                        </span>
                      </td>
                      <td className="p-8">
                        <p className="font-black text-[#1a1a2e] text-lg tracking-tighter">{formatKES(product.price)}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest opacity-60">{product.size ?? "Default Unit"}</p>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={product.in_stock}
                            onChange={() => handleToggle(product, "in_stock")}
                          />
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={product.is_active}
                            onChange={() => handleToggle(product, "is_active")}
                          />
                        </div>
                      </td>
                      <td className="p-10 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-[#22c55e] hover:bg-[#22c55e]/5 transition-all shadow-sm border border-slate-50"
                          >
                             <span className="material-symbols-outlined text-xl">edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-slate-50"
                          >
                             <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty Catalog State */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-32 h-32 bg-slate-50/50 rounded-full flex items-center justify-center mb-8 text-5xl animate-in zoom-in duration-700">📦</div>
            <h3 className="text-3xl font-black text-[#1a1a2e] mb-3 tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>No products found</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-60">
              We couldn't find any products matching your current search or filters.
            </p>
          </div>
        )}

        {/* Precision Pagination Control */}
        {pagination && pagination.total_pages > 1 && (
          <div className="p-10 bg-[#fcf8ff]/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing <span className="text-[#1a1a2e]">{showingFrom}-{showingTo}</span> / <span className="text-[#1a1a2e]">{pagination.total.toLocaleString()}</span> products
            </p>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 duration-300"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-3 p-2 bg-white border border-slate-100 rounded-[28px] shadow-sm">
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-12 h-12 flex items-center justify-center text-slate-200 font-bold">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-12 h-12 rounded-2xl font-black text-[11px] transition-all ${
                        p === page
                          ? "bg-[#1a1a2e] text-white shadow-xl shadow-[#1a1a2e]/20 scale-110"
                          : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                 className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 duration-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Analytical Summary Hub ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[48px] shadow-[0_4px_40px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between min-h-[180px] hover:translate-y-[-4px] transition-transform group">
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Total Catalog Value</p>
             <h3 className="text-4xl font-black text-[#1a1a2e] tracking-tighter leading-none" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>{formatKES(totalValuation)}</h3>
          </div>
          <div className="pt-4 border-t border-slate-50 mt-4 flex items-center gap-3">
             <TrendingUp size={16} className="text-[#22c55e]" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Calculated from listed prices</span>
          </div>
        </div>

        <div className="bg-[#1a1a2e] p-10 rounded-[48px] shadow-2xl flex flex-col justify-between min-h-[180px] relative overflow-hidden group border border-white/5">
          <Package size={180} className="absolute -right-12 -bottom-12 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] leading-none mb-1">Live Products</p>
             <h3 className="text-4xl font-black text-white tracking-tighter leading-none">{products.length} Products</h3>
          </div>
          <div className="relative z-10 pt-4 border-t border-white/10 mt-4 flex justify-between items-center">
            <span className="text-[10px] font-black text-white opacity-60 uppercase tracking-widest">Availability: Healthy</span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-[0_4px_40px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between min-h-[180px] hover:translate-y-[-4px] transition-transform group text-red-600">
          <div className="space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Stock Alerts</p>
             <h3 className="text-4xl font-black tracking-tighter leading-none" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>{stockAlerts} Out of Stock</h3>
          </div>
          <div className="pt-4 border-t border-slate-50 mt-4 flex items-center gap-3">
            <AlertCircle size={16} className={stockAlerts > 0 ? "animate-bounce" : "opacity-30"} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Items needing attention</span>
          </div>
        </div>
      </section>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-lg rounded-[40px] p-12 border-none shadow-[0_60px_120px_rgba(0,0,0,0.5)] bg-white animate-in zoom-in-95">
          <DialogHeader className="space-y-6 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mx-auto shadow-inner">
               <span className="material-symbols-outlined text-5xl">delete_forever</span>
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                Delete Product?
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                Are you sure you want to delete <span className="text-[#1a1a2e] font-black">&ldquo;{deleteTarget?.name}&rdquo;</span>? This action cannot be undone.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-10 flex-row gap-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 px-4 py-5 bg-red-600 hover:bg-red-700 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(220,38,38,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              {deleteLoading ? "Deleting..." : "Delete Product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
