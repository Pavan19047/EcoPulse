"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlaskConical, Search, Filter, Plus, TrendingUp, Microscope, Beaker, Atom, Dna, ShieldAlert, Wrench, MessageSquare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="molecules">Molecule Library</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
          <TabsTrigger value="generator">AI Generator</TabsTrigger>
          <TabsTrigger value="agent">AI Agent</TabsTrigger>
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

        {/* AI Agent: identify + predict interactions + toxicity + synthesis + explain + feedback */}
        <TabsContent value="agent" className="space-y-4">
          <AIAgentPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AIAgentPanel() {
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState(false)
  const [identified, setIdentified] = useState<any | null>(null)
  const [interactions, setInteractions] = useState<any[] | null>(null)
  const [toxicity, setToxicity] = useState<any | null>(null)
  const [synthesis, setSynthesis] = useState<any | null>(null)
  const [explain, setExplain] = useState<any | null>(null)
  const [rating, setRating] = useState<number>(3)
  const [comments, setComments] = useState<string>("")

  async function call(path: string, body: any) {
    const res = await fetch(path, { method: "POST", body: JSON.stringify(body) })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }

  async function runAll() {
    setBusy(true)
    setInteractions(null)
    setToxicity(null)
    setSynthesis(null)
    setExplain(null)
    try {
      const idRes = await call("/api/discovery/identify", { query })
      setIdentified(idRes.molecule)
      const mol = idRes.molecule
      const [pi, tox, syn, exp] = await Promise.all([
        call("/api/discovery/predict-interactions", { molecule: mol }),
        call("/api/discovery/toxicity", { molecule: mol }),
        call("/api/discovery/synthesis", { molecule: mol }),
        call("/api/discovery/explain", { molecule: mol, task: "prediction" }),
      ])
      setInteractions(pi.interactions)
      setToxicity(tox.toxicity)
      setSynthesis({ route: syn.route, conditions: syn.conditions })
      setExplain(exp.explanation)
    } catch (e) {
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  async function sendFeedback() {
    try {
      await call("/api/discovery/feedback", { molecule: identified?.name || identified?.smiles || query, rating, comments })
      setComments("")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Atom className="mr-2 h-5 w-5" /> AI Discovery Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Type a molecule name (e.g., Aspirin) or SMILES string"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={runAll} disabled={busy || !query}>
            {busy ? "Analyzing..." : "Analyze"}
          </Button>
        </div>

        {identified && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Identified Molecule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div><span className="text-gray-500">Name:</span> {identified.name || "Unknown"}</div>
                  {identified.formula && (<div><span className="text-gray-500">Formula:</span> {identified.formula}</div>)}
                  {identified.smiles && (
                    <div className="break-all"><span className="text-gray-500">SMILES:</span> <span className="font-mono text-xs">{identified.smiles}</span></div>
                  )}
                  <div className="text-xs text-gray-500">Source: {identified.source}</div>
                </div>
              </CardContent>
            </Card>

            {interactions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center"><Dna className="h-4 w-4 mr-2" />Predicted Protein Interactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {interactions.map((i, idx) => (
                      <div key={idx} className="flex justify-between border-b py-1">
                        <div>{i.protein}</div>
                        <div className="text-right text-xs">
                          <div>Affinity: {i.bindingAffinity} kcal/mol</div>
                          <div>Prob: {i.probability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {toxicity && (
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center"><ShieldAlert className="h-4 w-4 mr-2" />Toxicity Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div>hERG Risk: {toxicity.hergRisk}</div>
                    <div>LD50 (rat, oral): {toxicity.ld50RatOral} mg/kg</div>
                    <div>Lipinski violations: {toxicity.lipinski.ruleOfFiveViolations}</div>
                    <div>Soluble: {toxicity.lipinski.soluble ? "Yes" : "No"}, Permeable: {toxicity.lipinski.permeable ? "Yes" : "No"}</div>
                    {toxicity.alerts?.length ? <div>Alerts: {toxicity.alerts.join(", ")}</div> : null}
                  </div>
                </CardContent>
              </Card>
            )}

            {synthesis && (
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center"><Wrench className="h-4 w-4 mr-2" />Synthesis Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    {synthesis.route.map((s: any) => (
                      <div key={s.step} className="border rounded p-2">
                        <div className="font-medium">Step {s.step}: {s.action}</div>
                        <div className="text-xs text-gray-500">{s.detail}</div>
                        {synthesis.conditions?.find((c: any) => c.step === s.step) && (
                          <div className="mt-1 text-xs">
                            {(() => { const c = synthesis.conditions.find((c: any) => c.step === s.step); return `Reagent: ${c.reagent}, Solvent: ${c.solvent}, Temp: ${c.tempC}°C, Time: ${c.timeH}h` })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {explain && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center"><MessageSquare className="h-4 w-4 mr-2" />Why these predictions?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <div>{explain.text}</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {explain.features.map((f: any, i: number) => (
                        <div key={i} className="border rounded p-2 text-xs flex justify-between">
                          <span>{f.feature}</span>
                          <span className="font-mono">{Math.round(f.importance * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {identified && (
          <div className="border rounded p-3 space-y-2">
            <div className="text-sm font-medium">Was this helpful?</div>
            <div className="flex items-center gap-2">
              <Select value={String(rating)} onValueChange={(v) => setRating(Number(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map((r) => <SelectItem key={r} value={String(r)}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Any feedback or corrections?" value={comments} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)} />
              <Button variant="outline" onClick={sendFeedback} disabled={!comments && !rating}>Submit</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
