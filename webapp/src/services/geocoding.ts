export type GeocodeResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

// Open-Meteo Geocoding API (no key): https://open-meteo.com/en/docs/geocoding-api
export async function geocodeSearch(query: string, count: number = 8): Promise<GeocodeResult[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', query);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);
  const json = await res.json();
  const results = (json.results ?? []) as any[];
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    country: r.country,
    admin1: r.admin1 ?? undefined,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

