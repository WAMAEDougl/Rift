"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus, FolderOpen, Download } from "lucide-react"
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

  function downloadReport() {
    if (categories.length === 0) { toast.error("No categories to export"); return }
    const rows = [
      ["Name", "Slug", "Tagline", "Icon", "Ships Countrywide", "Product Count", "Sort Order"],
      ...categories.map((c) => [
        c.name, c.slug, c.tagline ?? "", c.icon ?? "",
        c.ships_countrywide ? "Yes" : "No",
        String(c.product_count), String(c.sort_order),
      ]),
    ]
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `categories-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Report downloaded")
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Categories
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {categories.length} total &middot; Manage how products are organized on the storefront
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadReport}
            className="inline-flex items-center gap-2 border border-gray-200 hover:border-amber-300 hover:bg-amber-50 text-gray-600 hover:text-amber-700 font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Download size={15} />
            Download Report
          </button>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Add Category
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Shipping</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Products</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-10 rounded-xl mx-auto" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-40 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28 rounded opacity-50" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-10 mx-auto rounded" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-xl" /></td>
                    </tr>
                  ))
                : categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl border border-amber-100">
                          {cat.icon ?? "📦"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.tagline ?? "No tagline"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                          {cat.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            cat.ships_countrywide
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {cat.ships_countrywide ? "Countrywide" : "Local only"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        {cat.product_count}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/categories/${cat.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
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
            <FolderOpen size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No categories yet</p>
            <p className="text-xs text-gray-400 mt-1">Add a category to get started</p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-lg font-bold text-gray-900">
                Delete Category?
              </DialogTitle>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">&ldquo;{deleteTarget?.name}&rdquo;</span>?
                Categories linked to products cannot be deleted.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
