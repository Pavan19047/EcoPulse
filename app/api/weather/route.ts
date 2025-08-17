import { type NextRequest, NextResponse } from "next/server"

// Mock weather API integration - in production, this would connect to real weather services
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!location && (!lat || !lon)) {
    return NextResponse.json({ error: "Location or coordinates required" }, { status: 400 })
  }

  try {
    // Simulate external weather API call
    const mockWeatherData = {
      location: location || `${lat}, ${lon}`,
      coordinates: {
        latitude: lat ? Number.parseFloat(lat) : Math.random() * 180 - 90,
        longitude: lon ? Number.parseFloat(lon) : Math.random() * 360 - 180,
      },
      current: {
        temperature: Math.round(Math.random() * 40 + 10), // 10-50°C
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        precipitation: Math.round(Math.random() * 20), // 0-20mm
        windSpeed: Math.round(Math.random() * 30 + 5), // 5-35 km/h
        pressure: Math.round(Math.random() * 100 + 950), // 950-1050 hPa
        uvIndex: Math.round(Math.random() * 11), // 0-11
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        temperature: {
          min: Math.round(Math.random() * 20 + 15),
          max: Math.round(Math.random() * 20 + 25),
        },
        humidity: Math.round(Math.random() * 40 + 40),
        precipitation: Math.round(Math.random() * 15),
        windSpeed: Math.round(Math.random() * 25 + 5),
      })),
      timestamp: new Date().toISOString(),
      source: "OpenWeatherMap API",
    }

    return NextResponse.json(mockWeatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
