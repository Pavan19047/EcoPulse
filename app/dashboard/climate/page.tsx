import { createClient } from "@/lib/supabase/server"
import ClimateVisualization from "@/components/visualization/climate-visualization"

export const revalidate = 60

export default async function ClimatePage() {
  const supabase = await createClient()

  const [climateRes, statsRes] = await Promise.all([
    supabase
      .from("climate_data")
      .select("id,location,temperature,humidity,precipitation,wind_speed,recorded_at")
      .order("recorded_at", { ascending: false })
      .limit(500),

    supabase
      .from("climate_data")
      .select("location, temperature, humidity, precipitation, wind_speed")
      .limit(5000),
  ])

  const climateData = climateRes.data || []
  const locationStats = statsRes.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Climate Data</h1>
        <p className="text-gray-600">Environmental monitoring and climate pattern analysis</p>
      </div>

  <ClimateVisualization climateData={climateData} locationStats={locationStats} />
    </div>
  )
}
