"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, KeyRound, LogOut, X, Loader2, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AdminTopbarProps {
  user: { name: string; role: "admin" | "kitchen" };
  onMenuClick?: () => void;
}

function getPageTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/admin") return { title: "Dashboard", subtitle: "Here's what's happening today." };
  if (pathname.startsWith("/admin/orders")) return { title: "Orders", subtitle: "Manage and track all customer orders." };
  if (pathname.startsWith("/admin/products")) return { title: "Products", subtitle: "Manage your product catalogue." };
  if (pathname.startsWith("/admin/categories")) return { title: "Categories", subtitle: "Organise your product categories." };
  if (pathname.startsWith("/admin/customers")) return { title: "Customers", subtitle: "View and manage your customer base." };
  if (pathname.startsWith("/admin/payments")) return { title: "Payments", subtitle: "Review payment logs and transactions." };
  if (pathname.startsWith("/admin/notifications")) return { title: "Notifications", subtitle: "Stay on top of store activity." };
  if (pathname.startsWith("/admin/settings")) return { title: "Settings", subtitle: "Configure your store preferences." };
  if (pathname.startsWith("/admin/pages")) return { title: "Pages", subtitle: "Manage sections and content for each page." };
  return { title: "Admin", subtitle: "" };
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all pr-10";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { toast.error("Session expired. Please log in again."); return; }

      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (signInError) { toast.error("Current password is incorrect"); return; }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) { toast.error(error.message); return; }

      toast.success("Password updated successfully");
      onClose();
    } catch {
      toast.error("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-card p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <KeyRound size={17} />
            </div>
            <div>
              <h3 className="font-display text-base font-medium text-foreground">Change Password</h3>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Current Password", value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
            { label: "New Password", value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
            { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
              <div className="relative">
                <input type={field.show ? "text" : "password"} value={field.value}
                  onChange={(e) => field.set(e.target.value)} required className={inputCls}
                  placeholder={field.label === "New Password" ? "At least 8 characters" : "••••••••"} />
                <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {field.show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90">
              {loading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTopbar({ user, onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const { title, subtitle } = getPageTitle(pathname);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="font-display text-xl lg:text-2xl font-medium text-foreground leading-none">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-xs mt-1 hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-6 w-px bg-border" />
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2.5 hover:bg-muted rounded-xl px-2 py-1.5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-foreground text-xs font-semibold leading-none">{user.name}</p>
                <p className="text-muted-foreground text-[10px] capitalize mt-0.5">{user.role}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-2xl border border-border shadow-card py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
                </div>
                <button onClick={() => { setDropdownOpen(false); setShowPasswordModal(true); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  <KeyRound size={15} /> Change Password
                </button>
                <div className="border-t border-border mt-1 pt-1">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </>
  );
}
