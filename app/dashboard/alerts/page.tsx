import { createClient } from "@/lib/supabase/server"
import AlertsSystem from "@/components/visualization/alerts-system"

export default async function AlertsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user alerts
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  // Fetch critical forecasts for system alerts
  const { data: criticalForecasts } = await supabase
    .from("disease_forecasts")
    .select(`
      *,
      diseases (name, category)
    `)
    .in("risk_level", ["critical", "high"])
    .order("forecast_date", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Real-time Alerts</h1>
        <p className="text-gray-600">Disease outbreak warnings and system notifications</p>
      </div>

      <AlertsSystem alerts={alerts || []} criticalForecasts={criticalForecasts || []} />
    </div>
  )
}
