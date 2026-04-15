"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"

const STATUS_ORDER = ["pending", "confirmed", "preparing", "ready", "dispatched", "delivered"] as const

function getNextStatuses(current: string, role: "admin" | "kitchen"): string[] {
  if (current === "delivered" || current === "cancelled") return []
  const idx = STATUS_ORDER.indexOf(current as (typeof STATUS_ORDER)[number])
  const next: string[] = idx >= 0 && idx < STATUS_ORDER.length - 1 ? [STATUS_ORDER[idx + 1]] : []
  if (role === "admin" && current !== "delivered" && current !== "cancelled") next.push("cancelled")
  return next
}

interface Props {
  orderId: string
  currentStatus: string
  role: "admin" | "kitchen"
}

export function OrderStatusControl({ orderId, currentStatus, role }: Props) {
  const router = useRouter()
  const nextStatuses = getNextStatuses(currentStatus, role)
  const [selected, setSelected] = useState(nextStatuses[0] ?? "")
  const [loading, setLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  if (nextStatuses.length === 0) {
    return (
      <p className="text-xs text-gray-400 py-2">No further status updates available.</p>
    )
  }

  const handleUpdate = async () => {
    if (selected === "cancelled") { setShowCancelDialog(true); return }
    await doUpdate(selected)
  }

  const doUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        toast.error(json?.error?.message ?? "Failed to update status")
        return
      }
      toast.success(`Status updated to ${newStatus}`)
      router.refresh()
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false) }
  }

  const handleConfirmCancel = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason || undefined }),
      })
      toast.success("Order cancelled")
      setShowCancelDialog(false)
      setCancelReason("")
      router.refresh()
    } finally { setLoading(false) }
  }

  return (
    <>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Move to status</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 capitalize"
          >
            {nextStatuses.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleUpdate}
          disabled={loading || !selected}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
            selected === "cancelled"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-amber-700 hover:bg-amber-800 text-white"
          }`}
        >
          {loading ? "Updating…" : "Update Status"}
        </button>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md rounded-2xl p-6 border border-gray-100 shadow-xl bg-white">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Cancel this order?
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-1">This action cannot be undone.</p>
          </DialogHeader>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Reason (optional)</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 resize-none"
            />
          </div>
          <DialogFooter className="mt-4 flex gap-3">
            <button onClick={() => { setShowCancelDialog(false); setCancelReason("") }} disabled={loading}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors">
              Keep Order
            </button>
            <button onClick={handleConfirmCancel} disabled={loading}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? "Cancelling…" : "Cancel Order"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
