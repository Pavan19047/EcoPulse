"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar, TrendingUp, Thermometer, Droplets, AlertTriangle, Users, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForecastCardProps {
  forecast: any
}

export default function ForecastCard({ forecast }: ForecastCardProps) {
  const getRiskColor = (risk: string) => {
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

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const confidencePercentage = Math.round((forecast.confidence_score || 0) * 100)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{forecast.diseases?.name || "Unknown Disease"}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {forecast.location}
            </CardDescription>
          </div>
          <Badge className={cn("border", getRiskColor(forecast.risk_level))}>
            {getRiskIcon(forecast.risk_level)}
            <span className="ml-1 capitalize">{forecast.risk_level}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Forecast Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Forecast Date</span>
          </div>
          <div className="font-medium">{new Date(forecast.forecast_date).toLocaleDateString()}</div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Predicted Cases</span>
          </div>
          <div className="font-medium">{forecast.predicted_cases?.toLocaleString() || "N/A"}</div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Confidence Score</span>
            <span className="font-medium">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>

        {/* Climate Factors */}
        {forecast.climate_factors && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Climate Factors</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {forecast.climate_factors.temperature && (
                <div className="flex items-center space-x-1">
                  <Thermometer className="h-3 w-3 text-red-500" />
                  <span>{forecast.climate_factors.temperature}°C</span>
                </div>
              )}
              {forecast.climate_factors.humidity && (
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span>{forecast.climate_factors.humidity}%</span>
                </div>
              )}
              {forecast.climate_factors.precipitation && (
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3 text-cyan-500" />
                  <span>{forecast.climate_factors.precipitation}mm</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disease Info */}
        {forecast.diseases && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Disease Information</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {forecast.diseases.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {forecast.diseases.transmission_mode?.replace("_", " ")}
              </Badge>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            View Details
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
