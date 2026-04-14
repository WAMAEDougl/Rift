import { notFound } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Truck,
  MapPin,
  Printer,
  ChevronRight,
  User,
  CreditCard,
  Hash,
  ShieldCheck,
  Zap,
  Info,
  X,
  Box,
  Eye,
  AlertTriangle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/admin/supabase"
import StatusBadge from "@/components/admin/StatusBadge"
import { formatKES, formatDate, formatRelativeTime } from "@/lib/admin/formatters"
import { OrderStatusControl } from "./OrderStatusControl"
import { CancelOrderButton } from "./CancelOrderButton"
import { DeliveryEditForm } from "@/components/admin/DeliveryEditForm"

const STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "ready", label: "Ready", icon: Package },
  { key: "dispatched", label: "Dispatched", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = getAdminClient()

  const [{ data: order }, { data: profile }] = await Promise.all([
    admin
      .from("orders")
      .select(
        "*, order_items(id, product_id, product_name, product_price, quantity, line_total)"
      )
      .eq("id", id)
      .single(),
    admin
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single(),
  ])

  if (!order) notFound()

  const role = (profile?.role ?? "admin") as "admin" | "kitchen"
  const isCancelled = order.status === "cancelled"
  const isDelivered = order.status === "delivered"
  const isTerminal = isCancelled || isDelivered

  const stepKeys = STEPS.map((s) => s.key)
  const currentStepIndex = isCancelled ? -1 : stepKeys.indexOf(order.status)
  const progressPercent =
    currentStepIndex <= 0 ? 0 : (currentStepIndex / (STEPS.length - 1)) * 100
  const paymentMethodLabel = order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method.replace(/_/g, " ")
  const paymentStatusLabel = order.payment_status === "paid" ? "Paid" : order.payment_status.replace(/_/g, " ")

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full px-4 mb-20 max-w-[1600px] mx-auto">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-6 border-b border-slate-50/50">
        <div className="space-y-1">
          <Link 
            href="/admin/orders" 
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e] mb-2 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={16} />
            Back to Orders
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Order #{order.order_number}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
               <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? "bg-red-500" : isDelivered ? "bg-[#22c55e]" : "bg-[#2b6cb0] animate-pulse"}`} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                 {order.status.replace(/_/g, " ")}
               </span>
             </div>
             <div className="h-4 w-px bg-slate-200" />
             <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1a2e]/5 rounded-full">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1a2e]">
                 {paymentMethodLabel} · {paymentStatusLabel}
               </span>
             </div>
             <div className="h-4 w-px bg-slate-200" />
             <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
               Placed {formatRelativeTime(order.created_at)}
             </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none bg-slate-50 hover:bg-slate-100 text-[#1a1a2e] px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border border-slate-100">
            <Printer size={18} />
            Print Invoice
          </button>
          {!isTerminal && (
            <button className="flex-1 lg:flex-none bg-[#1a1a2e] text-white px-10 py-4 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center justify-center gap-3 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all overflow-hidden relative group">
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
              <span className="relative z-10">Next Stage</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Asymmetric Bento Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* ── Left Column (8 cols) ── */}
        <div className="lg:col-span-8 space-y-10">

          {/* Sequential Progression */}
          <section className="bg-white p-12 rounded-[60px] border border-slate-50 shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-1000 rotate-12">
               <Zap size={160} />
            </div>
            
            <div className="mb-12 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Clock size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Delivery Status</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time fulfillment tracking</p>
              </div>
            </div>

            {isCancelled ? (
              <div className="p-8 rounded-[32px] bg-red-50 border border-red-100 flex items-center gap-6 animate-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-red-500 shadow-xl shadow-red-200/50">
                  <X size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-red-900 uppercase tracking-widest leading-none mb-2">Order Cancelled</h4>
                  <p className="text-sm font-semibold text-red-700/60">{order.order_notes || "This order was cancelled by the administrator."}</p>
                </div>
              </div>
            ) : (
              <div className="relative pt-4 pb-8">
                {/* Background track */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-slate-50 rounded-full" />
                {/* Active progress fill */}
                <div
                  className="absolute top-8 left-0 h-1 bg-[#22c55e] transition-all duration-1000 ease-out rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                  style={{ width: `${progressPercent}%` }}
                />

                <div className="relative flex justify-between">
                  {STEPS.map((step, idx) => {
                    const StepIcon = step.icon
                    const isCompleted = idx < currentStepIndex
                    const isCurrent = idx === currentStepIndex

                    return (
                      <div key={step.key} className="flex flex-col items-center gap-6 flex-1">
                        <div
                          className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-700 relative group/step ${
                            isCompleted
                              ? "bg-[#22c55e] text-white shadow-xl shadow-[#22c55e]/20"
                              : isCurrent
                                ? "bg-[#1a1a2e] text-white ring-[12px] ring-[#1a1a2e]/5 shadow-2xl scale-110"
                                : "bg-white border border-slate-100 text-slate-200"
                          }`}
                        >
                          <StepIcon size={24} strokeWidth={isCompleted || isCurrent ? 2.5 : 2} />
                          {isCurrent && (
                             <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#22c55e] rounded-full border-2 border-white animate-ping" />
                          )}
                        </div>
                        <div className="text-center space-y-1">
                          <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isCompleted || isCurrent ? "text-[#1a1a2e]" : "text-slate-300"}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                             <p className="text-[9px] font-bold text-[#22c55e] uppercase tracking-widest animate-pulse">In Progress</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Order Items */}
          <section className="bg-white p-12 rounded-[60px] border border-slate-50 shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)]">
             <div className="mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Hash size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Order Items</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details of products ordered</p>
              </div>
            </div>

            <div className="overflow-hidden border border-slate-50 rounded-[40px] mb-12">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Product Details</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Unit Price</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Qty</th>
                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.order_items.map((item: any) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 group-hover:text-[#22c55e] transition-colors">
                              <Box size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-black text-[#1a1a2e]">{item.product_name}</p>
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ID: {item.product_id.split("-")[0]}</p>
                           </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <p className="text-sm font-bold text-slate-500">{formatKES(item.product_price)}</p>
                      </td>
                      <td className="py-6 px-8 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-100 text-sm font-black text-[#1a1a2e] shadow-sm">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right">
                        <p className="text-sm font-black text-[#1a1a2e]">{formatKES(item.line_total)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price Calculations */}
            <div className="flex justify-end pr-8">
              <div className="w-full md:w-96 space-y-6">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Subtotal</span>
                  <span className="text-sm font-bold">{formatKES(order.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Delivery Fee</span>
                  <span className="text-sm font-bold">{formatKES(order.delivery_fee)}</span>
                </div>
                <div className="pt-8 border-t border-slate-100 flex justify-between items-center bg-[#1a1a2e] p-8 rounded-[40px] shadow-2xl shadow-[#1a1a2e]/20 group/total transition-transform hover:scale-[1.02] duration-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Final Balance</span>
                    <p className="text-2xl font-black text-[#22c55e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Total Amount</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                      {formatKES(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Order Notes */}
          {order.order_notes && (
            <section className="bg-slate-50/50 p-12 rounded-[60px] border border-slate-100 group transition-all duration-700">
              <div className="mb-8 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Order Notes</h3>
              </div>
              <div className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm relative overflow-hidden">
                <p className="text-sm font-medium text-slate-600 leading-relaxed relative z-10">{order.order_notes}</p>
                <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:scale-125 transition-transform duration-[2s]">
                    <Info size={120} />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── Right Column (4 cols) ── */}
        <div className="lg:col-span-4 space-y-10">

          {/* Customer Details */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-xl relative overflow-hidden group">
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                   <User size={20} />
                </div>
                <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Customer Details</h3>
              </div>
              {order.customer_id && (
                <Link
                  href={`/admin/customers/${order.customer_id}`}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#22c55e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm"
                >
                  <ChevronRight size={18} />
                </Link>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-5 p-6 rounded-[32px] bg-slate-50/50 border border-slate-100 animate-in slide-in-from-right-8 duration-700">
                 <div className="w-16 h-16 rounded-[20px] bg-white border border-slate-100 flex items-center justify-center shadow-xl shadow-slate-200/50">
                    <span className="text-2xl font-black text-[#1a1a2e] leading-none">{order.customer_name[0]}</span>
                 </div>
                 <div>
                    <p className="text-base font-black text-[#1a1a2e] leading-none mb-1">{order.customer_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-white border border-slate-100 inline-block">Loyalty Member</p>
                 </div>
              </div>

              <div className="space-y-4 px-2">
                <div className="group/item">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Email Address</p>
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50/30 border border-transparent group-hover/item:border-slate-100 transition-all">
                    <div className="text-[#1a1a2e]/30 group-hover/item:text-[#22c55e] transition-colors"><span className="material-symbols-outlined text-[20px]">mail</span></div>
                    <p className="text-sm font-bold text-[#1a1a2e]">{order.customer_email || "Not Provided"}</p>
                  </div>
                </div>

                <div className="group/item">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Phone Number</p>
                   <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50/30 border border-transparent group-hover/item:border-slate-100 transition-all">
                    <div className="text-[#1a1a2e]/30 group-hover/item:text-[#22c55e] transition-colors"><span className="material-symbols-outlined text-[20px]">phone_enabled</span></div>
                    <p className="text-sm font-bold text-[#1a1a2e] font-mono">{order.customer_phone}</p>
                  </div>
                </div>

                <div className="group/item">
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2 ml-1">Delivery Address</p>
                   <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50/30 border border-transparent group-hover/item:border-slate-100 transition-all">
                    <div className="text-[#1a1a2e]/30 group-hover/item:text-[#22c55e] transition-colors mt-0.5"><span className="material-symbols-outlined text-[20px]">location_on</span></div>
                    <p className="text-sm font-bold text-[#1a1a2e] leading-relaxed">
                      {order.delivery_address}
                      {order.delivery_city && <span className="block text-[10px] text-slate-400 mt-1 uppercase font-black">{order.delivery_city} Region</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 animate-in fade-in duration-1000 delay-500">
                <StatusBadge status={order.delivery_type} type="delivery" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 p-8 opacity-[0.02] group-hover:scale-150 transition-transform duration-[3s]">
                <User size={160} />
            </div>
          </section>

          {/* Delivery Edit Form */}
          <DeliveryEditForm
            orderId={order.id}
            initialData={{
              delivery_address: order.delivery_address,
              delivery_city: order.delivery_city,
              delivery_type: order.delivery_type,
              customer_name: order.customer_name,
              customer_phone: order.customer_phone,
              customer_email: order.customer_email,
            }}
          />

          {/* Payment Details */}
          <section className="bg-[#1a1a2e] p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                <CreditCard size={120} className="text-white" />
            </div>
            
            <div className="relative z-10 space-y-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Payment Details</h3>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Order transaction info</p>
                </div>
                <Link
                  href={`/admin/payments/${order.id}`}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#22c55e] hover:bg-[#22c55e] hover:text-white transition-all shadow-lg"
                >
                  <Eye size={18} />
                </Link>
              </div>

              <div className="space-y-6">
                 <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 group-hover:border-white/10 transition-all duration-700">
                    <div className="flex items-center justify-between mb-4">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Method</p>
                       <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#22c55e] text-white animate-pulse shadow-lg shadow-[#22c55e]/20">VERIFIED</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#22c55e]">
                          <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                       </div>
                       <div>
                          <p className="text-lg font-black text-white leading-none uppercase">{paymentMethodLabel}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">Transaction ID: {order.id.split("-")[0]}</p>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-[28px] bg-white/5 border border-white/5">
                       <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Status</p>
                       <StatusBadge status={order.payment_status} type="payment" />
                    </div>
                    {order.mpesa_receipt_number && (
                      <div className="p-5 rounded-[28px] bg-white/5 border border-white/5">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">M-Pesa Receipt</p>
                        <p className="text-xs font-black text-[#22c55e] tracking-tight">{order.mpesa_receipt_number}</p>
                      </div>
                    )}
                 </div>
              </div>
              
              {order.mpesa_checkout_request_id && (
                <div className="p-6 rounded-[28px] bg-white/5 border border-white/5 group-hover:bg-[#22c55e]/5 transition-all">
                   <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck size={14} className="text-[#22c55e]" />
                      <p className="text-[9px] font-black text-white uppercase tracking-widest">Process ID</p>
                   </div>
                   <p className="text-[9px] font-medium text-white/20 break-all font-mono leading-relaxed">{order.mpesa_checkout_request_id}</p>
                </div>
              )}
            </div>
          </section>

          {/* Order Actions */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-xl relative group">
            <div className="mb-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Zap size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Quick Actions</h3>
            </div>
            
            <div className="px-2">
              {!isTerminal ? (
                <OrderStatusControl orderId={order.id} currentStatus={order.status} role={role} />
              ) : (
                <div className="flex items-center gap-3 p-6 rounded-[32px] bg-slate-50/50 border border-slate-100">
                   <Info size={18} className="text-slate-300" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order finalized: no further actions</p>
                </div>
              )}
            </div>
          </section>

          {/* Cancel Order */}
          {!isTerminal && role === "admin" && (
            <section className="bg-red-50/50 p-10 rounded-[48px] border border-red-100 transition-all duration-700 group/abort">
               <div className="mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-500 shadow-sm">
                   <AlertTriangle size={20} />
                </div>
                <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Danger Zone</h3>
              </div>
              <div className="space-y-6">
                 <p className="text-xs font-semibold text-red-800/50 leading-relaxed px-2">Cancelling this order will stop fulfillment and notify the customer. This action is irreversible.</p>
                 <CancelOrderButton orderId={order.id} orderNumber={order.order_number} />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
