"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Search, Filter, Globe } from "lucide-react"
import ForecastCard from "./forecast-card"
import { Button } from "@/components/ui/button"
import RiskMap from "./risk-map"
import ClimateChart from "./climate-chart"
import { cn } from "@/lib/utils"
import GenerateForecastModal from "../GenerateForecastModal" // <-- 1. Import the modal

interface ForecastingDashboardProps {
  forecasts: any[]
  climateData: any[]
  riskStats: Record<string, number>
}

export default function ForecastingDashboard({ forecasts, climateData, riskStats }: ForecastingDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [selectedDisease, setSelectedDisease] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- 2. Add state for the modal
  const [localForecasts, setLocalForecasts] = useState<any[]>(forecasts)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  const toggleSelected = (id: string | number, checked: boolean) => {
    setSelectedIds(prev => {
      const n = new Set(prev); checked ? n.add(id) : n.delete(id); return n;
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected forecast(s)? This cannot be undone.`)) return;
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map(id => fetch(`/api/forecasts/${id}`, { method: "DELETE" })))
      .then(() => {
        setLocalForecasts(prev => prev.filter(f => !selectedIds.has(f.id)))
        clearSelection()
      })
      .catch(() => {/* optional: toast handled per-item if desired */})
  }

  // Filter forecasts based on search and filters
  const filteredForecasts = useMemo(() => {
    return localForecasts.filter((forecast) => {
      const matchesSearch =
        forecast.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        forecast.diseases?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRisk = selectedRisk === "all" || forecast.risk_level === selectedRisk
      const matchesDisease = selectedDisease === "all" || forecast.diseases?.name === selectedDisease

      return matchesSearch && matchesRisk && matchesDisease
    })
  }, [localForecasts, searchTerm, selectedRisk, selectedDisease])

  // Get unique diseases for filter and modal
  const uniqueDiseases = useMemo(() => {
    const diseaseMap = new Map();
    localForecasts.forEach(f => {
      if (f.diseases && !diseaseMap.has(f.diseases.id)) {
        diseaseMap.set(f.diseases.id, f.diseases);
      }
    });
    return Array.from(diseaseMap.values());
  }, [localForecasts])

  const getRiskColor = (risk: string) => {
    // ... (rest of the function is unchanged)
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

  // ... (rest of the component is mostly unchanged)

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
                  <SelectItem key={disease.id} value={disease.name}>
                    {disease.name}
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
            {/* 3. Update the button to open the modal */}
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
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
            <>
              {selectedIds.size > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-md mb-2 bg-muted/30">
                  <div className="text-sm">{selectedIds.size} selected</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearSelection}>Clear</Button>
                    <Button variant="destructive" size="sm" onClick={bulkDelete}>Delete Selected</Button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredForecasts.map((forecast) => (
                  <div key={forecast.id ?? `${forecast.location}-${forecast.forecast_date}`} className="relative">
                    <label className="absolute left-2 top-2 z-10 bg-white/90 rounded p-1 border flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(forecast.id)}
                        onChange={(e) => toggleSelected(forecast.id, e.target.checked)}
                        aria-label="Select forecast"
                      />
                      Select
                    </label>
                    <ForecastCard
                      forecast={forecast}
                      onDelete={(id) => setLocalForecasts((prev) => prev.filter((f) => String(f.id) !== String(id)))}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <RiskMap forecasts={filteredForecasts} />
        </TabsContent>

        <TabsContent value="climate" className="space-y-4">
          <ClimateChart climateData={climateData} />
        </TabsContent>
      </Tabs>
      
      {/* 4. Add the modal component to the JSX */}
      <GenerateForecastModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        diseases={uniqueDiseases}
        onCreated={(row) => setLocalForecasts((prev) => [row, ...prev])}
      />
    </div>
  )
}