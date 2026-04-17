"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Tag, Globe, Zap } from "lucide-react"
import { toast } from "sonner"

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

const INPUT_CLS =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 placeholder:text-gray-300 transition-all"

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1.5">{children}</label>
  )
}

function ToggleSwitch({ checked, onChange, label, description }: {
  checked: boolean; onChange: () => void; label: string; description: string
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? "bg-amber-600" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  )
}

function SectionCard({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">{icon}</div>
        <div>
          <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>{title}</h3>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function NewCategoryPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const slugManuallyEdited = useRef(false)
  const [isDirty, setIsDirty] = useState(false)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [tagline, setTagline] = useState("")
  const [icon, setIcon] = useState("")
  const [shipsCountrywide, setShipsCountrywide] = useState(true)
  const [sortOrder, setSortOrder] = useState("0")

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = "" }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  function markDirty() { if (!isDirty) setIsDirty(true) }

  function handleNameChange(value: string) {
    setName(value); markDirty()
    if (!slugManuallyEdited.current) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlug(value); slugManuallyEdited.current = true; markDirty()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required.")
      return
    }
    setSubmitting(true)
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(), slug: slug.trim(),
        tagline: tagline.trim() || null,
        icon: icon.trim() || null,
        ships_countrywide: shipsCountrywide,
        sort_order: parseInt(sortOrder, 10) || 0,
      }),
    })
    const json = await res.json()
    setSubmitting(false)
    if (!res.ok) { toast.error(json.error?.message ?? "Failed to create category"); return }
    setIsDirty(false)
    toast.success("Category created successfully")
    router.push("/admin/categories")
  }

  return (
    <div className="space-y-6 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <Link href="/admin/categories" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-700 transition-colors mb-2">
            <ArrowLeft size={13} /> Back to Categories
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Add New Category
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Create a new product category for your catalogue</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/categories" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
            Discard
          </Link>
          <button
            type="submit" form="new-category-form" disabled={submitting}
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {submitting ? "Saving…" : "Save Category"}
          </button>
        </div>
      </div>

      <form id="new-category-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Main Column */}
        <div className="lg:col-span-8 space-y-5">
          <SectionCard icon={<Tag size={17} />} title="Category Information" subtitle="Name, slug and tagline">
            <div className="space-y-4">
              <div>
                <FieldLabel>Category Name *</FieldLabel>
                <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Beverages, Flour Blends" className={INPUT_CLS} />
              </div>
              <div>
                <FieldLabel>URL Slug *</FieldLabel>
                <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-600/20 focus-within:border-amber-600/40">
                  <span className="px-3 py-2.5 text-xs text-gray-300 bg-gray-50 border-r border-gray-200 shrink-0">/products?category=</span>
                  <input type="text" value={slug} onChange={(e) => handleSlugChange(e.target.value)} className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-transparent outline-none" placeholder="category-slug" />
                </div>
              </div>
              <div>
                <FieldLabel>Tagline</FieldLabel>
                <input type="text" value={tagline} onChange={(e) => { setTagline(e.target.value); markDirty() }} placeholder="Short description shown on the storefront" className={INPUT_CLS} />
              </div>
            </div>
          </SectionCard>

          <SectionCard icon={<Globe size={17} />} title="Category Icon" subtitle="Emoji displayed on category cards">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-4xl shrink-0">
                {icon || "📦"}
              </div>
              <div className="flex-1">
                <FieldLabel>Emoji Icon</FieldLabel>
                <input type="text" value={icon} onChange={(e) => { setIcon(e.target.value); markDirty() }} placeholder="Paste an emoji e.g. 🥛, 🌾, 🍵" className={INPUT_CLS} />
                <p className="text-xs text-gray-400 mt-2">This emoji appears on category cards and pills on the storefront.</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-5">
          <SectionCard icon={<Zap size={17} />} title="Shipping & Display" subtitle="Availability and sort order">
            <div className="space-y-3">
              <ToggleSwitch
                checked={shipsCountrywide}
                onChange={() => { setShipsCountrywide(!shipsCountrywide); markDirty() }}
                label="Ships countrywide"
                description="Products in this category ship to all 47 counties"
              />
              <div>
                <FieldLabel>Sort Order</FieldLabel>
                <input type="number" value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); markDirty() }} className={INPUT_CLS} />
                <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
              </div>
            </div>
          </SectionCard>

          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-playfair, serif)" }}>Tips</h3>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-start gap-2"><span className="text-amber-600 mt-0.5">•</span> Slug must be unique and URL-safe (lowercase, hyphens only)</li>
              <li className="flex items-start gap-2"><span className="text-amber-600 mt-0.5">•</span> The tagline appears below the category name on the storefront</li>
              <li className="flex items-start gap-2"><span className="text-amber-600 mt-0.5">•</span> You can&apos;t delete a category that has products</li>
            </ul>
          </div>
        </aside>

        {/* Footer */}
        <div className="lg:col-span-12 flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400">Fields marked * are required</p>
          <div className="flex items-center gap-3">
            <Link href="/admin/categories" className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
              Cancel
            </Link>
            <button
              type="submit" disabled={submitting}
              className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <Save size={15} />
              {submitting ? "Saving…" : "Save Category"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
