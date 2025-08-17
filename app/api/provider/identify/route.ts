import { NextRequest, NextResponse } from "next/server"

// Local starter provider: identify simple molecules from a small map.
// If unknown, respond 404 so the main route can fall back to public services.
export async function POST(req: NextRequest) {
	try {
		const { query } = await req.json()
		if (!query || typeof query !== "string") {
			return NextResponse.json({ error: "Missing query" }, { status: 400 })
		}

		const q = query.trim()
		const key = q.toLowerCase()

		const common: Record<string, { name: string; formula: string; smiles: string; weight?: number }> = {
			// Inorganics
			ammonia: { name: "Ammonia", formula: "NH3", smiles: "N", weight: 17.031 },
			nh3: { name: "Ammonia", formula: "NH3", smiles: "N", weight: 17.031 },

			// Organics
			aspirin: { name: "Aspirin", formula: "C9H8O4", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", weight: 180.16 },
			paracetamol: { name: "Paracetamol", formula: "C8H9NO2", smiles: "CC(=O)NC1=CC=C(O)C=C1", weight: 151.16 },
			ibuprofen: { name: "Ibuprofen", formula: "C13H18O2", smiles: "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O", weight: 206.28 },
			caffeine: { name: "Caffeine", formula: "C8H10N4O2", smiles: "Cn1cnc2n(C)c(=O)n(C)c(=O)c12", weight: 194.19 },
			quinine: { name: "Quinine", formula: "C20H24N2O2", smiles: "CC[C@H]1C[C@@H]2C(=O)Nc3ccccc3C2=O", weight: 324.42 },
		}

		// Exact match on known keys
		const hit = common[key]
		if (hit) {
			return NextResponse.json({ molecule: hit })
		}

		// Very small SMILES heuristic: treat a single-letter 'N' as ammonia, else let fallback handle
		const isSmilesLike = /[A-Za-z0-9@+\-#=()\[\]\/\\]+/.test(q) && /[A-Za-z]/.test(q)
		if (isSmilesLike) {
			if (q === "N") {
				return NextResponse.json({ molecule: common["ammonia"] })
			}
			// Unknown SMILES: let main route fall back to public services
			return NextResponse.json({ error: "Unknown molecule" }, { status: 404 })
		}

		// Unknown name → 404 to trigger fallback in main identify route
		return NextResponse.json({ error: "Not found" }, { status: 404 })
	} catch (e: any) {
		return NextResponse.json({ error: e?.message || "Identify provider failed" }, { status: 500 })
	}
}
