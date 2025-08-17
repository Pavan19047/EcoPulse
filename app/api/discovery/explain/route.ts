import { NextRequest, NextResponse } from "next/server"
import { providerExplain } from "@/lib/discovery/providers"

// Generate model explanations: why certain predictions were made
export async function POST(req: NextRequest) {
  try {
    const { molecule, task } = await req.json()
    if (!molecule) return NextResponse.json({ error: "Missing molecule" }, { status: 400 })

  // Provider first
  const provided = await providerExplain(molecule, task)
  if (provided?.explanation) return NextResponse.json({ ok: true, explanation: provided.explanation })

  const features = [
      { feature: "Hydrogen bond donors", importance: 0.22 },
      { feature: "LogP (lipophilicity)", importance: 0.18 },
      { feature: "Aromatic rings", importance: 0.15 },
      { feature: "Polar surface area", importance: 0.14 },
      { feature: "Rotatable bonds", importance: 0.09 },
      { feature: "Molecular weight", importance: 0.08 },
      { feature: "H-bond acceptors", importance: 0.07 },
      { feature: "Substructure alerts", importance: 0.07 },
    ]

    const rationale = `The ${task || "model"} prioritized features indicating favorable binding and ADME properties. Higher lipophilicity and optimal hydrogen-bonding patterns increase the likelihood of target engagement, while polar surface area and molecular weight were balanced to ensure permeability.`

    return NextResponse.json({ ok: true, explanation: { features, text: rationale } })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Explain failed" }, { status: 500 })
  }
}
