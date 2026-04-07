"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Props {
  orderId: string
  orderNumber: string
}

export function CancelOrderButton({ orderId, orderNumber }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || undefined }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        toast.error(json?.error ?? "Failed to cancel order")
        return
      }

      toast.success(`Order ${orderNumber} cancelled`)
      setOpen(false)
      setReason("")
      router.refresh()
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Danger Zone Card ── */}
      <div className="bg-red-50/60 rounded-3xl p-8 border border-red-100">
        <h3
          className="font-bold text-lg text-red-600 mb-4 flex items-center gap-2"
          style={{ fontFamily: "var(--font-manrope, sans-serif)" }}
        >
          <AlertTriangle size={18} />
          Danger Zone
        </h3>
        <p className="text-xs text-red-400/80 mb-6 leading-relaxed">
          Cancelling this order will notify the customer. This action cannot be
          undone.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="w-full border-2 border-red-500 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <X size={16} />
          Cancel Order
        </button>
      </div>

      {/* ── Confirmation Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order {orderNumber}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel this order? This action cannot be
            undone.
          </p>
          <div className="mt-2">
            <label className="text-sm font-medium text-slate-600 block mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Out of stock, customer request…"
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 resize-none"
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false)
                setReason("")
              }}
              disabled={loading}
            >
              Keep Order
            </Button>
            <Button
              onClick={handleCancel}
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
