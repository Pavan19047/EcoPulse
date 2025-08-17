"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FlaskConical, Target, Beaker, Calendar, ExternalLink, Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoleculeCardProps {
  molecule: any
}

export default function MoleculeCard({ molecule }: MoleculeCardProps) {
  const getMethodColor = (method: string) => {
    switch (method) {
      case "ai_generated":
        return "text-purple-700 bg-purple-50 border-purple-200"
      case "natural_product":
        return "text-green-700 bg-green-50 border-green-200"
      case "synthetic":
        return "text-blue-700 bg-blue-50 border-blue-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "ai_generated":
        return <TrendingUp className="h-4 w-4" />
      case "natural_product":
        return <FlaskConical className="h-4 w-4" />
      case "synthetic":
        return <Beaker className="h-4 w-4" />
      default:
        return <FlaskConical className="h-4 w-4" />
    }
  }

  // Calculate average evaluation score
  const evaluations = molecule.drug_evaluations || []
  const avgScore =
    evaluations.length > 0
      ? evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.score || 0), 0) / evaluations.length
      : 0
  const avgConfidence =
    evaluations.length > 0
      ? evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.confidence || 0), 0) / evaluations.length
      : 0

  const scorePercentage = Math.round(avgScore * 100)
  const confidencePercentage = Math.round(avgConfidence * 100)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{molecule.name}</CardTitle>
            <CardDescription className="flex items-center">
              <Target className="mr-1 h-4 w-4" />
              {molecule.diseases?.name || "No target specified"}
            </CardDescription>
          </div>
          <Badge className={cn("border", getMethodColor(molecule.discovery_method))}>
            {getMethodIcon(molecule.discovery_method)}
            <span className="ml-1 capitalize">{molecule.discovery_method?.replace("_", " ")}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Molecular Properties */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Formula</span>
            <div className="font-mono font-medium">{molecule.molecular_formula || "N/A"}</div>
          </div>
          <div>
            <span className="text-gray-500">Weight</span>
            <div className="font-medium">{molecule.molecular_weight?.toFixed(2) || "N/A"} Da</div>
          </div>
        </div>

        {/* SMILES Structure */}
        {molecule.smiles && (
          <div className="space-y-2">
            <span className="text-sm text-gray-500">SMILES</span>
            <div className="bg-gray-50 p-2 rounded text-xs font-mono break-all">{molecule.smiles}</div>
          </div>
        )}

        {/* Evaluation Scores */}
        {evaluations.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Drug Score</span>
                <span className="font-medium">{scorePercentage}%</span>
              </div>
              <Progress value={scorePercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Confidence</span>
                <span className="font-medium">{confidencePercentage}%</span>
              </div>
              <Progress value={confidencePercentage} className="h-2" />
            </div>
          </div>
        )}

        {/* Properties */}
        {molecule.properties && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Properties</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(molecule.properties).map(([key, value]) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation Types */}
        {evaluations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Evaluations ({evaluations.length})</h4>
            <div className="flex flex-wrap gap-1">
              {evaluations.slice(0, 3).map((evaluation: any, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {evaluation.evaluation_type}
                </Badge>
              ))}
              {evaluations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{evaluations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Discovery Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {new Date(molecule.created_at).toLocaleDateString()}
          </div>
          {molecule.source && <div>Source: {molecule.source}</div>}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            View Details
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm">
            <Star className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
