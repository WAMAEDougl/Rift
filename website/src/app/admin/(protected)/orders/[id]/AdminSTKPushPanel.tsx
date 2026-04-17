"use client"

import { useState } from "react"
import { Smartphone, AlertCircle, CheckCircle2 } from "lucide-react"
import type { OrderStatus } from "@/lib/admin/types"

interface Props {
  orderId: string
  orderNumber: string
  subtotal: number
  orderStatus: OrderStatus
}

export function AdminSTKPushPanel({ orderId, orderNumber, subtotal, orderStatus }: Props) {
  const [deliveryFee, setDeliveryFee] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const parsedFee = deliveryFee.trim() === "" ? NaN : Number(deliveryFee)
  const previewTotal =
    !isNaN(parsedFee) && parsedFee >= 0 ? subtotal + parsedFee : null

  const validate = (): boolean => {
    if (deliveryFee.trim() === "" || isNaN(parsedFee)) {
      setFieldError("Please enter a valid delivery fee.")
      return false
    }
    if (parsedFee < 0) {
      setFieldError("Delivery fee cannot be negative.")
      return false
    }
    setFieldError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setLoading(true)
    setFeedback(null)

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_fee: parsedFee }),
      })

      if (res.ok) {
        setFeedback({
          type: "success",
          text: "STK Push sent to customer's phone.",
        })
        setDeliveryFee("")
        setFieldError(null)
      } else {
        const json = await res.json().catch(() => ({}))
        const errorText =
          json?.error?.message ?? "Failed to send STK Push. Please try again."
        setFeedback({ type: "error", text: errorText })
        // Intentionally NOT resetting deliveryFee on error — the admin should be
        // able to review and resubmit the same value without re-entering it.
        // (Requirement 5.10)
      }
    } catch {
      setFeedback({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
          <Smartphone size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Send Payment Request</h3>
          <p className="text-xs text-gray-400">Order {orderNumber}</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Status-aware informational note (Requirement 5.11) */}
        {orderStatus === "pending_delivery_confirmation" && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 text-sm">
            <p>Submitting this will transition the order to active processing.</p>
          </div>
        )}

        {/* Delivery fee input */}
        <div>
          <label
            htmlFor="delivery-fee"
            className="block text-xs font-medium text-gray-500 mb-1.5"
          >
            Delivery Fee (KES)
          </label>
          <input
            id="delivery-fee"
            type="number"
            min="0"
            step="1"
            value={deliveryFee}
            onChange={(e) => {
              setDeliveryFee(e.target.value)
              if (fieldError) setFieldError(null)
              if (feedback) setFeedback(null)
            }}
            placeholder="e.g. 200"
            disabled={loading}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 disabled:opacity-50 ${
              fieldError
                ? "border-red-300 bg-red-50/30"
                : "border-gray-200"
            }`}
          />
          {fieldError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle size={12} className="shrink-0" />
              {fieldError}
            </p>
          )}
        </div>

        {/* Total preview */}
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
          <p className="text-xs text-amber-700 font-medium mb-1">Charge preview</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 text-xs">
              Subtotal: KES {subtotal.toLocaleString()}
            </span>
            <span className="font-semibold text-gray-900">
              Total:{" "}
              {previewTotal !== null
                ? `KES ${previewTotal.toLocaleString()}`
                : "—"}
            </span>
          </div>
        </div>

        {/* Inline feedback */}
        {feedback && (
          <div
            className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs ${
              feedback.type === "success"
                ? "bg-green-50 border border-green-100 text-green-700"
                : "bg-red-50 border border-red-100 text-red-600"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
            )}
            {feedback.text}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Smartphone size={14} />
          {loading ? "Sending…" : "Send STK Push"}
        </button>
      </div>
    </div>
  )
}
