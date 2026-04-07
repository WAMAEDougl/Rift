import Link from "next/link";
import { ShoppingBasket, Receipt, Hourglass, UserPlus, TrendingUp, AlertCircle, Search, Filter, ChevronLeft, ChevronRight, Package, ArrowUpRight } from "lucide-react";
import { getAdminClient } from "@/lib/admin/supabase";
import { formatKES, formatDate } from "@/lib/admin/formatters";
import StatusBadge from "@/components/admin/StatusBadge";

export default async function AdminDashboardPage() {
  const supabase = getAdminClient();

  const [
    { count: totalOrders },
    { data: revenueRows },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: recentOrdersData },
    { data: lowStockProducts },
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
        "id, order_number, customer_name, total, status, payment_status, created_at, order_items(id)"
      )
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select("name, in_stock")
      .eq("in_stock", false)
      .limit(3),
  ]);

  const recentOrders = recentOrdersData?.map(o => ({
    ...o,
    itemCount: (o.order_items as any[])?.length ?? 0
  }));

  const totalRevenueKES =
    revenueRows?.reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;

  // Revenue data: last 14 days
  const now = new Date();
  const revenueData: { date: string; revenue_kes: number; label: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-KE", { day: "2-digit" });
    const revenue_kes =
      revenueRows
        ?.filter((r) => r.created_at.slice(0, 10) === iso)
        .reduce((sum, r) => sum + (r.total ?? 0), 0) ?? 0;
    revenueData.push({ date: iso, revenue_kes, label });
  }

  const maxRev = Math.max(...revenueData.map((d) => d.revenue_kes), 1);

  const statCards = [
    {
      label: "Total Orders",
      value: (totalOrders ?? 0).toLocaleString(),
      change: "+12.5%",
      icon: "shopping_basket",
      color: "text-primary",
      bg: "bg-surface-container-low",
      highlight: "bg-primary/5",
    },
    {
      label: "Revenue",
      value: formatKES(totalRevenueKES),
      change: "+8.2%",
      icon: "payments",
      color: "text-tertiary",
      bg: "bg-surface-container-low",
      highlight: "bg-tertiary/5",
    },
    {
      label: "Pending Orders",
      value: (pendingOrders ?? 0).toLocaleString(),
      change: "-2.4%",
      icon: "hourglass_empty",
      color: "text-error",
      bg: "bg-surface-container-low",
      highlight: "bg-error/5",
    },
    {
      label: "New Customers",
      value: (totalCustomers ?? 0).toLocaleString(),
      change: "+15.1%",
      icon: "person_add",
      color: "text-[#004b1e]",
      bg: "bg-surface-container-low",
      highlight: "bg-primary-container/10",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* ── High-Fidelity Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-8 rounded-[40px] shadow-[0_4px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_60px_rgba(0,0,0,0.06)] hover:scale-[1.03] transition-all duration-700 group relative border border-slate-50/50"
          >
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className={`w-14 h-14 ${card.bg} rounded-2xl ${card.color} flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-6`}>
                <span className="material-symbols-outlined text-[24px]">{card.icon}</span>
              </div>
              <span className={`px-3 py-1.5 ${card.change.startsWith("+") ? "bg-[#22c55e]/10 text-[#22c55e]" : "bg-red-50 text-red-500"} text-[10px] font-black rounded-full uppercase tracking-widest`}>
                {card.change}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">{card.label}</p>
              <h3 className="text-4xl font-extrabold text-[#1a1a2e] tracking-tight leading-none" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                {card.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Performance Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-8 bg-white p-10 rounded-[48px] shadow-[0_4px_40px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tight leading-none" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                Revenue Performance
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Activity tracker — last 14 days</p>
            </div>
            <button className="px-6 py-3 bg-[#1a1a2e] hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-[#1a1a2e]/10 active:scale-95">
              Generate Report
            </button>
          </div>

          <div className="h-72 flex items-end justify-between gap-3 px-2 relative z-10">
            {revenueData.map((day, i) => {
              const barH = Math.max((day.revenue_kes / maxRev) * 100, 8);
              const isHighest = day.revenue_kes === maxRev && maxRev > 0;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center group cursor-pointer h-full justify-end">
                  <div className="relative w-full flex flex-col items-center justify-end h-full">
                     <div className={`absolute -top-12 bg-[#1a1a2e] text-white text-[11px] font-black py-2 px-4 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-4 group-hover:-translate-y-6 z-20 whitespace-nowrap shadow-2xl pointer-events-none`}>
                      {formatKES(day.revenue_kes)}
                    </div>
                    <div
                      className={`w-full rounded-2xl transition-all duration-700 relative z-10 ${
                        isHighest ? "bg-primary shadow-[0_10px_30px_rgba(0,110,47,0.3)]" : "bg-slate-100/80 group-hover:bg-[#22c55e]/30"
                      }`}
                      style={{ height: `${barH}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-tighter group-hover:text-primary transition-colors">
                    D{day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Highlighting Alert Container */}
        <div className="lg:col-span-4 bg-[#1a1a2e] rounded-[48px] p-10 text-white relative overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(26,26,46,0.3)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-32 translate-x-32"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md self-start group cursor-help">
              <span className="material-symbols-outlined text-primary-container text-2xl group-hover:animate-pulse">error</span>
            </div>
            <h4 className="text-3xl font-black mb-4 tracking-tight leading-tight" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
              Inventory Alert
            </h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 opacity-70">
              Some products are marked as out of stock. Update your inventory to keep things running smoothly.
            </p>
            <div className="space-y-4 flex-1">
              {lowStockProducts && lowStockProducts.length > 0 ? (
                lowStockProducts.map((p) => (
                  <div key={p.name} className="bg-white/5 p-5 rounded-[24px] backdrop-blur-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse"></span>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-200">{p.name}</span>
                    </div>
                    <span className="text-xs font-black text-red-400 bg-red-500/10 px-3 py-1.5 rounded-[12px] border border-red-500/20 tracking-tighter uppercase">RESTOCK</span>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-[32px] bg-white/5 text-center border border-dashed border-white/10">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Inventory Balanced</p>
                </div>
              )}
            </div>
            <Link
              href="/admin/products"
              className="mt-10 w-full py-4 bg-primary-container text-[#004b1e] rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all text-center relative z-10 shadow-2xl shadow-primary-container/20 group overflow-hidden"
            >
              <span className="relative z-10">Manage Inventory</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent Orders Table ── */}
      <section className="bg-white rounded-[48px] shadow-sm overflow-hidden border border-slate-50">
        <div className="px-10 py-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tight" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
              Recent Orders
            </h3>
            <p className="text-slate-400 text-xs font-medium mt-1">Check your most recent customer orders</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                className="w-full md:w-72 pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400 outline-none"
                placeholder="Find a specific order..."
                type="text"
              />
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 px-6 py-3 bg-[#1a1a2e] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              Export
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Order #</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Customer</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Items</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Total</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50 last:border-0">
                  <td className="px-10 py-6">
                    <Link href={`/admin/orders/${order.id}`} className="font-bold text-[#006e2f] bg-green-50 px-3 py-1.5 rounded-xl group-hover:bg-[#006e2f] group-hover:text-white transition-all text-sm">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#1a1a2e] text-xs font-black shadow-inner">
                        {order.customer_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#1a1a2e]">{order.customer_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Registered Customer</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-[#1a1a2e] text-center">
                    {order.itemCount} <span className="text-[10px] text-slate-400 uppercase">Items</span>
                  </td>
                  <td className="px-10 py-6 text-sm font-black text-[#1a1a2e] tracking-tight">{formatKES(order.total)}</td>
                  <td className="px-10 py-6">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="px-10 py-6 text-[11px] font-bold text-slate-400 text-right uppercase tracking-tighter">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-10 py-8 flex justify-between items-center border-t border-slate-50 bg-slate-50/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing <span className="text-[#1a1a2e]">{recentOrders?.length}</span> of <span className="text-[#1a1a2e]">{totalOrders}</span> orders
          </p>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm group">
              <ChevronLeft size={16} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center bg-[#1a1a2e] text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-[#1a1a2e]/10">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
