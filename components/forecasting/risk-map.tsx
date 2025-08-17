"use client"

import "maplibre-gl/dist/maplibre-gl.css"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map } from "lucide-react"
import { MapboxOverlay } from "@/components/map/MapboxOverlay"

const ReactMapGL = dynamic(() => import("react-map-gl/maplibre").then((m) => m.default), { ssr: false })

interface RiskMapProps {
  forecasts: any[]
}

export default function RiskMap({ forecasts }: RiskMapProps) {
  // Group forecasts by location for the summary below the map
  const locationGroups = forecasts.reduce(
    (acc, forecast) => {
      const location = forecast.location
      if (!acc[location]) acc[location] = []
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

  const getHighestRisk = (arr: any[]) => {
    const riskLevels = { critical: 4, high: 3, medium: 2, low: 1 }
    return arr.reduce((highest, f) => {
      const cl = riskLevels[f.risk_level as keyof typeof riskLevels] || 0
      const hl = riskLevels[highest as keyof typeof riskLevels] || 0
      return cl > hl ? f.risk_level : highest
    }, "low")
  }

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
  const mapStyle = maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
    : undefined

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
          {!mapStyle ? (
            <div className="bg-blue-50 rounded-lg p-6 text-center text-blue-800">
              Set NEXT_PUBLIC_MAPTILER_KEY in .env.local to enable the map.
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border">
              <ReactMapGL
                initialViewState={{ latitude: 20, longitude: 0, zoom: 1.5 }}
                mapStyle={mapStyle}
                style={{ width: "100%", height: 420 }}
              >
                <MapboxOverlay forecasts={forecasts} showRiskLayer={true} />
              </ReactMapGL>
            </div>
          )}
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
            {(Object.entries(locationGroups) as Array<[string, any[]]>).map(([location, locationForecasts]) => {
              const highestRisk = getHighestRisk(locationForecasts)
              const totalCases = locationForecasts.reduce((sum: number, f: any) => sum + (f.predicted_cases || 0), 0)

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
