"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface Props {
  customerId: string
  currentRole: string
  customerName: string
}

export default function RoleChangeControl({ customerId, currentRole, customerName }: Props) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState(currentRole)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleUpdateClick = () => {
    if (selectedRole === currentRole) return
    if (selectedRole === "admin") {
      setShowConfirm(true)
    } else {
      submitRoleChange()
    }
  }

  const submitRoleChange = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/customers/${customerId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      })
      setShowConfirm(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
        >
          <option value="customer">Customer</option>
          <option value="kitchen">Kitchen</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleUpdateClick}
          disabled={selectedRole === currentRole || loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md px-4 py-2 text-sm font-medium"
        >
          Update Role
        </button>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant admin access?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to give <strong>{customerName}</strong> admin access? They will
            have full access to the admin dashboard.
          </p>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={submitRoleChange}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Updating..." : "Yes, grant admin access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
