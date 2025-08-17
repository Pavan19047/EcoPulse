import { createClient } from "@/lib/supabase/server"
import DrugDiscoveryDashboard from "@/components/discovery/drug-discovery-dashboard"

export default async function DiscoveryPage() {
  const supabase = createClient()

  // Fetch molecules with related data
  const { data: molecules } = await supabase
    .from("molecules")
    .select(`
      *,
      diseases (
        id,
        name,
        category
      ),
      drug_evaluations (
        id,
        evaluation_type,
        score,
        confidence,
        methodology,
        results,
        evaluated_at
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  // Fetch evaluation statistics
  const { data: evaluations } = await supabase.from("drug_evaluations").select("evaluation_type, score, confidence")

  // Get discovery method statistics
  const { data: discoveryStats } = await supabase.from("molecules").select("discovery_method")

  const methodCounts =
    discoveryStats?.reduce(
      (acc, molecule) => {
        acc[molecule.discovery_method] = (acc[molecule.discovery_method] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Calculate evaluation averages
  const evaluationStats =
    evaluations?.reduce(
      (acc, evaluation) => {
        if (!acc[evaluation.evaluation_type]) {
          acc[evaluation.evaluation_type] = { total: 0, count: 0, confidence: 0 }
        }
        acc[evaluation.evaluation_type].total += evaluation.score || 0
        acc[evaluation.evaluation_type].confidence += evaluation.confidence || 0
        acc[evaluation.evaluation_type].count += 1
        return acc
      },
      {} as Record<string, { total: number; count: number; confidence: number }>,
    ) || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Drug Discovery</h1>
        <p className="text-gray-600">AI-generated drug candidates and molecular analysis</p>
      </div>

      <DrugDiscoveryDashboard
        molecules={molecules || []}
        methodStats={methodCounts}
        evaluationStats={evaluationStats}
      />
    </div>
  )
}
