import { NextRequest, NextResponse } from "next/server"
import { providerSynthesis } from "@/lib/discovery/providers"

// Mock synthesis planning: propose a short route with 3-5 steps
export async function POST(req: NextRequest) {
  try {
    const { molecule } = await req.json()
    if (!molecule) return NextResponse.json({ error: "Missing molecule" }, { status: 400 })

  // Provider first
  const provided = await providerSynthesis(molecule)
  if (provided?.route) return NextResponse.json({ ok: true, route: provided.route, conditions: provided.conditions })

  const base = String(molecule.name || molecule.smiles || "candidate")
    const steps = [
      { step: 1, action: "Functionalization", detail: `Introduce key functional group for ${base}` },
      { step: 2, action: "Coupling", detail: "Palladium-catalyzed cross-coupling to assemble core" },
      { step: 3, action: "Cyclization", detail: "Form heterocyclic ring via intramolecular reaction" },
      { step: 4, action: "Protection/Deprotection", detail: "Adjust protecting groups for downstream steps" },
      { step: 5, action: "Purification", detail: "Crystallization and HPLC to obtain target compound" },
    ].slice(0, 3 + (base.length % 3))

    const conditions = steps.map((s) => ({
      step: s.step,
      reagent: ["NaBH4", "Pd/C", "H2SO4", "CuI"][s.step % 4],
      solvent: ["MeOH", "THF", "DMF", "DMSO"][s.step % 4],
      tempC: [0, 25, 60, 80][s.step % 4],
      timeH: [1, 4, 8, 12][s.step % 4],
    }))

    return NextResponse.json({ ok: true, route: steps, conditions })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Synthesis planning failed" }, { status: 500 })
  }
}
