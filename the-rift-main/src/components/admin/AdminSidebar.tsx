"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Tag,
  CreditCard, Bell, Settings, LogOut, Image, BookOpen,
  Info, X, Layout,
} from "lucide-react";

interface AdminSidebarProps {
  role: "admin" | "kitchen";
  userName?: string;
  userRole?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navGroups = [
  {
    label: "Store",
    items: [
      { label: "Dashboard",  href: "/admin",               icon: LayoutDashboard, exact: true },
      { label: "Orders",     href: "/admin/orders",        icon: ShoppingCart,    exact: false },
      { label: "Customers",  href: "/admin/customers",     icon: Users,           exact: false },
      { label: "Payments",   href: "/admin/payments",      icon: CreditCard,      exact: false },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Products",   href: "/admin/products",      icon: Package,         exact: false },
      { label: "Categories", href: "/admin/categories",    icon: Tag,             exact: false },
      { label: "Banners",    href: "/admin/banners",       icon: Image,           exact: false },
      { label: "Recipes",    href: "/admin/recipes",       icon: BookOpen,        exact: false },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Pages",         href: "/admin/pages",         icon: Layout,   exact: false },
      { label: "Notifications", href: "/admin/notifications", icon: Bell,     exact: false },
      { label: "Content",       href: "/admin/content",       icon: Info,     exact: false },
      { label: "Settings",      href: "/admin/settings",      icon: Settings, exact: false },
    ],
  },
];

const kitchenAllowed = ["/admin", "/admin/orders"];

export default function AdminSidebar({
  role,
  userName,
  userRole,
  mobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const displayName = userName ?? "Admin";
  const displayRole = userRole ?? role;
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const visibleGroups = navGroups.map((g) => ({
    ...g,
    items: role === "kitchen"
      ? g.items.filter((i) => kitchenAllowed.includes(i.href))
      : g.items,
  })).filter((g) => g.items.length > 0);

  const sidebarContent = (
    <aside
      className="h-full w-64 flex flex-col"
      style={{ background: "linear-gradient(180deg, #1c1917 0%, #1a1f1a 100%)" }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/8 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#c8a96e]/15 border border-[#c8a96e]/25 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 15.5C9 15.5 3.5 11.5 3.5 7C3.5 4.515 6.015 2.5 9 2.5C11.985 2.5 14.5 4.515 14.5 7C14.5 11.5 9 15.5 9 15.5Z" fill="#c8a96e" fillOpacity="0.9"/>
              <line x1="9" y1="15.5" x2="9" y2="9" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-display text-sm font-medium leading-none">Rift &amp; Root</p>
            <p className="text-[#c8a96e]/50 text-[9px] uppercase tracking-[0.2em] mt-0.5">Admin Portal</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-none">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/25">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/6 hover:text-white/80"
                    }`}
                  >
                    <Icon size={15} className={active ? "text-[#c8a96e] shrink-0" : "shrink-0"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/8 space-y-1 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium text-white/40 hover:bg-white/8 hover:text-white/70 transition-all"
        >
          <LogOut size={15} className="shrink-0" />
          Sign Out
        </button>
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/8">
          <div className="w-7 h-7 rounded-full bg-[#c8a96e] flex items-center justify-center text-[#1c1917] text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-xs font-semibold truncate leading-tight">{displayName}</p>
            <p className="text-white/35 text-[10px] capitalize truncate">{displayRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 z-50">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slide-in drawer */}
      {/* Mobile backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onMobileClose}
      />
      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full z-50 w-64 shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
