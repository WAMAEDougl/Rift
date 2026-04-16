"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Trash2,
  ChevronRight,
  Search,
  BookOpen,
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
import type { RecipeRow } from "@/lib/types/recipe"

interface PaginationMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

const CATEGORY_OPTIONS: { value: RecipeRow["category"]; label: string }[] = [
  { value: "cooking-demo", label: "Cooking Demo" },
  { value: "beverage", label: "Beverage" },
  { value: "how-to", label: "How-To" },
  { value: "health-tip", label: "Health Tip" },
]

const DIFFICULTY_OPTIONS: { value: RecipeRow["difficulty"]; label: string }[] = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Advanced", label: "Advanced" },
]

const CATEGORY_COLORS: Record<RecipeRow["category"], string> = {
  "cooking-demo": "bg-orange-50 text-orange-600 border-orange-100",
  "beverage": "bg-blue-50 text-blue-600 border-blue-100",
  "how-to": "bg-purple-50 text-purple-600 border-purple-100",
  "health-tip": "bg-green-50 text-green-600 border-green-100",
}

const DIFFICULTY_COLORS: Record<RecipeRow["difficulty"], string> = {
  "Easy": "bg-green-50 text-green-600 border-green-100",
  "Medium": "bg-amber-50 text-amber-600 border-amber-100",
  "Advanced": "bg-red-50 text-red-600 border-red-100",
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<RecipeRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchRecipes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set("page", String(page))
    params.set("per_page", "20")
    if (search) params.set("q", search)
    if (categoryFilter) params.set("category", categoryFilter)
    if (difficultyFilter) params.set("difficulty", difficultyFilter)

    const res = await fetch(`/api/admin/recipes?${params.toString()}`)
    const json = await res.json()
    if (json.data) {
      setRecipes(json.data.items as RecipeRow[])
      setPagination(json.data.pagination as PaginationMeta)
    }
    setLoading(false)
  }, [page, search, categoryFilter, difficultyFilter])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const clearFilters = () => {
    setSearch("")
    setCategoryFilter("")
    setDifficultyFilter("")
    setPage(1)
  }

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return []
    const { total_pages } = pagination
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, "...", total_pages]
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages]
    return [1, "...", page, "...", total_pages]
  }

  const showingFrom = pagination ? (pagination.page - 1) * pagination.per_page + 1 : 0
  const showingTo = pagination
    ? Math.min(pagination.page * pagination.per_page, pagination.total)
    : 0

  const handleDeleteClick = (recipe: RecipeRow) => {
    setDeleteTarget(recipe)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/recipes/${deleteTarget.id}`, {
      method: "DELETE",
    })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) {
      toast.error(json.error?.message ?? "Delete failed")
      return
    }
    toast.success(`"${deleteTarget.title}" was deleted`)
    setDeleteTarget(null)
    fetchRecipes()
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
            Recipes
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {pagination?.total.toLocaleString()} total &middot; View and manage all recipes
          </p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={16} />
          Add Recipe
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-300 shrink-0" />
          <input
            type="text"
            placeholder="Recipe title, slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 placeholder:text-gray-300 outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
        >
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => {
            setDifficultyFilter(e.target.value)
            setPage(1)
          }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
        >
          <option value="">All Difficulties</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
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
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Recipe
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">
                  Featured
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">
                  Published
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-40 rounded" />
                          <Skeleton className="h-3 w-28 rounded opacity-50" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-24 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-10 mx-auto rounded-full" />
                      </td>
                      <td className="px-6 py-4">
                        <Skeleton className="h-5 w-10 mx-auto rounded-full" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-8 w-24 ml-auto rounded-xl" />
                      </td>
                    </tr>
                  ))
                : recipes.map((recipe) => (
                    <tr
                      key={recipe.id}
                      className="hover:bg-amber-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{recipe.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">{recipe.slug}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[recipe.category]}`}
                        >
                          {CATEGORY_OPTIONS.find((c) => c.value === recipe.category)?.label ??
                            recipe.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[recipe.difficulty]}`}
                        >
                          {recipe.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{recipe.author}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {new Date(recipe.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {recipe.featured ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                              No
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {recipe.is_published ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                              Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-400 border border-gray-100">
                              Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity">
                          <Link
                            href={`/admin/recipes/${recipe.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/admin/recipes/${recipe.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(recipe)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
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

        {/* Empty state */}
        {!loading && recipes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No recipes found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="text-gray-700 font-medium">
                {showingFrom}–{showingTo}
              </span>{" "}
              of{" "}
              <span className="text-gray-700 font-medium">
                {pagination.total.toLocaleString()}
              </span>{" "}
              recipes
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
                  <span
                    key={`ellipsis-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm"
                  >
                    …
                  </span>
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
                onClick={() =>
                  setPage((p) => Math.min(pagination.total_pages, p + 1))
                }
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
                Delete Recipe?
              </DialogTitle>
              <p className="text-sm text-gray-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">&ldquo;{deleteTarget?.title}&rdquo;</span>?
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
              disabled={deleting}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Recipe"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
