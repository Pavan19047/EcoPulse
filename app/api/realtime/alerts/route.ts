import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    // Get recent critical forecasts for real-time alerts
    const { data: criticalForecasts } = await supabase
      .from("disease_forecasts")
      .select(`
        *,
        diseases (name, category)
      `)
      .in("risk_level", ["critical", "high"])
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order("created_at", { ascending: false })

    // Generate real-time alerts
    const alerts = criticalForecasts?.map((forecast) => ({
      id: `alert-${forecast.id}`,
      type: "disease_outbreak",
      severity: forecast.risk_level === "critical" ? "critical" : "warning",
      title: `${forecast.risk_level.toUpperCase()} Risk Alert - ${forecast.diseases?.name}`,
      message: `High probability outbreak forecast for ${forecast.location}. Predicted cases: ${forecast.predicted_cases?.toLocaleString()}`,
      location: forecast.location,
      timestamp: forecast.created_at,
      forecastId: forecast.id,
      confidence: forecast.confidence_score,
    }))

    // Check for climate anomalies
    const { data: recentClimate } = await supabase
      .from("climate_data")
      .select("*")
      .gte("recorded_at", new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()) // Last 6 hours
      .order("recorded_at", { ascending: false })

    const climateAlerts = recentClimate
      ?.filter((data) => data.temperature > 40 || data.humidity > 90 || data.precipitation > 50)
      .map((data) => ({
        id: `climate-${data.id}`,
        type: "climate_anomaly",
        severity: "warning",
        title: "Climate Anomaly Detected",
        message: `Unusual weather conditions in ${data.location}: ${
          data.temperature > 40 ? `High temperature (${data.temperature}°C)` : ""
        }${data.humidity > 90 ? ` High humidity (${data.humidity}%)` : ""}${
          data.precipitation > 50 ? ` Heavy precipitation (${data.precipitation}mm)` : ""
        }`,
        location: data.location,
        timestamp: data.recorded_at,
        climateData: {
          temperature: data.temperature,
          humidity: data.humidity,
          precipitation: data.precipitation,
        },
      }))

    const allAlerts = [...(alerts || []), ...(climateAlerts || [])]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20) // Limit to 20 most recent alerts

    return NextResponse.json({
      alerts: allAlerts,
      timestamp: new Date().toISOString(),
      count: allAlerts.length,
    })
  } catch (error) {
    console.error("Real-time alerts error:", error)
    return NextResponse.json({ error: "Failed to fetch real-time alerts" }, { status: 500 })
  }
}
