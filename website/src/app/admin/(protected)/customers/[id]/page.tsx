import { notFound } from "next/navigation"
import Link from "next/link"
import { getAdminClient } from "@/lib/admin/supabase"
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters"
import StatusBadge from "@/components/admin/StatusBadge"
import RoleChangeControl from "./RoleChangeControl"

interface Props {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const admin = getAdminClient()

  const { data: profile } = await admin.from("profiles").select("*").eq("id", id).single()
  if (!profile) notFound()

  const { data: orders } = await admin
    .from("orders")
    .select("id, order_number, created_at, total, status, payment_status")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(200)

  const orderList = orders ?? []
  const order_count = orderList.length
  const total_spent_kes = orderList
    .filter((o) => o.payment_status === "completed")
    .reduce((sum, o) => sum + o.total, 0)
  const first_order_at = orderList[orderList.length - 1]?.created_at ?? null
  const last_order_at = orderList[0]?.created_at ?? null

  const initials = (profile.full_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        ← Back to Customers
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-semibold shrink-0">
            {initials}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900">
                {profile.full_name ?? "—"}
              </h3>
              <RoleBadgeDisplay role={profile.role} />
            </div>

            {profile.email && (
              <p className="text-sm text-gray-600">📧 {profile.email}</p>
            )}
            {profile.phone && (
              <p className="text-sm text-gray-600">📞 {profile.phone}</p>
            )}
            {(profile.default_address || profile.default_city) && (
              <p className="text-sm text-gray-600">
                📍{" "}
                {[profile.default_address, profile.default_city].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Joined: {formatDate(profile.created_at)}
            </p>

            {/* Role change control */}
            <div className="pt-2">
              <RoleChangeControl
                customerId={id}
                currentRole={profile.role}
                customerName={profile.full_name ?? profile.email ?? "this user"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Orders</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{order_count}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Spent</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{formatKES(total_spent_kes)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">First Order</p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {first_order_at ? formatRelativeTime(first_order_at) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Last Order</p>
          <p className="text-sm font-medium text-gray-900 mt-1">
            {last_order_at ? formatRelativeTime(last_order_at) : "—"}
          </p>
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Order History</h2>
        </div>
        {orderList.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatRelativeTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatKES(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.payment_status} type="payment" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function RoleBadgeDisplay({ role }: { role: string }) {
  const colors: Record<string, string> = {
    customer: "bg-gray-100 text-gray-700",
    kitchen: "bg-orange-100 text-orange-700",
    admin: "bg-red-100 text-red-700",
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[role] ?? "bg-gray-100 text-gray-700"}`}
    >
      {role}
    </span>
  )
}
