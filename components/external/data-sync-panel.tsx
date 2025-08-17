"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Download, CheckCircle, AlertCircle, Clock, Database } from "lucide-react"

export default function DataSyncPanel() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncResults, setSyncResults] = useState<any[]>([])

  const handleClimateSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    setSyncResults([])

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/sync/climate", {
        method: "POST",
      })

      const data = await response.json()

      clearInterval(progressInterval)
      setSyncProgress(100)
      setSyncResults(data.results || [])
      setLastSync(new Date())

      setTimeout(() => {
        setIsSyncing(false)
        setSyncProgress(0)
      }, 1000)
    } catch (error) {
      console.error("Sync failed:", error)
      setIsSyncing(false)
      setSyncProgress(0)
    }
  }

  const handleExport = async (dataType: string, format: string) => {
    try {
      const response = await fetch(`/api/export?type=${dataType}&format=${format}`)

      if (format === "csv") {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${dataType}_export.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${dataType}_export.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Synchronization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 h-5 w-5" />
            External Data Synchronization
          </CardTitle>
          <CardDescription>Sync climate data from external weather APIs and monitoring stations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Climate Data Sync</h4>
              <p className="text-sm text-gray-500">Fetch latest weather data from global monitoring stations</p>
            </div>
            <Button onClick={handleClimateSync} disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Now
                </>
              )}
            </Button>
          </div>

          {isSyncing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Synchronization Progress</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}

          {lastSync && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last sync: {lastSync.toLocaleString()}</span>
            </div>
          )}

          {syncResults.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Sync Results:</h5>
              {syncResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{result.station}</span>
                  <Badge variant={result.status === "success" ? "default" : "destructive"}>
                    {result.status === "success" ? (
                      <CheckCircle className="mr-1 h-3 w-3" />
                    ) : (
                      <AlertCircle className="mr-1 h-3 w-3" />
                    )}
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>Export platform data for external analysis and reporting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Disease Forecasts</h4>
              <p className="text-sm text-gray-500">Export forecast data and predictions</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("forecasts", "json")}>
                  JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("forecasts", "csv")}>
                  CSV
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Climate Data</h4>
              <p className="text-sm text-gray-500">Export environmental monitoring data</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("climate", "json")}>
                  JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("climate", "csv")}>
                  CSV
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Drug Molecules</h4>
              <p className="text-sm text-gray-500">Export molecular data and evaluations</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleExport("molecules", "json")}>
                  JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport("molecules", "csv")}>
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            API Integration Status
          </CardTitle>
          <CardDescription>Monitor external API connections and service health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Weather API</span>
              </div>
              <Badge variant="default">Connected</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Climate Monitoring</span>
              </div>
              <Badge variant="default">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="font-medium">Disease Surveillance</span>
              </div>
              <Badge variant="secondary">Limited</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium">Molecular Database</span>
              </div>
              <Badge variant="destructive">Offline</Badge>
            </div>
          </div>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some external services are experiencing connectivity issues. Data synchronization may be delayed.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
