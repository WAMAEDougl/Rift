"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No categories yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tagline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ships Countrywide</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4 text-2xl">{cat.icon ?? "—"}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                    <td className="px-6 py-4 text-gray-600">{cat.tagline ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {cat.ships_countrywide ? (
                        <span className="text-green-600 font-medium">✓</span>
                      ) : (
                        <span className="text-gray-300">−</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cat.product_count}</td>
                    <td className="px-6 py-4 text-gray-600">{cat.sort_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/categories/${cat.id}/edit`}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Categories with existing products cannot be deleted. Reassign or remove products first.
          </p>
          <DialogFooter>
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
