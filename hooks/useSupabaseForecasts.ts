import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function useSupabaseForecasts() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForecasts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("forecasts")
      .select("*")
      .order("forecast_date", { ascending: false });
    setForecasts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const addForecast = async (forecast: any) => {
    await supabase.from("forecasts").insert([forecast]);
    await fetchForecasts();
  };

  const refreshForecasts = fetchForecasts;

  return { forecasts, loading, addForecast, refreshForecasts };
}
