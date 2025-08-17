// Utility functions for external API integrations

export interface WeatherData {
  location: string
  coordinates: { latitude: number; longitude: number }
  current: {
    temperature: number
    humidity: number
    precipitation: number
    windSpeed: number
    pressure: number
    uvIndex: number
  }
  forecast: Array<{
    date: string
    temperature: { min: number; max: number }
    humidity: number
    precipitation: number
    windSpeed: number
  }>
  timestamp: string
  source: string
}

export async function fetchWeatherData(location: string): Promise<WeatherData | null> {
  try {
    const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`)
    if (!response.ok) throw new Error("Weather API request failed")
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch weather data:", error)
    return null
  }
}

export async function syncClimateData(): Promise<any> {
  try {
    const response = await fetch("/api/sync/climate", { method: "POST" })
    if (!response.ok) throw new Error("Climate sync failed")
    return await response.json()
  } catch (error) {
    console.error("Failed to sync climate data:", error)
    throw error
  }
}

export async function generateForecast(params: {
  diseaseId: string
  location: string
  climateFactors?: any
}): Promise<any> {
  try {
    const response = await fetch("/api/forecasts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    })
    if (!response.ok) throw new Error("Forecast generation failed")
    return await response.json()
  } catch (error) {
    console.error("Failed to generate forecast:", error)
    throw error
  }
}

export async function exportData(dataType: string, format: "json" | "csv" = "json"): Promise<any> {
  try {
    const response = await fetch(`/api/export?type=${dataType}&format=${format}`)
    if (!response.ok) throw new Error("Data export failed")

    if (format === "csv") {
      return await response.blob()
    }
    return await response.json()
  } catch (error) {
    console.error("Failed to export data:", error)
    throw error
  }
}

export async function fetchRealtimeAlerts(): Promise<any> {
  try {
    const response = await fetch("/api/realtime/alerts")
    if (!response.ok) throw new Error("Failed to fetch alerts")
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch real-time alerts:", error)
    throw error
  }
}
