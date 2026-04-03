import Link from "next/link";
import { ShoppingBag, TrendingUp, Clock, Users } from "lucide-react";
import { getAdminClient } from "@/lib/admin/supabase";
import { formatKES, formatDate } from "@/lib/admin/formatters";
import StatusBadge from "@/components/admin/StatusBadge";

const ALL_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

const STATUS_BAR_COLORS: Record<string, string> = {
  pending: "bg-yellow-400",
  confirmed: "bg-blue-400",
  preparing: "bg-orange-400",
  ready: "bg-purple-400",
  dispatched: "bg-indigo-400",
  delivered: "bg-green-400",
  cancelled: "bg-red-400",
};

export default async function AdminDashboardPage() {
  const supabase = getAdminClient();

  const [
    { count: totalOrders },
    { data: revenueRows },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: recentOrders },
    { data: allOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "completed"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer"),
    supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, total, status, payment_status, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("orders").select("status, created_at, total"),
  ]);

  const totalRevenueKES =
    revenueRows?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;

  // Revenue data: last 14 days
  const now = new Date();
  const revenueData: { date: string; revenue_kes: number; label: string }[] =
    [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
    });
    const revenue_kes =
      revenueRows
        ?.filter((r) => r.created_at.slice(0, 10) === iso)
        .reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;
    revenueData.push({ date: iso, revenue_kes, label });
  }

  // Order status summary
  const statusCounts: Record<string, number> = {};
  for (const status of ALL_STATUSES) {
    statusCounts[status] = 0;
  }
  for (const order of allOrders ?? []) {
    if (order.status in statusCounts) {
      statusCounts[order.status]++;
    }
  }

  const safeTotal = totalOrders ?? 0;
  const maxRev = Math.max(...revenueData.map((d) => d.revenue_kes), 1);
  const chartHeight = 160;
  const svgWidth = 560;
  const barWidth = Math.floor(svgWidth / revenueData.length) - 4;

  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {safeTotal}
              </p>
              <p className="text-xs text-gray-400 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatKES(totalRevenueKES)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Completed payments</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pendingOrders ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalCustomers ?? 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Registered accounts</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Revenue — Last 14 Days
          </h2>
          <div className="overflow-x-auto">
            <svg
              width="100%"
              viewBox={`0 0 ${svgWidth} ${chartHeight + 40}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {revenueData.map((day, i) => {
                const barH = Math.max(
                  (day.revenue_kes / maxRev) * chartHeight,
                  2
                );
                const x = i * (barWidth + 4) + 2;
                const y = chartHeight - barH;
                return (
                  <g key={day.date}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barH}
                      rx={3}
                      className="fill-orange-400"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={chartHeight + 20}
                      textAnchor="middle"
                      fontSize={9}
                      className="fill-gray-400"
                    >
                      {day.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Breakdown</h2>
          <div className="space-y-3">
            {ALL_STATUSES.map((status) => {
              const count = statusCounts[status] ?? 0;
              const pct = safeTotal > 0 ? (count / safeTotal) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={status} type="order" />
                    <span className="text-sm text-gray-600 font-medium">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLORS[status] ?? "bg-gray-300"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            View all
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-orange-600 font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline block w-full h-full"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block w-full h-full"
                      >
                        {order.customer_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block w-full h-full"
                      >
                        {formatKES(order.total)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block w-full h-full"
                      >
                        <StatusBadge status={order.status} type="order" />
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block w-full h-full"
                      >
                        <StatusBadge
                          status={order.payment_status}
                          type="payment"
                        />
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block w-full h-full"
                      >
                        {formatDate(order.created_at)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
