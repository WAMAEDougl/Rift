"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Leaf } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError("Invalid email or password.")
      setLoading(false)
      return
    }

    const res = await fetch("/api/admin/auth/me")
    if (res.status === 403) {
      await supabase.auth.signOut()
      setError("Access denied. Admin accounts only.")
      setLoading(false)
      return
    }

    window.location.href = "/admin"
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #78350F 0%, #92400E 50%, #B45309 100%)" }}>
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Ayola Foods
            </p>
            <p className="text-amber-300/60 text-[10px] uppercase tracking-widest">Kenya</p>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Eat Healthy.<br />Enjoy Life.
          </h1>
          <p className="text-amber-100/60 text-lg leading-relaxed max-w-sm">
            Kenya's first health-food restaurant and packaged products brand — formulated by a food scientist.
          </p>
        </div>

        <p className="text-amber-100/30 text-xs">
          Ayola Foods &copy; {new Date().getFullYear()} — Internal use only
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#faf7f2]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-900 font-bold" style={{ fontFamily: "var(--font-playfair, serif)" }}>
              Ayola Foods
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "var(--font-playfair, serif)" }}>
            Welcome back
          </h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="admin@ayolafoods.com"
                className="border-gray-200 focus-visible:ring-amber-600 focus-visible:ring-offset-0 h-11"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="••••••••"
                  className="border-gray-200 focus-visible:ring-amber-600 focus-visible:ring-offset-0 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-700 hover:bg-amber-800 text-white font-semibold mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-300 text-xs mt-8 lg:hidden">
            Ayola Foods &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}
