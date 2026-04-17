"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MessageCircle, Send, AlertCircle, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react"
import { formatPhoneDisplay } from "@/lib/utils/validation"

interface Message {
  id: string
  body: string
  direction: "sent" | "received"
  timestamp: string
}

interface Props {
  initialMessages: Message[]
  initialError: string | null
  phone: string
  orderId: string
}

export function WhatsAppPanel({ initialMessages, initialError, phone, orderId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [polling, setPolling] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages])

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setPolling(true)
    try {
      const res = await fetch(`/api/admin/whatsapp/messages?order_id=${orderId}`)
      if (res.ok) {
        const json = await res.json()
        setMessages(json.data?.messages ?? [])
      }
    } catch {
      // silently ignore poll errors
    } finally {
      if (!silent) setPolling(false)
    }
  }, [orderId])

  // Poll every 8 seconds for new inbound messages
  useEffect(() => {
    pollRef.current = setInterval(() => fetchMessages(true), 8000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchMessages])

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed) return

    setLoading(true)
    setFeedback(null)

    // Optimistically add the sent message to the thread immediately
    const optimisticMsg: Message = {
      id: `optimistic-${Date.now()}`,
      body: trimmed,
      direction: "sent",
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setMessage("")

    try {
      const res = await fetch("/api/admin/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message: trimmed, order_id: orderId }),
      })

      if (res.ok) {
        setFeedback({ type: "success", text: "Message sent." })
        // Refresh to replace optimistic message with real one from DB
        setTimeout(() => fetchMessages(true), 1000)
      } else {
        const json = await res.json().catch(() => ({}))
        const errorText = json?.error?.message ?? "Failed to send message. Please try again."
        setFeedback({ type: "error", text: errorText })
        // Remove the optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
        setMessage(trimmed) // restore input
      }
    } catch {
      setFeedback({ type: "error", text: "An error occurred. Please try again." })
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id))
      setMessage(trimmed)
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

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ts
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <MessageCircle size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">WhatsApp</h3>
            <p className="text-xs text-gray-400">{formatPhoneDisplay(phone)}</p>
          </div>
        </div>
        <button
          onClick={() => fetchMessages(false)}
          disabled={polling}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          title="Refresh messages"
        >
          <RefreshCw size={14} className={polling ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Error notice */}
      {initialError && (
        <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600">Could not load messages. Use the refresh button above.</p>
        </div>
      )}

      {/* Message thread */}
      <div ref={threadRef} className="px-5 py-4 h-64 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            No messages yet — waiting for customer reply
          </p>
        ) : (
          messages.map((msg) => {
            const isSent = msg.direction === "sent"
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1 ${isSent ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5">
                  {isSent ? (
                    <ArrowUpRight size={11} className="text-amber-600" />
                  ) : (
                    <ArrowDownLeft size={11} className="text-green-600" />
                  )}
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSent ? "text-amber-600" : "text-green-600"}`}>
                    {isSent ? "You" : "Customer"}
                  </span>
                  <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                </div>
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  isSent
                    ? "bg-amber-50 text-gray-800 border border-amber-100"
                    : "bg-gray-50 text-gray-800 border border-gray-100"
                }`}>
                  {msg.body}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Reply area */}
      <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a reply… (Ctrl+Enter to send)"
          rows={2}
          disabled={loading}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600/40 resize-none disabled:opacity-50"
        />

        {feedback && (
          <div className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs ${
            feedback.type === "success"
              ? "bg-green-50 border border-green-100 text-green-700"
              : "bg-red-50 border border-red-100 text-red-600"
          }`}>
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
