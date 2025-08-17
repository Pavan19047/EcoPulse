import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  try {
    // Simulate fetching data from multiple weather stations
    const weatherStations = [
      { name: "Mumbai, India", lat: 19.076, lon: 72.8777 },
      { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792 },
      { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018 },
      { name: "São Paulo, Brazil", lat: -23.5505, lon: -46.6333 },
      { name: "Nairobi, Kenya", lat: -1.2921, lon: 36.8219 },
    ]

    const syncResults = []

    for (const station of weatherStations) {
      // Fetch weather data for each station
      const weatherResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/weather?lat=${station.lat}&lon=${station.lon}`,
      )
      const weatherData = await weatherResponse.json()

      if (weatherData.current) {
        // Insert new climate data record
        const { data, error } = await supabase.from("climate_data").insert({
          location: station.name,
          latitude: station.lat,
          longitude: station.lon,
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          precipitation: weatherData.current.precipitation,
          wind_speed: weatherData.current.windSpeed,
          recorded_at: new Date().toISOString(),
          data_source: "weather_api_sync",
        })

        if (error) {
          console.error(`Error inserting climate data for ${station.name}:`, error)
          syncResults.push({ station: station.name, status: "error", error: error.message })
        } else {
          syncResults.push({ station: station.name, status: "success", recordsInserted: 1 })
        }
      }
    }

    return NextResponse.json({
      message: "Climate data sync completed",
      results: syncResults,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Climate sync error:", error)
    return NextResponse.json({ error: "Failed to sync climate data" }, { status: 500 })
  }
}
