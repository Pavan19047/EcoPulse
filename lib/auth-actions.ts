"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
        role: formData.get("role") as string,
        organization: formData.get("organization") as string,
        specialization: formData.get("specialization") as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error("Sign up error:", error)
    redirect("/auth/signup?error=Could not authenticate user")
  }

  revalidatePath("/", "layout")
  redirect("/auth/login?message=Check your email to confirm your account")
}

export async function signIn(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error("Sign in error:", error)
    redirect("/auth/login?error=Could not authenticate user")
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/auth/login")
}
