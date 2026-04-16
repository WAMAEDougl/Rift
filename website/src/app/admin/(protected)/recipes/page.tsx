"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Trash2, Search, BookOpen, Pencil, Plus, Eye,
  ChevronLeft, ChevronRight, SlidersHorizontal, X,
  Star, Globe, Clock, Users, TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecipeRow } from "@/lib/types/recipe"

interface PaginationMeta {
  page: number; per_page: number; total: number; total_pages: number
}

const CATEGORY_OPTIONS: { value: RecipeRow["category"]; label: string; icon: string; color: string }[] = [
  { value: "cooking-demo", label: "Cooking Demo", icon: "🍳", color: "bg-orange-50 text-orange-600 border-orange-100" },
  { value: "beverage",     label: "Beverage",     icon: "🥤", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { value: "how-to",       label: "How-To",       icon: "📖", color: "bg-purple-50 text-purple-600 border-purple-100" },
  { value: "health-tip",   label: "Health Tip",   icon: "🌿", color: "bg-green-50 text-green-600 border-green-100" },
]

const DIFFICULTY_OPTIONS: { value: RecipeRow["difficulty"]; label: string; color: string }[] = [
  { value: "Easy",     label: "Easy",     color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { value: "Medium",   label: "Medium",   color: "bg-amber-50 text-amber-600 border-amber-100" },
  { value: "Advanced", label: "Advanced", color: "bg-red-50 text-red-600 border-red-100" },
]

function CategoryBadge({ category }: { category: RecipeRow["category"] }) {
  const opt = CATEGORY_OPTIONS.find(c => c.value === category)
  if (!opt) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${opt.color}`}>
      <span>{opt.icon}</span> {opt.label}
    </span>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: RecipeRow["difficulty"] }) {
  const opt = DIFFICULTY_OPTIONS.find(d => d.value === difficulty)
  if (!opt) return null
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${opt.color}`}>
      {opt.label}
    </span>
  )
}

