"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "dispatched",
  "delivered",
] as const

function getNextStatuses(
  current: string,
  role: "admin" | "kitchen"
): string[] {
  if (current === "delivered" || current === "cancelled") return []
  const idx = STATUS_ORDER.indexOf(current as (typeof STATUS_ORDER)[number])
  const next: string[] =
    idx >= 0 && idx < STATUS_ORDER.length - 1 ? [STATUS_ORDER[idx + 1]] : []
  if (role === "admin" && current !== "delivered" && current !== "cancelled") {
    next.push("cancelled")
  }
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

  /* ── Empty state ── */
  if (nextStatuses.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-[0_10px_30px_-5px_rgba(26,26,46,0.06)]">
        <h3
          className="font-bold text-lg text-[#1a1a2e] mb-4"
          style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
        >
          Status Control
        </h3>
        <p className="text-sm text-slate-400">No further updates available.</p>
      </div>
    )
  }

  /* ── Handlers ── */
  const handleUpdate = async () => {
    if (selected === "cancelled") {
      setShowCancelDialog(true)
      return
    }
    await doUpdate(selected)
  }

  const doUpdate = async (newStatus: string, reason?: string) => {
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

      if (newStatus === "cancelled" && reason) {
        await fetch(`/api/admin/orders/${orderId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        })
      }

      toast.success(`Order status updated to ${newStatus}`)
      router.refresh()
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmCancel = async () => {
    setShowCancelDialog(false)
    await fetch(`/api/admin/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: cancelReason || undefined }),
    })
    toast.success("Order cancelled")
    setCancelReason("")
    router.refresh()
  }

  const isCancelSelected = selected === "cancelled"

  return (
    <>
      {/* ── Control Card ── */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_10px_30px_-5px_rgba(26,26,46,0.06)]">
        <h3
          className="font-bold text-lg text-[#1a1a2e] mb-6"
          style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
        >
          Status Control
        </h3>

        <div className="space-y-4">
          <label className="block">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2 block">
              Change Order Status
            </span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full bg-slate-50 border-0 rounded-xl text-sm font-medium py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30 transition-all capitalize text-[#1a1a2e]"
            >
              {nextStatuses.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={handleUpdate}
            disabled={loading || !selected}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isCancelSelected
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#1a1a2e] hover:bg-slate-800 text-white"
            }`}
          >
            {loading ? "Updating…" : "Update Status"}
          </button>
        </div>
      </div>

      {/* ── Cancel confirmation dialog ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            This will mark the order as cancelled. This action cannot be undone.
          </p>
          <div className="mt-2">
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 resize-none"
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false)
                setCancelReason("")
              }}
              disabled={loading}
            >
              Keep Order
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Cancelling…" : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
