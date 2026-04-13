"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Search,
  Filter,
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
    kitchen: "bg-amber-50 text-amber-700 border border-amber-100",
    customer: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20",
  }

  const label = role === "customer" ? "Regular" : role

  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[role] ?? styles.customer}`}
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <p className="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.4em] animate-in slide-in-from-left duration-500">Audience</p>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Customers
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
               {pagination?.total.toLocaleString()} Accounts
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">View and manage your customers</p>
          </div>
        </div>
        <button className="bg-[#1a1a2e] text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-3 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative">
           <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-700">person_add</span>
           <span className="relative z-10">Add New Customer</span>
        </button>
      </div>

      {/* ── Analytical Bento Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Advanced Filters Pillar */}
        <div className="md:col-span-12 lg:col-span-6 bg-white p-2 rounded-[32px] border border-slate-50 shadow-[0_10px_40px_-10px_rgba(26,26,46,0.04)] flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-slate-50 relative group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="flex-1 flex items-center gap-4 px-6 py-4 relative z-10">
            <span className="material-symbols-outlined text-slate-300 text-lg">filter_list</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#22c55e] mb-1">Filter by Role</span>
              <select
                value={role}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-black text-[#1a1a2e] focus:ring-0 cursor-pointer outline-none capitalize leading-none"
              >
                <option value="">All Roles</option>
                <option value="customer">Regular</option>
                <option value="kitchen">Kitchen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex-[2] flex items-center gap-4 px-6 py-4 relative z-10">
            <span className="material-symbols-outlined text-slate-300 text-lg">search</span>
             <div className="flex flex-col w-full">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Search Customers</span>
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold text-[#1a1a2e] focus:ring-0 w-full placeholder:text-slate-300 outline-none leading-none"
              />
            </div>
          </div>
        </div>

        {/* Global Volume Stat Card */}
        <div className="md:col-span-6 lg:col-span-3 bg-[#fcf8ff] p-8 rounded-[32px] border border-white shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all h-32">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-[#22c55e] uppercase tracking-widest">Total Customers</p>
              <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-[#1a1a2e] transition-colors">
                 <Users size={16} />
              </div>
           </div>
           <h3 className="text-3xl font-black text-[#1a1a2e] tracking-tight">{pagination?.total.toLocaleString() ?? "—"}</h3>
        </div>

        {/* Efficiency Metric Stat Card */}
        <div className="md:col-span-6 lg:col-span-3 bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all h-32">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Engagement</p>
              <div className="p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-[#22c55e] transition-colors">
                 <TrendingUp size={16} />
              </div>
           </div>
           <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-[#1a1a2e] tracking-tight">{stats.avgOrder}</h3>
              <span className="text-[10px] font-black text-slate-300 uppercase mb-1.5 tracking-tighter">Orders / Customer</span>
           </div>
        </div>
      </section>

      {/* ── Data Catalog Grid ── */}
      <section className="bg-white rounded-[60px] overflow-hidden shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] border border-slate-50/50">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100/50">
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Customer Details</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Orders</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total Spent</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Location</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Role</th>
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-10">
                        <div className="flex items-center gap-6">
                           <Skeleton className="w-16 h-16 rounded-full" />
                           <div className="space-y-3">
                              <Skeleton className="h-5 w-40 rounded-lg" />
                              <Skeleton className="h-3 w-56 rounded-lg opacity-40" />
                           </div>
                        </div>
                      </td>
                      <td className="p-8"><Skeleton className="h-8 w-12 mx-auto rounded-2xl" /></td>
                      <td className="p-8"><Skeleton className="h-6 w-28 rounded-lg" /></td>
                      <td className="p-8"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-8"><Skeleton className="h-10 w-28 rounded-full" /></td>
                      <td className="p-10 text-right"><Skeleton className="h-10 w-24 ml-auto rounded-2xl" /></td>
                    </tr>
                  ))
                : customers.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-[#fcf8ff] transition-all duration-300 group border-b border-slate-50 last:border-0 relative"
                    >
                      <td className="p-10">
                        <div className="flex items-center gap-6 transition-transform group-hover:translate-x-2 duration-500">
                          <div className="w-16 h-16 rounded-[28px] overflow-hidden bg-[#fcf8ff]/50 flex-shrink-0 flex items-center justify-center text-[#1a1a2e] text-xl font-black border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                             {c.full_name ? c.full_name.charAt(0).toUpperCase() : <Users size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-lg text-[#1a1a2e] tracking-tight">{c.full_name ?? "—"}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">{c.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-center text-sm font-black text-[#1a1a2e]">
                         <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-[20px] shadow-sm">
                           {c.order_count}
                         </div>
                      </td>
                      <td className="p-8">
                        <p className="font-black text-slate-800 text-lg tracking-tighter">
                          KSh {c.total_spent.toLocaleString()}
                        </p>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 group/loc">
                           <span className="material-symbols-outlined text-[16px] text-slate-200 group-hover/loc:text-[#22c55e] transition-colors">location_on</span>
                           <span className="text-[11px] font-black uppercase text-[#1a1a2e] tracking-tighter">{c.default_city ?? "Global"}</span>
                        </div>
                      </td>
                      <td className="p-8">
                        <StatusBadge role={c.role} />
                      </td>
                      <td className="p-10 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-[#22c55e] hover:bg-[#22c55e]/5 transition-all shadow-sm border border-slate-50"
                            title="View Details"
                          >
                             <span className="material-symbols-outlined text-xl">monitoring</span>
                          </Link>
                          <button
                            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-400 hover:text-[#1a1a2e] hover:bg-slate-50 transition-all shadow-sm border border-slate-50"
                            title="Edit Customer"
                          >
                             <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Empty Catalog State */}
        {!loading && customers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="w-32 h-32 bg-slate-50/50 rounded-full flex items-center justify-center mb-8 text-5xl animate-in zoom-in duration-700">👥</div>
            <h3 className="text-3xl font-black text-[#1a1a2e] mb-3 tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>No customers found</h3>
            <p className="text-slate-400 max-w-sm mx-auto text-sm font-medium leading-relaxed opacity-60">
              We couldn't find any customers matching your current search or filters.
            </p>
          </div>
        )}

        {/* Performance-Optimized Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="p-10 bg-[#fcf8ff]/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Showing <span className="text-[#1a1a2e]">{showingFrom}-{showingTo}</span> / <span className="text-[#1a1a2e]">{pagination.total.toLocaleString()}</span> entries
            </p>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-20 duration-300"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center bg-white rounded-[28px] p-2 border border-slate-100 shadow-sm gap-3">
                {getPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-12 h-12 flex items-center justify-center text-slate-200 font-bold">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-[11px] transition-all ${
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

      {/* ── Analytical Ledger Footer ── */}
      <footer className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Audience Sync: Up to date
          </span>
        </div>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link href="#" className="hover:text-[#22c55e] transition-colors">Data Privacy</Link>
          <Link href="#" className="hover:text-[#1a1a2e] transition-colors">Help Center</Link>
          <span>© 2026 Ayola Foods Admin</span>
        </div>
      </footer>
    </div>
  )
}
