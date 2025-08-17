import { NextRequest, NextResponse } from "next/server"

// Capture user feedback for RLHF-style learning loop (mock)
export async function POST(req: NextRequest) {
  try {
    const { molecule, rating, comments } = await req.json()
    if (!molecule) return NextResponse.json({ error: "Missing molecule" }, { status: 400 })

    // In a real app, persist to a table (e.g., discovery_feedback)
    const stored = {
      id: Math.random().toString(36).slice(2),
      molecule: typeof molecule === "string" ? { name: molecule } : molecule,
      rating: typeof rating === "number" ? Math.max(1, Math.min(5, rating)) : 3,
      comments: comments || null,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({ ok: true, feedback: stored })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Feedback failed" }, { status: 500 })
  }
}
