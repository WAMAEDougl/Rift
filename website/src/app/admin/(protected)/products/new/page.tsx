"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, Sparkles, Box, Info, Image as ImageIcon, Zap, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
}

interface FormErrors {
  name?: string
  slug?: string
  category_id?: string
  price?: string
}

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

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState("")
  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInput("")
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap min-h-[40px]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[#1a1a2e]/10 animate-in zoom-in duration-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-white/40 hover:text-red-400 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-[#1a1a2e] focus:outline-none focus:ring-4 focus:ring-[#22c55e]/5 flex-1 placeholder:text-slate-300 transition-all font-inter"
        />
        <button
          type="button"
          onClick={add}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white transition-all shadow-sm active:scale-90"
        >
          <Sparkles size={18} />
        </button>
      </div>
    </div>
  )
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const slugManuallyEdited = useRef(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [price, setPrice] = useState("")
  const [size, setSize] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [ingredients, setIngredients] = useState("")
  const [nutritionHighlights, setNutritionHighlights] = useState<string[]>([])
  const [badge, setBadge] = useState("")
  const [inStock, setInStock] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [sortOrder, setSortOrder] = useState("0")

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((json) => { if (json.data) setCategories(json.data as Category[]) })
  }, [])

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

  function validate(): boolean {
    const next: FormErrors = {}
    if (!name.trim()) next.name = "Identity Required"
    if (!slug.trim()) next.slug = "Path Required"
    if (!categoryId) next.category_id = "Taxonomy Required"
    const priceNum = parseInt(price, 10)
    if (!price || isNaN(priceNum) || priceNum < 1) next.price = "Value > 0 Required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error("Validation failed. Please review mandatory fields.")
      return
    }

    setSubmitting(true)
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim(),
        category_id: categoryId,
        description: description.trim() || null,
        long_description: longDescription.trim() || null,
        price: parseInt(price, 10),
        size: size.trim() || null,
        image_url: imageUrl.trim() || null,
        features,
        ingredients: ingredients.trim() || null,
        nutrition_highlights: nutritionHighlights,
        badge: badge.trim() || null,
        in_stock: inStock,
        is_active: isActive,
        sort_order: parseInt(sortOrder, 10) || 0,
      }),
    })
    const json = await res.json()
    setSubmitting(false)
    if (!res.ok) {
      toast.error(json.error?.message ?? "Synchronizing failed")
      return
    }
    setIsDirty(false)
    toast.success("Product synchronized successfully")
    router.push("/admin/products")
  }

  const INPUT_WRAP_CLS = "space-y-2.5"
  const LABEL_CLS = "block text-[10px] font-black uppercase tracking-[0.2em] mb-2 ml-1 text-slate-400"
  const FIELD_CLS = "w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 text-sm text-[#1a1a2e] font-bold focus:outline-none focus:ring-4 focus:ring-[#22c55e]/10 focus:border-[#22c55e]/30 placeholder:text-slate-300 transition-all font-inter"

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full px-4 mb-20">
      {/* ── High-Premium Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-4 border-b border-slate-50/50">
        <div className="space-y-1">
          <Link 
            href="/admin/products" 
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#22c55e] mb-2 hover:translate-x-[-4px] transition-transform"
          >
            <ArrowLeft size={16} />
            Product Catalog
          </Link>
          <h2 className="text-4xl font-black tracking-tighter text-[#1a1a2e]" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>
            Add Product
          </h2>
          <div className="flex items-center gap-3 text-slate-400">
             <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                New Entry
             </span>
             <div className="h-3 w-px bg-slate-200" />
             <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Adding a fresh item to your culinary collection</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <Link
             href="/admin/products"
             className="px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-[#1a1a2e] hover:bg-slate-50 transition-all"
           >
             Discard
           </Link>
           <button
             type="submit"
             form="new-product-form"
             disabled={submitting}
             className="bg-[#1a1a2e] text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center gap-4 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
           >
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">{submitting ? "Processing..." : "Save Product"}</span>
           </button>
        </div>
      </div>

      <form id="new-product-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* ── Primary Column (8) ── */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* General Identification */}
          <section className="bg-white p-12 rounded-[60px] border border-slate-50 shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 rotate-12">
               <Info size={160} />
            </div>
            <div className="mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Box size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Product Information</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core identification details</p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="md:col-span-2 space-y-1">
                <FieldLabel>Product Name</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter product name..."
                  className={FIELD_CLS}
                />
                {errors.name && <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mt-2 ml-2">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <FieldLabel>Category</FieldLabel>
                <select
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); markDirty() }}
                  className={FIELD_CLS}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mt-2 ml-2">{errors.category_id}</p>}
              </div>

              <div className="space-y-1">
                <FieldLabel>Product Link (URL Slug)</FieldLabel>
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-6 py-4">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">ayola.com/p/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full bg-transparent text-sm font-black text-[#1a1a2e] outline-none placeholder:text-slate-200"
                  />
                </div>
                {errors.slug && <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mt-2 ml-2">{errors.slug}</p>}
              </div>

              <div className="md:col-span-2 space-y-1">
                <FieldLabel>Brief Summary</FieldLabel>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); markDirty() }}
                  placeholder="One-line product hook..."
                  className={FIELD_CLS}
                />
              </div>
            </div>
          </section>

          {/* Narrative & Metrics */}
          <section className="bg-white p-12 rounded-[60px] border border-slate-50 shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)]">
            <div className="mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Product Details</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full description and pricing</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-1">
                <FieldLabel>Full Description</FieldLabel>
                <div className="rounded-[32px] border border-slate-100 bg-slate-50/50 overflow-hidden group/text focus-within:ring-4 focus-within:ring-[#22c55e]/5 transition-all">
                  <div className="flex gap-4 border-b border-slate-100 bg-white p-4">
                    <button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#1a1a2e] hover:bg-slate-50 transition-all">
                      <span className="material-symbols-outlined text-[20px]">format_bold</span>
                    </button>
                    <button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#1a1a2e] hover:bg-slate-50 transition-all">
                      <span className="material-symbols-outlined text-[20px]">format_italic</span>
                    </button>
                    <button type="button" className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-[#1a1a2e] hover:bg-slate-50 transition-all ml-auto">
                      <span className="material-symbols-outlined text-[20px]">magic_button</span>
                    </button>
                  </div>
                  <textarea
                    value={longDescription}
                    onChange={(e) => { setLongDescription(e.target.value); markDirty() }}
                    rows={8}
                    placeholder="Describe the culinary heritage, processing methods, and unique flavor profile..."
                    className="w-full bg-transparent px-8 py-8 text-sm font-medium text-[#1a1a2e] outline-none leading-relaxed placeholder:text-slate-200"
                  />
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-1">
                  <FieldLabel>Price (KES)</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); markDirty() }}
                    placeholder="000.00"
                    className={FIELD_CLS}
                  />
                  {errors.price && <p className="text-[9px] font-black uppercase text-red-500 tracking-widest mt-2 ml-2">{errors.price}</p>}
                </div>
                <div className="space-y-1">
                  <FieldLabel>Size / Weight</FieldLabel>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => { setSize(e.target.value); markDirty() }}
                    placeholder="e.g. 500g, 1L..."
                    className={FIELD_CLS}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Composition */}
          <section className="bg-white p-12 rounded-[60px] border border-slate-50 shadow-[0_20px_80px_-20px_rgba(26,26,46,0.06)]">
            <div className="mb-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Zap size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Product Composition</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ingredients and product highlights</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-1">
                <FieldLabel>Product Features</FieldLabel>
                <TagInput
                  value={features}
                  onChange={(v) => { setFeatures(v); markDirty() }}
                  placeholder="Enter a feature..."
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>Main Ingredients / Structure</FieldLabel>
                <textarea
                  value={ingredients}
                  onChange={(e) => { setIngredients(e.target.value); markDirty() }}
                  rows={4}
                  placeholder="List the primary ingredients used..."
                  className={FIELD_CLS}
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>Nutrition / Health Highlights</FieldLabel>
                <TagInput
                  value={nutritionHighlights}
                  onChange={(v) => { setNutritionHighlights(v); markDirty() }}
                  placeholder="Add a health benefit..."
                />
              </div>
            </div>
          </section>
        </div>

        {/* ── Sidebar Column (4) ── */}
        <aside className="lg:col-span-4 space-y-10">
          
          {/* Visual Presentation */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-xl overflow-hidden group/media relative">
            <div className="mb-8 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <ImageIcon size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Product Image</h3>
            </div>
            
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-100 aspect-square group/preview transition-all duration-700 hover:border-[#22c55e]/20">
                {imageUrl ? (
                  <img src={imageUrl} alt="Product Preview" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover/preview:scale-110" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-100 group-hover/preview:text-[#22c55e] transition-all duration-700">
                       <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                    </div>
                    <div>
                        <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-widest">No Image</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Recommended: 1:1 Aspect Ratio</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <FieldLabel>Image URL Address</FieldLabel>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); markDirty() }}
                  placeholder="https://example.com/image.jpg"
                  className={FIELD_CLS}
                />
              </div>
            </div>
          </section>

          {/* Operational Flow */}
          <section className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-xl">
             <div className="mb-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#22c55e]">
                 <Zap size={20} />
              </div>
              <h3 className="text-xl font-black text-[#1a1a2e] tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Product Status</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 rounded-[28px] bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-500">
                <div>
                  <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-widest leading-none">Visibility</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">Visible on storefront</p>
                </div>
                <ToggleSwitch checked={isActive} onChange={() => { setIsActive(!isActive); markDirty() }} />
              </div>
              <div className="flex items-center justify-between p-6 rounded-[28px] bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-500">
                <div>
                  <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-widest leading-none">Stock Status</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">Mark as available</p>
                </div>
                <ToggleSwitch checked={inStock} onChange={() => { setInStock(!inStock); markDirty() }} />
              </div>
              <div className="pt-4 px-2">
                <FieldLabel>Sort Order</FieldLabel>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => { setSortOrder(e.target.value); markDirty() }}
                  className={FIELD_CLS}
                />
              </div>
            </div>
          </section>

          {/* Promotion Ledger */}
          <section className="bg-[#1a1a2e] p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
               <div className="w-14 h-14 rounded-[20px] bg-white/5 flex items-center justify-center text-[#22c55e]">
                 <Sparkles size={24} className="group-hover:rotate-45 transition-transform duration-700" />
               </div>
            </div>
            <div className="relative z-10 space-y-8">
               <div>
                 <h3 className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: "var(--font-manrope, sans-serif)" }}>Market Promotion</h3>
                 <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Stickers and badges for visibility</p>
               </div>
               
               <div className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Special Badge Protocol</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => { setBadge(e.target.value); markDirty() }}
                    placeholder="e.g. CURATED, LIMITED"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white font-bold focus:outline-none focus:ring-4 focus:ring-[#22c55e]/10 focus:border-[#22c55e]/20 placeholder:text-white/10 transition-all font-inter"
                  />
                </div>
                <div className="p-6 rounded-[28px] bg-white/5 border border-white/5 group-hover:bg-[#22c55e]/5 transition-all duration-700">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#22c55e]">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Premium Selection</p>
                      <p className="text-[9px] font-medium text-white/30 mt-0.5">Elevated carousel priority mapping enabled by default.</p>
                    </div>
                  </div>
                </div>
               </div>
            </div>
            <div className="absolute -bottom-20 -left-20 opacity-5 group-hover:scale-150 transition-transform duration-[3000ms]">
                <Box size={200} className="rotate-12" />
            </div>
          </section>

        </aside>

        {/* ── Actions Footer ── */}
        <footer className="lg:col-span-12 flex flex-col sm:flex-row justify-between items-center bg-white p-10 rounded-[48px] border border-slate-50 shadow-2xl gap-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined">history_edu</span>
             </div>
             <div>
                <p className="text-xs font-black text-[#1a1a2e] uppercase tracking-widest">Repository Status</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-60">Ready for synchronization with global nodes</p>
             </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              href="/admin/products"
              className="flex-1 sm:flex-none px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:w-80 bg-[#1a1a2e] text-white px-10 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#1a1a2e]/20 flex items-center justify-center gap-4 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
            >
              <Save size={18} className="group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">{submitting ? "Processing..." : "Save Product"}</span>
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
