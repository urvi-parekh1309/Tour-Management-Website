import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
  }

  return NextResponse.json({
    message: "Login successful",
    user: {
      id: data.user?.id,
      email: data.user?.email,
      fullName: data.user?.user_metadata?.full_name || "",
    },
  })
}
