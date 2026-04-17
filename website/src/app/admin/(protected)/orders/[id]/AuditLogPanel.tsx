"use client"

import { ClipboardList } from "lucide-react"
import { formatDate } from "@/lib/admin/formatters"
import type { OrderAuditLogEntry } from "@/lib/admin/types"

interface Props {
  entries: OrderAuditLogEntry[]
}

export function AuditLogPanel({ entries }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
          <ClipboardList size={16} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Delivery Fee Audit Log</h3>
          <p className="text-xs text-gray-400">Authorization history</p>
        </div>
      </div>

      <div className="px-5 py-5">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No delivery fee authorization on record
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">
                    KES {entry.delivery_fee.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Authorized by{" "}
                  <span className="font-medium text-gray-700">
                    {entry.authorized_by_name}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
