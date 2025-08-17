import { createClient } from "@/lib/supabase/server"
import ForecastingDashboard from "@/components/forecasting/forecasting-dashboard"

export default async function ForecastingPage() {
  const supabase = createClient()

  // Fetch disease forecasts with related data
  const { data: forecasts } = await supabase
    .from("disease_forecasts")
    .select(`
      *,
      diseases (
        id,
        name,
        category,
        symptoms,
        transmission_mode
      )
    `)
    .order("forecast_date", { ascending: false })
    .limit(50)

  // Fetch climate data for context
  const { data: climateData } = await supabase
    .from("climate_data")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(20)

  // Get summary statistics
  const { data: riskStats } = await supabase.from("disease_forecasts").select("risk_level")

  const riskCounts =
    riskStats?.reduce(
      (acc, forecast) => {
        acc[forecast.risk_level] = (acc[forecast.risk_level] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Disease Forecasting</h1>
        <p className="text-gray-600">AI-powered disease outbreak predictions based on climate data</p>
      </div>

      <ForecastingDashboard forecasts={forecasts || []} climateData={climateData || []} riskStats={riskCounts} />
    </div>
  )
}
