"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlaskConical, Search, Filter, Plus, TrendingUp, Microscope, Beaker } from "lucide-react"
import MoleculeCard from "./molecule-card"
import EvaluationChart from "./evaluation-chart"
import MoleculeGenerator from "./molecule-generator"

interface DrugDiscoveryDashboardProps {
  molecules: any[]
  methodStats: Record<string, number>
  evaluationStats: Record<string, { total: number; count: number; confidence: number }>
}

export default function DrugDiscoveryDashboard({
  molecules,
  methodStats,
  evaluationStats,
}: DrugDiscoveryDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string>("all")
  const [selectedDisease, setSelectedDisease] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  // Filter and sort molecules
  const filteredMolecules = useMemo(() => {
    const filtered = molecules.filter((molecule) => {
      const matchesSearch =
        molecule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        molecule.molecular_formula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        molecule.diseases?.name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesMethod = selectedMethod === "all" || molecule.discovery_method === selectedMethod
      const matchesDisease = selectedDisease === "all" || molecule.diseases?.name === selectedDisease

      return matchesSearch && matchesMethod && matchesDisease
    })

    // Sort molecules
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "oldest":
        return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case "name":
        return filtered.sort((a, b) => a.name.localeCompare(b.name))
      case "weight":
        return filtered.sort((a, b) => (b.molecular_weight || 0) - (a.molecular_weight || 0))
      default:
        return filtered
    }
  }, [molecules, searchTerm, selectedMethod, selectedDisease, sortBy])

  // Get unique diseases and methods for filters
  const uniqueDiseases = useMemo(() => {
    const diseases = molecules.map((m) => m.diseases?.name).filter(Boolean)
    return [...new Set(diseases)]
  }, [molecules])

  const uniqueMethods = Object.keys(methodStats)

  // Calculate average evaluation scores
  const avgEvaluationScores = Object.entries(evaluationStats).map(([type, stats]) => ({
    type,
    avgScore: stats.count > 0 ? (stats.total / stats.count).toFixed(2) : "0.00",
    avgConfidence: stats.count > 0 ? ((stats.confidence / stats.count) * 100).toFixed(1) : "0.0",
    count: stats.count,
  }))

  const calculateOverallScore = (scores: any[]) => {
    if (scores.length === 0) return "0.00"
    const totalScore = scores.reduce((sum, scoreObj) => sum + Number.parseFloat(scoreObj.avgScore), 0)
    return (totalScore / scores.length).toFixed(2)
  }

  return (
    <div className="space-y-6">
      {/* Discovery Overview Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Molecules</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{molecules.length}</div>
            <p className="text-xs text-muted-foreground">In discovery pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{methodStats.ai_generated || 0}</div>
            <p className="text-xs text-muted-foreground">AI-discovered candidates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Natural Products</CardTitle>
            <Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{methodStats.natural_product || 0}</div>
            <p className="text-xs text-muted-foreground">From natural sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Evaluation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateOverallScore(avgEvaluationScores)}</div>
            <p className="text-xs text-muted-foreground">Overall score</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Search & Filter Molecules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, formula, or target disease..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Discovery Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {uniqueMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method.replace("_", " ").toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Target Disease" />
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="weight">Molecular Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="molecules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="molecules">Molecule Library</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="generator">AI Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="molecules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Drug Candidates ({filteredMolecules.length})</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Molecule
            </Button>
          </div>

          {filteredMolecules.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FlaskConical className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No molecules found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredMolecules.map((molecule) => (
                <MoleculeCard key={molecule.id} molecule={molecule} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="evaluations" className="space-y-4">
          <EvaluationChart evaluationStats={avgEvaluationScores} />
        </TabsContent>

        <TabsContent value="generator" className="space-y-4">
          <MoleculeGenerator />
        </TabsContent>
      </Tabs>
    </div>
  )
}
