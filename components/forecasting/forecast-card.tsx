"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar, TrendingUp, Thermometer, Droplets, AlertTriangle, Users, ExternalLink, MoreHorizontal, Trash2, FileDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import * as XLSX from "xlsx"
// jsPDF is optional; we lazy import to avoid SSR bundling issues
import { toast } from "sonner"

type ExportFormat = "csv" | "xlsx" | "pdf" | "json";

interface ForecastCardProps {
  forecast: any
  onDelete?: (id: string | number) => void
}

export default function ForecastCard({ forecast, onDelete }: ForecastCardProps) {
  const formatDateSafe = (dateStr?: string) => {
    if (!dateStr) return "—"
    // Handle ISO date-only (YYYY-MM-DD) safely across SSR/CSR without timezone shifts
    const d = dateStr.split("T")[0]
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) {
      const [_, y, mo, da] = m
      const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(da), 12, 0, 0)) // noon UTC avoids TZ day shift
      return format(dt, "MMM d, yyyy")
    }
    // Fallback for other formats
    const dt = new Date(dateStr)
    if (isNaN(dt.getTime())) return dateStr
    return format(dt, "MMM d, yyyy")
  }
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "text-red-700 bg-red-50 border-red-200"
      case "high":
        return "text-orange-700 bg-orange-50 border-orange-200"
      case "medium":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-green-700 bg-green-50 border-green-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      case "high":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const confidencePercentage = Math.round((forecast.confidence_score || 0) * 100)

  const toRow = () => ({
    id: forecast.id,
    disease: forecast.diseases?.name || "",
    location: forecast.location,
    forecast_date: formatDateSafe(forecast.forecast_date),
    predicted_cases: forecast.predicted_cases,
    confidence_score: confidencePercentage + "%",
    risk_level: forecast.risk_level,
    latitude: forecast.latitude,
    longitude: forecast.longitude,
  });

  const exportData = (fmt: ExportFormat) => {
    const row = toRow();
    if (fmt === "json") {
      const blob = new Blob([JSON.stringify(row, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
  a.href = url; a.download = `forecast-${forecast.id}.json`; a.click();
      URL.revokeObjectURL(url);
  toast.success("Exported JSON")
      return;
    }
    if (fmt === "csv") {
      const headers = Object.keys(row).join(",");
      const values = Object.values(row).map(v => typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v).join(",");
      const csv = headers + "\n" + values;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `forecast-${forecast.id}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast.success("Exported CSV")
      return;
    }
    if (fmt === "xlsx") {
      const ws = XLSX.utils.json_to_sheet([row]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Forecast");
  XLSX.writeFile(wb, `forecast-${forecast.id}.xlsx`);
  toast.success("Exported Excel")
      return;
    }
    if (fmt === "pdf") {
      // Try jsPDF; if it fails, fall back to print HTML
      import("jspdf").then(({ jsPDF }) => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(`Forecast ${forecast.id}`, 14, 18);
        doc.setFontSize(11);
        const entries = Object.entries(toRow());
        let y = 28;
        entries.forEach(([k, v]) => {
          const line = `${k}: ${String(v ?? "")}`;
          doc.text(line, 14, y);
          y += 8;
        });
        doc.save(`forecast-${forecast.id}.pdf`);
        toast.success("Exported PDF");
      }).catch(() => {
        const html = `<!doctype html><meta charset=\"utf-8\"><title>Forecast ${forecast.id}</title>
          <style>body{font-family:system-ui,Segoe UI,Arial;padding:24px}h1{font-size:18px;margin:0 0 8px}table{border-collapse:collapse;width:100%}td{border:1px solid #ddd;padding:8px}</style>
          <h1>Forecast ${forecast.id}</h1>
          <table>${Object.entries(toRow()).map(([k,v])=>`<tr><td><b>${k}</b></td><td>${String(v ?? "")}</td></tr>`).join("")}</table>`;
        const w = window.open("", "_blank");
        if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); toast.success("Opened print dialog for PDF") }
      });
      return;
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{forecast.diseases?.name || "Unknown Disease"}</CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {forecast.location}
            </CardDescription>
          </div>
          <Badge className={cn("border", getRiskColor(forecast.risk_level))}>
            {getRiskIcon(forecast.risk_level)}
            <span className="ml-1 capitalize">{forecast.risk_level}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Forecast Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>Forecast Date</span>
          </div>
          <div className="font-medium">{formatDateSafe(forecast.forecast_date)}</div>

          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>Predicted Cases</span>
          </div>
          <div className="font-medium">{forecast.predicted_cases?.toLocaleString() || "N/A"}</div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Confidence Score</span>
            <span className="font-medium">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>

        {/* Climate Factors */}
        {forecast.climate_factors && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Climate Factors</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {forecast.climate_factors.temperature && (
                <div className="flex items-center space-x-1">
                  <Thermometer className="h-3 w-3 text-red-500" />
                  <span>{forecast.climate_factors.temperature}°C</span>
                </div>
              )}
              {forecast.climate_factors.humidity && (
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <span>{forecast.climate_factors.humidity}%</span>
                </div>
              )}
              {forecast.climate_factors.precipitation && (
                <div className="flex items-center space-x-1">
                  <Droplets className="h-3 w-3 text-cyan-500" />
                  <span>{forecast.climate_factors.precipitation}mm</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disease Info */}
        {forecast.diseases && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Disease Information</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                {forecast.diseases.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {forecast.diseases.transmission_mode?.replace("_", " ")}
              </Badge>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            View Details
            <ExternalLink className="ml-2 h-3 w-3" />
          </Button>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileDown className="mr-2 h-3 w-3" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export As</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => exportData("csv")}>CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData("xlsx")}>Excel (.xlsx)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData("pdf")}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData("json")}>JSON</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!forecast.id) return;
                if (!confirm("Delete this forecast? This cannot be undone.")) return;
                fetch(`/api/forecasts/${forecast.id}`, { method: "DELETE" })
                  .then((r) => r.ok ? (onDelete?.(forecast.id), toast.success("Forecast deleted")) : r.json().then((j) => Promise.reject(j?.error || "Delete failed")))
                  .catch((e) => toast.error(String(e)));
              }}
            >
              <Trash2 className="mr-2 h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
