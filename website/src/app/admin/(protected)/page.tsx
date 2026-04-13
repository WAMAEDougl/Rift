import Link from "next/link"
import {
  ShoppingCart, TrendingUp, Clock, Users,
  AlertCircle, ArrowUpRight, ChevronRight, Package,
} from "lucide-react"
import { getAdminClient } from "@/lib/admin/supabase"
import { formatKES, formatDate } from "@/lib/admin/formatters"
import StatusBadge from "@/components/admin/StatusBadge"

export default async function AdminDashboardPage() {
  const supabase = getAdminClient()

  const [
    { count: totalOrders },
    { data: revenueRows },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: recentOrdersData },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total, created_at").eq("payment_status", "completed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders")
      .select("id, order_number, customer_name, total, status, payment_status, created_at, order_items(id)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("products").select("name, in_stock").eq("in_stock", false).limit(3),
  ])

  const recentOrders = recentOrdersData?.map((o) => ({
    ...o,
    itemCount: (o.order_items as { id: string }[])?.length ?? 0,
  }))

  const totalRevenueKES = revenueRows?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0

  // Revenue chart — last 14 days
  const now = new Date()
  const revenueData: { date: string; revenue_kes: number; label: string }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString("en-KE", { day: "2-digit" })
    const revenue_kes =
      revenueRows?.filter((r) => r.created_at.slice(0, 10) === iso).reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0
    revenueData.push({ date: iso, revenue_kes, label })
  }
  const maxRev = Math.max(...revenueData.map((d) => d.revenue_kes), 1)

  const statCards = [
    {
      label: "Total Orders",
      value: (totalOrders ?? 0).toLocaleString(),
      icon: ShoppingCart,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-700",
      border: "border-amber-100",
    },
    {
      label: "Total Revenue",
      value: formatKES(totalRevenueKES),
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-700",
      border: "border-green-100",
    },
    {
      label: "Pending Orders",
      value: (pendingOrders ?? 0).toLocaleString(),
      icon: Clock,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-700",
      border: "border-orange-100",
    },
    {
      label: "Customers",
      value: (totalCustomers ?? 0).toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
      border: "border-blue-100",
    },
  ]

  return (
    <div className="space-y-8">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`bg-white rounded-2xl border ${card.border} p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-200`}
            >
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={card.iconColor} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none"
                  style={{ fontFamily: "var(--font-playfair, serif)" }}>
                  {card.value}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Revenue Chart + Inventory Alert ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900"
                style={{ fontFamily: "var(--font-playfair, serif)" }}>
                Revenue — Last 14 Days
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Completed payments only</p>
            </div>
            <Link
              href="/admin/payments"
              className="text-xs text-amber-700 font-medium hover:text-amber-800 flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="h-48 flex items-end gap-1.5">
            {revenueData.map((day) => {
              const barH = Math.max((day.revenue_kes / maxRev) * 100, 4)
              const isHighest = day.revenue_kes === maxRev && maxRev > 0
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isHighest
                        ? "bg-amber-600"
                        : "bg-amber-100 group-hover:bg-amber-400"
                    }`}
                    style={{ height: `${barH}%` }}
                    title={formatKES(day.revenue_kes)}
                  />
                  <span className="text-[9px] text-gray-300 group-hover:text-gray-500 transition-colors">
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Inventory Alert */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Inventory Alerts</h3>
              <p className="text-xs text-gray-400">Out of stock items</p>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between px-3 py-2.5 bg-red-50 rounded-xl border border-red-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">Out</span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <Package size={24} className="text-gray-200 mb-2" />
                <p className="text-xs text-gray-400">All products in stock</p>
              </div>
            )}
          </div>

          <Link
            href="/admin/products"
            className="mt-4 w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-xl text-center transition-colors"
          >
            Manage Products
          </Link>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900"
              style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Recent Orders
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest {recentOrders?.length} orders</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/60">
                {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold shrink-0">
                        {order.customer_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{order.customer_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.itemCount}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{formatKES(order.total)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {recentOrders?.length} of {totalOrders ?? 0} orders
          </p>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            All orders <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
