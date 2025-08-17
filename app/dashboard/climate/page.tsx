import { createClient } from "@/lib/supabase/server"
import ClimateVisualization from "@/components/visualization/climate-visualization"

export default async function ClimatePage() {
  const supabase = createClient()

  // Fetch comprehensive climate data
  const { data: climateData } = await supabase
    .from("climate_data")
    .select("*")
    .order("recorded_at", { ascending: false })
    .limit(500)

  // Get location-based statistics
  const { data: locationStats } = await supabase
    .from("climate_data")
    .select("location, temperature, humidity, precipitation, wind_speed")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Climate Data</h1>
        <p className="text-gray-600">Environmental monitoring and climate pattern analysis</p>
      </div>

      <ClimateVisualization climateData={climateData || []} locationStats={locationStats || []} />
    </div>
  )
}
