"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Calendar } from "@/components/ui/calendar";
import { Calendar } from "@/components/ui/calendar";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabaseForecasts } from "@/hooks/useSupabaseForecasts";
import { fetchClimateFactors, fetchLocationSuggestions } from "@/hooks/mapboxUtils";
import { format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
};

const DISEASES = ["Dengue", "Malaria", "Cholera", "Custom"];

export default function GenerateForecastModal({ open, onClose }: Props) {
  const [disease, setDisease] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [forecastDate, setForecastDate] = useState<Date | null>(null);
  const [climateFactors, setClimateFactors] = useState<any>(null);
  const [predictedCases, setPredictedCases] = useState<number>(100);
  const [confidenceScore, setConfidenceScore] = useState<number>(0.8);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addForecast, refreshForecasts } = useSupabaseForecasts();

  useEffect(() => {
    if (location.length > 2) {
      fetchLocationSuggestions(location).then(setLocationSuggestions);
    }
  }, [location]);

  useEffect(() => {
    if (location && forecastDate) {
      fetchClimateFactors(location, forecastDate).then(setClimateFactors);
    }
  }, [location, forecastDate]);

  const isValid =
    disease &&
    location &&
    forecastDate &&
    climateFactors &&
    predictedCases > 0 &&
    confidenceScore > 0 &&
    riskLevel;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addForecast({
        disease,
        location,
        forecast_date: format(forecastDate!, "yyyy-MM-dd"),
        predicted_cases: predictedCases,
        confidence_score: confidenceScore,
        climate_factors: climateFactors,
        risk_level: riskLevel,
      });
      refreshForecasts();
      onClose();
    } catch (err: any) {
      setError("Failed to save forecast. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Generate New Forecast</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select value={disease} onValueChange={setDisease} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Disease" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISEASES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    required
                    aria-autocomplete="list"
                    aria-label="Location"
                  />
                  {locationSuggestions.length > 0 && (
                    <ul className="bg-white border rounded shadow mt-1 max-h-32 overflow-auto z-10">
                      {locationSuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          className="px-2 py-1 cursor-pointer hover:bg-blue-100"
                          onClick={() => setLocation(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Calendar
                  selected={forecastDate}
                  onSelect={setForecastDate}
                  aria-label="Forecast Date"
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Climate Factors</label>
                  <Input
                    value={climateFactors ? JSON.stringify(climateFactors) : ""}
                    readOnly
                    aria-label="Climate Factors"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={predictedCases}
                    onChange={(e) => setPredictedCases(Number(e.target.value))}
                    placeholder="Predicted Cases"
                    required
                  />
                  <Input
                    type="number"
                    min={0.1}
                    max={1}
                    step={0.01}
                    value={confidenceScore}
                    onChange={(e) => setConfidenceScore(Number(e.target.value))}
                    placeholder="Confidence Score"
                    required
                  />
                  <Select value={riskLevel} onValueChange={setRiskLevel} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <DialogFooter>
                  <Button type="submit" disabled={!isValid || loading} className="w-full">
                    {loading ? "Generating..." : "Generate Forecast"}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" type="button" className="w-full mt-2">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
