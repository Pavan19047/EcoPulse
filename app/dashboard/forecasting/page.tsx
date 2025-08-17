import { createClient } from "@/lib/supabase/server"
import ForecastingDashboard from "@/components/forecasting/forecasting-dashboard"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ForecastingPage() {
  const supabase = await createClient()

  // Fetch all data in parallel to reduce TTFB
  const [forecastsRes, climateRes, riskGroupedRes] = await Promise.all([
    // Disease forecasts with only the fields we actually render
    supabase
      .from("disease_forecasts")
      .select(
        `id,disease_id,location,latitude,longitude,risk_level,confidence_score,predicted_cases,forecast_date,climate_factors,model_version,
        diseases (id,name,category,transmission_mode)`
      )
      .order("forecast_date", { ascending: false })
      .limit(50),

    // Recent climate context
    supabase
      .from("climate_data")
      .select("id,location,temperature,humidity,precipitation,recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(20),

    // Grouped counts by risk level (much smaller payload than selecting all rows)
    // Supabase count per group: use aggregate with group by via RPC-like syntax is limited; fetch risk_level and aggregate client-side with head limit to reduce transfer
    supabase
      .from("disease_forecasts")
      .select("risk_level")
      .limit(1000),
  ])

  const forecasts = forecastsRes.data || []
  const climateData = climateRes.data || []
  const riskCounts = (riskGroupedRes.data || []).reduce((acc: Record<string, number>, row: any) => {
    const key = row.risk_level as string
    if (key) acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disease Forecasting</h1>
        <p className="text-gray-600">AI-powered disease outbreak predictions based on climate data</p>
      </div>

  <ForecastingDashboard forecasts={forecasts} climateData={climateData} riskStats={riskCounts} />
    </div>
  )
}
