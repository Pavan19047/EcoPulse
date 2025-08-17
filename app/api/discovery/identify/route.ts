import { NextRequest, NextResponse } from "next/server"
import { providerIdentify } from "@/lib/discovery/providers"

// Lightweight identifier that recognizes SMILES-like strings and a few common names
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 })
    }

    const q = query.trim()

    // Try external provider first if configured
    const provided = await providerIdentify(q)
    if (provided?.molecule) {
      return NextResponse.json({ ok: true, molecule: { ...provided.molecule, source: "provider" } })
    }

    // Public fallbacks (best-effort; no secrets): OPSIN name->SMILES, PubChem properties
    async function opsinNameToSmiles(name: string) {
      try {
        const r = await fetch(`https://opsin.ch.cam.ac.uk/opsin/${encodeURIComponent(name)}.json`, { cache: "no-store" })
        if (!r.ok) return null
        const d = await r.json()
        const smiles = d?.smiles as string | undefined
        const formula = d?.formula as string | undefined
        if (!smiles) return null
        return { smiles, formula }
      } catch { return null }
    }

    async function pubchemPropsByName(name: string) {
      try {
        const r = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight/JSON`, { cache: "no-store" })
        if (!r.ok) return null
        const d = await r.json()
        const p = d?.PropertyTable?.Properties?.[0]
        if (!p) return null
        return { formula: p.MolecularFormula, weight: p.MolecularWeight }
      } catch { return null }
    }
  const isSmiles = /[A-Za-z0-9@+\-#=()\[\]\/\\]+/.test(q) && /[A-Za-z]/.test(q) && /[=()]/.test(q)

    // Some common mappings
    const common: Record<string, any> = {
      aspirin: { name: "Aspirin", formula: "C9H8O4", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", weight: 180.16 },
      paracetamol: { name: "Paracetamol", formula: "C8H9NO2", smiles: "CC(=O)NC1=CC=C(O)C=C1", weight: 151.16 },
      ibuprofen: { name: "Ibuprofen", formula: "C13H18O2", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", weight: 206.28 },
      caffeine: { name: "Caffeine", formula: "C8H10N4O2", smiles: "Cn1cnc2n(C)c(=O)n(C)c(=O)c12", weight: 194.19 },
      quinine: { name: "Quinine", formula: "C20H24N2O2", smiles: "CC[C@H]1C[C@@H]2C(=O)Nc3ccccc3C2=O", weight: 324.42 },
    }

    const key = q.toLowerCase()
    let result: any

    if (common[key]) {
      result = { ...common[key], source: "builtin" }
    } else if (isSmiles) {
      // Minimal SMILES heuristic
      const atoms = (q.match(/[A-Z][a-z]?/g) || [])
      const counts: Record<string, number> = {}
      atoms.forEach((a) => (counts[a] = (counts[a] || 0) + 1))
      result = {
        name: "Unknown (SMILES)",
        smiles: q,
        formula: Object.entries(counts)
          .map(([a, c]) => `${a}${c > 1 ? c : ""}`)
          .join(""),
        weight: undefined,
        source: "heuristic",
      }
    } else {
      // Assume plain name; attempt public fallbacks
      const [ops, pub] = await Promise.all([opsinNameToSmiles(q), pubchemPropsByName(q)])
      result = {
        name: q,
        smiles: ops?.smiles,
        formula: ops?.formula || pub?.formula,
        weight: pub?.weight,
        source: ops || pub ? "public" : "name",
      }
    }

    return NextResponse.json({ ok: true, molecule: result })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Identify failed" }, { status: 500 })
  }
}