function StatCard({ icon, label, value, sub, accent }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; accent?: string
}) {
  return (
    <div className={`rounded-2xl border p-5 flex items-center gap-4 ${accent ?? "bg-white border-gray-100"}`}>
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none mt-0.5" style={{ fontFamily: "var(--font-playfair, serif)" }}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeRow[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
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
    const res = await fetch(`/api/admin/recipes?${params}`)
    const json = await res.json()
    if (json.data) {
      setRecipes(json.data.items as RecipeRow[])
      setPagination(json.data.pagination as PaginationMeta)
    }
    setLoading(false)
  }, [page, search, categoryFilter, difficultyFilter])

  useEffect(() => { fetchRecipes() }, [fetchRecipes])

  const clearFilters = () => {
    setSearch(""); setCategoryFilter(""); setDifficultyFilter(""); setPage(1)
  }

  const hasFilters = search || categoryFilter || difficultyFilter

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return []
    const { total_pages } = pagination
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, "...", total_pages]
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages]
    return [1, "...", page, "...", total_pages]
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/recipes/${deleteTarget.id}`, { method: "DELETE" })
    const json = await res.json()
    setDeleting(false)
    if (!res.ok) { toast.error(json.error?.message ?? "Delete failed"); return }
    toast.success(`"${deleteTarget.title}" deleted`)
    setDeleteTarget(null)
    fetchRecipes()
  }

  const featuredCount = recipes.filter(r => r.featured).length
  const publishedCount = recipes.filter(r => r.is_published).length

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Recipes
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {loading ? "Loading…" : `${pagination?.total ?? 0} recipes in your catalogue`}
          </p>
        </div>
        <Link
          href="/admin/recipes/new"
          className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-700/20"
        >
          <Plus size={16} /> New Recipe
        </Link>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BookOpen size={18} />} label="Total" value={pagination?.total ?? "—"} sub="All recipes" />
        <StatCard icon={<TrendingUp size={18} />} label="Published" value={publishedCount} sub="Live on site" accent="bg-green-50 border-green-100" />
        <StatCard icon={<Star size={18} />} label="Featured" value={featuredCount} sub="On homepage" accent="bg-amber-50 border-amber-100" />
        <StatCard icon={<Globe size={18} />} label="Categories" value={CATEGORY_OPTIONS.length} sub="Recipe types" />
      </div>

      {/* ── Search + filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
          <Search size={15} className="text-gray-300 shrink-0" />
          <input
            type="text"
            placeholder="Search by title or slug…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-300 outline-none"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              showFilters || hasFilters
                ? "bg-amber-700 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {hasFilters && (
              <span className="w-4 h-4 rounded-full bg-white/30 text-[10px] flex items-center justify-center font-bold">
                {[categoryFilter, difficultyFilter].filter(Boolean).length}
              </span>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-gray-300 hover:text-gray-500 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Expandable filter row */}
        {showFilters && (
          <div className="px-4 py-3 bg-gray-50/50 flex flex-wrap gap-3 items-center border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Category</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setCategoryFilter(""); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !categoryFilter ? "bg-amber-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >All</button>
                {CATEGORY_OPTIONS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => { setCategoryFilter(c.value); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === c.value ? "bg-amber-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {c.icon} {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-px h-5 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Difficulty</span>
              <div className="flex gap-1">
                <button
                  onClick={() => { setDifficultyFilter(""); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !difficultyFilter ? "bg-amber-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >All</button>
                {DIFFICULTY_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => { setDifficultyFilter(d.value); setPage(1) }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      difficultyFilter === d.value ? "bg-amber-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >{d.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-100">
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recipe</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Difficulty</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Meta</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-40 rounded" />
                            <Skeleton className="h-3 w-28 rounded opacity-50" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-6 w-28 rounded-full" /></td>
                      <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-24 rounded" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-6 w-16 mx-auto rounded-full" /></td>
                      <td className="px-5 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-xl" /></td>
                    </tr>
                  ))
                : recipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-amber-50/20 transition-colors group">
                      {/* Recipe */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Cover image or placeholder */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shrink-0 flex items-center justify-center">
                            {recipe.cover_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={recipe.cover_image_url} alt={recipe.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen size={18} className="text-amber-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">{recipe.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 font-mono truncate max-w-[200px]">{recipe.slug}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        <CategoryBadge category={recipe.category} />
                      </td>
                      {/* Difficulty */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <DifficultyBadge difficulty={recipe.difficulty} />
                      </td>
                      {/* Meta */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <div className="space-y-1">
                          {recipe.prep_time && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={11} className="text-gray-300" /> {recipe.prep_time}
                            </p>
                          )}
                          {recipe.servings && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Users size={11} className="text-gray-300" /> {recipe.servings}
                            </p>
                          )}
                          {!recipe.prep_time && !recipe.servings && (
                            <p className="text-xs text-gray-300">—</p>
                          )}
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center gap-1">
                          {recipe.is_published ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-100">
                              Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-400 border border-gray-100">
                              Draft
                            </span>
                          )}
                          {recipe.featured && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                              <Star size={9} /> Featured
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/recipes/${recipe.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="View"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            href={`/admin/recipes/${recipe.id}/edit`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(recipe)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-amber-300" />
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">
              {hasFilters ? "No recipes match your filters" : "No recipes yet"}
            </p>
            <p className="text-xs text-gray-400 mb-5">
              {hasFilters ? "Try clearing your filters" : "Create your first recipe to get started"}
            </p>
            {hasFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Clear filters
              </button>
            ) : (
              <Link
                href="/admin/recipes/new"
                className="inline-flex items-center gap-2 bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-800 transition-colors"
              >
                <Plus size={15} /> New Recipe
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Showing{" "}
              <span className="text-gray-700 font-semibold">
                {(pagination.page - 1) * pagination.per_page + 1}–{Math.min(pagination.page * pagination.per_page, pagination.total)}
              </span>{" "}
              of <span className="text-gray-700 font-semibold">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page ? "bg-amber-700 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >{p}</button>
                )
              )}
              <button
                onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                disabled={page >= pagination.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-white">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-base font-bold text-gray-900">Delete Recipe?</DialogTitle>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">&ldquo;{deleteTarget?.title}&rdquo;</span> will be permanently removed.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-5 flex-row gap-2">
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
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
