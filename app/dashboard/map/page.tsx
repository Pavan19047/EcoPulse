import { createClient } from "@/lib/supabase/server"
import GlobalRiskMap from "@/components/visualization/global-risk-map"

export default async function MapPage() {
  const supabase = createClient()

  // Fetch forecast data for map visualization
  const { data: forecasts } = await supabase
    .from("disease_forecasts")
    .select(`
      *,
      diseases (
        id,
        name,
        category,
        transmission_mode
      )
    `)
    .order("forecast_date", { ascending: false })

  // Fetch climate data for overlay
  const { data: climateData } = await supabase
    .from("climate_data")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Global Risk Map</h1>
        <p className="text-gray-600">Interactive visualization of disease outbreak risks worldwide</p>
      </div>

      <GlobalRiskMap forecasts={forecasts || []} climateData={climateData || []} />
    </div>
  )
}
