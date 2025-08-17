import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardOverview from "@/components/dashboard/dashboard-overview"

export const revalidate = 30

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile data
  const { data: profile } = await supabase.from("users").select("*").eq("email", user.email).single()

  return <DashboardOverview user={user} profile={profile} />
}
