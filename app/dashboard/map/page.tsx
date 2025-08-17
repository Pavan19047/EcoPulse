import { createClient } from "@/lib/supabase/server"
import GlobalRiskMap from "@/components/visualization/global-risk-map"

export const revalidate = 60 // cache server-rendered map data for 1 minute to improve TTFB

export default async function MapPage() {
  const supabase = await createClient()

  const [forecastsRes, climateRes] = await Promise.all([
    // Only needed fields for map markers and popups
    supabase
      .from("disease_forecasts")
      .select(
        `id,disease_id,location,latitude,longitude,risk_level,confidence_score,predicted_cases,forecast_date,
         diseases (id,name,category,transmission_mode)`
      )
      .order("forecast_date", { ascending: false })
      .limit(200),

    supabase
      .from("climate_data")
      .select("id,location,temperature,humidity,precipitation,recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(200),
  ])

  const forecasts = forecastsRes.data || []
  const climateData = climateRes.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Global Risk Map</h1>
        <p className="text-gray-600">Interactive visualization of disease outbreak risks worldwide</p>
      </div>

  <GlobalRiskMap forecasts={forecasts} climateData={climateData} />
    </div>
  )
}
