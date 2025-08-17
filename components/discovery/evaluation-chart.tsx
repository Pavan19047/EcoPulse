"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, Target, Beaker } from "lucide-react"

interface EvaluationChartProps {
  evaluationStats: Array<{
    type: string
    avgScore: string
    avgConfidence: string
    count: number
  }>
}

export default function EvaluationChart({ evaluationStats }: EvaluationChartProps) {
  const chartData = evaluationStats.map((stat) => ({
    type: stat.type.replace("_", " ").toUpperCase(),
    score: Number.parseFloat(stat.avgScore),
    confidence: Number.parseFloat(stat.avgConfidence),
    count: stat.count,
  }))

  const pieData = evaluationStats.map((stat, index) => ({
    name: stat.type.replace("_", " ").toUpperCase(),
    value: stat.count,
    color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluationStats.reduce((sum, stat) => sum + stat.count, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all molecules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluationStats.length > 0
                ? (
                    evaluationStats.reduce((sum, stat) => sum + Number.parseFloat(stat.avgScore), 0) /
                    evaluationStats.length
                  ).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluation Types</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluationStats.length}</div>
            <p className="text-xs text-muted-foreground">Different methodologies</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Evaluation Scores</CardTitle>
            <CardDescription>Performance by evaluation type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evaluation Distribution</CardTitle>
            <CardDescription>Number of evaluations by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
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

      {/* Detailed Evaluation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Summary</CardTitle>
          <CardDescription>Detailed breakdown of all evaluation types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Evaluation Type</th>
                  <th className="text-right py-2">Count</th>
                  <th className="text-right py-2">Avg Score</th>
                  <th className="text-right py-2">Avg Confidence</th>
                </tr>
              </thead>
              <tbody>
                {evaluationStats.map((stat) => (
                  <tr key={stat.type} className="border-b">
                    <td className="py-2 font-medium">{stat.type.replace("_", " ").toUpperCase()}</td>
                    <td className="text-right py-2">{stat.count}</td>
                    <td className="text-right py-2">{stat.avgScore}</td>
                    <td className="text-right py-2">{stat.avgConfidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
