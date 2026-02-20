"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function mapSupabaseUser(su: SupabaseUser | null): User | null {
  if (!su) return null
  return {
    name: su.user_metadata?.full_name || su.email?.split("@")[0] || "Traveler",
    email: su.email || "",
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getUser().then(({ data: { user: su } }) => {
      setUser(mapSupabaseUser(su))
      setIsLoading(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return { success: false, error: error.message }
      }
      const { data: { user: su } } = await supabase.auth.getUser()
      setUser(mapSupabaseUser(su))
      return { success: true }
    } catch {
      return { success: false, error: "Something went wrong" }
    }
  }, [supabase])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/`,
          data: {
            full_name: name,
          },
        },
      })
      if (error) {
        return { success: false, error: error.message }
      }
      // If email confirmation is required, user won't be auto-signed in
      // but we can still show them as signed in from the response
      if (data.user) {
        setUser({ name, email: data.user.email || email })
      }
      return { success: true }
    } catch {
      return { success: false, error: "Something went wrong" }
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
