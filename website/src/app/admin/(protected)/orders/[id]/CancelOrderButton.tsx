"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"

interface Props {
  orderId: string
  orderNumber: string
}

export function CancelOrderButton({ orderId, orderNumber }: Props) {
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
        toast.error(json?.error?.message ?? "Failed to cancel order")
        return
      }
      toast.success(`Order ${orderNumber} cancelled`)
      setOpen(false)
      setReason("")
      window.location.reload()
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
      >
        <Trash2 size={14} />
        Cancel Order
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 border border-gray-100 shadow-xl bg-white">
          <DialogHeader className="mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-3">
              <AlertTriangle size={18} />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Cancel order {orderNumber}?
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-1">This action cannot be undone.</p>
          </DialogHeader>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Out of stock, customer request…"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 resize-none"
            />
          </div>
          <DialogFooter className="mt-4 flex gap-3">
            <button onClick={() => { setOpen(false); setReason("") }} disabled={loading}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors">
              Keep Order
            </button>
            <button onClick={handleCancel} disabled={loading}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? "Cancelling…" : "Cancel Order"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
