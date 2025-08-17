"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchClimateFactors, fetchLocationSuggestions } from "@/hooks/mapboxUtils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  diseases: any[]; // Pass diseases from the dashboard
  onCreated?: (forecast: any) => void;
};

export default function GenerateForecastModal({ open, onClose, diseases = [], onCreated }: Props) {
  const router = useRouter();
  const [diseaseId, setDiseaseId] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [forecastDate, setForecastDate] = useState<Date | undefined>(new Date());
  const [climateFactors, setClimateFactors] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.length > 2) {
      fetchLocationSuggestions(location)
        .then((list) => {
          // Deduplicate suggestions and cap list size
          const unique = Array.from(new Set(list)).slice(0, 10);
          setLocationSuggestions(unique);
        })
        .catch(() => setLocationSuggestions([]));
    } else {
      setLocationSuggestions([]);
    }
  }, [location]);

  useEffect(() => {
    if (location && forecastDate) {
      fetchClimateFactors(location, forecastDate).then(setClimateFactors);
    }
  }, [location, forecastDate]);

  const isValid = diseaseId && location && forecastDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsLoading(true);
    setError(null);

    try {
  const response = await fetch("/api/forecasts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diseaseId,
          location,
          climateFactors,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate forecast.");
      }

  // Update UI immediately
  const { forecast } = await response.json();
  let row = Array.isArray(forecast) ? forecast[0] : forecast;
  if (row && !row.diseases && diseases?.length) {
    const selected = diseases.find((d) => String(d.id) === String(diseaseId));
    if (selected) {
      row = { ...row, diseases: selected };
    }
  }
  if (onCreated && row) onCreated(row);
  router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate New Forecast</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="disease">Disease</Label>
            <Select onValueChange={setDiseaseId} value={diseaseId}>
              <SelectTrigger id="disease">
                <SelectValue placeholder="Select a disease" />
              </SelectTrigger>
              <SelectContent>
                {diseases.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Mumbai, India"
              required
              autoComplete="off"
            />
      {locationSuggestions.length > 0 && (
              <div className="bg-background border rounded-md shadow-md mt-1 max-h-32 overflow-auto z-10">
        {locationSuggestions.map((suggestion, idx) => (
          <div
            key={`${suggestion}-${idx}`}
            className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
            onClick={() => {
              setLocation(suggestion);
              setLocationSuggestions([]);
            }}
          >
            {suggestion}
          </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Forecast Date</Label>
            <Calendar
              selected={forecastDate}
              onSelect={(date) => setForecastDate(date ?? undefined)}
              ariaLabel="Select forecast date"
              fromYear={2000}
              toYear={new Date().getFullYear() + 5}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Forecast"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}