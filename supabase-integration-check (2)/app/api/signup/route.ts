import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const { fullName, email, password } = await request.json()

  if (!fullName || !email || !password) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${request.nextUrl.origin}/`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  return NextResponse.json({
    message: "Signup successful",
    user: {
      id: data.user?.id,
      email: data.user?.email,
      fullName: data.user?.user_metadata?.full_name || fullName,
    },
  })
}
