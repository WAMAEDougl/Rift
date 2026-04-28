"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingCart, Users, Package, Tag,
  CreditCard, Bell, Settings, LogOut, Image, BookOpen,
  Info,
} from "lucide-react";

interface AdminSidebarProps {
  role: "admin" | "kitchen";
  userName?: string;
  userRole?: string;
}

// Grouped nav — dividers between sections
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
      { label: "Notifications", href: "/admin/notifications", icon: Bell,     exact: false },
      { label: "Content",       href: "/admin/content",       icon: Info,     exact: false },
      { label: "Settings",      href: "/admin/settings",      icon: Settings, exact: false },
    ],
  },
];

const kitchenAllowed = ["/admin", "/admin/orders"];

export default function AdminSidebar({ role, userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();

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

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col z-50 ink-gradient">

      {/* Brand */}
      <div className="px-5 py-5 border-b border-background/10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M9 15.5C9 15.5 3.5 11.5 3.5 7C3.5 4.515 6.015 2.5 9 2.5C11.985 2.5 14.5 4.515 14.5 7C14.5 11.5 9 15.5 9 15.5Z" fill="#c8a96e" fillOpacity="0.9"/>
              <line x1="9" y1="15.5" x2="9" y2="9" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="text-background font-display text-sm font-medium leading-none">Rift &amp; Root</p>
            <p className="text-accent/50 text-[9px] uppercase tracking-[0.2em] mt-0.5">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Nav — scrollable */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-none">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-background/30">
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
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? "bg-background/15 text-background"
                        : "text-background/55 hover:bg-background/8 hover:text-background/90"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={active ? "text-accent shrink-0" : "shrink-0 opacity-70"}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — user + logout */}
      <div className="px-3 pb-4 pt-3 border-t border-background/10 space-y-1 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-[13px] font-medium text-background/50 hover:bg-background/10 hover:text-background transition-all"
        >
          <LogOut size={15} className="shrink-0" />
          Sign Out
        </button>

        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-background/10">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-foreground text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-background text-xs font-semibold truncate leading-tight">{displayName}</p>
            <p className="text-accent/50 text-[10px] capitalize truncate">{displayRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
