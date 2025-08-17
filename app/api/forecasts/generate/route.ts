import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { diseaseId, location, climateFactors } = body

    // Try to geocode the location using MapTiler for accurate coordinates
    async function geocode(q: string): Promise<{ lat: number; lon: number; label: string } | null> {
      try {
        const key = process.env.NEXT_PUBLIC_MAPTILER_KEY
        if (!key) return null
        const res = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${key}&limit=1`,
          { cache: "no-store" },
        )
        if (!res.ok) return null
        const data = await res.json()
        const feature = data?.features?.[0]
        if (!feature?.center || feature.center.length < 2) return null
        const lon = Number(feature.center[0])
        const lat = Number(feature.center[1])
        const label =
          feature.place_name ||
          feature.text ||
          feature?.properties?.name ||
          (Array.isArray(feature?.place_name_en) ? feature.place_name_en[0] : feature?.place_name_en) ||
          q
        if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon, label }
        return null
      } catch {
        return null
      }
    }

    // Simulate AI model prediction
    const riskLevels = ["low", "medium", "high", "critical"]
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
    const confidenceScore = Math.random() * 0.4 + 0.6 // 0.6-1.0
    const predictedCases = Math.floor(Math.random() * 5000 + 100)

    // Determine coordinates
    const geo = await geocode(location)
    const coords = geo ? { lat: geo.lat, lon: geo.lon } : { lat: 0, lon: 0 }
    const normalizedLocation = geo?.label || location

    // Insert new forecast
  const { data, error } = await supabase
      .from("disease_forecasts")
      .insert({
      disease_id: diseaseId,
      location: normalizedLocation,
      latitude: coords.lat,
      longitude: coords.lon,
      risk_level: riskLevel,
      confidence_score: confidenceScore,
      predicted_cases: predictedCases,
      forecast_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
      climate_factors: climateFactors || {
        temperature: Math.random() * 20 + 20,
        humidity: Math.random() * 40 + 40,
        precipitation: Math.random() * 20,
      },
      model_version: "v2.1.0",
    })
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

    if (error) {
      console.error("Error generating forecast:", error)
      return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Forecast generated successfully",
      forecast: data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Forecast generation error:", error)
    return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 })
  }
}
