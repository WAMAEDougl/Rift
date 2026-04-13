"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Sparkles, Box, Info, Zap, Globe, Layout, Palette, Trash2, AlertTriangle, Eye } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-500 shadow-inner ${checked ? "bg-[#22c55e]" : "bg-slate-200"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-xl transition-transform duration-500 ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 ml-1 text-slate-400">
      {children}
    </label>
  )
}

export default function EditCategoryPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const slugManuallyEdited = useRef(false)
  const [isDirty, setIsDirty] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [tagline, setTagline] = useState("")
  const [icon, setIcon] = useState("")
  const [shipsCountrywide, setShipsCountrywide] = useState(true)
  const [sortOrder, setSortOrder] = useState("0")

  useEffect(() => {
    fetch(`/api/admin/categories/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const c = json.data
          setCategoryName(c.name)
          setName(c.name)
          setSlug(c.slug)
          setTagline(c.tagline ?? "")
          setIcon(c.icon ?? "")
          setShipsCountrywide(c.ships_countrywide)
          setSortOrder(String(c.sort_order))
        }
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  function markDirty() {
    if (!isDirty) setIsDirty(true)
  }

  function handleNameChange(value: string) {
    setName(value)
    markDirty()
    if (!slugManuallyEdited.current) {
      setSlug(slugify(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value)
    slugManuallyEdited.current = true
    markDirty()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) {
      toast.error("Mandatory fields (Name & Slug) required.")
      return
    }

    setSubmitting(true)
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        tagline: tagline.trim() || null,
        icon: icon.trim() || null,
        ships_countrywide: shipsCountrywide,
        sort_order: parseInt(sortOrder, 10) || 0,
      }),
    })
    const json = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to update category")
      return
    }
    setIsDirty(false)
    toast.success("Category updated successfully")
    router.push("/admin/categories")
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    const json = await res.json()
    setDeleteLoading(false)
    if (!res.ok) {
      toast.error(json.error?.message ?? "Delete failed")
      setDeleteOpen(false)
      return
    }
    setIsDirty(false)
    toast.success(`"${categoryName}" deleted successfully`)
    router.push("/admin/categories")
  }

  const FIELD_CLS = "w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-[#1a1a2e] font-bold focus:outline-none focus:ring-4 focus:ring-[#22c55e]/10 focus:border-[#22c55e]/30 placeholder:text-slate-200 transition-all font-inter"

  if (loading) {
    return (
      <div className="space-y-10 animate-pulse w-full px-4 mb-20 max-w-[1400px] mx-auto pt-10">
          <div className="h-16 w-1/3 bg-slate-50 rounded-[28px] mb-10" />
          <div className="grid grid-cols-12 gap-10">
              <div className="col-span-8 space-y-10">
                 <div className="h-[400px] bg-slate-50 rounded-[60px]" />
                 <div className="h-[300px] bg-slate-50 rounded-[60px]" />
              </div>
              <div className="col-span-4 space-y-10">
                 <div className="h-[300px] bg-slate-50 rounded-[48px]" />
                 <div className="h-[200px] bg-slate-50 rounded-[48px]" />
              </div>
          </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full px-4 mb-20 max-w-[1400px] mx-auto">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <Link 
            href="/admin/categories" 
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#22c55e] mb-2 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={16} />
            Categories
          </Link>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Edit Category
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-[#1a1a2e] px-4 py-1.5 rounded-full text-white shadow-xl shadow-[#1a1a2e]/10">
               Editing: {categoryName}
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Updating category details</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Link
             href="/admin/categories"
             className="px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-[#1a1a2e] hover:bg-slate-50 transition-all"
           >
             Cancel
           </Link>
           <button
             type="submit"
             form="edit-category-form"
             disabled={submitting}
             className="bg-[#1a1a2e] text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-4 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
           >
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">{submitting ? "Saving..." : "Save Changes"}</span>
           </button>
        </div>
      </div>

      <form id="edit-category-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* ── Primary Column (8) ── */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Identity & Discovery */}
          <section className="bg-white p-12 rounded-[60px] border border-slate-50 shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 rotate-12">
               <Layout size={160} />
            </div>
            <div className="mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Box size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Category Info</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basic identification details</p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="md:col-span-2 space-y-1">
                <FieldLabel>Official Name</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Artisanal Spices, Dairy Gold..."
                  className={FIELD_CLS}
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <FieldLabel>Category Link (URL Slug)</FieldLabel>
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-6 py-4">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">ayola.com/c/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full bg-transparent text-sm font-black text-[#1a1a2e] outline-none placeholder:text-slate-200"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <FieldLabel>Catchy Tagline</FieldLabel>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => { setTagline(e.target.value); markDirty() }}
                  placeholder="A short hook that appears on the website..."
                  className={FIELD_CLS}
                />
              </div>
            </div>
          </section>

          {/* Aesthetics & Icons */}
          <section className="bg-white p-12 rounded-[60px] border border-slate-50 shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] relative overflow-hidden group">
            <div className="mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Palette size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Category Icon</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Choose an emoji to represent this category</p>
              </div>
            </div>

            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
               <div className="lg:col-span-1 space-y-6">
                  <div className="w-full aspect-square rounded-[40px] bg-slate-50 border border-slate-100 flex items-center justify-center text-5xl shadow-inner group-hover/preview:scale-105 transition-transform duration-700">
                    {icon || "📦"}
                  </div>
                  <div className="text-center">
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Real-time Resolution</p>
                  </div>
               </div>
               <div className="lg:col-span-2 space-y-8 flex flex-col justify-center">
                  <div className="space-y-1">
                    <FieldLabel>Pick an Emoji</FieldLabel>
                    <input
                      type="text"
                      value={icon}
                      onChange={(e) => { setIcon(e.target.value); markDirty() }}
                      placeholder="Paste Emoji (e.g. 🍷, 🧀, 🥩)"
                      className={FIELD_CLS}
                    />
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 ml-2 opacity-60">This symbol will appear in category pills and cards.</p>
                  </div>
               </div>
            </div>
          </section>
        </div>

        {/* ── Sidebar Column (4) ── */}
        <aside className="lg:col-span-4 space-y-10">
          
          {/* Operational Logic */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 rotate-12">
               <Globe size={100} />
            </div>
            <div className="mb-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Zap size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Shipping Logic</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-[28px] bg-slate-50/50 border border-slate-100 group/logic hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-500">
                <div>
                  <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-widest leading-none">Global Reach</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">Ships Countrywide</p>
                </div>
                <ToggleSwitch checked={shipsCountrywide} onChange={() => { setShipsCountrywide(!shipsCountrywide); markDirty() }} />
              </div>
              
              <div className="pt-6 px-2">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                       <span className="material-symbols-outlined text-[20px]">sort</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#1a1a2e] uppercase tracking-widest">Display Order</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Order of appearance</p>
                    </div>
                 </div>
                 <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => { setSortOrder(e.target.value); markDirty() }}
                  className={FIELD_CLS}
                />
              </div>
            </div>
          </section>
          
           {/* Danger Zone */}
           <section className="bg-red-50/50 p-10 rounded-[48px] border border-red-100 group transition-all duration-700">
             <div className="mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white border border-red-200 flex items-center justify-center text-red-500 shadow-sm">
                 <Trash2 size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Delete Category</h3>
            </div>
            <div className="space-y-6">
               <p className="text-xs font-semibold text-red-800/60 leading-relaxed px-2">Deleting a category is permanent. Any products linked to this category will need to be moved or they will lose their classification.</p>
               <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm flex items-center justify-center gap-4"
                >
                  <Trash2 size={18} />
                  Purge Taxonomy Node
                </button>
            </div>
          </section>
        </aside>

        {/* ── Actions Footer ── */}
        <footer className="lg:col-span-12 flex flex-col sm:flex-row justify-between items-center bg-white p-10 rounded-[48px] border border-slate-50 shadow-2xl gap-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined">account_tree</span>
             </div>
             <div>
                <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-widest">Update Status</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">Changes are ready to be saved</p>
             </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              href="/admin/categories"
              className="flex-1 sm:flex-none px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-center"
            >
              Discard Changes
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:w-80 bg-[#1a1a2e] text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center justify-center gap-4 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
            >
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">{submitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </footer>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-lg rounded-[40px] p-12 border-none shadow-[0_60px_120px_rgba(220,38,38,0.2)] bg-white">
          <DialogHeader className="space-y-6 text-center">
             <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mx-auto animate-bounce">
                <AlertTriangle size={48} />
             </div>
             <div className="space-y-2">
               <DialogTitle className="text-3xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
                 Confirm Deletion
               </DialogTitle>
               <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">Are you sure you want to delete <span className="text-red-500 font-bold">&ldquo;{categoryName}&rdquo;</span> from the global repository?</p>
             </div>
          </DialogHeader>
          
          <div className="p-6 rounded-[28px] bg-red-50/50 border border-red-100 flex items-start gap-4 mb-8">
             <Info size={20} className="text-red-400 shrink-0 mt-0.5" />
             <p className="text-xs font-semibold text-red-800/60 leading-relaxed">Safety check: You cannot delete a category that still contains products. Please move all products to another category first.</p>
          </div>

          <DialogFooter className="flex-row gap-4 pt-4">
            <button
              onClick={() => setDeleteOpen(false)}
              className="flex-1 px-4 py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Abort
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex-1 px-4 py-5 bg-red-600 text-white rounded-[24px] text-xs font-black uppercase tracking-widest shadow-2xl shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
