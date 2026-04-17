"use client"

import { useState } from "react"
import { MessageCircle, Send, AlertCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import type { WaSenderMessage } from "@/lib/wasender"
import { formatPhoneDisplay } from "@/lib/utils/validation"

interface Props {
  initialMessages: WaSenderMessage[]
  initialError: string | null
  phone: string
  orderId: string
}

export function WhatsAppPanel({ initialMessages, initialError, phone, orderId: _orderId }: Props) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed) return

    setLoading(true)
    setFeedback(null)

    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: trimmed }),
      })

      if (res.ok) {
        setFeedback({ type: "success", text: "Message sent successfully." })
        setMessage("")
      } else {
        const json = await res.json().catch(() => ({}))
        const errorText = json?.error?.message ?? "Failed to send message. Please try again."
        setFeedback({ type: "error", text: errorText })
      }
    } catch {
      setFeedback({ type: "error", text: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
          <MessageCircle size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">WhatsApp Messages</h3>
          <p className="text-xs text-gray-400">{formatPhoneDisplay(phone)}</p>
        </div>
      </div>

      {/* Error notice — shown without hiding the rest of the panel */}
      {initialError && (
        <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600">
            Could not load WhatsApp messages. Please refresh.
          </p>
        </div>
      )}

      {/* Message thread */}
      <div className="px-5 py-4 max-h-72 overflow-y-auto space-y-3">
        {initialMessages.length === 0 && !initialError ? (
          <p className="text-xs text-gray-400 text-center py-6">No WhatsApp messages found</p>
        ) : (
          initialMessages.map((msg) => {
            const isSent = msg.direction === "sent"
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isSent ? "items-end" : "items-start"}`}
              >
                {/* Direction badge + timestamp */}
                <div className="flex items-center gap-1.5">
                  {isSent ? (
                    <ArrowUpRight size={11} className="text-amber-600" />
                  ) : (
                    <ArrowDownLeft size={11} className="text-green-600" />
                  )}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      isSent ? "text-amber-600" : "text-green-600"
                    }`}
                  >
                    {isSent ? "Sent" : "Received"}
                  </span>
                  <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    isSent
                      ? "bg-amber-50 text-gray-800 border border-amber-100"
                      : "bg-gray-50 text-gray-800 border border-gray-100"
                  }`}
                >
                  {msg.body}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Reply area */}
      <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Reply</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Ctrl+Enter to send)"
            rows={3}
            disabled={loading}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 resize-none disabled:opacity-50"
          />
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
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            {feedback.text}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send size={14} />
          {loading ? "Sending…" : "Send"}
        </button>
      </div>
    </div>
  )
}
