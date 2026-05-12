"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings,
  MapPin,
  Palette,
  Store,
  Smartphone,
  MessageCircle,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Save,
  X,
  Eye,
  Type,
  Truck,
  BadgePercent,
  Clock,
} from "lucide-react";
import { adminFetch } from "@/lib/admin/fetch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessSettings {
  store_name: string;
  tagline: string;
  support_email: string;
  support_phone: string;
  whatsapp_number: string;
  address: string;
  city: string;
  country: string;
  currency: string;
  // M-Pesa
  mpesa_shortcode: string;
  mpesa_environment: "sandbox" | "production";
  wasender_api_key: string;
  wasender_phone_id: string;
  // Business rules
  default_delivery_fee: string;
  free_shipping_threshold: string;
  low_stock_threshold: string;
  tax_rate: string;
  tax_inclusive: boolean;
  allow_guest_checkout: boolean;
  new_order_sound_enabled: boolean;
  new_message_sound_enabled: boolean;
}

interface DeliveryZone {
  id: string;
  name: string;
  description: string | null;
  areas: string[];
  fee: number;
  free_above: number | null;
  estimated_days: string | null;
  is_active: boolean;
  created_at: string;
}

interface PersonalizationSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
  logo_url: string;
  favicon_url: string;
  store_description: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Playfair Display",
  "Lato",
  "Montserrat",
  "Raleway",
  "Nunito",
  "DM Sans",
  "Space Grotesk",
];

const defaultBusiness: BusinessSettings = {
  store_name: "",
  tagline: "",
  support_email: "",
  support_phone: "",
  whatsapp_number: "",
  address: "",
  city: "",
  country: "Kenya",
  currency: "KES",
  mpesa_shortcode: "",
  mpesa_environment: "sandbox",
  wasender_api_key: "",
  wasender_phone_id: "",
  default_delivery_fee: "0",
  free_shipping_threshold: "0",
  low_stock_threshold: "5",
  tax_rate: "0",
  tax_inclusive: false,
  allow_guest_checkout: true,
  new_order_sound_enabled: true,
  new_message_sound_enabled: true,
};

const defaultPersonalization: PersonalizationSettings = {
  primary_color: "#16a34a",
  secondary_color: "#15803d",
  accent_color: "#f59e0b",
  font_heading: "Playfair Display",
  font_body: "Inter",
  logo_url: "",
  favicon_url: "",
  store_description: "",
};

