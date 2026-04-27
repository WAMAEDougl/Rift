"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CreditCard, Search, ChevronLeft, ChevronRight, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters";

interface Payment {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  payment_method: string;
  payment_status: string;
  mpesa_receipt_number: string | null;
  created_at: string;
}

interface PaginationMeta { page: number; per_page: number; total: number; total_pages: number; }

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-500/10 text-green-600 dark:text-green-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  failed: "bg-destructive/10 text-destructive",
  refunded: "bg-muted text-muted-foreground",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "20");
    if (search) params.set("q", search);
    if (statusFilter) params.set("payment_status", statusFilter);
    if (methodFilter) params.set("payment_method", methodFilter);

    const res = await fetch(`/api/admin/payments?${params.toString()}`);
    const json = await res.json();
    if (json.data) {
      setPayments(json.data.items);
      setPagination(json.data.pagination);
    }
    setLoading(false);
  }, [page, search, statusFilter, methodFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalRevenue = payments.filter((p) => p.payment_status === "paid").reduce((acc, p) => acc + p.total, 0);
  const paidCount = payments.filter((p) => p.payment_status === "paid").length;
  const pendingCount = payments.filter((p) => p.payment_status === "pending").length;

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
        <h1 className="font-display text-3xl font-medium text-foreground">Payments</h1>
        <p className="text-xs text-muted-foreground mt-1">{pagination?.total.toLocaleString()} transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center"><TrendingUp size={16} className="text-green-600" /></div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Revenue (page)</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{formatKES(totalRevenue)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><CheckCircle2 size={16} className="text-primary" /></div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Paid</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{paidCount}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center"><Clock size={16} className="text-amber-600" /></div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Pending</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{pendingCount}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] border border-border rounded-xl px-3 py-2">
          <Search size={15} className="text-muted-foreground/40 shrink-0" />
          <input type="text" placeholder="Order number, M-Pesa receipt..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent border-none p-0 text-sm text-foreground focus:ring-0 placeholder:text-muted-foreground/50 outline-none" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-primary focus:border-primary outline-none">
          <option value="">All Statuses</option>
          {["paid", "pending", "failed", "refunded"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
          className="border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-primary focus:border-primary outline-none">
          <option value="">All Methods</option>
          {["mpesa", "cash", "card"].map((m) => (
            <option key={m} value={m}>{m.toUpperCase()}</option>
          ))}
        </select>
        <button onClick={() => { setSearch(""); setStatusFilter(""); setMethodFilter(""); setPage(1); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                {["Order", "Customer", "Amount", "Method", "Status", "Receipt", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : payments.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${p.id}`} className="text-sm font-semibold text-primary hover:underline">
                          {p.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-foreground">{p.customer_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.customer_phone}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground text-sm">{formatKES(p.total)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground uppercase tracking-wide">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[p.payment_status] ?? "bg-muted text-muted-foreground"}`}>
                          {p.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.mpesa_receipt_number
                          ? <span className="font-mono text-xs text-foreground bg-muted/50 px-2 py-1 rounded-lg">{p.mpesa_receipt_number}</span>
                          : <span className="text-xs text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-foreground/80">{formatDate(p.created_at)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(p.created_at)}</p>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && payments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CreditCard size={36} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No payments found</p>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Showing <span className="text-foreground font-medium">{payments.length}</span> of{" "}
              <span className="text-foreground font-medium">{pagination.total.toLocaleString()}</span> transactions
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
