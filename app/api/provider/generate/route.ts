import { NextResponse } from "next/server"
export async function POST() { return NextResponse.json({ compounds: [ { name: "Astra-21-1", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", molecular_formula: "C14H12O4", molecular_weight: 244.24, score: 0.82, confidence: 0.86 } ] }) }
