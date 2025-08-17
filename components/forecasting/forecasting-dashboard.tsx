"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Search, Filter, Globe } from "lucide-react"
import ForecastCard from "./forecast-card"
import RiskMap from "./risk-map"
import ClimateChart from "./climate-chart"
import { cn } from "@/lib/utils"

interface ForecastingDashboardProps {
  forecasts: any[]
  climateData: any[]
  riskStats: Record<string, number>
}

export default function ForecastingDashboard({ forecasts, climateData, riskStats }: ForecastingDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [selectedDisease, setSelectedDisease] = useState<string>("all")

  // Filter forecasts based on search and filters
  const filteredForecasts = useMemo(() => {
    return forecasts.filter((forecast) => {
      const matchesSearch =
        forecast.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forecast.diseases?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRisk = selectedRisk === "all" || forecast.risk_level === selectedRisk
      const matchesDisease = selectedDisease === "all" || forecast.diseases?.name === selectedDisease

      return matchesSearch && matchesRisk && matchesDisease
    })
  }, [forecasts, searchTerm, selectedRisk, selectedDisease])

  // Get unique diseases for filter
  const uniqueDiseases = useMemo(() => {
    const diseases = forecasts.map((f) => f.diseases?.name).filter(Boolean)
    return [...new Set(diseases)]
  }, [forecasts])

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

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-200"
      case "high":
        return "text-orange-700 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-700 bg-green-50 border-green-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(riskStats).map(([risk, count]) => (
          <Card key={risk}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{risk} Risk</CardTitle>
              <div className={cn("w-3 h-3 rounded-full", getRiskColor(risk))} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">Active forecasts</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by location or disease..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedRisk} onValueChange={setSelectedRisk}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Disease Type" />
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
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="forecasts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecasts">Forecast List</TabsTrigger>
          <TabsTrigger value="map">Risk Map</TabsTrigger>
          <TabsTrigger value="climate">Climate Data</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Disease Forecasts ({filteredForecasts.length})</h3>
            <Button variant="outline" size="sm">
              <TrendingUp className="mr-2 h-4 w-4" />
              Generate New Forecast
            </Button>
          </div>

          {filteredForecasts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No forecasts found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredForecasts.map((forecast) => (
                <ForecastCard key={forecast.id} forecast={forecast} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <RiskMap forecasts={filteredForecasts} />
        </TabsContent>

        <TabsContent value="climate" className="space-y-4">
          <ClimateChart climateData={climateData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
