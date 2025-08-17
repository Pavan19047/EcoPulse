"use client";

import React from "react";
import { Marker, Popup } from "react-map-gl/maplibre";
import { getRiskColor } from "@/hooks/mapboxUtils";
import { format, parseISO } from "date-fns";

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
  const [hovered, setHovered] = React.useState<Forecast | null>(null);
  const hideTimer = React.useRef<number | null>(null);

  if (!showRiskLayer) return null;

  const handleEnter = (f: Forecast) => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setHovered(f);
  };

  const handleLeave = () => {
    // Small delay so users can move cursor into the popup without it disappearing instantly
    hideTimer.current = window.setTimeout(() => setHovered(null), 150);
  };

  return (
    <>
      {forecasts?.map((f) => {
        const lat = typeof f.latitude === "number" ? f.latitude : 0;
        const lon = typeof f.longitude === "number" ? f.longitude : 0;
        const color = getRiskColor(f.risk_level || "");
        return (
          <Marker key={String(f.id)} latitude={lat} longitude={lon} anchor="bottom">
            <div
              onMouseEnter={() => handleEnter(f)}
              onMouseLeave={handleLeave}
              onClick={() => handleEnter(f)}
              title={`${(f as any).diseases?.name ?? (f as any).disease ?? "Unknown"} - ${f.location ?? "Unknown"}`}
              aria-label={`Forecast marker for ${(f as any).diseases?.name ?? (f as any).disease ?? "Unknown"} in ${f.location ?? "Unknown"}`}
              style={{
                background: color,
                width: 14,
                height: 14,
                borderRadius: "50%",
                boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
                cursor: "pointer",
              }}
            />
          </Marker>
        );
      })}

      {hovered && (
        <Popup
          latitude={typeof hovered.latitude === "number" ? hovered.latitude : 0}
          longitude={typeof hovered.longitude === "number" ? hovered.longitude : 0}
          anchor="top"
          closeButton={false}
          closeOnClick={false}
          offset={14}
          onClose={() => setHovered(null)}
        >
          <div
            onMouseEnter={() => handleEnter(hovered)}
            onMouseLeave={handleLeave}
            style={{ maxWidth: 260 }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {hovered.location || "Unknown location"}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.4 }}>
              <div>
                <span style={{ fontWeight: 600 }}>Disease:</span> {(hovered as any).diseases?.name || (hovered as any).disease || "Unknown"}
              </div>
              {hovered.forecast_date && (
                <div>
                  <span style={{ fontWeight: 600 }}>Date:</span> {(() => {
                    try {
                      return format(parseISO(String(hovered.forecast_date)), "PP");
                    } catch {
                      return String(hovered.forecast_date);
                    }
                  })()}
                </div>
              )}
              {typeof hovered.predicted_cases === "number" && (
                <div>
                  <span style={{ fontWeight: 600 }}>Predicted cases:</span> {hovered.predicted_cases.toLocaleString()}
                </div>
              )}
              {typeof hovered.confidence_score === "number" && (
                <div>
                  <span style={{ fontWeight: 600 }}>Confidence:</span> {hovered.confidence_score}
                </div>
              )}
              {hovered.risk_level && (
                <div>
                  <span style={{ fontWeight: 600 }}>Risk level:</span> {hovered.risk_level}
                </div>
              )}
            </div>
          </div>
        </Popup>
      )}
    </>
  );
}
