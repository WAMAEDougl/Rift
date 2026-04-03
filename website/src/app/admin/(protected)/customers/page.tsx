"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
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

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    customer: "bg-gray-100 text-gray-700",
    kitchen: "bg-orange-100 text-orange-700",
    admin: "bg-red-100 text-red-700",
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[role] ?? "bg-gray-100 text-gray-700"}`}
    >
      {role}
    </span>
  )
}

const FILTER_INPUT_CLASS =
  "border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"

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

  const pageNumbers = pagination
    ? Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Customers</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total customers</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className={FILTER_INPUT_CLASS + " min-w-[220px]"}
        />
        <select
          value={role}
          onChange={(e) => handleRoleFilter(e.target.value)}
          className={FILTER_INPUT_CLASS}
        >
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="kitchen">Kitchen</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-14 rounded-md" /></td>
                    </tr>
                  ))
                : customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {c.full_name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{c.email ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{c.phone ?? "—"}</td>
                      <td className="px-6 py-4">
                        <RoleBadge role={c.role} />
                      </td>
                      <td className="px-6 py-4 text-gray-600">{c.default_city ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {formatRelativeTime(c.created_at)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{c.order_count}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-4 py-2 text-sm font-medium inline-block"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && customers.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-900 font-medium">No customers found.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="gap-1"
          >
            <ChevronLeft size={14} />
            Previous
          </Button>
          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
              className={
                p === page ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" : ""
              }
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            disabled={page >= pagination.total_pages}
            className="gap-1"
          >
            Next
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}
