"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { X, Mail, Lock, Eye, EyeOff, User, Compass, AlertCircle } from "lucide-react"

type Mode = "signin" | "signup"

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  if (!open) return null

  const reset = () => {
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setShowPassword(false)
  }

  const switchMode = (m: Mode) => {
    reset()
    setMode(m)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      if (mode === "signup") {
        if (!name) {
          setError("Please enter your name")
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters")
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match")
          setLoading(false)
          return
        }
        const result = await signUp(name, email, password)
        if (!result.success) {
          setError(result.error || "Sign up failed")
          setLoading(false)
          return
        }
      } else {
        const result = await signIn(email, password)
        if (!result.success) {
          setError(result.error || "Sign in failed")
          setLoading(false)
          return
        }
      }

      setLoading(false)
      reset()
      onClose()
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#3B2314]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#FFF8F0] rounded-2xl shadow-2xl border border-[#D4C0AA] overflow-hidden">
        {/* Tricolor bar */}
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right, #FF9933, #FFFFFF, #138808)" }} />

        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5E6D3] text-[#8B6F5A] hover:bg-[#D4C0AA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#FF9933" }}>
              <Compass className="w-6 h-6 text-[#FFF8F0]" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#3B2314]">
                {mode === "signin" ? "Welcome back" : "Create an account"}
              </h3>
              <p className="text-xs text-[#8B6F5A]">
                {mode === "signin" ? "Sign in to plan your smart journey" : "Start planning your Incredible India trip"}
              </p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-xl bg-[#F5E6D3] p-1 mb-6">
            <button
              onClick={() => switchMode("signin")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "signin"
                  ? "bg-[#FFF8F0] text-[#3B2314] shadow-sm"
                  : "text-[#8B6F5A] hover:text-[#6B4423]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === "signup"
                  ? "bg-[#FFF8F0] text-[#3B2314] shadow-sm"
                  : "text-[#8B6F5A] hover:text-[#6B4423]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-[#6B4423] mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F5A]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D4C0AA] bg-[#FFF8F0] text-sm text-[#3B2314] placeholder:text-[#D4C0AA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#6B4423] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F5A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D4C0AA] bg-[#FFF8F0] text-sm text-[#3B2314] placeholder:text-[#D4C0AA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6B4423] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F5A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-[#D4C0AA] bg-[#FFF8F0] text-sm text-[#3B2314] placeholder:text-[#D4C0AA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B6F5A] hover:text-[#6B4423]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold text-[#6B4423] mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F5A]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#D4C0AA] bg-[#FFF8F0] text-sm text-[#3B2314] placeholder:text-[#D4C0AA] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/30 focus:border-[#FF9933] transition-all"
                  />
                </div>
              </div>
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-[#FF9933] font-medium hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-[#FFF8F0] font-semibold text-sm transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#6B4423" }}
            >
              {loading
                ? "Please wait..."
                : mode === "signin" ? "Sign In" : "Create Account"
              }
            </button>
          </form>

          {mode === "signin" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#D4C0AA]" />
                <span className="text-xs text-[#8B6F5A]">or</span>
                <div className="flex-1 h-px bg-[#D4C0AA]" />
              </div>
              <button className="w-full py-3 rounded-xl border border-[#D4C0AA] bg-[#FFF8F0] text-sm font-medium text-[#3B2314] flex items-center justify-center gap-2 hover:bg-[#F5E6D3] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
