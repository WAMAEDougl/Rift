"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, UserPlus, Trash2, Mail, Phone, Store, Truck, Bell, Users } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface StoreSettings {
  store_name: string | null;
  support_email: string | null;
  support_phone: string | null;
  default_delivery_fee: number | null;
  delivery_cities: string[] | null;
  order_notification_emails: string[] | null;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "kitchen">("kitchen");
  const [inviting, setInviting] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);
  const [removing, setRemoving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    store_name: "",
    support_email: "",
    support_phone: "",
    default_delivery_fee: "",
    delivery_cities: "",
    order_notification_emails: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          const s = j.data as StoreSettings;
          setSettings(s);
          setForm({
            store_name: s.store_name ?? "",
            support_email: s.support_email ?? "",
            support_phone: s.support_phone ?? "",
            default_delivery_fee: s.default_delivery_fee != null ? String(s.default_delivery_fee) : "",
            delivery_cities: (s.delivery_cities ?? []).join(", "),
            order_notification_emails: (s.order_notification_emails ?? []).join(", "),
          });
        }
        setLoadingSettings(false);
      });

    fetch("/api/admin/customers?role=admin&per_page=50")
      .then((r) => r.json())
      .then((j) => {
        // Fallback: just show empty if endpoint doesn't support role filter
        setAdmins([]);
        setLoadingAdmins(false);
      });
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload: Record<string, unknown> = {};
      if (form.store_name.trim()) payload.store_name = form.store_name.trim();
      if (form.support_email.trim()) payload.support_email = form.support_email.trim();
      if (form.support_phone.trim()) payload.support_phone = form.support_phone.trim();
      if (form.default_delivery_fee !== "") payload.default_delivery_fee = parseInt(form.default_delivery_fee, 10);
      if (form.delivery_cities.trim()) {
        payload.delivery_cities = form.delivery_cities.split(",").map((s) => s.trim()).filter(Boolean);
      }
      if (form.order_notification_emails.trim()) {
        payload.order_notification_emails = form.order_notification_emails.split(",").map((s) => s.trim()).filter(Boolean);
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Save failed"); return; }
      toast.success("Settings saved");
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/admin/settings/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Invite failed"); return; }
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteOpen(false);
      setInviteEmail("");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove() {
    if (!removeTarget) return;
    setRemoving(true);
    const res = await fetch(`/api/admin/settings/users/${removeTarget.id}`, { method: "DELETE" });
    const json = await res.json();
    setRemoving(false);
    if (!res.ok) { toast.error(json.error?.message ?? "Remove failed"); setRemoveTarget(null); return; }
    toast.success("User access removed");
    setAdmins((prev) => prev.filter((u) => u.id !== removeTarget.id));
    setRemoveTarget(null);
  }

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-medium text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Configure your store preferences</p>
      </div>

      {/* Store Settings */}
      <form onSubmit={handleSaveSettings} className="bg-card rounded-2xl border border-border p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Store size={16} className="text-primary" /></div>
          <div>
            <h2 className="font-display text-base font-medium text-foreground">Store Information</h2>
            <p className="text-xs text-muted-foreground">Basic store details and contact info</p>
          </div>
        </div>

        {loadingSettings
          ? <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)}</div>
          : (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Store Name</label>
                <input type="text" value={form.store_name} onChange={(e) => set("store_name", e.target.value)}
                  placeholder="Rift & Root" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}><Mail size={11} className="inline mr-1" />Support Email</label>
                  <input type="email" value={form.support_email} onChange={(e) => set("support_email", e.target.value)}
                    placeholder="admin@riftandroot.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}><Phone size={11} className="inline mr-1" />Support Phone</label>
                  <input type="text" value={form.support_phone} onChange={(e) => set("support_phone", e.target.value)}
                    placeholder="0713 280 550" className={inputCls} />
                </div>
              </div>
            </div>
          )}

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center"><Truck size={16} className="text-accent" /></div>
          <div>
            <h2 className="font-display text-base font-medium text-foreground">Delivery</h2>
            <p className="text-xs text-muted-foreground">Delivery fee and coverage</p>
          </div>
        </div>

        {!loadingSettings && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Default Delivery Fee (KES)</label>
              <input type="number" value={form.default_delivery_fee} onChange={(e) => set("default_delivery_fee", e.target.value)}
                min="0" placeholder="200" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Delivery Cities</label>
              <input type="text" value={form.delivery_cities} onChange={(e) => set("delivery_cities", e.target.value)}
                placeholder="Nairobi, Mombasa, Kisumu" className={inputCls} />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated list of cities.</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center"><Bell size={16} className="text-green-600" /></div>
          <div>
            <h2 className="font-display text-base font-medium text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">Email addresses to notify on new orders</p>
          </div>
        </div>

        {!loadingSettings && (
          <div>
            <label className={labelCls}>Notification Emails</label>
            <input type="text" value={form.order_notification_emails} onChange={(e) => set("order_notification_emails", e.target.value)}
              placeholder="admin@riftandroot.com, ops@riftandroot.com" className={inputCls} />
            <p className="text-xs text-muted-foreground mt-1">Comma-separated email addresses.</p>
          </div>
        )}

        <div className="pt-2">
          <button type="submit" disabled={savingSettings || loadingSettings}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50">
            {savingSettings ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Settings</>}
          </button>
        </div>
      </form>

      {/* Team Management */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"><Users size={16} className="text-muted-foreground" /></div>
            <div>
              <h2 className="font-display text-base font-medium text-foreground">Team Access</h2>
              <p className="text-xs text-muted-foreground">Manage admin and kitchen staff accounts</p>
            </div>
          </div>
          <button onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-sm px-4 py-2 rounded-xl transition-colors hover:bg-muted">
            <UserPlus size={14} /> Invite
          </button>
        </div>

        {/* Hardcoded accounts notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Currently using hardcoded accounts. Connect Supabase Auth to manage team members here.
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 font-mono">admin@riftandroot.com — Admin</p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 font-mono">kitchen@riftandroot.com — Kitchen</p>
          </div>
        </div>

        {loadingAdmins
          ? <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
          : admins.length === 0
            ? null
            : (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {admins.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {(u.full_name ?? u.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.full_name ?? u.email}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded-full bg-primary/10 text-primary">{u.role}</span>
                      <button onClick={() => setRemoveTarget(u)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
        }
      </div>

      {/* Invite Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-medium text-foreground">Invite Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="mt-4 space-y-4">
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                required placeholder="colleague@example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "admin" | "kitchen")}
                className={inputCls}>
                <option value="kitchen">Kitchen — Orders & Dashboard only</option>
                <option value="admin">Admin — Full access</option>
              </select>
            </div>
            <DialogFooter className="flex-row gap-3 pt-2">
              <button type="button" onClick={() => setInviteOpen(false)}
                className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={inviting}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2">
                {inviting ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : "Send Invite"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirm */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-card">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="font-display text-lg font-medium text-foreground">Remove Access?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Remove admin access for <span className="font-semibold text-foreground">{removeTarget?.email}</span>?
                They will be demoted to a regular customer account.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button onClick={() => setRemoveTarget(null)}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleRemove} disabled={removing}
              className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90">
              {removing ? "Removing..." : "Remove Access"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
