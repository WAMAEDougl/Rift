"use client"

import { useEffect, useState } from "react"

export function useAdminRole() {
  const [role, setRole] = useState<"admin" | "kitchen" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.role) {
          setRole(json.data.role)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { role, loading, isKitchen: role === "kitchen", isAdmin: role === "admin" }
}
