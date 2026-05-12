"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard, Search, ChevronLeft, ChevronRight,
  TrendingUp, CheckCircle2, Clock, MessageCircle,
  Smartphone, ArrowRight, AlertCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters";
import { adminFetchCached } from "@/lib/admin/fetch";

interface Payment {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  total: number;
  delivery_fee: number | null;
  payment_method: string;
  payment_status: string;
  mpesa_receipt_number: string | null;
  created_at: string;
}

interface PaginationMeta { page: number; per_page: number; total: number; total_pages: number; }

// Payment status config aligned with WhatsApp-first flow
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  paid:      { label: "Paid",            className: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",   icon: <CheckCircle2 size={11} /> },
  pending:   { label: "Awaiting STK",    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",   icon: <Clock size={11} /> },
  failed:    { label: "Failed",          className: "bg-destructive/10 text-destructive border border-destructive/20",                  icon: <AlertCircle size={11} /> },
  refunded:  { label: "Refunded",        className: "bg-muted text-muted-foreground border border-border",                             icon: <CreditCard size={11} /> },
  completed: { label: "Completed",       className: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20",   icon: <CheckCircle2 size={11} /> },
};

const METHOD_CONFIG: Record<string, { label: string; className: string }> = {
  whatsapp:  { label: "WhatsApp",  className: "bg-green-500/10 text-green-700 dark:text-green-400" },
  mpesa:     { label: "M-Pesa",    className: "bg-primary/10 text-primary" },
  cash:      { label: "Cash",      className: "bg-muted text-muted-foreground" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-muted text-muted-foreground border border-border", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const cfg = METHOD_CONFIG[method] ?? { label: method.toUpperCase(), className: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.className}`}>
      {method === "whatsapp" && <MessageCircle size={10} />}
      {method === "mpesa" && <Smartphone size={10} />}
      {cfg.label}
    </span>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "paid">("all");

  // Debounce search input by 400ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "20");
    if (debouncedSearch) params.set("q", debouncedSearch);
    const effectiveStatus = tab === "pending" ? "pending" : tab === "paid" ? "paid" : statusFilter;
    if (effectiveStatus) params.set("payment_status", effectiveStatus);

    const res = await adminFetchCached(`/api/admin/payments?${params.toString()}`);
    const json = await res.json();
    if (json.data) {
      setPayments(json.data.items);
      setPagination(json.data.pagination);
    }
    setLoading(false);
  }, [page, debouncedSearch, statusFilter, tab]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const paidRevenue = payments.filter((p) => ["paid", "completed"].includes(p.payment_status)).reduce((acc, p) => acc + p.total, 0);
  const paidCount = payments.filter((p) => ["paid", "completed"].includes(p.payment_status)).length;
  const pendingCount = payments.filter((p) => p.payment_status === "pending").length;
  const awaitingSTK = payments.filter((p) => p.payment_status === "pending" && p.payment_method === "whatsapp");

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

      {/* Awaiting STK Push banner */}
      {awaitingSTK.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Smartphone size={16} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                {awaitingSTK.length} order{awaitingSTK.length > 1 ? "s" : ""} awaiting payment request
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                Negotiate delivery on WhatsApp, then send an M-Pesa STK Push from the order detail page.
              </p>
            </div>
          </div>
          <button onClick={() => { setTab("pending"); setPage(1); }}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline">
            View all <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Revenue (page)</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{formatKES(paidRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">From confirmed payments</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Paid</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{paidCount}</p>
          <p className="text-xs text-muted-foreground mt-1">M-Pesa confirmed</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Awaiting STK</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Delivery fee to negotiate</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Tabs */}
        <div className="flex items-center bg-muted/30 rounded-xl p-1 gap-1 shrink-0">
          {([["all", "All"], ["pending", "Awaiting STK"], ["paid", "Paid"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => { setTab(val); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${tab === val ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 border border-border rounded-xl px-3 py-2 bg-card">
          <Search size={15} className="text-muted-foreground/40 shrink-0" />
          <input type="text" placeholder="Search by order number or M-Pesa receipt..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent border-none p-0 text-sm text-foreground focus:ring-0 placeholder:text-muted-foreground/50 outline-none" />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table + Cards */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">

        {/* ── Mobile card view (below sm) ── */}
        <div className="sm:hidden divide-y divide-border">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32 rounded" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded" />
                  </div>
                </div>
              ))
            : payments.map((p) => {
                const isAwaitingSTK = p.payment_status === "pending" && p.payment_method === "whatsapp";
                return (
                  <div key={p.id} className={`p-4 ${isAwaitingSTK ? "bg-amber-500/[0.03]" : ""}`}>
                    <div className="flex items-start justify-between mb-1.5">
                      <Link href={`/admin/orders/${p.id}`} className="text-sm font-bold text-primary hover:underline font-mono">
                        {p.order_number}
                      </Link>
                      <StatusBadge status={p.payment_status} />
                    </div>
                    <p className="text-sm font-medium text-foreground">{p.customer_name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{p.customer_phone}</p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <MethodBadge method={p.payment_method} />
                        {p.delivery_fee != null && p.delivery_fee > 0 && (
                          <span className="text-xs text-muted-foreground">+{formatKES(p.delivery_fee)} delivery</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatKES(p.total)}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(p.created_at)}</p>
                      </div>
                    </div>
                    {isAwaitingSTK && (
                      <Link href={`/admin/orders/${p.id}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                        <Smartphone size={11} /> Send STK Push
                      </Link>
                    )}
                    {p.mpesa_receipt_number && (
                      <span className="mt-2 inline-block font-mono text-xs text-foreground bg-muted/50 px-2 py-1 rounded-lg">
                        {p.mpesa_receipt_number}
                      </span>
                    )}
                  </div>
                );
              })}
        </div>

        {/* ── Desktop table view (sm+) ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                {["Order", "Customer", "Subtotal", "Delivery", "Total", "Method", "Status", "Receipt / Action", "Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-5 py-4"><Skeleton className="h-5 w-20 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : payments.map((p) => {
                    const isAwaitingSTK = p.payment_status === "pending" && p.payment_method === "whatsapp";
                    return (
                      <tr key={p.id} className={`hover:bg-muted/20 transition-colors ${isAwaitingSTK ? "bg-amber-500/[0.03]" : ""}`}>
                        <td className="px-5 py-4">
                          <Link href={`/admin/orders/${p.id}`}
                            className="text-sm font-semibold text-primary hover:underline font-mono">
                            {p.order_number}
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-foreground">{p.customer_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{p.customer_phone}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {formatKES(p.subtotal ?? p.total)}
                        </td>
                        <td className="px-5 py-4 text-sm whitespace-nowrap">
                          {p.delivery_fee != null && p.delivery_fee > 0
                            ? <span className="text-foreground font-medium">{formatKES(p.delivery_fee)}</span>
                            : <span className="text-muted-foreground/50 text-xs italic">Pending</span>}
                        </td>
                        <td className="px-5 py-4 font-semibold text-foreground text-sm whitespace-nowrap">
                          {formatKES(p.total)}
                        </td>
                        <td className="px-5 py-4">
                          <MethodBadge method={p.payment_method} />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={p.payment_status} />
                        </td>
                        <td className="px-5 py-4">
                          {p.mpesa_receipt_number ? (
                            <span className="font-mono text-xs text-foreground bg-muted/50 px-2 py-1 rounded-lg">
                              {p.mpesa_receipt_number}
                            </span>
                          ) : isAwaitingSTK ? (
                            <Link href={`/admin/orders/${p.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                              <Smartphone size={11} /> Send STK Push
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-xs text-foreground/70 whitespace-nowrap">{formatDate(p.created_at)}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{formatRelativeTime(p.created_at)}</p>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {!loading && payments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <CreditCard size={20} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No payments found</p>
            {tab === "pending" && (
              <p className="text-xs text-muted-foreground/60">No orders are awaiting payment requests right now.</p>
            )}
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
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

      {/* Flow explanation */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-display text-sm font-medium text-foreground mb-4">Payment Flow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { icon: <MessageCircle size={15} className="text-green-600" />, bg: "bg-green-500/10", step: "1", title: "Order placed", desc: "Customer submits order via WhatsApp checkout" },
            { icon: <MessageCircle size={15} className="text-primary" />, bg: "bg-primary/10", step: "2", title: "Negotiate on WhatsApp", desc: "Discuss delivery fee and confirm details with customer" },
            { icon: <Smartphone size={15} className="text-amber-600" />, bg: "bg-amber-500/10", step: "3", title: "Send STK Push", desc: "Open the order, enter delivery fee, trigger M-Pesa prompt" },
            { icon: <CheckCircle2 size={15} className="text-green-600" />, bg: "bg-green-500/10", step: "4", title: "Payment confirmed", desc: "M-Pesa callback updates order status automatically" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{s.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
