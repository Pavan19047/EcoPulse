import { NextRequest, NextResponse } from "next/server"
import { providerDocking } from "@/lib/discovery/providers"

// Mock protein interaction prediction
export async function POST(req: NextRequest) {
  try {
    const { molecule, targets } = await req.json()
    if (!molecule) return NextResponse.json({ error: "Missing molecule" }, { status: 400 })

  const proteinTargets: string[] = targets && Array.isArray(targets) ? targets : [
      "ACE2", "Mpro", "NSP12", "DHFR", "HSP90"
    ]

  // Provider first
  const provided = await providerDocking(molecule, proteinTargets)
  if (provided?.interactions) return NextResponse.json({ ok: true, interactions: provided.interactions })

    const rng = (seed: number) => () => (seed = (seed * 9301 + 49297) % 233280) / 233280
    const seed = (JSON.stringify(molecule).length + proteinTargets.join(",").length) % 1000
    const rand = rng(seed)

    const interactions = proteinTargets.map((p) => ({
      protein: p,
      bindingAffinity: Number.parseFloat((-6 - rand() * 6).toFixed(2)), // kcal/mol (more negative is better)
      probability: Number.parseFloat((0.5 + rand() * 0.5).toFixed(2)),
      residues: Array.from({ length: 5 + Math.floor(rand() * 5) }, (_, i) => `RES${Math.floor(rand() * 200)}:${i}`),
    }))

    return NextResponse.json({ ok: true, interactions })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Prediction failed" }, { status: 500 })
  }
}
