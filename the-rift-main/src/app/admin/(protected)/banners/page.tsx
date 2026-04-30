"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Image, Plus, Pencil, Trash2, Loader2, X, Upload,
  Eye, EyeOff, Calendar, Link as LinkIcon, LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate } from "@/lib/admin/formatters";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  link_text: string | null;
  position: "hero" | "promo_strip" | "middle" | "footer";
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  title_color: string | null;
  subtitle_color: string | null;
  description_color: string | null;
}

type Position = "hero" | "promo_strip" | "middle" | "footer";

const POSITION_CONFIG: Record<Position, { label: string; className: string }> = {
  hero:       { label: "Hero Banner",    className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" },
  promo_strip:{ label: "Promo Strip",    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
  middle:     { label: "Middle Section", className: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" },
  footer:     { label: "Footer",         className: "bg-muted text-muted-foreground border border-border" },
};

function getBannerStatus(banner: Banner): { label: string; className: string } {
  if (!banner.is_active) return { label: "Inactive", className: "bg-muted text-muted-foreground border border-border" };
  const now = new Date();
  if (banner.ends_at && new Date(banner.ends_at) < now) return { label: "Expired", className: "bg-destructive/10 text-destructive border border-destructive/20" };
  if (banner.starts_at && new Date(banner.starts_at) > now) return { label: "Scheduled", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" };
  return { label: "Active", className: "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" };
}

const emptyForm = {
  title: "", subtitle: "", description: "", image_url: "", mobile_image_url: "",
  link_url: "", link_text: "", position: "hero" as Position,
  sort_order: "0", is_active: true, starts_at: "", ends_at: "",
  title_color: "#ffffff", subtitle_color: "#e8d5a3", description_color: "#ffffffb3",
};

const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/50 transition-all";
const labelCls = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

// ── Color Picker Component ─────────────────────────────────────────────────────
const PRESET_COLORS = [
  { label: "White", value: "#ffffff" },
  { label: "Cream", value: "#fef9ef" },
  { label: "Gold", value: "#e8d5a3" },
  { label: "Light Gold", value: "#f5e6c8" },
  { label: "Black", value: "#1c1917" },
  { label: "Dark Gray", value: "#44403c" },
  { label: "Primary", value: "#c8a96e" },
  { label: "White 70%", value: "#ffffffb3" },
  { label: "White 50%", value: "#ffffff80" },
  { label: "White 30%", value: "#ffffff4d" },
  { label: "Green", value: "#4ade80" },
  { label: "Red", value: "#f87171" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Yellow", value: "#fbbf24" },
];

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-2">
        {/* Preset swatches */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => onChange(c.value)}
              className={`w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 ${
                value === c.value ? "border-primary scale-110 shadow-md" : "border-border"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
        {/* Hex input + native color picker */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value.length === 7 ? value : "#ffffff"}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-background p-0.5"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={inputCls + " font-mono text-xs"}
            placeholder="#ffffff"
            maxLength={9}
          />
          {/* Live preview */}
          <div
            className="w-9 h-9 rounded-lg border border-border shrink-0"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [positionFilter, setPositionFilter] = useState<"" | Position>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (positionFilter) params.set("position", positionFilter);
    const res = await fetch(`/api/admin/banners?${params.toString()}`, {
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to load banners");
      setLoading(false);
      return;
    }
    if (json.data) setBanners(json.data);
    setLoading(false);
  }, [positionFilter]);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(b: Banner) {
    setEditTarget(b);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      description: b.description ?? "",
      image_url: b.image_url,
      mobile_image_url: b.mobile_image_url ?? "",
      link_url: b.link_url ?? "",
      link_text: b.link_text ?? "",
      position: b.position,
      sort_order: String(b.sort_order),
      is_active: b.is_active,
      starts_at: b.starts_at ? b.starts_at.slice(0, 16) : "",
      ends_at: b.ends_at ? b.ends_at.slice(0, 16) : "",
      title_color: b.title_color ?? "#ffffff",
      subtitle_color: b.subtitle_color ?? "#e8d5a3",
      description_color: b.description_color ?? "#ffffffb3",
    });
    setModalOpen(true);
  }

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Upload failed"); return; }
      set("image_url", json.data.url);
      toast.success("Image uploaded");
    } finally { setUploading(false); }
  }

  async function handleToggleActive(banner: Banner) {
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    if (!res.ok) { toast.error("Update failed"); return; }
    setBanners((prev) => prev.map((b) => b.id === banner.id ? { ...b, is_active: !b.is_active } : b));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        image_url: form.image_url.trim(),
        mobile_image_url: form.mobile_image_url.trim() || null,
        link_url: form.link_url.trim() || null,
        link_text: form.link_text.trim() || null,
        position: form.position,
        sort_order: parseInt(form.sort_order, 10) || 0,
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
        title_color: form.title_color || null,
        subtitle_color: form.subtitle_color || null,
        description_color: form.description_color || null,
      };

      const url = editTarget ? `/api/admin/banners/${editTarget.id}` : "/api/admin/banners";
      const method = editTarget ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error?.message ?? "Save failed"); return; }
      toast.success(editTarget ? "Banner updated" : "Banner created");
      setModalOpen(false);
      fetchBanners();
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const json = await res.json();
    setDeleteLoading(false);
    if (!res.ok) { toast.error(json.error?.message ?? "Delete failed"); setDeleteTarget(null); return; }
    toast.success("Banner deleted");
    setDeleteTarget(null);
    fetchBanners();
  }

  const totalBanners = banners.length;
  const activeBanners = banners.filter((b) => getBannerStatus(b).label === "Active").length;
  const heroBanners = banners.filter((b) => b.position === "hero").length;
  const promoBanners = banners.filter((b) => b.position === "promo_strip").length;

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-foreground">Banners</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage storefront banners and promotions</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Banners", value: totalBanners, icon: LayoutTemplate, color: "bg-primary/10 text-primary" },
          { label: "Active", value: activeBanners, icon: Eye, color: "bg-green-500/10 text-green-600" },
          { label: "Hero Banners", value: heroBanners, icon: Image, color: "bg-purple-500/10 text-purple-600" },
          { label: "Promo Strips", value: promoBanners, icon: LinkIcon, color: "bg-blue-500/10 text-blue-600" },
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

      {/* Filter */}
      <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">Position</p>
        <div className="flex items-center bg-muted/30 rounded-xl p-1 gap-1">
          {([["", "All"], ["hero", "Hero"], ["promo_strip", "Promo Strip"], ["middle", "Middle"], ["footer", "Footer"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setPositionFilter(val as "" | Position)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${positionFilter === val ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Image size={24} className="text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No banners yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first banner to promote your products</p>
            </div>
            <button onClick={openCreate}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors hover:opacity-90">
              <Plus size={14} /> Create your first banner
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30">
                  {["Banner", "Position", "Schedule", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map((b) => {
                  const status = getBannerStatus(b);
                  const posCfg = POSITION_CONFIG[b.position];
                  return (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                            {b.image_url
                              ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Image size={14} className="text-muted-foreground/40" /></div>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{b.title}</p>
                            {b.subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{b.subtitle}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${posCfg.className}`}>
                          {posCfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {b.starts_at || b.ends_at ? (
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            {b.starts_at && <p className="flex items-center gap-1"><Calendar size={10} /> From {formatDate(b.starts_at)}</p>}
                            {b.ends_at && <p className="flex items-center gap-1"><Calendar size={10} /> Until {formatDate(b.ends_at)}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">Always on</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleToggleActive(b)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors hover:opacity-80 ${status.className}`}>
                          {b.is_active ? <Eye size={10} /> : <EyeOff size={10} />}
                          {status.label}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(b)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteTarget(b)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) setModalOpen(false); }}>
        <DialogContent className="max-w-4xl rounded-2xl p-0 bg-card max-h-[92vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-display text-xl font-medium text-foreground">
                {editTarget ? "Edit Banner" : "New Banner"}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => set("is_active", !form.is_active)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-primary" : "bg-muted"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm font-medium text-foreground">{form.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-5 min-h-0">

                {/* ── LEFT PANEL: Content (3/5) ── */}
                <div className="lg:col-span-3 p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-border">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content</p>

                  {/* Title */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Title *</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Colour:</span>
                        <div className="flex gap-1">
                          {["#ffffff","#e8d5a3","#c8a96e","#1c1917","#fbbf24"].map((c) => (
                            <button key={c} type="button" onClick={() => set("title_color", c)}
                              className={`w-5 h-5 rounded-md border-2 transition-all ${form.title_color === c ? "border-primary scale-110" : "border-transparent"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                          <input type="color" value={form.title_color.length === 7 ? form.title_color : "#ffffff"}
                            onChange={(e) => set("title_color", e.target.value)}
                            className="w-5 h-5 rounded-md border border-border cursor-pointer p-0" title="Custom colour" />
                        </div>
                      </div>
                    </div>
                    <RichTextEditor value={form.title} onChange={(v) => set("title", v)}
                      placeholder="Heritage Flavours, Modern Nutrition"
                      textColor={form.title_color} minHeight="60px" />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Subtitle</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Colour:</span>
                        <div className="flex gap-1">
                          {["#ffffff","#e8d5a3","#c8a96e","#1c1917","#fbbf24"].map((c) => (
                            <button key={c} type="button" onClick={() => set("subtitle_color", c)}
                              className={`w-5 h-5 rounded-md border-2 transition-all ${form.subtitle_color === c ? "border-primary scale-110" : "border-transparent"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                          <input type="color" value={form.subtitle_color.length === 7 ? form.subtitle_color : "#e8d5a3"}
                            onChange={(e) => set("subtitle_color", e.target.value)}
                            className="w-5 h-5 rounded-md border border-border cursor-pointer p-0" title="Custom colour" />
                        </div>
                      </div>
                    </div>
                    <RichTextEditor value={form.subtitle} onChange={(v) => set("subtitle", v)}
                      placeholder="Nairobi's most unconventional food brand"
                      textColor={form.subtitle_color} minHeight="50px" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Description</label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground">Colour:</span>
                        <div className="flex gap-1">
                          {["#ffffff","#ffffffb3","#ffffff80","#e8d5a3","#1c1917"].map((c) => (
                            <button key={c} type="button" onClick={() => set("description_color", c)}
                              className={`w-5 h-5 rounded-md border-2 transition-all ${form.description_color === c ? "border-primary scale-110" : "border-transparent"}`}
                              style={{ backgroundColor: c }} />
                          ))}
                          <input type="color" value={form.description_color.length === 7 ? form.description_color : "#ffffff"}
                            onChange={(e) => set("description_color", e.target.value)}
                            className="w-5 h-5 rounded-md border border-border cursor-pointer p-0" title="Custom colour" />
                        </div>
                      </div>
                    </div>
                    <RichTextEditor value={form.description} onChange={(v) => set("description", v)}
                      placeholder="Rabbit, turkey eggs, probiotic beverages and heritage grain flours..."
                      textColor={form.description_color} minHeight="90px" />
                  </div>

                  {/* Link */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>CTA Link URL</label>
                      <input type="url" value={form.link_url} onChange={(e) => set("link_url", e.target.value)} className={inputCls} placeholder="https://..." />
                    </div>
                    <div>
                      <label className={labelCls}>CTA Button Text</label>
                      <input type="text" value={form.link_text} onChange={(e) => set("link_text", e.target.value)} className={inputCls} placeholder="Shop Now" />
                    </div>
                  </div>
                </div>

                {/* ── RIGHT PANEL: Settings (2/5) ── */}
                <div className="lg:col-span-2 p-6 space-y-5 bg-muted/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Image & Settings</p>

                  {/* Image */}
                  <div>
                    <label className={labelCls}>Image URL *</label>
                    <div className="flex gap-2 mb-2">
                      <input type="url" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} required className={inputCls} placeholder="https://..." />
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                      </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    {/* Preview */}
                    <div className="rounded-xl border border-border overflow-hidden bg-muted/30 aspect-video flex items-center justify-center">
                      {form.image_url ? (
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="text-center p-4">
                          <Image size={24} className="text-muted-foreground/20 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Image preview</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Mobile Image URL</label>
                    <input type="url" value={form.mobile_image_url} onChange={(e) => set("mobile_image_url", e.target.value)} className={inputCls} placeholder="Optional" />
                  </div>

                  <div>
                    <label className={labelCls}>Position *</label>
                    <select value={form.position} onChange={(e) => set("position", e.target.value)} className={inputCls}>
                      <option value="hero">Hero Banner</option>
                      <option value="promo_strip">Promo Strip</option>
                      <option value="middle">Middle Section</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Sort Order</label>
                      <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} min="0" className={inputCls} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className={labelCls}>Start Date & Time</label>
                      <input type="datetime-local" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>End Date & Time</label>
                      <input type="datetime-local" value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-border bg-card shrink-0">
              <button type="button" onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90 flex items-center justify-center gap-2">
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : editTarget ? "Save Changes" : "Create Banner"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm rounded-2xl p-6 bg-card">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mx-auto">
              <Trash2 size={22} />
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="font-display text-lg font-medium text-foreground">Delete Banner?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Delete <span className="font-semibold text-foreground">&ldquo;{deleteTarget?.title}&rdquo;</span>?
                <span className="block mt-1 text-xs">
                  Position: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${deleteTarget ? POSITION_CONFIG[deleteTarget.position].className : ""}`}>
                    {deleteTarget ? POSITION_CONFIG[deleteTarget.position].label : ""}
                  </span>
                </span>
              </p>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleteLoading}
              className="flex-1 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 hover:opacity-90">
              {deleteLoading ? "Deleting..." : "Delete Banner"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
