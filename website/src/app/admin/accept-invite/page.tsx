"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Leaf, CheckCircle2 } from "lucide-react"

export default function AcceptInvitePage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push("/admin"), 2000)
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
          <h1 className="text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "var(--font-playfair, serif)" }}>
            You're almost in.
          </h1>
          <p className="text-amber-100/60 text-lg leading-relaxed max-w-sm">
            Set a secure password to activate your admin account and get started.
          </p>
        </div>

        <p className="text-amber-100/30 text-xs">
          Ayola Foods &copy; {new Date().getFullYear()} — Internal use only
        </p>
      </div>

      {/* Right — form */}
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

          {done ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-playfair, serif)" }}>
                Password set!
              </h2>
              <p className="text-gray-400 text-sm">Redirecting you to the dashboard…</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: "var(--font-playfair, serif)" }}>
                Set your password
              </h2>
              <p className="text-gray-400 text-sm mb-8">
                {userEmail ? (
                  <>Creating account for <span className="text-gray-600 font-medium">{userEmail}</span></>
                ) : (
                  "Create a password to activate your account."
                )}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Min. 8 characters"
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

                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Repeat your password"
                      className="border-gray-200 focus-visible:ring-amber-600 focus-visible:ring-offset-0 h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
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
                      Saving…
                    </span>
                  ) : "Set Password & Continue"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
