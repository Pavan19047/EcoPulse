"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"
import { TrendingUp, Users, FlaskConical, Activity, Calendar, Target } from "lucide-react"

interface AnalyticsDashboardProps {
  forecasts: any[]
  molecules: any[]
  evaluations: any[]
  projects: any[]
  users: any[]
}

export default function AnalyticsDashboard({
  forecasts,
  molecules,
  evaluations,
  projects,
  users,
}: AnalyticsDashboardProps) {
  // Process data for various analytics
  const analyticsData = useMemo(() => {
    // Time series data for forecasts
    const forecastTimeSeries = forecasts
      .reduce((acc, forecast) => {
        const date = new Date(forecast.forecast_date).toISOString().split("T")[0]
        const existing = acc.find((item) => item.date === date)
        if (existing) {
          existing.count += 1
          if (forecast.risk_level === "critical") existing.critical += 1
          if (forecast.risk_level === "high") existing.high += 1
        } else {
          acc.push({
            date,
            count: 1,
            critical: forecast.risk_level === "critical" ? 1 : 0,
            high: forecast.risk_level === "high" ? 1 : 0,
          })
        }
        return acc
      }, [] as any[])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Risk distribution
    const riskDistribution = forecasts.reduce(
      (acc, forecast) => {
        acc[forecast.risk_level] = (acc[forecast.risk_level] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Discovery method distribution
    const discoveryMethods = molecules.reduce(
      (acc, molecule) => {
        acc[molecule.discovery_method] = (acc[molecule.discovery_method] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // User role distribution
    const userRoles = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Project status distribution
    const projectStatus = projects.reduce(
      (acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Evaluation scores over time
    const evaluationTrends = evaluations
      .map((evaluation) => ({
        date: new Date(evaluation.evaluated_at).toISOString().split("T")[0],
        score: evaluation.score || 0,
        confidence: evaluation.confidence || 0,
        type: evaluation.evaluation_type,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      forecastTimeSeries,
      riskDistribution: Object.entries(riskDistribution).map(([name, value]) => ({ name, value })),
      discoveryMethods: Object.entries(discoveryMethods).map(([name, value]) => ({ name, value })),
      userRoles: Object.entries(userRoles).map(([name, value]) => ({ name, value })),
      projectStatus: Object.entries(projectStatus).map(([name, value]) => ({ name, value })),
      evaluationTrends,
    }
  }, [forecasts, molecules, evaluations, projects, users])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

  const summaryStats = [
    {
      title: "Total Forecasts",
      value: forecasts.length.toLocaleString(),
      icon: TrendingUp,
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Active Users",
      value: users.length.toLocaleString(),
      icon: Users,
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Drug Candidates",
      value: molecules.length.toLocaleString(),
      icon: FlaskConical,
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Research Projects",
      value: projects.length.toLocaleString(),
      icon: Target,
      change: "+3%",
      changeType: "positive",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="forecasts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts">Disease Forecasts</TabsTrigger>
          <TabsTrigger value="discovery">Drug Discovery</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="projects">Project Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Forecast Trends</CardTitle>
                <CardDescription>Disease forecast activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.forecastTimeSeries}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="critical" stackId="2" stroke="#ff4444" fill="#ff4444" />
                      <Area type="monotone" dataKey="high" stackId="2" stroke="#ff8800" fill="#ff8800" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Current risk assessment breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="discovery" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Discovery Methods</CardTitle>
                <CardDescription>Distribution of drug discovery approaches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.discoveryMethods}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evaluation Trends</CardTitle>
                <CardDescription>Drug evaluation scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={analyticsData.evaluationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Scatter dataKey="score" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Roles</CardTitle>
                <CardDescription>Platform user distribution by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.userRoles}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.userRoles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Platform adoption metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-80">
                  <div className="text-center">
                    <Activity className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Growth Analytics</h3>
                    <p className="text-gray-600">
                      Detailed user engagement and growth metrics will be displayed here with time-series data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
                <CardDescription>Research project progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.projectStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Research project milestones and deadlines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-80">
                  <div className="text-center">
                    <Calendar className="mx-auto h-16 w-16 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Project Timeline View</h3>
                    <p className="text-gray-600">
                      Interactive timeline showing project milestones, deadlines, and progress tracking.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
