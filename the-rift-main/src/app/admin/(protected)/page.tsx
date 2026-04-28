import Link from "next/link";
import {
  ShoppingCart, TrendingUp, Clock, Users,
  ChevronRight, Package, Tag as TagIcon, Bell as BellIcon,
  Settings as SettingsIcon, ArrowUpRight, CreditCard,
  Image as ImageIcon, BookOpen, Info,
} from "lucide-react";
import { getAdminClient } from "@/lib/admin/supabase";
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters";
import StatusBadge from "@/components/admin/StatusBadge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Rift & Root Admin" };

export default async function AdminDashboardPage() {
  const supabase = getAdminClient();

  const [
    { count: totalOrders },
    { data: revenueRows },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: recentOrdersData },
    { count: totalProducts },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total").eq("payment_status", "paid"),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders")
      .select("id, order_number, customer_name, total, status, payment_status, created_at, order_items(id)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const recentOrders = recentOrdersData?.map((o) => ({
    ...o,
    itemCount: (o.order_items as { id: string }[])?.length ?? 0,
  }));

  const totalRevenueKES = revenueRows?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" :
    now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 pb-4">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">{greeting}</p>
          <h1 className="font-display text-3xl font-medium text-foreground leading-tight">Dashboard</h1>
        </div>
        <Link href="/admin/orders/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors hover:opacity-90 w-fit">
          <ShoppingCart size={15} /> New Order
        </Link>
      </div>

      {/* ── KPI stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatKES(totalRevenueKES),
            sub: "All confirmed payments",
            icon: TrendingUp,
            accent: "bg-green-500/10 text-green-600 dark:text-green-400",
            border: "border-green-500/10",
          },
          {
            label: "Total Orders",
            value: (totalOrders ?? 0).toLocaleString(),
            sub: "All time",
            icon: ShoppingCart,
            accent: "bg-primary/10 text-primary",
            border: "border-primary/10",
          },
          {
            label: "Needs Attention",
            value: (pendingOrders ?? 0).toLocaleString(),
            sub: "Pending & confirmed",
            icon: Clock,
            accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            border: "border-amber-500/10",
          },
          {
            label: "Customers",
            value: (totalCustomers ?? 0).toLocaleString(),
            sub: "Registered accounts",
            icon: Users,
            accent: "bg-secondary/10 text-secondary",
            border: "border-secondary/10",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label}
              className={`bg-card rounded-2xl border ${card.border} p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow`}>
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.accent}`}>
                  <Icon size={16} />
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground/30" />
              </div>
              <div>
                <p className="font-display text-2xl font-medium text-foreground leading-none">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">{card.label}</p>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modules grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-medium text-foreground">Modules</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Navigate to any section of the admin panel</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Orders",
              desc: "Manage & fulfil customer orders",
              href: "/admin/orders",
              icon: ShoppingCart,
              iconBg: "bg-primary/10",
              iconColor: "text-primary",
              stat: pendingOrders ? `${pendingOrders} pending` : "All clear",
              statColor: pendingOrders ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400",
            },
            {
              label: "Products",
              desc: "Catalogue, pricing & inventory",
              href: "/admin/products",
              icon: Package,
              iconBg: "bg-secondary/10",
              iconColor: "text-secondary",
              stat: `${totalProducts ?? 0} active`,
              statColor: "text-muted-foreground",
            },
            {
              label: "Customers",
              desc: "Accounts, history & roles",
              href: "/admin/customers",
              icon: Users,
              iconBg: "bg-blue-500/10",
              iconColor: "text-blue-600",
              stat: `${(totalCustomers ?? 0).toLocaleString()} registered`,
              statColor: "text-muted-foreground",
            },
            {
              label: "Payments",
              desc: "Transactions & M-Pesa receipts",
              href: "/admin/payments",
              icon: CreditCard,
              iconBg: "bg-green-500/10",
              iconColor: "text-green-600",
              stat: formatKES(totalRevenueKES),
              statColor: "text-green-600 dark:text-green-400",
            },
            {
              label: "Categories",
              desc: "Organise product groups",
              href: "/admin/categories",
              icon: TagIcon,
              iconBg: "bg-accent/10",
              iconColor: "text-accent",
              stat: "Manage",
              statColor: "text-muted-foreground",
            },
            {
              label: "Banners",
              desc: "Storefront banners & promotions",
              href: "/admin/banners",
              icon: ImageIcon,
              iconBg: "bg-purple-500/10",
              iconColor: "text-purple-600",
              stat: "Manage",
              statColor: "text-muted-foreground",
            },
            {
              label: "Recipes",
              desc: "Blog recipes & cooking guides",
              href: "/admin/recipes",
              icon: BookOpen,
              iconBg: "bg-orange-500/10",
              iconColor: "text-orange-600",
              stat: "Manage",
              statColor: "text-muted-foreground",
            },
            {
              label: "Notifications",
              desc: "Alerts & store activity",
              href: "/admin/notifications",
              icon: BellIcon,
              iconBg: "bg-amber-500/10",
              iconColor: "text-amber-600",
              stat: "View all",
              statColor: "text-muted-foreground",
            },
            {
              label: "Content",
              desc: "About, Community & site pages",
              href: "/admin/content",
              icon: Info,
              iconBg: "bg-blue-500/10",
              iconColor: "text-blue-600",
              stat: "Edit pages",
              statColor: "text-muted-foreground",
            },
            {
              label: "Settings",
              desc: "Store config & team access",
              href: "/admin/settings",
              icon: SettingsIcon,
              iconBg: "bg-muted",
              iconColor: "text-muted-foreground",
              stat: "Configure",
              statColor: "text-muted-foreground",
            },
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <Link key={mod.href + mod.label} href={mod.href}
                className="group bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mod.iconBg}`}>
                    <Icon size={18} className={mod.iconColor} />
                  </div>
                  <ArrowUpRight size={14} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors mt-0.5" />
                </div>
                {/* Label + desc */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground leading-none">{mod.label}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{mod.desc}</p>
                </div>
                {/* Stat */}
                <div className="pt-3 border-t border-border">
                  <p className={`text-xs font-semibold ${mod.statColor}`}>{mod.stat}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-medium text-foreground">Recent Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest {recentOrders?.length ?? 0} orders</p>
          </div>
          <Link href="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
            View all <ChevronRight size={13} />
          </Link>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30">
                    {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`}
                          className="text-sm font-semibold text-primary hover:underline font-mono">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {order.customer_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-foreground font-medium truncate max-w-[120px]">{order.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground text-center">{order.itemCount}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground whitespace-nowrap">{formatKES(order.total)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={order.status} type="order" />
                          <StatusBadge status={order.payment_status} type="payment" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-xs text-foreground/70 whitespace-nowrap">{formatDate(order.created_at)}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{formatRelativeTime(order.created_at)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing <span className="text-foreground font-medium">{recentOrders.length}</span> of{" "}
                <span className="text-foreground font-medium">{(totalOrders ?? 0).toLocaleString()}</span> orders
              </p>
              <Link href="/admin/orders"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                All orders <ChevronRight size={12} />
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingCart size={20} className="text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground/60">Orders will appear here once customers start placing them.</p>
          </div>
        )}
      </div>

    </div>
  );
}
