"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Trash2, AlertTriangle, Eye, RefreshCw, Store, CreditCard, Users, Search, Bell, Settings2, Globe, ShieldCheck } from "lucide-react"
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

const C = {
  primary: "#006e2f",
  primaryHover: "#005a26",
  primaryContainer: "#22c55e",
  surface: "#fcf8ff",
  surfaceContainerLow: "#f5f2ff",
  surfaceContainerHigh: "#e8e5ff",
  onSurface: "#1a1a2e",
  onSurfaceVariant: "#3d4a3d",
  outlineVariant: "#bccbb9",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
}

const INPUT_CLS =
  "w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-[#1a1a2e] font-bold focus:outline-none focus:ring-4 focus:ring-[#22c55e]/10 focus:border-[#22c55e]/30 placeholder:text-slate-300 transition-all font-inter"

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
    <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-slate-50/50 border border-slate-100 min-h-[64px] items-center px-4">
      {value.map((item) => (
        <span
          key={item}
          className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-[#1a1a2e]/10"
        >
          {item}
          <button
            onClick={() => onChange(value.filter((v) => v !== item))}
            className="leading-none text-white/40 hover:text-red-400 transition-colors"
            aria-label={`Remove ${item}`}
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        placeholder={placeholder}
        className="bg-transparent border-none text-xs font-bold focus:outline-none focus:ring-0 p-2 flex-1 min-w-[120px] placeholder:text-slate-300 text-[#1a1a2e]"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Section card wrapper
 ───────────────────────────────────────────── */
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white p-10 rounded-[48px] border border-slate-50 shadow-[0_20px_60px_-20px_rgba(26,26,46,0.04)] ${className}`}
  >
    {children}
  </div>
)

const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <h3
    className="text-2xl font-black text-[#1a1a2e] mb-8 flex items-center gap-4 tracking-tighter"
    style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
  >
    <div className="w-12 h-12 rounded-2xl bg-[#fcf8ff] flex items-center justify-center text-[#22c55e] border border-slate-50 shadow-inner">
       {icon}
    </div>
    {children}
  </h3>
)

/* ─────────────────────────────────────────────
   Field Label (shared)
 ───────────────────────────────────────────── */
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label
    className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1 text-slate-400"
  >
    {children}
  </label>
)

/* ─────────────────────────────────────────────
   Store Tab
 ───────────────────────────────────────────── */
function StoreTab({
  settings,
}: {
  settings: StoreSettings | null
}) {
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
    <div className="grid grid-cols-12 gap-10">
      <div className="col-span-12 lg:col-span-8">
        <Card>
          <SectionTitle icon={<Store size={22} />}>Global Marketplace Configuration</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <FieldLabel>Organization Identity</FieldLabel>
              <input className={INPUT_CLS} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Store Name" />
            </div>
            <div className="space-y-1">
              <FieldLabel>Primary Support Node</FieldLabel>
              <input type="email" className={INPUT_CLS} value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} placeholder="Email" />
            </div>
            <div className="space-y-1">
              <FieldLabel>Verification Hotline</FieldLabel>
              <input className={INPUT_CLS} value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} placeholder="Phone" />
            </div>
            <div className="space-y-1">
              <FieldLabel>Logistics Base Fee (KES)</FieldLabel>
              <input type="number" className={INPUT_CLS} value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} placeholder="Amount" />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <FieldLabel>Operational Jurisdiction</FieldLabel>
              <TagInput value={cities} onChange={setCities} placeholder="Inject city node…" />
            </div>
            <div className="space-y-1">
              <FieldLabel>Critical Alert Channels</FieldLabel>
              <TagInput value={notifEmails} onChange={setNotifEmails} placeholder="Inject email node…" />
            </div>
          </div>

          <div className="mt-12 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1a1a2e] text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-4 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
            >
               <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">cloud_upload</span>
               <span className="relative z-10">{saving ? "Synchronizing..." : "Synchronize Repository"}</span>
            </button>
          </div>
        </Card>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-10">
         <div className="bg-[#1a1a2e] p-10 rounded-[48px] shadow-2xl relative overflow-hidden group min-h-[320px] flex flex-col justify-end border border-white/5">
            <div className="absolute top-0 right-0 p-8">
               <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-[#22c55e]">
                 <Globe size={28} className="animate-pulse" />
               </div>
            </div>
            <div className="relative z-10 space-y-4">
               <p className="text-[10px] font-black text-[#22c55e] uppercase tracking-[0.4em]">Global Node System</p>
               <h3 className="text-3xl font-black text-white tracking-tighter leading-tight" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Distributed Operational Infrastructure</h3>
               <p className="text-sm font-medium text-white/50 leading-relaxed">Your store architecture directly impacts the logistics and verification latency of the culinary ecosystem.</p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
               <Settings2 size={240} className="rotate-12" />
            </div>
         </div>

         <div className="bg-slate-50 p-8 rounded-[48px] border border-slate-100 flex items-center gap-6 group hover:translate-y-[-4px] transition-transform">
            <div className="w-16 h-16 rounded-[24px] bg-white flex items-center justify-center text-slate-400 group-hover:text-[#22c55e] transition-colors shadow-sm">
               <ShieldCheck size={28} />
            </div>
            <div className="flex-1">
               <p className="text-[10px] font-black text-[#1a1a2e] uppercase tracking-widest leading-none mb-1">Security Status</p>
               <p className="text-sm font-bold text-slate-400 tracking-tight">Repository Encrypted & Verified</p>
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
    label,
    value,
    show,
    onToggle,
  }: {
    label: string
    value: string
    show: boolean
    onToggle: () => void
  }) => (
    <div className="space-y-2">
      <span
        className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1"
      >
        {label}
      </span>
      <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center group/field hover:bg-slate-100/50 transition-all">
        <span className="text-xs font-mono font-black text-[#1a1a2e] tracking-tight">
          {show ? value : `•••••••••••••${value.slice(-4)}`}
        </span>
        <button onClick={onToggle} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#1a1a2e] hover:bg-white transition-all">
          <span className="material-symbols-outlined text-[20px]">{show ? "visibility_off" : "visibility"}</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
       <div className="col-span-12 lg:col-span-6">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/2 rounded-full -translate-y-24 translate-x-24 blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-10">
              <SectionTitle icon={<CreditCard size={22} />}>M-Pesa API Ecosystem</SectionTitle>
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${isProd ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                {isProd ? "Production Logic" : "Sandbox Protocol"}
              </div>
            </div>

            <div className="space-y-8 mb-10">
              <div className="flex items-center gap-6 p-6 rounded-[32px] bg-slate-50/50 border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-300 shadow-sm">
                     <span className="material-symbols-outlined text-2xl">barcode</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">C2B Shortcode</span>
                    <p className="font-black text-2xl tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                      {process.env.NEXT_PUBLIC_MPESA_SHORTCODE ?? "174379"}
                    </p>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MaskedField
                  label="Auth Key"
                  value={process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY ?? "A9z...Node"}
                  show={showKey}
                  onToggle={() => setShowKey((s) => !s)}
                />
                <MaskedField
                  label="Auth Secret"
                  value="X2k...Secret"
                  show={showSecret}
                  onToggle={() => setShowSecret((s) => !s)}
                />
              </div>
            </div>

            <div className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 mb-10 flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 shrink-0">
                  <AlertTriangle size={20} />
               </div>
               <p className="text-xs font-medium text-slate-500 leading-relaxed">
                  Financial authentication parameters are strictly locked to environment variables. Modification requires system-level authorization.
               </p>
            </div>

            <button
              onClick={handleTest}
              disabled={testLoading}
              className="w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 border-2 border-slate-100 hover:border-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all duration-500 disabled:opacity-40 group"
            >
              <RefreshCw size={18} className={testLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
              {testLoading ? "Authenticating Node..." : "Test Connection Protocol"}
            </button>
          </Card>
       </div>
       <div className="col-span-12 lg:col-span-6">
          <div className="bg-[#fcf8ff] p-12 rounded-[60px] border border-white shadow-inner flex flex-col justify-center h-full relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <h4 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Financial Security Notice</h4>
                <p className="text-sm font-medium text-[#1a1a2e]/50 leading-relaxed max-w-sm">Every payment node interaction is logged and verified through the Safaricom Daraja gateway. Ensure your encryption keys are rotated periodically according to the Ayola Security Protocol.</p>
                <Link href="#" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#22c55e] group/link">
                   Documentation Portal 
                   <span className="material-symbols-outlined text-[16px] group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </Link>
             </div>
             <div className="absolute -bottom-20 -right-20 opacity-[0.03]">
                 <span className="material-symbols-outlined text-[400px]">security</span>
             </div>
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
  const [inviting, setInviting] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const res = await fetch("/api/admin/settings/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const json = await res.json()
      if (json.error) {
        toast.error(json.error.message)
      } else {
        toast.success(`Invitation sent to ${inviteEmail}.`)
        setOpen(false)
        setInviteEmail("")
        setInviteRole("admin")
      }
    } catch {
      toast.error("Failed to send invitation.")
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
    <Card className="!p-0 overflow-hidden">
      <div className="p-10 flex justify-between items-center border-b border-slate-50">
        <SectionTitle icon={<Users size={22} />}>Administrative Core</SectionTitle>
        <button
          onClick={() => setOpen(true)}
          className="bg-[#1a1a2e] text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-3 hover:bg-slate-800 hover:scale-[1.02] transition-all group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          Authorize Member
        </button>
      </div>

      <div className="overflow-x-auto">
        {users.length === 0 ? (
          <div className="py-24 text-center text-sm font-bold text-slate-300 uppercase tracking-widest">
            Critical Failure: No internal nodes detected.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 border-b border-slate-100/50">
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Node Profile</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Authorization Level</th>
                <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Commission Date</th>
                <th className="p-10 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#fcf8ff] transition-all duration-300 group"
                >
                  <td className="p-10">
                    <div className="flex items-center gap-6 transition-transform group-hover:translate-x-2 duration-500">
                      <div className="w-16 h-16 rounded-[24px] bg-[#1a1a2e] flex items-center justify-center font-black text-white text-lg shadow-xl shadow-[#1a1a2e]/20 group-hover:rotate-6 transition-transform">
                        {initials(user.full_name, user.email)}
                      </div>
                      <div>
                        <p className="font-extrabold text-lg text-[#1a1a2e] tracking-tight" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                          {user.full_name ?? "Identity Pending"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`inline-flex items-center px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${user.role === "admin" ? "bg-red-50/50 text-red-600 border-red-100/50" : "bg-amber-50/50 text-amber-600 border-amber-100/50"}`}>
                       <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                       {user.role} tier
                    </span>
                  </td>
                  <td className="p-8">
                     <span className="text-sm font-black text-slate-400 tracking-tighter">
                       {new Date(user.created_at).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                     </span>
                  </td>
                  <td className="p-10 text-right">
                    <button
                      onClick={() => handleRemove(user.id, user.full_name ?? user.email ?? "Node")}
                      disabled={removing === user.id}
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                      title="Deauthorize Node"
                    >
                       <span className="material-symbols-outlined text-xl">delete_forever</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) setOpen(false) }}>
        <DialogContent className="max-w-lg rounded-[40px] p-12 border-none shadow-[0_60px_120px_rgba(0,0,0,0.5)] bg-white animate-in zoom-in-95">
          <DialogHeader className="space-y-6 text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-500 mx-auto shadow-inner">
               <span className="material-symbols-outlined text-5xl">person_add</span>
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                Authorize Member
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">Identify the node email and assign a specific hierarchical authorization tier.</p>
            </div>
          </DialogHeader>

          <div className="space-y-8 py-4">
            <div className="space-y-1">
              <FieldLabel>Identity Email</FieldLabel>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@ayolafoods.com"
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1">
              <FieldLabel>Authorization Tier</FieldLabel>
              <div className="flex bg-slate-50 p-2 rounded-[24px] border border-slate-100">
                {(["admin", "kitchen"] as const).map((r) => (
                  <button 
                    key={r}
                    onClick={() => setInviteRole(r)}
                    className={`flex-1 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${inviteRole === r ? "bg-[#1a1a2e] text-white shadow-xl" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {r} Tier
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-10 flex-row gap-4">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 px-4 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Abort
            </button>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex-1 px-4 py-5 bg-[#1a1a2e] text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {inviting ? "Broadcasting..." : "Authorize Node"}
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

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "store", label: "Store Configuration", icon: "storefront" },
  { id: "mpesa", label: "Financial Systems", icon: "payments" },
  { id: "accounts", label: "Administrative Core", icon: "shield_person" },
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full px-4">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <p className="text-[#22c55e] text-[10px] font-black uppercase tracking-[0.4em] animate-in slide-in-from-left duration-500">Configuration Stream</p>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Repository Settings
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
               Kernel Version 3.4.1
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Manage your culinary digital infrastructure</p>
          </div>
        </div>
      </div>

      {/* ── High-Fidelity Tab Bar ── */}
      <div className="flex overflow-x-auto no-scrollbar pb-2">
         <div className="bg-white/80 backdrop-blur-xl p-2 rounded-[32px] border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] flex items-center gap-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-8 py-3 rounded-[24px] text-[11px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                    active ? "bg-[#1a1a2e] text-white shadow-2xl scale-105" : "text-slate-400 hover:text-[#1a1a2e]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${active ? "text-[#22c55e]" : ""}`}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
         </div>
      </div>

      {/* ── Procedural Content ── */}
      <div className="animate-in fade-in zoom-in-95 duration-500">
        {activeTab === "store" && <StoreTab settings={settings} />}
        {activeTab === "mpesa" && <MpesaCard environment={mpesaEnv} />}
        {activeTab === "accounts" && <AccountsTable users={users} />}
      </div>

      {/* ── Analytical Lifecycle Footer ── */}
      <footer className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Kernel Status: Optimal & Verified
          </span>
        </div>
        <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link href="#" className="hover:text-[#22c55e] transition-colors">Core API Docs</Link>
          <Link href="#" className="hover:text-[#1a1a2e] transition-colors">Security Protocol</Link>
          <span>© 2026 Ayola Systems Core</span>
        </div>
      </footer>
    </div>
  )
}