import { createClient } from "@/lib/supabase/server"
import AnalyticsDashboard from "@/components/visualization/analytics-dashboard"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Fetch comprehensive analytics data
  const { data: forecasts } = await supabase.from("disease_forecasts").select("*")
  const { data: molecules } = await supabase.from("molecules").select("*")
  const { data: evaluations } = await supabase.from("drug_evaluations").select("*")
  const { data: projects } = await supabase.from("research_projects").select("*")
  const { data: users } = await supabase.from("users").select("role, created_at, organization")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive platform analytics and insights</p>
      </div>

      <AnalyticsDashboard
        forecasts={forecasts || []}
        molecules={molecules || []}
        evaluations={evaluations || []}
        projects={projects || []}
        users={users || []}
      />
    </div>
  )
}
