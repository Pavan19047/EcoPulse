import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const body = await request.json()
    const { diseaseId, location, climateFactors } = body

    // Simulate AI model prediction
    const riskLevels = ["low", "medium", "high", "critical"]
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
    const confidenceScore = Math.random() * 0.4 + 0.6 // 0.6-1.0
    const predictedCases = Math.floor(Math.random() * 5000 + 100)

    // Get location coordinates (mock data)
    const locationCoords = {
      "Mumbai, India": { lat: 19.076, lon: 72.8777 },
      "Lagos, Nigeria": { lat: 6.5244, lon: 3.3792 },
      "Bangkok, Thailand": { lat: 13.7563, lon: 100.5018 },
    }

    const coords = locationCoords[location as keyof typeof locationCoords] || { lat: 0, lon: 0 }

    // Insert new forecast
    const { data, error } = await supabase.from("disease_forecasts").insert({
      disease_id: diseaseId,
      location,
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
