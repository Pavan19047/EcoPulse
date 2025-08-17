import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { providerGenerate } from "@/lib/discovery/providers"

// Generate mock molecules and optionally save
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  try {
    const body = await req.json()
    const { targetDisease, constraints, method, save } = body || {}

    // Provider first
    const provided = await providerGenerate(targetDisease, constraints, method)
    if (provided?.compounds) {
      const compounds = provided.compounds
      let saved: any[] = []
      if (save && targetDisease) {
        const { data: disease } = await supabase
          .from("diseases")
          .select("id")
          .ilike("name", `%${targetDisease}%`)
          .maybeSingle()
        const rows = compounds.map((c: any) => ({
          name: c.name,
          smiles: c.smiles,
          molecular_formula: c.molecular_formula,
          molecular_weight: c.molecular_weight,
          target_disease_id: disease?.id || null,
          discovery_method: c.discovery_method || method || "ai_generated",
          source: c.source || "ai_generator",
          properties: { score: c.score, confidence: c.confidence, constraints },
        }))
        const { data } = await supabase.from("molecules").insert(rows).select("*")
        saved = data || []
      }
      return NextResponse.json({ ok: true, compounds, saved })
    }

    const seed = JSON.stringify({ targetDisease, constraints, method }).length
    const rng = (s: number) => () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296
    const rand = rng(seed || 1234)

    const names = ["Nova-", "Quantum-", "Astra-", "Helio-", "Cerebra-", "Viva-", "Aether-"]
    const suffix = ["01", "12", "21", "42", "77", "90"]

    const compounds = Array.from({ length: 3 }, (_, i) => {
      const weight = Number.parseFloat((150 + rand() * 400).toFixed(2))
      const score = Number.parseFloat((0.6 + rand() * 0.4).toFixed(2))
      const confidence = Number.parseFloat((0.6 + rand() * 0.4).toFixed(2))
      const name = `${names[Math.floor(rand() * names.length)]}${suffix[Math.floor(rand() * suffix.length)]}-${i + 1}`
      const smiles = "CC(=O)OC1=CC=CC=C1C(=O)O".split("")
        .map((c) => (rand() > 0.97 ? c + "N" : c))
        .join("")
      return {
        name,
        smiles,
        molecular_formula: "C" + (10 + Math.floor(rand() * 20)) + "H" + (10 + Math.floor(rand() * 30)) + "O" + (1 + Math.floor(rand() * 5)),
        molecular_weight: weight,
        discovery_method: method || "ai_generated",
        score,
        confidence,
      }
    })

    // Optionally save to DB if a disease is provided
    let saved: any[] = []
    if (save && targetDisease) {
      const { data: disease } = await supabase
        .from("diseases")
        .select("id")
        .ilike("name", `%${targetDisease}%`)
        .maybeSingle()
      const rows = compounds.map((c) => ({
        name: c.name,
        smiles: c.smiles,
        molecular_formula: c.molecular_formula,
        molecular_weight: c.molecular_weight,
        target_disease_id: disease?.id || null,
        discovery_method: c.discovery_method,
        source: "ai_generator",
        properties: { score: c.score, confidence: c.confidence, constraints },
      }))
      const { data } = await supabase.from("molecules").insert(rows).select("*")
      saved = data || []
    }

    return NextResponse.json({ ok: true, compounds, saved })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Generation failed" }, { status: 500 })
  }
}
