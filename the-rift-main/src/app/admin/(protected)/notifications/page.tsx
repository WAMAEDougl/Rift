"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCheck, Circle, ChevronLeft, ChevronRight, ShoppingBag, CreditCard, Package, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/admin/formatters";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface PaginationMeta { page: number; per_page: number; total: number; total_pages: number; }

const TYPE_ICON: Record<string, React.ReactNode> = {
  new_order: <ShoppingBag size={15} />,
  payment_received: <CreditCard size={15} />,
  low_stock: <Package size={15} />,
};

const TYPE_COLOR: Record<string, string> = {
  new_order: "bg-primary/10 text-primary",
  payment_received: "bg-green-500/10 text-green-600",
  low_stock: "bg-amber-500/10 text-amber-600",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"" | "false" | "true">("");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("per_page", "20");
    if (filter !== "") params.set("is_read", filter);

    const res = await fetch(`/api/admin/notifications?${params.toString()}`);
    const json = await res.json();
    if (json.data) {
      setNotifications(json.data.items);
      setPagination(json.data.pagination);
      setUnreadCount(json.data.unread_count ?? 0);
    }
    setLoading(false);
  }, [page, filter]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markRead(id: string) {
    await fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    setMarkingAll(true);
    const res = await fetch("/api/admin/notifications/read-all", { method: "POST" });
    const json = await res.json();
    setMarkingAll(false);
    if (!res.ok) { toast.error("Failed to mark all as read"); return; }
    toast.success(`${json.data?.updated_count ?? "All"} notifications marked as read`);
    fetchNotifications();
  }

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">Notifications</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {unreadCount > 0
              ? <span className="text-primary font-medium">{unreadCount} unread</span>
              : "All caught up"}
            {pagination && <span> · {pagination.total.toLocaleString()} total</span>}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={markingAll}
            className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:bg-muted disabled:opacity-50">
            <CheckCheck size={15} />
            {markingAll ? "Marking…" : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center bg-muted/30 rounded-xl p-1 gap-1 w-fit">
        {([["", "All"], ["false", "Unread"], ["true", "Read"]] as const).map(([val, label]) => (
          <button key={val} onClick={() => { setFilter(val); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${filter === val ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {label}
            {val === "false" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-start gap-4">
                <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-72 rounded" />
                </div>
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            ))
          : notifications.length === 0
            ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Bell size={36} className="text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              </div>
            )
            : notifications.map((n) => (
                <div key={n.id}
                  className={`px-6 py-4 flex items-start gap-4 transition-colors hover:bg-muted/20 cursor-pointer ${!n.is_read ? "bg-primary/[0.02]" : ""}`}
                  onClick={() => { if (!n.is_read) markRead(n.id); }}>
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLOR[n.type] ?? "bg-muted text-muted-foreground"}`}>
                    {TYPE_ICON[n.type] ?? <Info size={15} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold truncate ${n.is_read ? "text-foreground/70" : "text-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <Circle size={7} className="text-primary fill-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                  </div>

                  {/* Time */}
                  <p className="text-xs text-muted-foreground shrink-0 mt-0.5">{formatRelativeTime(n.created_at)}</p>
                </div>
              ))
        }
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing <span className="text-foreground font-medium">{notifications.length}</span> of{" "}
            <span className="text-foreground font-medium">{pagination.total.toLocaleString()}</span>
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
  );
}
