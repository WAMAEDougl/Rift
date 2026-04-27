"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, Phone, Mail, MapPin, ShoppingBag,
  TrendingUp, Calendar, Package, Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters";
import { toast } from "sonner";

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  role: string;
  default_city: string | null;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  delivery_city: string | null;
  created_at: string;
}

interface Stats {
  order_count: number;
  total_spent_kes: number;
  first_order_at: string | null;
  last_order_at: string | null;
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/customers/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          setProfile(j.data.profile);
          setOrders(j.data.orders ?? []);
          setStats(j.data.stats);
        }
        setLoading(false);
      });
  }, [id]);

  async function handleRoleChange(newRole: string) {
    if (!profile) return;
    setChangingRole(true);
    const res = await fetch(`/api/admin/customers/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    const json = await res.json();
    setChangingRole(false);
    if (!res.ok) { toast.error(json.error?.message ?? "Update failed"); return; }
    setProfile((prev) => prev ? { ...prev, role: newRole } : prev);
    toast.success(`Role updated to ${newRole}`);
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-8 w-48 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <User size={36} className="text-muted-foreground/20 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Customer not found</p>
        <Link href="/admin/customers" className="mt-4 text-primary text-sm font-medium hover:underline">← Back to Customers</Link>
      </div>
    );
  }

  const initials = profile.full_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers"
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-medium text-foreground">{profile.full_name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Customer since {formatDate(profile.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — profile card */}
        <div className="space-y-5">
          <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-display text-lg font-medium text-foreground">{profile.full_name}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide mt-1 ${
                profile.role === "admin" ? "bg-primary/10 text-primary" :
                profile.role === "kitchen" ? "bg-accent/10 text-accent" :
                "bg-muted text-muted-foreground"
              }`}>
                {profile.role}
              </span>
            </div>

            <div className="w-full space-y-2.5 text-left">
              <div className="flex items-center gap-2.5 text-sm">
                <Phone size={13} className="text-muted-foreground shrink-0" />
                <span className="text-foreground font-medium">{profile.phone}</span>
              </div>
              {profile.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground truncate">{profile.email}</span>
                </div>
              )}
              {profile.default_city && (
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-foreground">{profile.default_city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Role management */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change Role</p>
            <div className="space-y-2">
              {["customer", "kitchen", "admin"].map((r) => (
                <button key={r} onClick={() => handleRoleChange(r)}
                  disabled={changingRole || profile.role === r}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    profile.role === r
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  }`}>
                  <span className="capitalize">{r}</span>
                  {profile.role === r && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Current</span>
                  )}
                  {changingRole && profile.role !== r && (
                    <Loader2 size={12} className="animate-spin text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — stats + orders */}
        <div className="lg:col-span-2 space-y-5">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Orders", value: stats?.order_count ?? 0, icon: ShoppingBag, color: "text-primary bg-primary/10" },
              { label: "Total Spent", value: formatKES(stats?.total_spent_kes ?? 0), icon: TrendingUp, color: "text-green-600 bg-green-500/10" },
              { label: "First Order", value: stats?.first_order_at ? formatRelativeTime(stats.first_order_at) : "—", icon: Calendar, color: "text-muted-foreground bg-muted" },
              { label: "Last Order", value: stats?.last_order_at ? formatRelativeTime(stats.last_order_at) : "—", icon: Package, color: "text-accent bg-accent/10" },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                    <Icon size={14} />
                  </div>
                  <p className="font-display text-lg font-medium text-foreground leading-none">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Order history */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-display text-base font-medium text-foreground">Order History</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{orders.length} orders</p>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingBag size={28} className="text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30">
                      {["Order", "Status", "Total", "Date"].map((h) => (
                        <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3">
                          <Link href={`/admin/orders/${o.id}`}
                            className="text-sm font-semibold text-primary hover:underline font-mono">
                            {o.order_number}
                          </Link>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={o.status} type="order" />
                            <StatusBadge status={o.payment_status} type="payment" />
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatKES(o.total)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <p className="text-xs text-foreground/70 whitespace-nowrap">{formatDate(o.created_at)}</p>
                          <p className="text-[11px] text-muted-foreground">{formatRelativeTime(o.created_at)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
