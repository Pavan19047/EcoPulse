import { NextResponse } from "next/server"
export async function POST() { return NextResponse.json({ toxicity: { hergRisk: 0.21, ld50RatOral: 850, lipinski: { ruleOfFiveViolations: 0, soluble: true, permeable: true }, alerts: [] } }) }
