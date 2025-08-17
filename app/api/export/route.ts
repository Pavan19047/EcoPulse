import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dataType = searchParams.get("type")
  const format = searchParams.get("format") || "json"

  const supabase = await createClient()

  try {
    let data
    let filename

    switch (dataType) {
      case "forecasts":
        const { data: forecasts } = await supabase
          .from("disease_forecasts")
          .select(`
            *,
            diseases (name, category)
          `)
          .order("created_at", { ascending: false })
        data = forecasts
        filename = `disease_forecasts_${new Date().toISOString().split("T")[0]}`
        break

      case "climate":
        const { data: climate } = await supabase
          .from("climate_data")
          .select("*")
          .order("recorded_at", { ascending: false })
          .limit(1000)
        data = climate
        filename = `climate_data_${new Date().toISOString().split("T")[0]}`
        break

      case "molecules":
        const { data: molecules } = await supabase
          .from("molecules")
          .select(`
            *,
            diseases (name, category),
            drug_evaluations (evaluation_type, score, confidence)
          `)
          .order("created_at", { ascending: false })
        data = molecules
        filename = `drug_molecules_${new Date().toISOString().split("T")[0]}`
        break

      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 })
    }

    if (format === "csv") {
      // Convert to CSV
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "No data to export" }, { status: 404 })
      }

      const headers = Object.keys(data[0]).filter((key) => typeof data[0][key] !== "object")
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    }

    // Return JSON
    return NextResponse.json({
      data,
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCount: data?.length || 0,
        dataType,
        format,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
