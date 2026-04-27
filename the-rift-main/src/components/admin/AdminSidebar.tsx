"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Tag,
  CreditCard, Bell, Settings, LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  role: "admin" | "kitchen";
  userName?: string;
  userRole?: string;
}

const allNavItems = [
  { label: "Dashboard",     href: "/admin",               icon: LayoutDashboard, exact: true },
  { label: "Orders",        href: "/admin/orders",        icon: ShoppingCart,    exact: false },
  { label: "Customers",     href: "/admin/customers",     icon: Users,           exact: false },
  { label: "Products",      href: "/admin/products",      icon: Package,         exact: false },
  { label: "Categories",    href: "/admin/categories",    icon: Tag,             exact: false },
  { label: "Payments",      href: "/admin/payments",      icon: CreditCard,      exact: false },
  { label: "Notifications", href: "/admin/notifications", icon: Bell,            exact: false },
  { label: "Settings",      href: "/admin/settings",      icon: Settings,        exact: false },
];

const kitchenNavItems = ["/admin", "/admin/orders"];

export default function AdminSidebar({ role, userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems =
    role === "kitchen"
      ? allNavItems.filter((item) => kitchenNavItems.includes(item.href))
      : allNavItems;

  function isActive(item: (typeof allNavItems)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const displayName = userName ?? "Admin";
  const displayRole = userRole ?? role;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-50 ink-gradient">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-background/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 15.5C9 15.5 3.5 11.5 3.5 7C3.5 4.515 6.015 2.5 9 2.5C11.985 2.5 14.5 4.515 14.5 7C14.5 11.5 9 15.5 9 15.5Z" fill="#c8a96e" fillOpacity="0.9"/>
              <line x1="9" y1="15.5" x2="9" y2="9" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-background font-display text-sm leading-none">Rift &amp; Root</p>
            <p className="text-accent/60 text-[10px] uppercase tracking-widest mt-0.5">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-background/15 text-background"
                  : "text-background/60 hover:bg-background/10 hover:text-background"
              }`}
            >
              <Icon size={16} className={active ? "text-accent" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-background/10 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-background/60 hover:bg-background/10 hover:text-background transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>

        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/10">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-foreground text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-background text-xs font-semibold truncate">{displayName}</p>
            <p className="text-accent/60 text-[10px] capitalize truncate">{displayRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
