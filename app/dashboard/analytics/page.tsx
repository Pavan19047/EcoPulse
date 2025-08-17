import { createClient } from "@/lib/supabase/server"
import AnalyticsDashboard from "@/components/visualization/analytics-dashboard"

export const revalidate = 60

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch analytics data in parallel with selective columns and sensible limits
  const [forecastsRes, moleculesRes, evaluationsRes, projectsRes, usersRes] = await Promise.all([
    supabase.from("disease_forecasts").select("id,forecast_date,risk_level"),
    supabase.from("molecules").select("id,discovery_method").limit(500),
    supabase.from("drug_evaluations").select("id,evaluated_at,score,confidence,evaluation_type").limit(1000),
    supabase.from("research_projects").select("id,status").limit(500),
    supabase.from("users").select("role, created_at, organization").limit(2000),
  ])

  const forecasts = forecastsRes.data || []
  const molecules = moleculesRes.data || []
  const evaluations = evaluationsRes.data || []
  const projects = projectsRes.data || []
  const users = usersRes.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive platform analytics and insights</p>
      </div>

  <AnalyticsDashboard forecasts={forecasts} molecules={molecules} evaluations={evaluations} projects={projects} users={users} />
    </div>
  )
}
