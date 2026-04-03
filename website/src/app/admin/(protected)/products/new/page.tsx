"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
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
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-200"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
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
    <div>
      <div className="flex gap-2 mb-2 flex-wrap">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
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
          className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 bg-gray-100 text-sm rounded-md hover:bg-gray-200"
        >
          Add
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
    if (!name.trim()) next.name = "Name is required"
    if (!slug.trim()) next.slug = "Slug is required"
    if (!categoryId) next.category_id = "Category is required"
    const priceNum = parseInt(price, 10)
    if (!price || isNaN(priceNum) || priceNum < 1) next.price = "Price must be a whole number ≥ 1"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

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
      toast.error(json.error?.message ?? "Failed to create product")
      return
    }
    setIsDirty(false)
    toast.success("Product created")
    router.push("/admin/products")
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Add Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); markDirty() }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); markDirty() }}
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Long Description */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Long Description</label>
            <textarea
              value={longDescription}
              onChange={(e) => { setLongDescription(e.target.value); markDirty() }}
              rows={5}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Price (KES) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={price}
              onChange={(e) => { setPrice(e.target.value); markDirty() }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
          </div>

          {/* Size */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => { setSize(e.target.value); markDirty() }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); markDirty() }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded border mt-2"
              />
            )}
          </div>

          {/* Features */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Features</label>
            <TagInput
              value={features}
              onChange={(v) => { setFeatures(v); markDirty() }}
              placeholder="Add a feature..."
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Ingredients</label>
            <textarea
              value={ingredients}
              onChange={(e) => { setIngredients(e.target.value); markDirty() }}
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Nutrition Highlights */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Nutrition Highlights</label>
            <TagInput
              value={nutritionHighlights}
              onChange={(v) => { setNutritionHighlights(v); markDirty() }}
              placeholder="Add a highlight..."
            />
          </div>

          {/* Badge */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Badge</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => { setBadge(e.target.value); markDirty() }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* In Stock */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">In Stock</label>
            <ToggleSwitch checked={inStock} onChange={() => { setInStock(!inStock); markDirty() }} />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <ToggleSwitch checked={isActive} onChange={() => { setIsActive(!isActive); markDirty() }} />
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Sort Order</label>
            <input
              type="number"
              step={1}
              value={sortOrder}
              onChange={(e) => { setSortOrder(e.target.value); markDirty() }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md text-sm font-medium disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Product"}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2 border border-gray-200 rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
