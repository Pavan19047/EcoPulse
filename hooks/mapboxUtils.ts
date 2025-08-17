import axios from "axios";

export async function fetchLocationSuggestions(query: string): Promise<string[]> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key) return [];
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${key}&limit=5`;
  const res = await axios.get(url);
  return res.data.features?.map((f: any) => f.place_name) ?? [];
}

export async function fetchClimateFactors(location: string, date: Date): Promise<any> {
  if (!process.env.NEXT_PUBLIC_OPENWEATHER_KEY) return {};
  // You may want to geocode location to lat/lon first
  // For demo, just return mock data
  return {
    temperature: 28,
    humidity: 70,
    precipitation: 5,
  };
}

export function getRiskColor(risk: string) {
  switch (risk) {
    case "critical":
      return "red";
    case "high":
      return "orange";
    case "medium":
      return "yellow";
    case "low":
      return "green";
    default:
      return "gray";
  }
}
