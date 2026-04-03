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

  if (nextStatuses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
          Update Status
        </h3>
        <p className="text-sm text-gray-500">No further updates available.</p>
      </div>
    )
  }

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

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Update Status
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white capitalize"
          >
            {nextStatuses.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <Button
            onClick={handleUpdate}
            disabled={loading || !selected}
            className={`text-sm ${
              selected === "cancelled"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This will mark the order as cancelled. This action cannot be undone.
          </p>
          <div className="mt-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Reason (optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
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
              {loading ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
