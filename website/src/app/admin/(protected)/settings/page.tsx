"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface StoreSettings {
  store_name: string
  support_email: string | null
  support_phone: string | null
  default_delivery_fee: number
  delivery_cities: string[]
  order_notification_emails: string[]
}

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "kitchen">("kitchen")
  const [inviting, setInviting] = useState(false)

  // M-Pesa test
  const [testingMpesa, setTestingMpesa] = useState(false)
  const [mpesaResult, setMpesaResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/customers?role=admin&per_page=50").then((r) => r.json()),
    ]).then(([settingsRes, usersRes]) => {
      if (settingsRes.data) setSettings(settingsRes.data)
      if (usersRes.data?.items) setUsers(usersRes.data.items)
      setLoading(false)
    })
  }, [])

  const saveSettings = async () => {
    if (!settings) return
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: settings.store_name,
          support_email: settings.support_email || undefined,
          support_phone: settings.support_phone || undefined,
          default_delivery_fee: settings.default_delivery_fee,
          delivery_cities: settings.delivery_cities,
          order_notification_emails: settings.order_notification_emails,
        }),
      })
      const json = await res.json()
      if (json.error) {
        setMessage({ type: "error", text: json.error.message })
      } else {
        setSettings(json.data)
        setMessage({ type: "success", text: "Settings saved successfully." })
      }
    } finally {
      setSaving(false)
    }
  }

  const inviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/settings/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const json = await res.json()
      if (json.error) {
        setMessage({ type: "error", text: json.error.message })
      } else {
        setMessage({ type: "success", text: `Invite sent to ${inviteEmail}` })
        setInviteEmail("")
      }
    } finally {
      setInviting(false)
    }
  }

  const testMpesa = async () => {
    setTestingMpesa(true)
    setMpesaResult(null)
    const res = await fetch("/api/admin/settings/test-mpesa", { method: "POST" })
    const json = await res.json()
    setMpesaResult(json.data)
    setTestingMpesa(false)
  }

  const revokeUser = async (id: string) => {
    if (!confirm("Demote this user to customer?")) return
    const res = await fetch(`/api/admin/settings/users/${id}`, { method: "DELETE" })
    const json = await res.json()
    if (!json.error) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setMessage({ type: "success", text: "User access revoked." })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-40 bg-gray-100 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Settings</h1>

      {message && (
        <div className={`px-4 py-3 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Store Settings */}
      {settings && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900">Store Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <Input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Fee (KES)</label>
              <Input type="number" value={settings.default_delivery_fee} onChange={(e) => setSettings({ ...settings, default_delivery_fee: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <Input type="email" value={settings.support_email || ""} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <Input value={settings.support_phone || ""} onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Cities (comma-separated)</label>
            <Input
              value={settings.delivery_cities.join(", ")}
              onChange={(e) => setSettings({ ...settings, delivery_cities: e.target.value.split(",").map((c) => c.trim()).filter(Boolean) })}
            />
          </div>

          <Button onClick={saveSettings} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
            {saving ? "Saving…" : "Save Settings"}
          </Button>
        </div>
      )}

      {/* Invite User */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">Invite Admin / Kitchen User</h2>
        <form onSubmit={inviteUser} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "admin" | "kitchen")}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="kitchen">Kitchen</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button type="submit" disabled={inviting} className="bg-orange-500 hover:bg-orange-600 text-white">
            {inviting ? "Sending…" : "Send Invite"}
          </Button>
        </form>
      </div>

      {/* Admin Users */}
      {users.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="font-medium text-gray-900">Admin & Kitchen Users</h2>
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.full_name || u.email}</p>
                  <p className="text-xs text-gray-500">{u.email} · <span className="capitalize">{u.role}</span></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => revokeUser(u.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* M-Pesa Test */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900">M-Pesa Integration</h2>
        <p className="text-sm text-gray-500">Test your M-Pesa credentials to verify the integration is working.</p>
        <Button onClick={testMpesa} disabled={testingMpesa} variant="outline">
          {testingMpesa ? "Testing…" : "Test M-Pesa Credentials"}
        </Button>
        {mpesaResult && (
          <div className={`px-4 py-3 rounded-md text-sm ${mpesaResult.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-yellow-50 text-yellow-700 border border-yellow-200"}`}>
            {mpesaResult.message}
          </div>
        )}
      </div>
    </div>
  )
}
