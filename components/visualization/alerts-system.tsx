"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  TrendingUp,
  Settings,
  Filter,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AlertsSystemProps {
  alerts: any[]
  criticalForecasts: any[]
}

export default function AlertsSystem({ alerts, criticalForecasts }: AlertsSystemProps) {
  const [selectedSeverity, setSelectedSeverity] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-200"
      case "error":
        return "text-red-700 bg-red-50 border-red-200"
      case "warning":
        return "text-orange-700 bg-orange-50 border-orange-200"
      case "info":
        return "text-blue-700 bg-blue-50 border-blue-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  // Generate system alerts from critical forecasts
  const systemAlerts = criticalForecasts.map((forecast) => ({
    id: `system-${forecast.id}`,
    type: "disease_outbreak",
    title: `${forecast.risk_level.toUpperCase()} Risk Alert - ${forecast.diseases?.name}`,
    message: `High probability outbreak forecast for ${forecast.location}. Predicted cases: ${forecast.predicted_cases?.toLocaleString()}`,
    severity: forecast.risk_level === "critical" ? "critical" : "warning",
    location: forecast.location,
    created_at: forecast.created_at,
    is_read: false,
    isSystem: true,
  }))

  const allAlerts = [...alerts, ...systemAlerts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const filteredAlerts = allAlerts.filter((alert) => {
    const matchesSeverity = selectedSeverity === "all" || alert.severity === selectedSeverity
    const matchesType = selectedType === "all" || alert.type === selectedType
    return matchesSeverity && matchesType
  })

  const alertStats = {
    total: allAlerts.length,
    unread: allAlerts.filter((alert) => !alert.is_read).length,
    critical: allAlerts.filter((alert) => alert.severity === "critical").length,
    warning: allAlerts.filter((alert) => alert.severity === "warning").length,
  }

  const uniqueTypes = [...new Set(allAlerts.map((alert) => alert.type))]

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.unread}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.critical}</div>
            <p className="text-xs text-muted-foreground">Immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertStats.warning}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Alert Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Severity Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Alert Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="system">System Alerts</TabsTrigger>
          <TabsTrigger value="settings">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Feed ({filteredAlerts.length})</CardTitle>
              <CardDescription>Real-time disease outbreak warnings and system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                    <p className="text-gray-500">All systems are operating normally.</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "flex items-start space-x-3 p-4 rounded-lg border",
                        !alert.is_read ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="flex-shrink-0">
                        <Badge className={cn("border", getSeverityColor(alert.severity))}>
                          {getSeverityIcon(alert.severity)}
                          <span className="ml-1 capitalize">{alert.severity}</span>
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <div className="flex items-center">
                                <Clock className="mr-1 h-3 w-3" />
                                {format(new Date(alert.created_at), "yyyy-MM-dd HH:mm:ss")}
                              </div>
                              {alert.location && (
                                <div className="flex items-center">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {alert.location}
                                </div>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {alert.type.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {!alert.is_read && (
                              <Button variant="outline" size="sm">
                                Mark Read
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                System-Generated Alerts
              </CardTitle>
              <CardDescription>Automated alerts from AI forecasting and monitoring systems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <Badge className={cn("capitalize", getSeverityColor(alert.severity))}>{alert.severity}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {alert.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(alert.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Forecast
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Alert Configuration
              </CardTitle>
              <CardDescription>Customize your alert preferences and notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Notification Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Critical Disease Outbreaks</p>
                        <p className="text-sm text-gray-500">Immediate notifications for critical risk alerts</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Climate Pattern Changes</p>
                        <p className="text-sm text-gray-500">Alerts for significant climate anomalies</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enabled
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Research Updates</p>
                        <p className="text-sm text-gray-500">Notifications about research project milestones</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Disabled
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Delivery Methods</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email" defaultChecked />
                      <label htmlFor="email" className="text-sm">
                        Email notifications
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="dashboard" defaultChecked />
                      <label htmlFor="dashboard" className="text-sm">
                        Dashboard alerts
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="mobile" />
                      <label htmlFor="mobile" className="text-sm">
                        Mobile push notifications
                      </label>
                    </div>
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