const emptyZoneForm = {
  name: "",
  description: "",
  areas: [] as string[],
  fee: "0",
  free_above: "",
  estimated_days: "",
  is_active: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
const labelCls = "block text-xs font-medium text-muted-foreground mb-1.5";
const sectionCls = "bg-card rounded-2xl border border-border p-6 space-y-5";
const sectionTitleCls = "flex items-center gap-2.5 text-sm font-semibold text-foreground mb-5";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function formatKES(n: number) {
  return `KES ${n.toLocaleString()}`;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"business" | "zones" | "personalization" | "themes">("business");

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-medium text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your store configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center bg-muted/30 rounded-xl p-1 gap-1 w-fit">
        {(
          [
            ["business", "Business", Settings],
            ["zones", "Delivery Zones", MapPin],
            ["personalization", "Personalization", Palette],
            ["themes", "Themes", Eye],
          ] as const
        ).map(([val, label, Icon]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === val
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "business" && <BusinessTab />}
      {activeTab === "zones" && <DeliveryZonesTab />}
      {activeTab === "personalization" && <PersonalizationTab />}
      {activeTab === "themes" && <ThemesTab />}
    </div>
  );
}

// ─── Business Settings Tab ────────────────────────────────────────────────────

function BusinessTab() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusiness);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWhatsAppSecrets, setShowWhatsAppSecrets] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/settings");
      const json = await res.json();
      if (json.data) {
        const d = json.data;
        setSettings({
          ...defaultBusiness,
          store_name: d.store_name ?? "",
          tagline: d.tagline ?? "",
          support_email: d.support_email ?? "",
          support_phone: d.support_phone ?? "",
          whatsapp_number: d.whatsapp_number ?? "",
          address: d.address ?? "",
          city: d.city ?? "",
          country: d.country ?? "Kenya",
          currency: d.currency ?? "KES",
          mpesa_shortcode: d.mpesa_shortcode ?? "",
          mpesa_environment: d.mpesa_environment ?? "sandbox",
          wasender_api_key: d.wasender_api_key ?? "",
          wasender_phone_id: d.wasender_phone_id ?? "",
          default_delivery_fee: String(d.default_delivery_fee ?? 0),
          free_shipping_threshold: String(d.free_shipping_threshold ?? 0),
          low_stock_threshold: String(d.low_stock_threshold ?? 5),
          tax_rate: String(d.tax_rate ?? 0),
          tax_inclusive: d.tax_inclusive ?? false,
          allow_guest_checkout: d.allow_guest_checkout ?? true,
          new_order_sound_enabled: d.new_order_sound_enabled ?? true,
          new_message_sound_enabled: d.new_message_sound_enabled ?? true,
        });
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function set(field: keyof BusinessSettings, value: string | boolean) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (settings.support_email && !emailRegex.test(settings.support_email)) {
      toast.error("Please enter a valid support email address");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...settings,
        default_delivery_fee: parseInt(settings.default_delivery_fee, 10) || 0,
        free_shipping_threshold: parseInt(settings.free_shipping_threshold, 10) || 0,
        low_stock_threshold: parseInt(settings.low_stock_threshold, 10) || 5,
        tax_rate: parseFloat(settings.tax_rate) || 0,
      };

      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to save settings");
        return;
      }

      toast.success("Settings saved successfully");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Store Info */}
      <div className={sectionCls}>
        <div className={sectionTitleCls}>
          <Store size={16} className="text-primary" />
          Store Information
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Store Name *</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => set("store_name", e.target.value)}
              placeholder="Rift & Root"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Fresh from farm to table"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Support Email</label>
            <input
              type="email"
              value={settings.support_email}
              onChange={(e) => set("support_email", e.target.value)}
              placeholder="hello@riftandroot.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Support Phone</label>
            <input
              type="tel"
              value={settings.support_phone}
              onChange={(e) => set("support_phone", e.target.value)}
              placeholder="+254 700 000 000"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="123 Main Street"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Nairobi"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              type="text"
              value={settings.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="Kenya"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => set("currency", e.target.value)}
              className={inputCls}
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* M-Pesa Config */}
      <div className={sectionCls}>
        <div className={sectionTitleCls}>
          <Smartphone size={16} className="text-green-600" />
          M-Pesa Configuration
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Shortcode / Till Number</label>
              <input
                type="text"
                value={settings.mpesa_shortcode}
                onChange={(e) => set("mpesa_shortcode", e.target.value)}
                placeholder="174379"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Environment</label>
              <select
                value={settings.mpesa_environment}
                onChange={(e) => set("mpesa_environment", e.target.value as "sandbox" | "production")}
                className={inputCls}
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Config */}
      <div className={sectionCls}>
        <div className={sectionTitleCls}>
          <MessageCircle size={16} className="text-green-600" />
          WhatsApp Configuration
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>WhatsApp Business Number</label>
            <input
              type="tel"
              value={settings.whatsapp_number}
              onChange={(e) => set("whatsapp_number", e.target.value)}
              placeholder="+254700000000"
              className={inputCls}
            />
          </div>

          <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Show API Credentials</p>
            <button
              type="button"
              onClick={() => setShowWhatsAppSecrets(!showWhatsAppSecrets)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
            >
              {showWhatsAppSecrets ? (
                <>
                  <Eye size={12} /> Hide
                </>
              ) : (
                <>
                  <Eye size={12} /> Show
                </>
              )}
            </button>
          </div>

          {showWhatsAppSecrets && (
            <div className="grid grid-cols-1 gap-4 pt-2">
              <div>
                <label className={labelCls}>WaSender Phone ID</label>
                <input
                  type="text"
                  value={settings.wasender_phone_id}
                  onChange={(e) => set("wasender_phone_id", e.target.value)}
                  placeholder="Your WaSender phone ID"
                  className={inputCls + " font-mono text-xs"}
                />
              </div>
              <div>
                <label className={labelCls}>WaSender API Key</label>
                <input
                  type="password"
                  value={settings.wasender_api_key}
                  onChange={(e) => set("wasender_api_key", e.target.value)}
                  placeholder="Your WaSender API key"
                  className={inputCls + " font-mono text-xs"}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business Rules */}
      <div className={sectionCls}>
        <div className={sectionTitleCls}>
          <ShieldCheck size={16} className="text-primary" />
          Business Rules
        </div>
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Default Delivery Fee (KES)</label>
              <input
                type="number"
                value={settings.default_delivery_fee}
                onChange={(e) => set("default_delivery_fee", e.target.value)}
                min="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Free Shipping Above (KES)</label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => set("free_shipping_threshold", e.target.value)}
                min="0"
                className={inputCls}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">0 = disabled</p>
            </div>
            <div>
              <label className={labelCls}>Low Stock Threshold</label>
              <input
                type="number"
                value={settings.low_stock_threshold}
                onChange={(e) => set("low_stock_threshold", e.target.value)}
                min="0"
                className={inputCls}
              />
              <p className="text-[11px] text-muted-foreground mt-1.5">Alert when stock falls below this</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tax Rate (%)</label>
              <input
                type="number"
                value={settings.tax_rate}
                onChange={(e) => set("tax_rate", e.target.value)}
                min="0"
                max="100"
                step="0.1"
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Toggle
              checked={settings.tax_inclusive}
              onChange={(v) => set("tax_inclusive", v)}
              label="Tax inclusive pricing"
              description="Product prices already include tax"
            />
            <Toggle
              checked={settings.allow_guest_checkout}
              onChange={(v) => set("allow_guest_checkout", v)}
              label="Allow guest checkout"
              description="Customers can order without creating an account"
            />
            <Toggle
              checked={settings.new_order_sound_enabled}
              onChange={(v) => set("new_order_sound_enabled", v)}
              label="New order sound alert"
              description="Play a sound when a new order arrives in the admin panel"
            />
            <Toggle
              checked={settings.new_message_sound_enabled}
              onChange={(v) => set("new_message_sound_enabled", v)}
              label="New message sound alert"
              description="Play a sound when a new WhatsApp message arrives"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={15} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Delivery Zones Tab ───────────────────────────────────────────────────────

function DeliveryZonesTab() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DeliveryZone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState(emptyZoneForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [areaInput, setAreaInput] = useState("");

  const fetchZones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/delivery-zones");
      const json = await res.json();
      if (json.data) setZones(json.data);
    } catch {
      toast.error("Failed to load delivery zones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  function openCreate() {
    setEditTarget(null);
    setForm(emptyZoneForm);
    setAreaInput("");
    setModalOpen(true);
  }

  function openEdit(zone: DeliveryZone) {
    setEditTarget(zone);
    setForm({
      name: zone.name,
      description: zone.description ?? "",
      areas: zone.areas,
      fee: String(zone.fee),
      free_above: zone.free_above ? String(zone.free_above) : "",
      estimated_days: zone.estimated_days ?? "",
      is_active: zone.is_active,
    });
    setAreaInput("");
    setModalOpen(true);
  }

  function set(field: string, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addArea() {
    const trimmed = areaInput.trim();
    if (!trimmed) return;
    if (form.areas.includes(trimmed)) {
      toast.error("Area already added");
      return;
    }
    set("areas", [...form.areas, trimmed]);
    setAreaInput("");
  }

  function removeArea(area: string) {
    set(
      "areas",
      form.areas.filter((a) => a !== area)
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.areas.length === 0) {
      toast.error("Add at least one area");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        areas: form.areas,
        fee: parseInt(form.fee, 10) || 0,
        free_above: form.free_above ? parseInt(form.free_above, 10) : null,
        estimated_days: form.estimated_days.trim() || null,
        is_active: form.is_active,
      };

      const url = editTarget
        ? `/api/admin/delivery-zones/${editTarget.id}`
        : "/api/admin/delivery-zones";
      const method = editTarget ? "PATCH" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Save failed");
        return;
      }

      toast.success(editTarget ? "Zone updated" : "Zone created");
      setModalOpen(false);
      fetchZones();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await adminFetch(`/api/admin/delivery-zones/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Delete failed");
        return;
      }
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      fetchZones();
    } finally {
      setDeleteLoading(false);
    }
  }

  const activeZones = zones.filter((z) => z.is_active).length;
  const totalAreas = zones.reduce((acc, z) => acc + z.areas.length, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: "Total Zones",
            value: zones.length,
            icon: MapPin,
            color: "bg-primary/10 text-primary",
          },
          {
            label: "Active Zones",
            value: activeZones,
            icon: Truck,
            color: "bg-green-500/10 text-green-600",
          },
          {
            label: "Total Areas",
            value: totalAreas,
            icon: MapPin,
            color: "bg-blue-500/10 text-blue-600",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon size={16} />
              </div>
              <p className="font-display text-2xl font-medium text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Delivery Zones</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure delivery areas, fees, and thresholds
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90"
        >
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {/* Zones List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <MapPin size={24} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No delivery zones yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create zones to define delivery areas and fees
              </p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90"
            >
              <Plus size={14} /> Create your first zone
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {zones.map((zone) => (
              <div key={zone.id} className="p-6 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-foreground">{zone.name}</h3>
                      {zone.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-600">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </div>
                    {zone.description && (
                      <p className="text-xs text-muted-foreground mb-3">{zone.description}</p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <BadgePercent size={12} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Delivery Fee</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatKES(zone.fee)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <BadgePercent size={12} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Free Above</p>
                          <p className="text-sm font-semibold text-foreground">
                            {zone.free_above ? formatKES(zone.free_above) : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Clock size={12} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Estimated</p>
                          <p className="text-sm font-semibold text-foreground">
                            {zone.estimated_days || "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[11px] text-muted-foreground mb-2">
                        Areas ({zone.areas.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {zone.areas.map((area) => (
                          <span
                            key={area}
                            className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-muted/50 text-foreground"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(zone)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(zone)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && setModalOpen(false)}>
        <DialogContent className="max-w-2xl rounded-2xl p-6 bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-medium text-foreground">
              {editTarget ? "Edit Delivery Zone" : "New Delivery Zone"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="mt-4 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Zone Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                  placeholder="Nairobi CBD"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Estimated Delivery</label>
                <input
                  type="text"
                  value={form.estimated_days}
                  onChange={(e) => set("estimated_days", e.target.value)}
                  placeholder="1-2 days"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="Optional description..."
                className={inputCls + " resize-none"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Delivery Fee (KES) *</label>
                <input
                  type="number"
                  value={form.fee}
                  onChange={(e) => set("fee", e.target.value)}
                  required
                  min="0"
                  placeholder="200"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Free Delivery Above (KES)</label>
                <input
                  type="number"
                  value={form.free_above}
                  onChange={(e) => set("free_above", e.target.value)}
                  min="0"
                  placeholder="5000"
                  className={inputCls}
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Leave empty for no free delivery threshold
                </p>
              </div>
            </div>

            <div>
              <label className={labelCls}>Areas *</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addArea();
                    }
                  }}
                  placeholder="e.g. Westlands, Kilimani, Lavington"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addArea}
                  className="shrink-0 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-colors"
                >
                  Add
                </button>
              </div>

              {form.areas.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-xl">
                  {form.areas.map((area) => (
                    <span
                      key={area}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-card text-foreground border border-border"
                    >
                      {area}
                      <button
                        type="button"
                        onClick={() => removeArea(area)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground">No areas added yet</p>
                </div>
              )}
            </div>

            <div className="pt-2">
              <Toggle
                checked={form.is_active}
                onChange={(v) => set("is_active", v)}
                label="Active"
                description="Make this zone available for customers"
              />
            </div>

            <DialogFooter className="flex-row gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : editTarget ? (
                  "Save Changes"
                ) : (
                  "Create Zone"
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-card">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="font-display text-lg font-medium text-foreground">
                Delete Delivery Zone?
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Delete{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{deleteTarget?.name}&rdquo;
                </span>
                ? This action cannot be undone.
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90"
            >
              {deleteLoading ? "Deleting..." : "Delete Zone"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Personalization Tab ──────────────────────────────────────────────────────

function PersonalizationTab() {
  const [settings, setSettings] = useState<PersonalizationSettings>(defaultPersonalization);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/settings");
      const json = await res.json();
      if (json.data) {
        setSettings({
          ...defaultPersonalization,
          primary_color: json.data.primary_color ?? defaultPersonalization.primary_color,
          secondary_color: json.data.secondary_color ?? defaultPersonalization.secondary_color,
          accent_color: json.data.accent_color ?? defaultPersonalization.accent_color,
          font_heading: json.data.font_heading ?? defaultPersonalization.font_heading,
          font_body: json.data.font_body ?? defaultPersonalization.font_body,
          logo_url: json.data.logo_url ?? "",
          favicon_url: json.data.favicon_url ?? "",
          store_description: json.data.store_description ?? "",
        });
      }
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function set(field: keyof PersonalizationSettings, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to save settings");
        return;
      }

      toast.success("Personalization saved");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left — Controls */}
        <div className="space-y-6">
          {/* Brand Colors */}
          <div className={sectionCls}>
            <div className={sectionTitleCls}>
              <Palette size={16} className="text-primary" />
              Brand Colors
            </div>
            <div className="space-y-4">
              {(
                [
                  ["primary_color", "Primary Color", "Main brand color used for buttons and accents"],
                  ["secondary_color", "Secondary Color", "Used for hover states and secondary elements"],
                  ["accent_color", "Accent Color", "Highlights, badges, and call-to-action elements"],
                ] as const
              ).map(([field, label, desc]) => (
                <div key={field} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="text"
                      value={settings[field]}
                      onChange={(e) => set(field, e.target.value)}
                      placeholder="#16a34a"
                      className="w-28 border border-border rounded-xl px-3 py-2 text-xs text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono"
                    />
                    <div className="relative">
                      <input
                        type="color"
                        value={settings[field]}
                        onChange={(e) => set(field, e.target.value)}
                        className="w-10 h-10 rounded-xl border border-border cursor-pointer p-0.5 bg-background"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography */}
          <div className={sectionCls}>
            <div className={sectionTitleCls}>
              <Type size={16} className="text-primary" />
              Typography
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Heading Font</label>
                <select
                  value={settings.font_heading}
                  onChange={(e) => set("font_heading", e.target.value)}
                  className={inputCls}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Body Font</label>
                <select
                  value={settings.font_body}
                  onChange={(e) => set("font_body", e.target.value)}
                  className={inputCls}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Assets */}
          <div className={sectionCls}>
            <div className={sectionTitleCls}>
              <Store size={16} className="text-primary" />
              Brand Assets
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Logo / Brand Badge</label>
                <div className="flex gap-2 items-start">
                  <input
                    type="url"
                    value={settings.logo_url}
                    onChange={(e) => set("logo_url", e.target.value)}
                    placeholder="https://... or upload below"
                    className={inputCls}
                  />
                  <label className="shrink-0 cursor-pointer inline-flex items-center gap-1.5 border border-border text-muted-foreground hover:text-primary hover:border-primary font-semibold text-xs px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
                      const json = await res.json();
                      if (res.ok) { set("logo_url", json.data.url); toast.success("Logo uploaded"); }
                      else toast.error("Upload failed");
                    }} />
                  </label>
                </div>
                {settings.logo_url && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <img src={settings.logo_url} alt="Logo preview" className="h-10 w-auto object-contain rounded-lg border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <p className="text-xs text-muted-foreground truncate">{settings.logo_url}</p>
                  </div>
                )}
              
              </div>
              <div>
                <label className={labelCls}>Favicon URL</label>
                <input
                  type="url"
                  value={settings.favicon_url}
                  onChange={(e) => set("favicon_url", e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Store Description</label>
                <textarea
                  value={settings.store_description}
                  onChange={(e) => set("store_description", e.target.value)}
                  rows={3}
                  placeholder="A short description of your store for SEO and social sharing..."
                  className={inputCls + " resize-none"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right — Live Preview */}
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-0">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Eye size={14} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">Live Preview</p>
              <span className="ml-auto text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                Approximate
              </span>
            </div>

            <div className="p-5 space-y-5">
              {/* Simulated nav */}
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: settings.primary_color }}
              >
                <div className="flex items-center gap-3">
                  {settings.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt="Logo"
                      className="h-8 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Store size={14} className="text-white" />
                    </div>
                  )}
                  <span
                    className="text-white font-bold text-sm"
                    style={{ fontFamily: settings.font_heading }}
                  >
                    Rift &amp; Root
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                  <div className="w-6 h-6 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Simulated hero */}
              <div
                className="rounded-xl p-6 text-center"
                style={{ backgroundColor: settings.secondary_color + "20" }}
              >
                <h2
                  className="text-xl font-bold mb-1"
                  style={{
                    fontFamily: settings.font_heading,
                    color: settings.primary_color,
                  }}
                >
                  Fresh from Farm to Table
                </h2>
                <p
                  className="text-sm text-muted-foreground mb-4"
                  style={{ fontFamily: settings.font_body }}
                >
                  {settings.store_description || "Discover the finest organic produce"}
                </p>
                <button
                  className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  Shop Now
                </button>
              </div>

              {/* Simulated product cards */}
              <div className="grid grid-cols-2 gap-3">
                {["Organic Kale", "Fresh Tomatoes"].map((name, i) => (
                  <div key={name} className="rounded-xl border border-border overflow-hidden bg-background">
                    <div
                      className="h-20 flex items-center justify-center"
                      style={{ backgroundColor: settings.accent_color + "20" }}
                    >
                      <span className="text-2xl">{i === 0 ? "🥬" : "🍅"}</span>
                    </div>
                    <div className="p-3">
                      <p
                        className="text-xs font-semibold text-foreground"
                        style={{ fontFamily: settings.font_body }}
                      >
                        {name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className="text-xs font-bold"
                          style={{ color: settings.primary_color }}
                        >
                          KES {i === 0 ? "120" : "80"}
                        </span>
                        <button
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: settings.accent_color }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Color swatches */}
              <div className="flex items-center gap-3 pt-2">
                {[
                  ["Primary", settings.primary_color],
                  ["Secondary", settings.secondary_color],
                  ["Accent", settings.accent_color],
                ].map(([label, color]) => (
                  <div key={label} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={15} />
              Save Personalization
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Themes Tab ───────────────────────────────────────────────────────────────

const THEME_GROUPS = [
  {
    label: "Warm & Organic",
    themes: [
      { id: "theme-earth",    name: "Earth",    description: "Terracotta, cream & forest green. The original heritage palette.", bg: "#f7f0e6", primary: "#c8603a", secondary: "#2d5a3d", accent: "#c8a96e", dark: false },
      { id: "theme-sahara",   name: "Sahara",   description: "Warm sand, burnt orange & copper. Desert-inspired artisan warmth.", bg: "#f7f2e8", primary: "#c06030", secondary: "#5a6030", accent: "#c89050", dark: false },
      { id: "theme-ember",    name: "Ember",    description: "Deep burgundy, rust & amber. Rich, smouldering warmth.", bg: "#f7f0ec", primary: "#8a3020", secondary: "#5a4030", accent: "#c87830", dark: false },
      { id: "theme-copper",   name: "Copper",   description: "Metallic copper, bronze & cream. Refined artisan character.", bg: "#f7f2e5", primary: "#a07040", secondary: "#607040", accent: "#b08050", dark: false },
      { id: "theme-espresso", name: "Espresso", description: "Deep brown, caramel & cream. Warm coffee-house sophistication.", bg: "#f5f0e8", primary: "#5a3820", secondary: "#4a3828", accent: "#a07030", dark: false },
      { id: "theme-savanna",  name: "Savanna",  description: "Golden grass, sienna & sky. Open-horizon African warmth.", bg: "#f7f2e0", primary: "#9a7030", secondary: "#3a7870", accent: "#c8a830", dark: false },
    ],
  },
  {
    label: "Nature & Fresh",
    themes: [
      { id: "theme-forest",   name: "Forest",   description: "Deep green, sage & lime. Fresh, health-focused, nature-forward.", bg: "#f2f7f0", primary: "#2d6b3a", secondary: "#4a8c5c", accent: "#8ab840", dark: false },
      { id: "theme-jade",     name: "Jade",     description: "Emerald, mint & lime. Vibrant, energetic, botanical.", bg: "#f0f7f2", primary: "#2a6840", secondary: "#3a8060", accent: "#70b030", dark: false },
      { id: "theme-citrus",   name: "Citrus",   description: "Bright orange, lemon & lime. Bold, energetic, sun-drenched.", bg: "#fdf8ee", primary: "#c07020", secondary: "#508030", accent: "#d0a010", dark: false },
      { id: "theme-aurora",   name: "Aurora",   description: "Northern lights — teal, violet & green. Ethereal and vivid.", bg: "#f0f7f5", primary: "#2a7878", secondary: "#5040a0", accent: "#40b060", dark: false },
    ],
  },
  {
    label: "Cool & Professional",
    themes: [
      { id: "theme-ocean",    name: "Ocean",    description: "Deep navy, teal & seafoam. Calm, trustworthy, coastal.", bg: "#f0f5f8", primary: "#2a5080", secondary: "#308878", accent: "#40a8b0", dark: false },
      { id: "theme-arctic",   name: "Arctic",   description: "Ice blue, frost & steel. Clean, minimal, crisp.", bg: "#f5f8fa", primary: "#3a6888", secondary: "#4a8898", accent: "#60a8c0", dark: false },
      { id: "theme-cobalt",   name: "Cobalt",   description: "Rich blue, navy & sky. Bold, confident, authoritative.", bg: "#f0f3f8", primary: "#2840a0", secondary: "#3868b0", accent: "#5080d0", dark: false },
      { id: "theme-slate",    name: "Slate",    description: "Cool grey, indigo & silver. Understated, modern, precise.", bg: "#f5f5f8", primary: "#4050a0", secondary: "#5068a0", accent: "#7080c0", dark: false },
    ],
  },
  {
    label: "Soft & Elegant",
    themes: [
      { id: "theme-rose",     name: "Rose",     description: "Dusty rose, blush & mauve. Refined, feminine, graceful.", bg: "#faf5f5", primary: "#b05060", secondary: "#806080", accent: "#d08070", dark: false },
      { id: "theme-lavender", name: "Lavender", description: "Soft purple, lilac & plum. Calm, creative, distinguished.", bg: "#f8f5fa", primary: "#7050a0", secondary: "#6050a0", accent: "#a070c0", dark: false },
      { id: "theme-dusk",     name: "Dusk",     description: "Twilight purple, peach & coral. Romantic, warm, evocative.", bg: "#faf5f8", primary: "#9050a0", secondary: "#a05080", accent: "#d07050", dark: false },
      { id: "theme-ivory",    name: "Ivory",    description: "Warm white, champagne & taupe. Timeless, airy, luxurious.", bg: "#fdfaf5", primary: "#806040", secondary: "#607050", accent: "#c0a060", dark: false },
      { id: "theme-pearl",    name: "Pearl",    description: "Pure white, soft silver & blush. Pristine, minimal, refined.", bg: "#fefefe", primary: "#907080", secondary: "#608080", accent: "#c09080", dark: false },
      { id: "theme-stone",    name: "Stone",    description: "Warm stone, pebble & chalk. Grounded, neutral, enduring.", bg: "#f8f6f2", primary: "#807060", secondary: "#708060", accent: "#b0a070", dark: false },
    ],
  },
  {
    label: "Bold & Dark",
    themes: [
      { id: "theme-midnight",  name: "Midnight",  description: "Dark charcoal, gold & amber. Premium, sophisticated, evening.", bg: "#1a1a2e", primary: "#c8a050", secondary: "#4a7a5c", accent: "#e8c060", dark: true },
      { id: "theme-obsidian",  name: "Obsidian",  description: "Pure black, electric blue & white. Stark, modern, powerful.", bg: "#181820", primary: "#4080e0", secondary: "#3060b0", accent: "#80b0f0", dark: true },
      { id: "theme-volcanic",  name: "Volcanic",  description: "Dark lava, magma orange & ash. Raw, intense, elemental.", bg: "#1e1410", primary: "#e05020", secondary: "#604030", accent: "#e08030", dark: true },
      { id: "theme-onyx",      name: "Onyx",      description: "Charcoal, warm grey & platinum. Sleek, executive, timeless.", bg: "#1a1814", primary: "#c0a060", secondary: "#707060", accent: "#c0a060", dark: true },
      { id: "theme-crimson",   name: "Crimson",   description: "Deep red, scarlet & gold. Bold, passionate, commanding.", bg: "#faf5f5", primary: "#a02030", secondary: "#703030", accent: "#c09020", dark: false },
    ],
  },
];

function ThemesTab() {
  const [activeTheme, setActiveTheme] = useState("theme-earth");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.active_theme) setActiveTheme(json.data.active_theme);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_theme: activeTheme }),
      });
      if (res.ok) {
        toast.success("Theme applied — reloading…");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Failed to save theme");
      }
    } catch {
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  }

  const allThemes = THEME_GROUPS.flatMap((g) => g.themes);
  const activeThemeData = allThemes.find((t) => t.id === activeTheme);

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-32 bg-muted rounded-full animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-44 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="font-display text-xl font-medium text-foreground">Site Theme</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose from {allThemes.length} professionally designed themes. Changes apply after saving and reloading.
          </p>
        </div>
        {activeThemeData && (
          <div className="hidden sm:flex items-center gap-3 shrink-0 bg-card border border-border rounded-2xl px-4 py-3">
            <div
              className="w-8 h-8 rounded-xl border border-border/50 shrink-0"
              style={{ backgroundColor: activeThemeData.bg }}
            />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Active Theme</p>
              <p className="text-sm font-semibold text-foreground">{activeThemeData.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Theme groups */}
      {THEME_GROUPS.map((group) => (
        <div key={group.label} className="space-y-4">
          <div className="flex items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{group.label}</p>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {group.themes.map((theme) => {
              const isActive = activeTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  title={theme.description}
                  className={`group text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "border-primary shadow-md ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {/* Visual preview */}
                  <div
                    className="h-28 p-3 flex flex-col justify-between relative overflow-hidden"
                    style={{ backgroundColor: theme.bg }}
                  >
                    {/* Mock nav bar */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <div className="h-1.5 w-12 rounded-full opacity-30" style={{ backgroundColor: theme.primary }} />
                      <div className="ml-auto flex gap-1">
                        <div className="h-1.5 w-6 rounded-full opacity-20" style={{ backgroundColor: theme.primary }} />
                        <div className="h-1.5 w-6 rounded-full opacity-20" style={{ backgroundColor: theme.primary }} />
                      </div>
                    </div>

                    {/* Mock hero text */}
                    <div className="space-y-1">
                      <div className="h-2.5 w-20 rounded-full opacity-85" style={{ backgroundColor: theme.primary }} />
                      <div className="h-1.5 w-14 rounded-full opacity-40" style={{ backgroundColor: theme.secondary }} />
                    </div>

                    {/* Mock CTA */}
                    <div className="flex gap-1.5">
                      <div
                        className="h-5 w-14 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.primary }}
                      >
                        <span className="text-[8px] font-bold" style={{ color: theme.dark ? "#1a1a1a" : "#ffffff" }}>
                          Order
                        </span>
                      </div>
                      <div
                        className="h-5 w-10 rounded-full border flex items-center justify-center"
                        style={{ borderColor: theme.accent, backgroundColor: "transparent" }}
                      >
                        <span className="text-[8px] font-semibold" style={{ color: theme.accent }}>
                          More
                        </span>
                      </div>
                    </div>

                    {/* Active checkmark */}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Theme name + swatches */}
                  <div className="px-3 py-2.5 bg-card">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-foreground">{theme.name}</p>
                      {isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary leading-none">
                          ON
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {[theme.bg, theme.primary, theme.secondary, theme.accent].map((color, i) => (
                        <div
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-border/40 shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer save bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border pt-4 pb-2 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {activeThemeData ? (
            <>
              Selected: <span className="font-semibold text-foreground">{activeThemeData.name}</span>
              <span className="mx-2 text-border">·</span>
              <span className="text-muted-foreground/70">{activeThemeData.description}</span>
            </>
          ) : (
            "Select a theme above"
          )}
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-xl transition-colors hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Applying…</> : <><Save size={15} /> Apply Theme</>}
        </button>
      </div>
    </div>
  );
}
