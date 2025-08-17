import { NextResponse } from "next/server"
export async function POST() { return NextResponse.json({ interactions: [{ protein: "ACE2", bindingAffinity: -8.1, probability: 0.77, residues: ["LYS31","GLU35"] }] }) }
