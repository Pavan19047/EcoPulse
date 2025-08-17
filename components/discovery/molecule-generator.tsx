"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Sparkles, FlaskConical, Target, Beaker } from "lucide-react"
import { toast } from "sonner"

export default function MoleculeGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [targetDisease, setTargetDisease] = useState("")
  const [constraints, setConstraints] = useState("")
  const [generationMethod, setGenerationMethod] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [autoSave, setAutoSave] = useState(false)

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setResults([])
      const res = await fetch("/api/discovery/generate", {
        method: "POST",
        body: JSON.stringify({ targetDisease, constraints, method: generationMethod, save: autoSave }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const view = (data.compounds || []).map((c: any, i: number) => ({
        id: i + 1,
        name: c.name,
        smiles: c.smiles,
        formula: c.molecular_formula,
        weight: c.molecular_weight,
        score: c.score,
        confidence: c.confidence,
      }))
      setResults(view)
      if (autoSave) toast.success(`Saved ${data.saved?.length || 0} molecules to library`)
    } catch (e: any) {
      toast.error(e?.message || "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            AI Molecule Generator
          </CardTitle>
          <CardDescription>Generate novel drug candidates using AI-powered molecular design</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-disease">Target Disease</Label>
              <Select value={targetDisease} onValueChange={setTargetDisease}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target disease" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malaria">Malaria</SelectItem>
                  <SelectItem value="dengue">Dengue Fever</SelectItem>
                  <SelectItem value="zika">Zika Virus</SelectItem>
                  <SelectItem value="cholera">Cholera</SelectItem>
                  <SelectItem value="lyme">Lyme Disease</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="generation-method">Generation Method</Label>
              <Select value={generationMethod} onValueChange={setGenerationMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AI method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transformer">Transformer Model</SelectItem>
                  <SelectItem value="gan">Generative Adversarial Network</SelectItem>
                  <SelectItem value="vae">Variational Autoencoder</SelectItem>
                  <SelectItem value="reinforcement">Reinforcement Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints">Molecular Constraints</Label>
            <Textarea
              id="constraints"
              placeholder="Enter specific constraints (e.g., molecular weight < 500, lipophilicity > 2, etc.)"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="h-4 w-4"
              />
              Save generated molecules to library
            </label>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !targetDisease || !generationMethod}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Molecules...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate New Molecules
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI model is generating novel molecular structures...</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progress</span>
                  <span>Analyzing chemical space...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="mr-2 h-5 w-5" />
              Generated Molecules ({results.length})
            </CardTitle>
            <CardDescription>AI-generated drug candidates for {targetDisease}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((molecule) => (
                <div key={molecule.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{molecule.name}</h4>
                      <p className="text-sm text-gray-500">
                        {molecule.formula} • {molecule.weight} Da
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Score: {(molecule.score * 100).toFixed(0)}%</div>
                      <div className="text-xs text-gray-500">Confidence: {(molecule.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">{molecule.smiles}</div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Target className="mr-2 h-3 w-3" />
                      Evaluate
                    </Button>
                    <Button variant="outline" size="sm" onClick={async () => {
                      try {
                        const res = await fetch("/api/discovery/generate", {
                          method: "POST",
                          body: JSON.stringify({ targetDisease, constraints, method: generationMethod, save: true }),
                        })
                        if (!res.ok) throw new Error(await res.text())
                        const data = await res.json()
                        toast.success(`Saved ${data.saved?.length || 0} molecules to library`)
                      } catch (e: any) {
                        toast.error(e?.message || "Save failed")
                      }
                    }}>
                      <Beaker className="mr-2 h-3 w-3" />
                      Add to Library
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Alert className="mt-4">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                These are AI-generated molecular structures. Further validation and testing are required before
                considering them as viable drug candidates.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
