"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from "recharts"
import { Thermometer, Droplets, Wind, Cloud, TrendingUp, MapPin } from "lucide-react"

interface ClimateVisualizationProps {
  climateData: any[]
  locationStats: any[]
}

export default function ClimateVisualization({ climateData, locationStats }: ClimateVisualizationProps) {
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [timeRange, setTimeRange] = useState("30days")

  // Process climate data for visualization
  const processedData = useMemo(() => {
    // Filter by location if selected
    const filteredData =
      selectedLocation === "all" ? climateData : climateData.filter((data) => data.location === selectedLocation)

    // Sort by date and format for charts
    const timeSeriesData = filteredData
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map((data) => ({
        date: new Date(data.recorded_at).toLocaleDateString(),
        temperature: data.temperature,
        humidity: data.humidity,
        precipitation: data.precipitation,
        windSpeed: data.wind_speed,
        location: data.location,
      }))

    // Calculate averages by location
    const locationAverages = locationStats.reduce(
      (acc, data) => {
        if (!acc[data.location]) {
          acc[data.location] = {
            location: data.location,
            temperature: [],
            humidity: [],
            precipitation: [],
            windSpeed: [],
          }
        }
        acc[data.location].temperature.push(data.temperature)
        acc[data.location].humidity.push(data.humidity)
        acc[data.location].precipitation.push(data.precipitation)
        acc[data.location].windSpeed.push(data.wind_speed)
        return acc
      },
      {} as Record<string, any>,
    )

    const locationSummary = Object.entries(locationAverages).map(([location, data]) => ({
      location,
      avgTemperature: (
        data.temperature.reduce((sum: number, val: number) => sum + val, 0) / data.temperature.length
      ).toFixed(1),
      avgHumidity: (data.humidity.reduce((sum: number, val: number) => sum + val, 0) / data.humidity.length).toFixed(1),
      avgPrecipitation: (
        data.precipitation.reduce((sum: number, val: number) => sum + val, 0) / data.precipitation.length
      ).toFixed(1),
      avgWindSpeed: (data.windSpeed.reduce((sum: number, val: number) => sum + val, 0) / data.windSpeed.length).toFixed(
        1,
      ),
      dataPoints: data.temperature.length,
    }))

    return { timeSeriesData, locationSummary }
  }, [climateData, locationStats, selectedLocation])

  const uniqueLocations = [...new Set(climateData.map((data) => data.location))]

  // Calculate current conditions
  const latestData = climateData[0] || {}
  const currentConditions = [
    {
      title: "Temperature",
      value: `${latestData.temperature || 0}°C`,
      icon: Thermometer,
      color: "text-red-500",
      trend: "+2.3°C",
    },
    {
      title: "Humidity",
      value: `${latestData.humidity || 0}%`,
      icon: Droplets,
      color: "text-blue-500",
      trend: "-1.2%",
    },
    {
      title: "Precipitation",
      value: `${latestData.precipitation || 0}mm`,
      icon: Cloud,
      color: "text-cyan-500",
      trend: "+5.7mm",
    },
    {
      title: "Wind Speed",
      value: `${latestData.wind_speed || 0} km/h`,
      icon: Wind,
      color: "text-gray-500",
      trend: "-0.8 km/h",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Current Conditions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {currentConditions.map((condition) => (
          <Card key={condition.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{condition.title}</CardTitle>
              <condition.icon className={`h-4 w-4 ${condition.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{condition.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{condition.trend}</span> from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Climate Data Visualization */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Climate Trends</TabsTrigger>
          <TabsTrigger value="comparison">Location Comparison</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Temperature & Humidity</CardTitle>
                <CardDescription>Temperature and humidity trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={processedData.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="temp" />
                      <YAxis yAxisId="humidity" orientation="right" />
                      <Tooltip />
                      <Area yAxisId="humidity" type="monotone" dataKey="humidity" fill="#3b82f6" fillOpacity={0.3} />
                      <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precipitation & Wind</CardTitle>
                <CardDescription>Precipitation and wind speed patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={processedData.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="precip" />
                      <YAxis yAxisId="wind" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="precip" dataKey="precipitation" fill="#06b6d4" />
                      <Line yAxisId="wind" type="monotone" dataKey="windSpeed" stroke="#6b7280" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Averages</CardTitle>
              <CardDescription>Climate averages across different monitoring locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Location</th>
                      <th className="text-right py-2">Avg Temp (°C)</th>
                      <th className="text-right py-2">Avg Humidity (%)</th>
                      <th className="text-right py-2">Avg Precipitation (mm)</th>
                      <th className="text-right py-2">Avg Wind (km/h)</th>
                      <th className="text-right py-2">Data Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.locationSummary.map((location) => (
                      <tr key={location.location} className="border-b">
                        <td className="py-2 font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {location.location}
                        </td>
                        <td className="text-right py-2">{location.avgTemperature}</td>
                        <td className="text-right py-2">{location.avgHumidity}</td>
                        <td className="text-right py-2">{location.avgPrecipitation}</td>
                        <td className="text-right py-2">{location.avgWindSpeed}</td>
                        <td className="text-right py-2">{location.dataPoints}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Climate Pattern Analysis
              </CardTitle>
              <CardDescription>Advanced pattern recognition and climate modeling insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Temperature Patterns</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Rising temperature trends observed in tropical regions correlate with increased vector activity.
                    </p>
                    <div className="text-xs text-gray-500">Confidence: 87%</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Humidity Cycles</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Seasonal humidity patterns show strong correlation with disease outbreak timing.
                    </p>
                    <div className="text-xs text-gray-500">Confidence: 92%</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Precipitation Events</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Heavy rainfall events create breeding conditions for disease vectors within 7-14 days.
                    </p>
                    <div className="text-xs text-gray-500">Confidence: 78%</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Wind Patterns</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Wind direction changes affect disease transmission routes and vector migration.
                    </p>
                    <div className="text-xs text-gray-500">Confidence: 65%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
