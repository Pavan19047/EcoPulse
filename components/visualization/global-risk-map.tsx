"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Map, Globe, Layers, Download, Thermometer, Droplets } from "lucide-react"

interface GlobalRiskMapProps {
  forecasts: any[]
  climateData: any[]
}

export default function GlobalRiskMap({ forecasts, climateData }: GlobalRiskMapProps) {
  const [selectedLayer, setSelectedLayer] = useState("risk")
  const [selectedDisease, setSelectedDisease] = useState("all")
  const [timeRange, setTimeRange] = useState("current")

  // Process data for map visualization
  const mapData = useMemo(() => {
    const locationData = forecasts.reduce(
      (acc, forecast) => {
        const location = forecast.location
        if (!acc[location]) {
          acc[location] = {
            location,
            latitude: forecast.latitude,
            longitude: forecast.longitude,
            forecasts: [],
            climate: climateData.find((c) => c.location === location),
          }
        }
        acc[location].forecasts.push(forecast)
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(locationData)
  }, [forecasts, climateData])

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

  const uniqueDiseases = [...new Set(forecasts.map((f) => f.diseases?.name).filter(Boolean))]

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5" />
            Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Select value={selectedLayer} onValueChange={setSelectedLayer}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Map Layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Disease Risk</SelectItem>
                <SelectItem value="climate">Climate Data</SelectItem>
                <SelectItem value="combined">Combined View</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Disease Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diseases</SelectItem>
                {uniqueDiseases.map((disease) => (
                  <SelectItem key={disease} value={disease}>
                    {disease}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="7days">Next 7 Days</SelectItem>
                <SelectItem value="30days">Next 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Interactive World Map
          </CardTitle>
          <CardDescription>Real-time disease risk visualization across global regions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for actual map implementation */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-8 gap-2 h-full">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="bg-blue-300 rounded"></div>
                ))}
              </div>
            </div>
            <div className="relative z-10">
              <Map className="mx-auto h-20 w-20 text-blue-400 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">Interactive Map Integration</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                This will display a fully interactive world map with real-time disease risk indicators, climate
                overlays, and detailed location information. Integration with mapping services like Mapbox or Google
                Maps will provide zoom, pan, and layer controls.
              </p>
              <div className="flex justify-center space-x-4">
                <Badge className="bg-red-100 text-red-800">Critical Risk Zones</Badge>
                <Badge className="bg-orange-100 text-orange-800">High Risk Areas</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Medium Risk Regions</Badge>
                <Badge className="bg-green-100 text-green-800">Low Risk Areas</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Data Grid */}
      <Tabs defaultValue="locations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="locations">Location Data</TabsTrigger>
          <TabsTrigger value="legend">Map Legend</TabsTrigger>
        </TabsList>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment by Location</CardTitle>
              <CardDescription>Detailed breakdown of disease risks across monitored regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mapData.map((location: any) => {
                  const highestRisk = getHighestRisk(location.forecasts)
                  const totalCases = location.forecasts.reduce(
                    (sum: number, f: any) => sum + (f.predicted_cases || 0),
                    0,
                  )

                  return (
                    <div key={location.location} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{location.location}</h4>
                          <p className="text-sm text-gray-500">
                            {location.latitude?.toFixed(2)}, {location.longitude?.toFixed(2)}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getRiskColor(highestRisk)}`} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Risk Level:</span>
                          <Badge className={`capitalize ${getRiskColor(highestRisk)} text-white`}>{highestRisk}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Predicted Cases:</span>
                          <span className="font-medium">{totalCases.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Forecasts:</span>
                          <span className="font-medium">{location.forecasts.length}</span>
                        </div>
                      </div>

                      {location.climate && (
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                              <Thermometer className="h-3 w-3 text-red-500 mr-1" />
                              <span>Temp</span>
                            </div>
                            <span>{location.climate.temperature}°C</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                              <Droplets className="h-3 w-3 text-blue-500 mr-1" />
                              <span>Humidity</span>
                            </div>
                            <span>{location.climate.humidity}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Map Legend & Information</CardTitle>
              <CardDescription>Understanding the map symbols and data visualization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Risk Level Indicators</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Critical Risk - Immediate action required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">High Risk - Enhanced monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Medium Risk - Standard precautions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Low Risk - Routine surveillance</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Climate Data Overlays</h4>
                <div className="space-y-2 text-sm">
                  <p>• Temperature gradients show regional climate patterns</p>
                  <p>• Humidity levels indicate vector breeding conditions</p>
                  <p>• Precipitation data reveals flood and drought risks</p>
                  <p>• Wind patterns affect disease transmission routes</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Data Sources</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Disease forecasts: AI prediction models</p>
                  <p>• Climate data: Weather monitoring stations</p>
                  <p>• Geographic coordinates: GPS positioning</p>
                  <p>• Risk assessments: Multi-factor analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
