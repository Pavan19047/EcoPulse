"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map, Globe } from "lucide-react"

interface RiskMapProps {
  forecasts: any[]
}

export default function RiskMap({ forecasts }: RiskMapProps) {
  // Group forecasts by location for the map view
  const locationGroups = forecasts.reduce(
    (acc, forecast) => {
      const location = forecast.location
      if (!acc[location]) {
        acc[location] = []
      }
      acc[location].push(forecast)
      return acc
    },
    {} as Record<string, any[]>,
  )

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getHighestRisk = (forecasts: any[]) => {
    const riskLevels = { critical: 4, high: 3, medium: 2, low: 1 }
    return forecasts.reduce((highest, forecast) => {
      const currentLevel = riskLevels[forecast.risk_level as keyof typeof riskLevels] || 0
      const highestLevel = riskLevels[highest as keyof typeof riskLevels] || 0
      return currentLevel > highestLevel ? forecast.risk_level : highest
    }, "low")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="mr-2 h-5 w-5" />
            Global Risk Map
          </CardTitle>
          <CardDescription>Interactive visualization of disease outbreak risks worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for actual map implementation */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
            <Globe className="mx-auto h-16 w-16 text-blue-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              This will display an interactive world map with risk indicators and real-time data visualization.
            </p>
            <p className="text-sm text-gray-500">
              Integration with mapping services like Mapbox or Google Maps will be implemented in the next phase.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location-based Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Summary by Location</CardTitle>
          <CardDescription>Current risk levels across monitored regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(locationGroups).map(([location, locationForecasts]) => {
              const highestRisk = getHighestRisk(locationForecasts)
              const totalCases = locationForecasts.reduce((sum, f) => sum + (f.predicted_cases || 0), 0)

              return (
                <div key={location} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getRiskColor(highestRisk)}`} />
                    <div>
                      <h4 className="font-medium">{location}</h4>
                      <p className="text-sm text-gray-500">
                        {locationForecasts.length} active forecast{locationForecasts.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`capitalize ${
                        highestRisk === "critical"
                          ? "bg-red-100 text-red-800"
                          : highestRisk === "high"
                            ? "bg-orange-100 text-orange-800"
                            : highestRisk === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                      }`}
                    >
                      {highestRisk} Risk
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">{totalCases.toLocaleString()} predicted cases</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
