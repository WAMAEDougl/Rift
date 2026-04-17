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

  const { data: profile } = await admin.from("profiles").select("id, full_name, email, phone, role, default_address, default_city, created_at").eq("id", id).single()
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
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-[#1a1a2e]"
      >
        ← Back to Customers
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2
          className="text-base font-bold text-[#1a1a2e] mb-4"
          style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
        >
          Profile
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-semibold shrink-0">
            {initials}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-[#1a1a2e]">
                {profile.full_name ?? "—"}
              </h3>
              <RoleBadgeDisplay role={profile.role} />
            </div>

            {profile.email && (
              <p className="text-sm text-slate-500">📧 {profile.email}</p>
            )}
            {profile.phone && (
              <p className="text-sm text-slate-500">📞 {profile.phone}</p>
            )}
            {(profile.default_address || profile.default_city) && (
              <p className="text-sm text-slate-500">
                📍{" "}
                {[profile.default_address, profile.default_city].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="text-sm text-slate-500">
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
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Orders</p>
          <p className="text-2xl font-semibold text-[#1a1a2e] mt-1">{order_count}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Spent</p>
          <p className="text-2xl font-semibold text-[#1a1a2e] mt-1">{formatKES(total_spent_kes)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">First Order</p>
          <p className="text-sm font-medium text-[#1a1a2e] mt-1">
            {first_order_at ? formatRelativeTime(first_order_at) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Last Order</p>
          <p className="text-sm font-medium text-[#1a1a2e] mt-1">
            {last_order_at ? formatRelativeTime(last_order_at) : "—"}
          </p>
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2
            className="text-base font-bold text-[#1a1a2e]"
            style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
          >
            Order History
          </h2>
        </div>
        {orderList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70">
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-[#006e2f] hover:text-[#005a26] hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatRelativeTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1a1a2e]">
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
    customer: "bg-slate-100 text-gray-700",
    kitchen: "bg-orange-100 text-orange-700",
    admin: "bg-red-100 text-red-700",
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[role] ?? "bg-slate-100 text-gray-700"}`}
    >
      {role}
    </span>
  )
}
