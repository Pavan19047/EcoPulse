import { NextRequest, NextResponse } from "next/server"
import { providerAdmet } from "@/lib/discovery/providers"

// Mock toxicity checks (hERG risk, LD50 estimates, Lipinski, etc.)
export async function POST(req: NextRequest) {
  try {
    const { molecule } = await req.json()
    if (!molecule) return NextResponse.json({ error: "Missing molecule" }, { status: 400 })

  // Provider first
  const provided = await providerAdmet(molecule)
  if (provided?.toxicity) return NextResponse.json({ ok: true, toxicity: provided.toxicity })

  const name = String(molecule.name || molecule.smiles || "unknown")
    const hash = Array.from(name).reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)
    const rnd = (min: number, max: number) => min + (Math.abs(hash) % 1000) / 1000 * (max - min)

    const toxicity = {
      hergRisk: Number.parseFloat((0.1 + (Math.abs(hash % 7) / 10)).toFixed(2)),
      ld50RatOral: Math.round(rnd(50, 2000)), // mg/kg
      lipinski: {
        ruleOfFiveViolations: Math.abs(hash % 3),
        soluble: (hash & 1) === 0,
        permeable: (hash & 2) === 0,
      },
      alerts: ["PAINS-A", "Reactive center"] .slice(0, Math.abs(hash % 2)),
    }

    return NextResponse.json({ ok: true, toxicity })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Toxicity check failed" }, { status: 500 })
  }
}
