"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Search,
  MapPin,
  Eye,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/admin/formatters"

interface CustomerRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string
  default_city: string | null
  created_at: string
  order_count: number
  total_spent: number
}

interface Pagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

interface CustomersResponse {
  data: {
    items: CustomerRow[]
    pagination: Pagination
  }
  error: string | null
}

function StatusBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: "bg-red-50 text-red-600 border border-red-100",
    kitchen: "bg-amber-100 text-amber-700 border border-amber-200",
    customer: "bg-green-50 text-green-700 border border-green-100",
  }

  const label = role === "customer" ? "Regular" : role

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[role] ?? styles.customer}`}
    >
      {label}
    </span>
  )
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("")
  const [page, setPage] = useState(1)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (role) params.set("role", role)
      params.set("page", String(page))
      params.set("per_page", "20")

      const res = await fetch(`/api/admin/customers?${params.toString()}`)
      const json: CustomersResponse = await res.json()
      if (json.data) {
        setCustomers(json.data.items)
        setPagination(json.data.pagination)
      }
    } finally {
      setLoading(false)
    }
  }, [search, role, page])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleFilter = (value: string) => {
    setRole(value)
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
  const showingTo = pagination ? Math.min(pagination.page * pagination.per_page, pagination.total) : 0

  const stats = useMemo(() => {
    const avgOrder = customers.length > 0
      ? (customers.reduce((acc, c) => acc + c.order_count, 0) / customers.length).toFixed(1)
      : "0.0"
    return { avgOrder }
  }, [customers])

  return (
    <div className="space-y-6 w-full">
      {/* Stat mini-cards + filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filter bar */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={15} className="text-gray-300 shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent border-none p-0 text-sm text-gray-700 focus:ring-0 placeholder:text-gray-300 outline-none"
            />
          </div>
          <select
            value={role}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-amber-600 focus:border-amber-600 outline-none text-gray-700"
          >
            <option value="">All Roles</option>
            <option value="customer">Regular</option>
            <option value="kitchen">Kitchen</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">Total</p>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <Users size={14} className="text-amber-700" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              {pagination?.total.toLocaleString() ?? "—"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">Avg Orders</p>
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp size={14} className="text-green-700" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              {stats.avgOrder}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60">
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center">Orders</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-36 rounded" />
                            <Skeleton className="h-3 w-48 rounded opacity-50" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-10 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto rounded-xl" /></td>
                    </tr>
                  ))
                : customers.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-sm font-bold shrink-0">
                            {c.full_name ? c.full_name.charAt(0).toUpperCase() : <Users size={16} />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{c.full_name ?? "—"}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{c.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        {c.order_count}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800 text-sm">
                          KSh {c.total_spent.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin size={12} className="text-gray-300" />
                          {c.default_city ?? "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge role={c.role} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && customers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={36} className="text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">No customers found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Showing <span className="text-gray-700 font-medium">{showingFrom}–{showingTo}</span> of{" "}
              <span className="text-gray-700 font-medium">{pagination.total.toLocaleString()}</span> customers
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
    </div>
  )
}
