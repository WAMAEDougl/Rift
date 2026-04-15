"use client"

import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Eye, EyeOff, KeyRound, LogOut, X } from "lucide-react"
import NotificationBell from "@/components/admin/NotificationBell"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AdminTopbarProps {
  user: { name: string; role: "admin" | "kitchen" }
}

function getPageTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/admin")                          return { title: "Dashboard",     subtitle: "Here's what's happening today." }
  if (pathname.startsWith("/admin/orders"))           return { title: "Orders",        subtitle: "Manage and track all customer orders." }
  if (pathname.startsWith("/admin/products"))         return { title: "Products",      subtitle: "Manage your product catalogue." }
  if (pathname.startsWith("/admin/categories"))       return { title: "Categories",    subtitle: "Organise your product categories." }
  if (pathname.startsWith("/admin/customers"))        return { title: "Customers",     subtitle: "View and manage your customer base." }
  if (pathname.startsWith("/admin/payments"))         return { title: "Payments",      subtitle: "Review payment logs and transactions." }
  if (pathname.startsWith("/admin/notifications"))    return { title: "Notifications", subtitle: "Stay on top of store activity." }
  if (pathname.startsWith("/admin/settings"))         return { title: "Settings",      subtitle: "Configure your store preferences." }
  return { title: "Admin", subtitle: "" }
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const INPUT_CLS = "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 placeholder:text-gray-300 transition-all pr-10"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return }

    setLoading(true)
    try {
      const supabase = createClient()

      // Re-authenticate with current password first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { toast.error("Session expired. Please log in again."); return }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInError) { toast.error("Current password is incorrect"); return }

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) { toast.error(error.message); return }

      toast.success("Password updated successfully")
      onClose()
    } catch {
      toast.error("Failed to update password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <KeyRound size={17} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
                Change Password
              </h3>
              <p className="text-xs text-gray-400">Update your account password</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className={INPUT_CLS}
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className={INPUT_CLS}
              />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className={INPUT_CLS}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminTopbar({ user }: AdminTopbarProps) {
  const pathname = usePathname()
  const { title, subtitle } = getPageTitle(pathname)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-amber-100 flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="text-gray-900 font-bold text-2xl leading-none"
            style={{ fontFamily: "var(--font-playfair, serif)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <NotificationBell />
          <div className="h-6 w-px bg-gray-200" />

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2.5 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">
                {user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-gray-800 text-xs font-semibold leading-none">{user.name}</p>
                <p className="text-gray-400 text-[10px] capitalize mt-0.5">{user.role}</p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-lg py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-gray-50">
                  <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={() => { setDropdownOpen(false); setShowPasswordModal(true) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <KeyRound size={15} />
                  Change Password
                </button>
                <div className="border-t border-gray-50 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  )
}
