"use client";

import React, { useEffect, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useSupabaseForecasts } from "@/hooks/useSupabaseForecasts";
import { MapboxOverlay } from "@/components/map/MapboxOverlay";
import { Download } from "lucide-react";

const ReactMapGL = dynamic(() => import("react-map-gl/mapbox").then((m) => m.default), { ssr: false });

export default function GlobalMapPage() {
  const { forecasts, loading } = useSupabaseForecasts();
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;
  const [viewport, setViewport] = useState({
    latitude: 20,
    longitude: 0,
    zoom: 1.5,
  });
  const [showRiskLayer, setShowRiskLayer] = useState(true);
  const [showClimateLayer, setShowClimateLayer] = useState(false);

  const handleExport = () => {
    const mapCanvas = document.querySelector(".mapboxgl-canvas") as HTMLCanvasElement;
    if (mapCanvas) {
      const link = document.createElement("a");
      link.download = "global-map.png";
      link.href = mapCanvas.toDataURL("image/png");
      link.click();
    }
  };

  if (!mapboxToken) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-6">
        <div className="max-w-xl text-center space-y-3">
          <h1 className="text-2xl font-semibold">Map requires a Mapbox token</h1>
          <p className="text-gray-600">
            Set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local and restart the dev server to enable the global map.
          </p>
          <p className="text-sm text-gray-500">Path: .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button onClick={handleExport} aria-label="Export map as image">
          <Download className="mr-2 h-4 w-4" />
          Export Map
        </Button>
        <Button
          variant={showRiskLayer ? "default" : "outline"}
          onClick={() => setShowRiskLayer((v) => !v)}
        >
          Disease Risk
        </Button>
        <Button
          variant={showClimateLayer ? "default" : "outline"}
          onClick={() => setShowClimateLayer((v) => !v)}
        >
          Climate Factors
        </Button>
      </div>
      <ReactMapGL
        mapboxAccessToken={mapboxToken}
        initialViewState={viewport}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100vw", height: "100vh" }}
        onMove={(evt: any) => setViewport(evt.viewState)}
      >
  <MapboxOverlay forecasts={forecasts} showRiskLayer={showRiskLayer} />
      </ReactMapGL>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20">
          <span className="text-lg font-semibold">Loading forecasts...</span>
        </div>
      )}
    </div>
  );
}
