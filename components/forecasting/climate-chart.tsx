"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Thermometer, Droplets, Wind, Cloud } from "lucide-react"

interface ClimateChartProps {
  climateData: any[]
}

export default function ClimateChart({ climateData }: ClimateChartProps) {
  // Process climate data for charts
  const chartData = climateData
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((data) => ({
      date: new Date(data.recorded_at).toLocaleDateString(),
      temperature: data.temperature,
      humidity: data.humidity,
      precipitation: data.precipitation,
      windSpeed: data.wind_speed,
      location: data.location,
    }))

  // Get latest readings for summary cards
  const latestData = climateData[0] || {}

  const summaryCards = [
    {
      title: "Temperature",
      value: `${latestData.temperature || 0}°C`,
      icon: Thermometer,
      color: "text-red-500",
    },
    {
      title: "Humidity",
      value: `${latestData.humidity || 0}%`,
      icon: Droplets,
      color: "text-blue-500",
    },
    {
      title: "Precipitation",
      value: `${latestData.precipitation || 0}mm`,
      icon: Cloud,
      color: "text-cyan-500",
    },
    {
      title: "Wind Speed",
      value: `${latestData.wind_speed || 0} km/h`,
      icon: Wind,
      color: "text-gray-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Climate Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">Latest reading</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Climate Data Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Climate Data Trends</CardTitle>
          <CardDescription>Historical climate patterns affecting disease transmission</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="temperature" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="humidity">Humidity</TabsTrigger>
              <TabsTrigger value="precipitation">Precipitation</TabsTrigger>
              <TabsTrigger value="wind">Wind Speed</TabsTrigger>
            </TabsList>

            <TabsContent value="temperature" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="humidity" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="precipitation" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="precipitation" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="wind" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="windSpeed"
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={{ fill: "#6b7280" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
