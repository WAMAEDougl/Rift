"use client"

import { usePathname } from "next/navigation"
import NotificationBell from "@/components/admin/NotificationBell"

interface AdminTopbarProps {
  user: { name: string; role: "admin" | "kitchen" }
}

function getPageTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/admin") return { title: "Dashboard", subtitle: "Welcome back, here's what's happening today." }
  if (pathname.startsWith("/admin/orders")) return { title: "Orders", subtitle: "Manage and track all customer orders." }
  if (pathname.startsWith("/admin/products")) return { title: "Products", subtitle: "Manage your product catalogue." }
  if (pathname.startsWith("/admin/categories")) return { title: "Categories", subtitle: "Organise your product categories." }
  if (pathname.startsWith("/admin/customers")) return { title: "Customers", subtitle: "View and manage your customer base." }
  if (pathname.startsWith("/admin/payments")) return { title: "Payments", subtitle: "Review payment logs and transactions." }
  if (pathname.startsWith("/admin/notifications")) return { title: "Notifications", subtitle: "Stay on top of store activity." }
  if (pathname.startsWith("/admin/settings")) return { title: "Settings", subtitle: "Configure your store preferences." }
  return { title: "Admin", subtitle: "" }
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  const pathname = usePathname()
  const { title, subtitle } = getPageTitle(pathname)
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fcf8ff]/70 backdrop-blur-3xl flex items-center justify-between px-10 py-7 border-b border-white/40 shadow-sm animate-in slide-in-from-top duration-700">
      <div className="flex flex-col">
        <h2
          className="text-[#1a1a2e] font-black text-3xl tracking-tight leading-none"
          style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2 opacity-80" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-8">
        <div className="relative group">
          <NotificationBell />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse" />
        </div>

        <div className="h-8 w-px bg-slate-200/60" />

        <div className="flex items-center gap-4 group cursor-pointer bg-white/40 p-1.5 pr-4 rounded-2xl border border-white transition-all hover:bg-white/60">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#22c55e] shadow-sm overflow-hidden group-hover:scale-105 transition-all">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[#1a1a2e] text-[9px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">Admin Panel</p>
            <p className="text-[#1a1a2e] text-xs font-black tracking-tight leading-none group-hover:text-[#006e2f] transition-colors uppercase">{user.name}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
