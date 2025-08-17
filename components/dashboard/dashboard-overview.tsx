"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, FlaskConical, Globe, Activity, Users, Database, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DashboardOverviewProps {
  user: any
  profile: any
}

export default function DashboardOverview({ user, profile }: DashboardOverviewProps) {
  const stats = [
    {
      name: "Active Disease Forecasts",
      value: "24",
      change: "+12%",
      changeType: "increase",
      icon: TrendingUp,
    },
    {
      name: "Drug Candidates",
      value: "156",
      change: "+8%",
      changeType: "increase",
      icon: FlaskConical,
    },
    {
      name: "High-Risk Regions",
      value: "7",
      change: "-3%",
      changeType: "decrease",
      icon: AlertTriangle,
    },
    {
      name: "Research Projects",
      value: "12",
      change: "+2",
      changeType: "increase",
      icon: Database,
    },
  ]

  const recentAlerts = [
    {
      id: 1,
      type: "critical",
      title: "Dengue Outbreak Risk - Bangkok",
      description: "High probability forecast for next 14 days",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      title: "Climate Pattern Change - Mumbai",
      description: "Unusual temperature and humidity patterns detected",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "info",
      title: "New Drug Candidate Identified",
      description: "AI model discovered promising malaria treatment",
      time: "6 hours ago",
    },
  ]

  const quickActions = [
    {
      title: "View Disease Forecasts",
      description: "Check latest outbreak predictions",
      href: "/dashboard/forecasting",
      icon: TrendingUp,
    },
    {
      title: "Explore Drug Discovery",
      description: "Browse AI-generated candidates",
      href: "/dashboard/discovery",
      icon: FlaskConical,
    },
    {
      title: "Global Risk Map",
      description: "Interactive disease risk visualization",
      href: "/dashboard/map",
      icon: Globe,
    },
    {
      title: "Research Projects",
      description: "Manage ongoing research initiatives",
      href: "/dashboard/projects",
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {profile?.full_name || user.email}</h1>
        <p className="text-blue-100 mb-4">
          {profile?.role === "researcher" && "Ready to advance drug discovery research"}
          {profile?.role === "public_health" && "Monitor global health threats and trends"}
          {profile?.role === "pharma" && "Accelerate pharmaceutical development"}
          {profile?.role === "admin" && "Oversee platform operations and analytics"}
        </p>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {profile?.role?.replace("_", " ").toUpperCase() || "USER"}
          </Badge>
          {profile?.organization && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              {profile.organization}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Latest disease outbreak warnings and system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    alert.type === "critical"
                      ? "bg-red-500"
                      : alert.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-500">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/dashboard/alerts">
                View All Alerts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to key platform features and tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button key={action.title} variant="ghost" className="w-full justify-start h-auto p-4" asChild>
                <Link href={action.href}>
                  <div className="flex items-center space-x-3">
                    <action.icon className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">AI Models: Operational</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Climate Data: Live</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">External APIs: Partial</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
