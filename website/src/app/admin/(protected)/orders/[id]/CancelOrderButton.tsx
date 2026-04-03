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
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3">
          Danger Zone
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Cancelling an order cannot be undone. The customer will need to place a new order.
        </p>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 text-sm"
        >
          Cancel Order
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order {orderNumber}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <div className="mt-2">
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Out of stock, customer request..."
              rows={3}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
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
              {loading ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
