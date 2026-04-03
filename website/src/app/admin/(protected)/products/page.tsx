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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white w-full sm:w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => { setStockFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : products.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No products found. Add your first product.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 block">{product.name}</span>
                      <span className="text-gray-400 text-xs">{product.slug}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category_name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-700">{formatKES(product.price)}</td>
                    <td className="px-6 py-4 text-gray-600">{product.size ?? "—"}</td>
                    <td className="px-6 py-4">
                      <ToggleSwitch
                        checked={product.in_stock}
                        onChange={() => handleToggle(product, "in_stock")}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <ToggleSwitch
                        checked={product.is_active}
                        onChange={() => handleToggle(product, "is_active")}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
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

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {(pagination.page - 1) * pagination.per_page + 1}–
              {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={pagination.page === pagination.total_pages}
                className="px-3 py-1 border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
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
            If this product has order history, it will be deactivated instead of permanently deleted.
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
