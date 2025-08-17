import { NextResponse } from "next/server"
export async function POST() { return NextResponse.json({ explanation: { text: "Model favored optimal H-bonding, moderate lipophilicity, and balanced PSA.", features: [ { feature: "HBD", importance: 0.22 }, { feature: "LogP", importance: 0.18 }, { feature: "PSA", importance: 0.14 } ] } }) }
