"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp, Clock, ShoppingBag, ChevronLeft, ChevronRight, X, AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters";
import { toast } from "sonner";
import { adminFetch, adminFetchCached, invalidateAdminCache } from "@/lib/admin/fetch";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  item_count: number;
  total: number;
  delivery_type: string;
  status: string;
  payment_status: string;
  created_at: string;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  // Local search state with debounce to avoid navigating on every keystroke
  const [localQ, setLocalQ] = useState(q);
  const qRef = useRef(q);
  useEffect(() => { qRef.current = q; }, [q]);
  useEffect(() => { setLocalQ(q); }, [q]);

  useEffect(() => {
    if (localQ === qRef.current) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (localQ) params.set("q", localQ); else params.delete("q");
      params.set("page", "1");
      router.push(`/admin/orders?${params.toString()}`);
    }, 400);
    return () => clearTimeout(t);
  }, [localQ]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateParam = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.set("page", "1");
      router.push(`/admin/orders?${params.toString()}`);
    },
    [router, searchParams]
  );

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/admin/orders?${params.toString()}`);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("per_page", "20");

      const res = await adminFetchCached(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      if (json.data) {
        setOrders(json.data.items);
        setPagination(json.data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [q, status, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const allSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id));
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(orders.map((o) => o.id)));
  };
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkConfirm = async () => {
    setBulkLoading(true);
    try {
      await adminFetch("/api/admin/orders/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status: "confirmed" }),
      });
      invalidateAdminCache("/api/admin/orders");
      toast.success("Orders confirmed");
      await fetchOrders();
    } finally { setBulkLoading(false); }
  };

  const handleBulkCancel = async () => {
    setBulkLoading(true);
    try {
      await adminFetch("/api/admin/orders/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), status: "cancelled", reason: cancelReason || undefined }),
      });
      invalidateAdminCache("/api/admin/orders");
      setShowCancelDialog(false);
      setCancelReason("");
      toast.success("Orders cancelled");
      await fetchOrders();
    } finally { setBulkLoading(false); }
  };

  const getPageNumbers = (): (number | "...")[] => {
    if (!pagination) return [];
    const { total_pages } = pagination;
    if (total_pages <= 5) return Array.from({ length: total_pages }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, "...", total_pages];
    if (page >= total_pages - 2) return [1, "...", total_pages - 2, total_pages - 1, total_pages];
    return [1, "...", page, "...", total_pages];
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {pagination?.total.toLocaleString()} total · Sales history
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-card rounded-2xl border border-border p-4 flex flex-wrap gap-3 items-center">
        <input
          className="flex-1 min-w-[160px] border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-primary focus:border-primary outline-none placeholder:text-muted-foreground/50"
          placeholder="Search by ID or name..."
          type="text"
          value={localQ}
          onChange={(e) => setLocalQ(e.target.value)}
        />
        <select
          className="border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-primary focus:border-primary outline-none"
          value={status}
          onChange={(e) => updateParam({ status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {["pending","confirmed","preparing","ready","dispatched","delivered","cancelled"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button onClick={() => { setLocalQ(""); router.push("/admin/orders"); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
          Clear
        </button>
      </div>

      {/* Table + Cards */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">

        {/* ── Mobile card view (below sm) ── */}
        <div className="sm:hidden divide-y divide-border">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                </div>
              ))
            : orders.map((order) => (
                <div key={order.id} className={`p-4 ${selectedIds.has(order.id) ? "bg-primary/5" : ""}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleRow(order.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer mt-0.5 shrink-0"
                      />
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-bold text-primary hover:underline">
                        {order.order_number}
                      </Link>
                    </div>
                    <StatusBadge status={order.status} type="order" />
                  </div>
                  <div className="pl-6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                        {order.customer_name?.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 pl-8">{order.customer_phone}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={order.delivery_type} type="delivery" />
                        <span className="text-xs text-muted-foreground">{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{formatKES(order.total)}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(order.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* ── Desktop table view (sm+) ── */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                </th>
                {["Order","Customer","Items","Total","Status","Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-4 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-8 mx-auto rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-28 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 ml-auto rounded" /></td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr key={order.id} className={`hover:bg-muted/20 transition-colors ${selectedIds.has(order.id) ? "bg-muted/10" : ""}`}>
                      <td className="px-6 py-4">
                        <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleRow(order.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer" />
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-primary hover:underline">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {order.customer_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{order.customer_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-muted-foreground">{order.item_count}</td>
                      <td className="px-6 py-4 font-semibold text-foreground text-sm">{formatKES(order.total)}</td>
                      <td className="px-6 py-4 space-y-1">
                        <StatusBadge status={order.delivery_type} type="delivery" />
                        <StatusBadge status={order.status} type="order" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-foreground/80">{formatDate(order.created_at)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(order.created_at)}</p>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag size={36} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No orders found</p>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Showing <span className="text-foreground font-medium">{orders.length}</span> of{" "}
              <span className="text-foreground font-medium">{pagination.total.toLocaleString()}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(page - 1)} disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-foreground/80 hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronLeft size={15} />
              </button>
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
                ) : (
                  <button key={p} onClick={() => goToPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground/80 hover:bg-muted"}`}>
                    {p}
                  </button>
                )
              )}
              <button onClick={() => goToPage(page + 1)} disabled={page >= pagination.total_pages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-card border border-border text-foreground/80 hover:bg-muted disabled:opacity-40 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center"><TrendingUp size={16} className="text-secondary" /></div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Revenue</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{formatKES(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Current page only — not all orders</p>
        </div>
        <div className="bg-accent/5 rounded-2xl border border-accent/20 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><Clock size={16} className="text-accent" /></div>
            <p className="text-xs text-accent font-medium uppercase tracking-wide">Needs Attention</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">{pendingCount} Pending</p>
          <p className="text-xs text-accent mt-1">Current page only — not all orders</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><ShoppingBag size={16} className="text-primary" /></div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Processing</p>
          </div>
          <p className="font-display text-2xl font-medium text-foreground">Healthy</p>
          <p className="text-xs text-muted-foreground mt-1">System status: Online</p>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border shadow-card px-4 sm:px-6 py-3 sm:py-4 rounded-2xl flex items-center gap-3 sm:gap-6 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">{selectedIds.size}</div>
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">selected</span>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={handleBulkConfirm} disabled={bulkLoading}
              className="bg-primary text-primary-foreground px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 hover:opacity-90 whitespace-nowrap">
              Confirm
            </button>
            <button onClick={() => setShowCancelDialog(true)} disabled={bulkLoading}
              className="bg-destructive text-destructive-foreground px-3 sm:px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 hover:opacity-90 whitespace-nowrap">
              Cancel
            </button>
          </div>
          <button onClick={() => setSelectedIds(new Set())}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors shrink-0">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="rounded-2xl p-6 max-w-md bg-card mx-4">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto">
              <AlertTriangle size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="font-display text-lg font-medium text-foreground">Cancel Orders?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Cancel <span className="font-semibold text-foreground">{selectedIds.size} selected orders</span>?
              </p>
            </div>
          </DialogHeader>
          <div className="mt-4 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Reason (optional)</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter a reason..." rows={3}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-background focus:ring-primary focus:border-primary outline-none resize-none" />
          </div>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button onClick={() => { setShowCancelDialog(false); setCancelReason(""); }} disabled={bulkLoading}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
              Go Back
            </button>
            <button onClick={handleBulkCancel} disabled={bulkLoading}
              className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90">
              {bulkLoading ? "Processing..." : "Cancel Orders"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
