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
  Pencil,
  Plus,
  Eye,
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

function StatusBadge({ active, labelOn, labelOff }: { active: boolean; labelOn: string; labelOff: string }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      {labelOn}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      {labelOff}
    </span>
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
  const [activeFilter, setActiveFilter] = useState("")
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
    params.set("per_page", "10")
    if (search) params.set("q", search)
    if (categoryFilter) params.set("category_id", categoryFilter)
    if (stockFilter === "in_stock") params.set("in_stock", "true")
    if (stockFilter === "out_of_stock") params.set("in_stock", "false")
    if (activeFilter === "active") params.set("is_active", "true")
    if (activeFilter === "inactive") params.set("is_active", "false")

    const res = await fetch(`/api/admin/products?${params.toString()}`)
    const json = await res.json()
    if (json.data) {
      setProducts(json.data.items as Product[])
      setPagination(json.data.pagination as PaginationMeta)
    }
    setLoading(false)
  }, [page, search, categoryFilter, stockFilter, activeFilter])

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
    setActiveFilter("")
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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"
            style={{ fontFamily: "var(--font-playfair, serif)" }}
          >
            Products
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {pagination?.total.toLocaleString()} total &middot; View and manage all products
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-700" />
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Catalog Value</p>
          </div>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            {formatKES(totalValuation)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Calculated from listed prices</p>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <Package size={16} className="text-amber-700" />
            </div>
            <p className="text-xs text-amber-700 font-medium uppercase tracking-wide">Live Products</p>
          </div>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            {products.length}
          </p>
          <p className="text-xs text-amber-600 mt-1">On this page</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Stock Alerts</p>
          </div>
          <p className="text-2xl font-bold text-red-600" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            {stockAlerts}
          </p>
          <p className="text-xs text-gray-400 mt-1">Items out of stock</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-300 shrink-0" />
          <input
            type="text"
            placeholder="Product name, slug..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 placeholder:text-gray-300 outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {/* Stock filter toggle */}
        <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-1">
          {(["", "in_stock", "out_of_stock"] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setStockFilter(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                stockFilter === v
                  ? v === "out_of_stock"
                    ? "bg-red-500 text-white"
                    : "bg-amber-700 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "" ? "All Stock" : v === "in_stock" ? "In Stock" : "Out of Stock"}
            </button>
          ))}
        </div>
        {/* Active filter toggle */}
        <div className="flex items-center bg-gray-50 rounded-xl p-1 gap-1">
          {(["", "active", "inactive"] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setActiveFilter(v); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeFilter === v
                  ? v === "inactive"
                    ? "bg-gray-500 text-white"
                    : "bg-amber-700 text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "" ? "All Status" : v === "active" ? "Active" : "Inactive"}
            </button>
          ))}
        </div>
        <button
          onClick={clearFilters}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
        >
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">In Stock</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Active</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-36 rounded" />
                            <Skeleton className="h-3 w-24 rounded opacity-50" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-10 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-10 mx-auto rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-xl" /></td>
                    </tr>
                  ))
                : products.map((product) => (
                    <tr key={product.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                          {product.category_name ?? "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800 text-sm">{formatKES(product.price)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{product.size ?? "Default"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusBadge
                            active={product.in_stock}
                            labelOn="In Stock"
                            labelOff="Out of Stock"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <StatusBadge
                            active={product.is_active}
                            labelOn="Active"
                            labelOff="Inactive"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                          {/* <Link
                            href={`/admin/products/${product.id}/view`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <Eye size={15} />
                          </Link> */}
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(product)}
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

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No products found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Showing <span className="text-gray-700 font-medium">{showingFrom}–{showingTo}</span> of{" "}
              <span className="text-gray-700 font-medium">{pagination.total.toLocaleString()}</span> products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-amber-700 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
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
                Delete Product?
              </DialogTitle>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">&ldquo;{deleteTarget?.name}&rdquo;</span>?
                This action cannot be undone.
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
              {deleteLoading ? "Deleting..." : "Delete Product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
