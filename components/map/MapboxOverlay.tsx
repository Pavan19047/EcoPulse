"use client";

import React from "react";
import { Marker, Popup } from "react-map-gl/mapbox";
import { getRiskColor } from "@/hooks/mapboxUtils";

type Forecast = {
  id: string | number;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  disease?: string | null;
  forecast_date?: string | null;
  predicted_cases?: number | null;
  confidence_score?: number | null;
  risk_level?: string | null;
};

export function MapboxOverlay({ forecasts, showRiskLayer }: { forecasts: Forecast[]; showRiskLayer: boolean }) {
  if (!showRiskLayer) return null;
  return (
    <>
      {forecasts?.map((f) => {
        const lat = typeof f.latitude === "number" ? f.latitude : 0;
        const lon = typeof f.longitude === "number" ? f.longitude : 0;
        const color = getRiskColor(f.risk_level || "");
        return (
          <Marker key={String(f.id)} latitude={lat} longitude={lon} anchor="bottom">
            <div
              title={`${f.disease ?? "Unknown"} - ${f.location ?? "Unknown"}\nDate: ${f.forecast_date ?? ""}\nCases: ${f.predicted_cases ?? ""}\nConfidence: ${f.confidence_score ?? ""}`}
              aria-label={`Forecast marker for ${f.disease ?? "Unknown"} in ${f.location ?? "Unknown"}`}
              style={{
                background: color,
                width: 14,
                height: 14,
                borderRadius: "50%",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
              }}
            />
          </Marker>
        );
      })}
    </>
  );
}
