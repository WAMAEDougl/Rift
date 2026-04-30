"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, Search, ChevronLeft, ChevronRight,
  TrendingUp, ShoppingBag, MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters";
import { adminFetch } from "@/lib/admin/fetch";

interface Customer {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  role: string;
  default_city: string | null;
  order_count: number;
  total_spent: number;
  last_order_at: string;
}

interface PaginationMeta { page: number; per_page: number; total: number; total_pages: number; }

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "20");
    if (search) params.set("q", search);

    const res = await adminFetch(`/api/admin/customers?${params.toString()}`);
    const json = await res.json();
    if (json.data) {
      setCustomers(json.data.items);
      setPagination(json.data.pagination);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const totalSpend = customers.reduce((acc, c) => acc + c.total_spent, 0);
  const repeatCustomers = customers.filter((c) => c.order_count > 1).length;

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return [];
    const { total_pages } = pagination;
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", total_pages];
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages];
    return [1, "...", page, "...", total_pages];
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-medium text-foreground">Customers</h1>
        <p className="text-xs text-muted-foreground mt-1">{pagination?.total.toLocaleString()} customers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Customers</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{pagination?.total.toLocaleString() ?? "—"}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Revenue (page)</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{formatKES(totalSpend)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <ShoppingBag size={16} className="text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Repeat Buyers</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{repeatCustomers}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card rounded-2xl border border-border p-4 flex gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 border border-border rounded-xl px-3 py-2">
          <Search size={15} className="text-muted-foreground/40 shrink-0" />
          <input type="text" placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent border-none p-0 text-sm text-foreground focus:ring-0 placeholder:text-muted-foreground/50 outline-none" />
        </div>
        {search && (
          <button onClick={() => { setSearch(""); setPage(1); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                {["Customer", "Contact", "Location", "Orders", "Total Spent", "Last Order"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/customers/${c.id}`} className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                            {(c.full_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                              {c.full_name ?? "—"}
                            </p>
                            {c.role !== "customer" && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                {c.role}
                              </span>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-foreground font-medium">{c.phone}</p>
                        {c.email && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">{c.email}</p>}
                      </td>
                      <td className="px-6 py-4">
                        {c.default_city
                          ? <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin size={12} className="shrink-0" />
                              {c.default_city}
                            </div>
                          : <span className="text-muted-foreground/40 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground">{c.order_count}</span>
                          {c.order_count > 1 && (
                            <span className="text-[10px] font-semibold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full">Repeat</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap">
                        {formatKES(c.total_spent)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-foreground/70 whitespace-nowrap">{formatDate(c.last_order_at)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{formatRelativeTime(c.last_order_at)}</p>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && customers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={36} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No customers found</p>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Showing <span className="text-foreground font-medium">{customers.length}</span> of{" "}
              <span className="text-foreground font-medium">{pagination.total.toLocaleString()}</span> customers
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-foreground/80 hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground/80 hover:bg-muted"}`}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))} disabled={page >= pagination.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-foreground/80 hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
