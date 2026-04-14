"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, Package, FileText, Leaf, ImageIcon, Zap } from "lucide-react"
import { toast } from "sonner"
import ImageUploader from "@/components/admin/ImageUploader"

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

const INPUT_CLS =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 placeholder:text-gray-300 transition-all"

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-gray-500 mb-1.5">
      {children}
    </label>
  )
}

function ToggleSwitch({ checked, onChange, label, description }: {
  checked: boolean
  onChange: () => void
  label: string
  description: string
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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-amber-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
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
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[36px]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-lg"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-amber-600 hover:text-red-500 transition-colors"
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className={INPUT_CLS}
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-colors border border-amber-100"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function SectionCard({ icon, title, subtitle, children }: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            {title}
          </h3>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
      </div>
      {children}
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

  function markDirty() { if (!isDirty) setIsDirty(true) }

  function handleNameChange(value: string) {
    setName(value)
    markDirty()
    if (!slugManuallyEdited.current) setSlug(slugify(value))
  }

  function handleSlugChange(value: string) {
    setSlug(value)
    slugManuallyEdited.current = true
    markDirty()
  }

  function validate(): boolean {
    const next: FormErrors = {}
    if (!name.trim()) next.name = "Product name is required"
    if (!slug.trim()) next.slug = "URL slug is required"
    if (!categoryId) next.category_id = "Category is required"
    const priceNum = parseInt(price, 10)
    if (!price || isNaN(priceNum) || priceNum < 1) next.price = "Price must be greater than 0"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast.error("Please fix the errors before saving.")
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
      toast.error(json.error?.message ?? "Failed to save product")
      return
    }
    setIsDirty(false)
    toast.success("Product saved successfully")
    router.push("/admin/products")
  }

  return (
    <div className="space-y-6 mb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft size={13} /> Back to Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Add New Product
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Fill in the details below to add a product to your catalogue</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Discard
          </Link>
          <button
            type="submit"
            form="new-product-form"
            disabled={submitting}
            className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          >
            <Save size={15} />
            {submitting ? "Saving…" : "Save Product"}
          </button>
        </div>
      </div>

      <form id="new-product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Main Column ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Basic Info */}
          <SectionCard icon={<Package size={17} />} title="Product Information" subtitle="Core identification details">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>Product Name *</FieldLabel>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Synbiotic Porridge"
                  className={INPUT_CLS}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <FieldLabel>Category *</FieldLabel>
                <select
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); markDirty() }}
                  className={INPUT_CLS}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
              </div>

              <div>
                <FieldLabel>URL Slug *</FieldLabel>
                <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-600/20 focus-within:border-amber-600/40">
                  <span className="px-3 py-2.5 text-xs text-gray-300 bg-gray-50 border-r border-gray-200 shrink-0">
                    /products/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm text-gray-800 bg-transparent outline-none"
                    placeholder="product-slug"
                  />
                </div>
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
              </div>

              <div className="md:col-span-2">
                <FieldLabel>Short Description</FieldLabel>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); markDirty() }}
                  placeholder="One-line product summary"
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </SectionCard>

          {/* Details */}
          <SectionCard icon={<FileText size={17} />} title="Product Details" subtitle="Full description and pricing">
            <div className="space-y-4">
              <div>
                <FieldLabel>Full Description</FieldLabel>
                <textarea
                  value={longDescription}
                  onChange={(e) => { setLongDescription(e.target.value); markDirty() }}
                  rows={6}
                  placeholder="Describe the product in detail — heritage, processing, flavor profile…"
                  className={`${INPUT_CLS} resize-none`}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>Price (KES) *</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); markDirty() }}
                    placeholder="e.g. 450"
                    className={INPUT_CLS}
                  />
                  {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <FieldLabel>Size / Weight</FieldLabel>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => { setSize(e.target.value); markDirty() }}
                    placeholder="e.g. 500g, 1L"
                    className={INPUT_CLS}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Composition */}
          <SectionCard icon={<Leaf size={17} />} title="Composition & Nutrition" subtitle="Ingredients and health highlights">
            <div className="space-y-5">
              <div>
                <FieldLabel>Product Features</FieldLabel>
                <TagInput
                  value={features}
                  onChange={(v) => { setFeatures(v); markDirty() }}
                  placeholder="e.g. Probiotic, Gluten-free…"
                />
              </div>
              <div>
                <FieldLabel>Ingredients</FieldLabel>
                <textarea
                  value={ingredients}
                  onChange={(e) => { setIngredients(e.target.value); markDirty() }}
                  rows={3}
                  placeholder="List the primary ingredients…"
                  className={`${INPUT_CLS} resize-none`}
                />
              </div>
              <div>
                <FieldLabel>Nutrition / Health Highlights</FieldLabel>
                <TagInput
                  value={nutritionHighlights}
                  onChange={(v) => { setNutritionHighlights(v); markDirty() }}
                  placeholder="e.g. High fibre, Rich in iron…"
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-4 space-y-5">

          {/* Image */}
          <SectionCard icon={<ImageIcon size={17} />} title="Product Image" subtitle="Upload from your computer or paste a URL">
            <ImageUploader
              imageUrl={imageUrl}
              onImageUrl={(url) => { setImageUrl(url); markDirty() }}
            />
          </SectionCard>

          {/* Status */}
          <SectionCard icon={<Zap size={17} />} title="Product Status" subtitle="Visibility and availability">
            <div className="space-y-3">
              <ToggleSwitch
                checked={isActive}
                onChange={() => { setIsActive(!isActive); markDirty() }}
                label="Visible on storefront"
                description="Show this product to customers"
              />
              <ToggleSwitch
                checked={inStock}
                onChange={() => { setInStock(!inStock); markDirty() }}
                label="In stock"
                description="Mark as available for purchase"
              />
              <div>
                <FieldLabel>Sort Order</FieldLabel>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => { setSortOrder(e.target.value); markDirty() }}
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </SectionCard>

          {/* Badge */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-1" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Promotional Badge
            </h3>
            <p className="text-xs text-gray-500 mb-3">Optional label shown on the product card</p>
            <input
              type="text"
              value={badge}
              onChange={(e) => { setBadge(e.target.value); markDirty() }}
              placeholder="e.g. NEW, BESTSELLER"
              className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 placeholder:text-gray-300 transition-all"
            />
          </div>
        </aside>

        {/* Footer Actions */}
        <div className="lg:col-span-12 flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400">All fields marked * are required</p>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <Save size={15} />
              {submitting ? "Saving…" : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
