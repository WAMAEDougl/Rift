"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, Link as LinkIcon, ImageIcon, X } from "lucide-react"
import { toast } from "sonner"

interface ImageUploaderProps {
  imageUrl: string
  onImageUrl: (url: string) => void
}

export default function ImageUploader({ imageUrl, onImageUrl }: ImageUploaderProps) {
  const [tab, setTab] = useState<"upload" | "url">("upload")
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState(imageUrl.startsWith("http") ? imageUrl : "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error?.message ?? "Upload failed"); return }
      onImageUrl(json.data.url)
      toast.success("Image uploaded successfully")
    } catch {
      toast.error("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  function handleUrlApply() {
    const trimmed = urlInput.trim()
    if (!trimmed) { toast.error("Please enter a URL"); return }
    if (!/^https?:\/\/.+/.test(trimmed)) { toast.error("Please enter a valid URL starting with http:// or https://"); return }
    onImageUrl(trimmed)
    toast.success("Image URL applied")
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="aspect-square rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center relative">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => { onImageUrl(""); setUrlInput("") }}
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 shadow transition-colors"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <div className="text-center p-6">
            <ImageIcon size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-300">No image yet</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            tab === "upload" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Upload size={13} /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
            tab === "url" ? "bg-white text-amber-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <LinkIcon size={13} /> Paste URL
        </button>
      </div>

      {/* Upload tab */}
      {tab === "upload" && (
        <div className="space-y-2">
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 size={24} className="text-amber-600 mx-auto mb-2 animate-spin" />
            ) : (
              <Upload size={24} className="text-gray-300 mx-auto mb-2 group-hover:text-amber-500 transition-colors" />
            )}
            <p className="text-xs text-gray-400 group-hover:text-amber-600 transition-colors">
              {uploading ? "Uploading…" : "Click to choose a file"}
            </p>
            <p className="text-[10px] text-gray-300 mt-1">JPG, PNG, WebP — max 5MB</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : "Upload from computer"}
          </button>
        </div>
      )}

      {/* URL tab */}
      {tab === "url" && (
        <div className="space-y-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlApply())}
            placeholder="https://example.com/image.jpg"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 placeholder:text-gray-300 transition-all"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-sm font-medium transition-colors"
          >
            <LinkIcon size={14} /> Apply URL
          </button>
        </div>
      )}
    </div>
  )
}
