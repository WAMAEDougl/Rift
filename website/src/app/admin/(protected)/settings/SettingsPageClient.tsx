"use client"

import { useState } from "react"
import { Plus, Trash2, AlertTriangle, RefreshCw, Store, CreditCard, Users, Globe, ShieldCheck, Eye, EyeOff, UserPlus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

/* ─────────────────────────────────────────────
   Types
 ───────────────────────────────────────────── */
interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
  role: string
  created_at: string
}

interface StoreSettings {
  id: number
  store_name: string
  support_email: string | null
  support_phone: string | null
  default_delivery_fee: number
  delivery_cities: string[]
  order_notification_emails: string[]
  updated_at: string | null
}

const INPUT_CLS =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 placeholder:text-gray-300 transition-all"

/* ─────────────────────────────────────────────
   Tag Input
 ───────────────────────────────────────────── */
const TagInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) => {
  const [input, setInput] = useState("")

  const add = () => {
    const t = input.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setInput("")
  }

  return (
    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white border border-gray-200 min-h-[52px] items-center">
      {value.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-lg"
        >
          {item}
          <button
            onClick={() => onChange(value.filter((v) => v !== item))}
            className="text-amber-600 hover:text-red-500 transition-colors leading-none"
            aria-label={`Remove ${item}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        placeholder={placeholder}
        className="bg-transparent border-none text-sm focus:outline-none focus:ring-0 flex-1 min-w-[120px] placeholder:text-gray-300 text-gray-800"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section card wrapper
 ───────────────────────────────────────────── */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
    {children}
  </div>
)

const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <h3
    className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3"
    style={{ fontFamily: "var(--font-playfair, serif)" }}
  >
    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
      {icon}
    </div>
    {children}
  </h3>
)

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-gray-500 mb-1.5">
    {children}
  </label>
)

/* ─────────────────────────────────────────────
   Store Tab
 ───────────────────────────────────────────── */
function StoreTab({ settings }: { settings: StoreSettings | null }) {
  const [storeName, setStoreName] = useState(settings?.store_name ?? "Ayola Foods KE")
  const [supportEmail, setSupportEmail] = useState(settings?.support_email ?? "")
  const [supportPhone, setSupportPhone] = useState(settings?.support_phone ?? "")
  const [deliveryFee, setDeliveryFee] = useState(String(settings?.default_delivery_fee ?? 150))
  const [cities, setCities] = useState(settings?.delivery_cities ?? ["Nairobi"])
  const [notifEmails, setNotifEmails] = useState(settings?.order_notification_emails ?? [])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: storeName,
          support_email: supportEmail,
          support_phone: supportPhone,
          default_delivery_fee: parseInt(deliveryFee) || 0,
          delivery_cities: cities,
          order_notification_emails: notifEmails,
        }),
      })
      const json = await res.json()
      if (json.error) toast.error(json.error.message)
      else toast.success("Settings saved successfully.")
    } catch {
      toast.error("Failed to save settings. Try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8">
        <Card className="p-6">
          <SectionTitle icon={<Store size={18} />}>Store Information</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel>Store Name</FieldLabel>
              <input className={INPUT_CLS} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store Name" />
            </div>
            <div>
              <FieldLabel>Support Email</FieldLabel>
              <input type="email" className={INPUT_CLS} value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="support@ayolafoods.com" />
            </div>
            <div>
              <FieldLabel>Support Phone</FieldLabel>
              <input className={INPUT_CLS} value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="+254 700 000 000" />
            </div>
            <div>
              <FieldLabel>Default Delivery Fee (KES)</FieldLabel>
              <input type="number" className={INPUT_CLS} value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="150" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel>Delivery Cities (press Enter to add)</FieldLabel>
              <TagInput value={cities} onChange={setCities} placeholder="Add city…" />
            </div>
            <div>
              <FieldLabel>Order Notification Emails (press Enter to add)</FieldLabel>
              <TagInput value={notifEmails} onChange={setNotifEmails} placeholder="Add email…" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-4">
        <div className="rounded-2xl p-6 flex flex-col gap-3 border border-amber-100 bg-amber-50">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Globe size={18} />
          </div>
          <h4 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Store Configuration
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            These settings control how your store operates — delivery fees, supported cities, and notification recipients.
          </p>
        </div>

        <div className="rounded-2xl p-5 border border-gray-100 bg-white flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Settings are secure</p>
            <p className="text-xs text-gray-400 mt-0.5">Saved directly to your database</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   M-Pesa Card
 ───────────────────────────────────────────── */
function MpesaCard({ environment }: { environment: "sandbox" | "production" }) {
  const isProd = environment === "production"
  const [testLoading, setTestLoading] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const handleTest = async () => {
    setTestLoading(true)
    try {
      const res = await fetch("/api/admin/settings/test-mpesa", { method: "POST" })
      const json = await res.json()
      if (json.data?.success) toast.success(json.data.message)
      else toast.error(json.data?.message ?? "Test failed.")
    } catch {
      toast.error("Failed to test connection.")
    } finally {
      setTestLoading(false)
    }
  }

  const MaskedField = ({
    label, value, show, onToggle,
  }: { label: string; value: string; show: boolean; onToggle: () => void }) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
        <span className="text-sm font-mono text-gray-700 flex-1">
          {show ? value : `•••••••••••${value.slice(-4)}`}
        </span>
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition-colors">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle icon={<CreditCard size={18} />}>M-Pesa Integration</SectionTitle>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isProd ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
            {isProd ? "Production" : "Sandbox"}
          </span>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Shortcode</p>
              <p className="font-bold text-gray-900 text-lg">
                {process.env.NEXT_PUBLIC_MPESA_SHORTCODE ?? "174379"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MaskedField
              label="Consumer Key"
              value={process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY ?? "A9z...Node"}
              show={showKey}
              onToggle={() => setShowKey((s) => !s)}
            />
            <MaskedField
              label="Consumer Secret"
              value="X2k...Secret"
              show={showSecret}
              onToggle={() => setShowSecret((s) => !s)}
            />
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            These keys are managed in your server environment. Contact support to update them.
          </p>
        </div>

        <button
          onClick={handleTest}
          disabled={testLoading}
          className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-gray-200 hover:border-amber-600 hover:bg-amber-700 hover:text-white transition-all disabled:opacity-40"
        >
          <RefreshCw size={15} className={testLoading ? "animate-spin" : ""} />
          {testLoading ? "Testing…" : "Test Connection"}
        </button>
      </Card>

      <div className="rounded-2xl p-6 border border-amber-100 bg-amber-50 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Security Notice
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            All transactions are securely processed through Safaricom Daraja API. Ensure your credentials are current before going live.
          </p>
        </div>
        <div className="mt-6 flex items-center gap-3 p-4 bg-white rounded-xl border border-amber-100">
          <ShieldCheck size={18} className="text-green-600 shrink-0" />
          <p className="text-xs text-gray-600 font-medium">
            {isProd ? "Live payments enabled" : "Sandbox mode — no real charges"}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Accounts Table
 ───────────────────────────────────────────── */
function AccountsTable({ users: initialUsers }: { users: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers ?? [])
  const [open, setOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "kitchen">("admin")
  const [invitePassword, setInvitePassword] = useState("")
  const [inviteConfirm, setInviteConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    if (invitePassword.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    if (invitePassword !== inviteConfirm) {
      toast.error("Passwords do not match.")
      return
    }
    setInviting(true)
    try {
      const res = await fetch("/api/admin/settings/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, password: invitePassword }),
      })
      const json = await res.json()
      if (json.error) {
        toast.error(json.error.message)
      } else {
        toast.success(`Account created for ${inviteEmail}.`)
        setOpen(false)
        setInviteEmail("")
        setInvitePassword("")
        setInviteConfirm("")
        setInviteRole("admin")
        // Refresh the user list
        const usersRes = await fetch("/api/admin/settings/users")
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          if (usersData.data) setUsers(usersData.data)
        }
      }
    } catch {
      toast.error("Failed to create account.")
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (userId: string, name: string) => {
    setRemoving(userId)
    try {
      const res = await fetch(`/api/admin/settings/users/${userId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.error) {
        toast.error(json.error.message)
      } else {
        toast.success(`${name} downgraded to customer.`)
        setUsers((prev) => prev.filter((u) => u.id !== userId))
      }
    } catch {
      toast.error("Failed to remove user.")
    } finally {
      setRemoving(null)
    }
  }

  const initials = (name: string | null, email: string | null) => {
    if (name) return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    return (email ?? "?")[0].toUpperCase()
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50">
        <div>
          <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Admin & Kitchen Users
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{users.length} team member{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <UserPlus size={15} />
          Invite Member
        </button>
      </div>

      {users.length === 0 ? (
        <div className="py-16 text-center">
          <Users size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No admin users found.</p>
        </div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/60">
              {["User", "Role", "Joined", ""].map((h) => (
                <th key={h} className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-amber-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-xs font-bold shrink-0">
                      {initials(user.full_name, user.email)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user.full_name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {new Date(user.created_at).toLocaleDateString("en-KE", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleRemove(user.id, user.full_name ?? user.email ?? "User")}
                    disabled={removing === user.id}
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 ml-auto"
                    title="Remove Access"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Invite Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false) }}>
        <DialogContent className="max-w-md rounded-2xl p-6 border border-gray-100 shadow-xl bg-white">
          <DialogHeader className="mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-3">
              <UserPlus size={18} />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Invite Team Member
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-1">Create a new account and set their password.</p>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <FieldLabel>Email Address</FieldLabel>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@ayolafoods.com"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <FieldLabel>Role</FieldLabel>
              <div className="flex gap-2">
                {(["admin", "kitchen"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setInviteRole(r)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                      inviteRole === r
                        ? "bg-amber-700 text-white"
                        : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className={INPUT_CLS + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <FieldLabel>Confirm Password</FieldLabel>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={inviteConfirm}
                  onChange={(e) => setInviteConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className={INPUT_CLS + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-3">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim() || !invitePassword.trim()}
              className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {inviting ? "Creating…" : "Create Account"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

/* ─────────────────────────────────────────────
   Root Export
 ───────────────────────────────────────────── */
type Tab = "store" | "mpesa" | "accounts"

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "store",    label: "General",  icon: <Store size={15} /> },
  { id: "mpesa",    label: "Payments", icon: <CreditCard size={15} /> },
  { id: "accounts", label: "Team",     icon: <Users size={15} /> },
]

export default function SettingsPageClient({
  settings,
  users,
  mpesaEnv,
}: {
  settings: StoreSettings | null
  users: AdminUser[]
  mpesaEnv: "sandbox" | "production"
}) {
  const [activeTab, setActiveTab] = useState<Tab>("store")

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100/60 p-1 rounded-xl w-fit">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === "store"    && <StoreTab settings={settings} />}
        {activeTab === "mpesa"    && <MpesaCard environment={mpesaEnv} />}
        {activeTab === "accounts" && <AccountsTable users={users} />}
      </div>
    </div>
  )
}
