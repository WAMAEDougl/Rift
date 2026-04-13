"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

interface Category {
  id: string
  slug: string
  name: string
  tagline: string | null
  icon: string | null
  ships_countrywide: boolean
  product_count: number
  sort_order: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/categories")
    const json = await res.json()
    if (json.data) setCategories(json.data as Category[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
      method: "DELETE",
    })
    const json = await res.json()
    setDeleteLoading(false)
    if (!res.ok) {
      toast.error(json.error?.message ?? "Delete failed")
      setDeleteTarget(null)
      return
    }
    toast.success(`"${deleteTarget.name}" was deleted`)
    setDeleteTarget(null)
    fetchCategories()
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full px-4">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <p className="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.4em] animate-in slide-in-from-left duration-500">Product Categories</p>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Categories
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
               {categories.length} Total Categories
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Manage how your products are organized on the storefront</p>
          </div>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-[#1a1a2e] text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-3 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
        >
           <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-700">add_circle</span>
           <span className="relative z-10">Add Category</span>
        </Link>
      </div>

      {/* ── Data Catalog Grid ── */}
      <section className="bg-white rounded-[60px] overflow-hidden shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] border border-slate-50/50">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100/50">
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 w-32">Visual Icon</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Category Details</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">URL Slug</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Shipping</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Products</th>
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-10 text-center"><Skeleton className="h-12 w-12 rounded-2xl mx-auto" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-40 rounded-lg" /></td>
                      <td className="p-8"><Skeleton className="h-4 w-32 rounded-lg opacity-40" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-12 mx-auto rounded-full" /></td>
                      <td className="p-8"><Skeleton className="h-8 w-16 mx-auto rounded-2xl" /></td>
                      <td className="p-10 text-right"><Skeleton className="h-10 w-24 ml-auto rounded-2xl" /></td>
                    </tr>
                  ))
                : categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#fcf8ff] transition-all duration-300 group border-b border-slate-50 last:border-0 relative">
                     <td className="p-10 text-center">
                        <div className="w-16 h-16 rounded-[28px] bg-slate-50/50 flex items-center justify-center text-3xl shadow-inner border border-slate-100 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6">
                          {cat.icon ?? "📦"}
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="font-black text-[#1a1a2e] text-lg tracking-tight">{cat.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60 line-clamp-1">{cat.tagline ?? "No context provided"}</p>
                      </td>
                      <td className="p-8">
                         <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl w-fit">
                           {cat.slug}
                         </div>
                      </td>
                      <td className="p-8 text-center">
                         <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${cat.ships_countrywide ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-slate-100 text-slate-400"}`}>
                           {cat.ships_countrywide ? "Countrywide Enabled" : "Local Restricted"}
                         </div>
                      </td>
                      <td className="p-8 text-center text-sm font-black text-[#1a1a2e]">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-[20px] shadow-sm">
                           {cat.product_count}
                         </div>
                      </td>
                      <td className="p-10 text-right">
                         <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <Link
                            href={`/admin/categories/${cat.id}/edit`}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-[#22c55e] hover:bg-[#22c55e]/5 transition-all shadow-sm border border-slate-50"
                          >
                             <span className="material-symbols-outlined text-xl">edit</span>
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(cat)}
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
        {!loading && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-32 h-32 bg-slate-50/50 rounded-full flex items-center justify-center mb-8 text-5xl animate-in zoom-in duration-700">📂</div>
            <h3 className="text-3xl font-black text-[#1a1a2e] mb-3 tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>No taxonomy detected</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-60">
              The category stream is currently empty. Initialize the catalog by injecting a new taxonomic node.
            </p>
          </div>
        )}
      </section>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
         <DialogContent className="max-w-lg rounded-[40px] p-12 border-none shadow-[0_60px_120px_rgba(0,0,0,0.5)] bg-white animate-in zoom-in-95">
          <DialogHeader className="space-y-6 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mx-auto shadow-inner">
               <span className="material-symbols-outlined text-5xl">folder_off</span>
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                Purge Category?
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                Nodes linked to active products cannot be purged. Ensure zero dependencies before confirming deletion of <span className="text-[#1a1a2e] font-black">&ldquo;{deleteTarget?.name}&rdquo;</span>.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-10 flex-row gap-4">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Retain Node
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 px-4 py-5 bg-red-600 hover:bg-red-700 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(220,38,38,0.3)] transition-all active:scale-95 disabled:opacity-50"
            >
              {deleteLoading ? "Purging Taxonomy..." : "Confirm Purge"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
