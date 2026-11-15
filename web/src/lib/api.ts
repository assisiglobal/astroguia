import type { Interpretation, LocationsResponse, NatalChart, NatalFormData } from "./types";
import { UNKNOWN_TIME } from "./constants";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `Error ${res.status} al llamar a ${url}`);
  }
  return body as T;
}

export async function getLocations(): Promise<LocationsResponse> {
  try {
    return await fetchJson<LocationsResponse>("/api/locations");
  } catch {
    // Sin API disponible (ej. GitHub Pages) usamos el dataset offline.
    const { default: data } = await import("../../../data/argentina.json");
    return {
      country: data.country,
      timezone: data.timezone,
      provinces: data.provinces.map((p) => ({ name: p.name, cities: p.cities.map((c) => c.name) })),
    };
  }
}

export function postNatal(form: NatalFormData): Promise<NatalChart> {
  return fetchJson<NatalChart>("/api/natal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: form.name.trim() || undefined,
      date: form.date,
      time: form.unknownTime ? UNKNOWN_TIME : form.time,
      country: form.country,
      province: form.province,
      city: form.city,
    }),
  });
}

/** Mock hasta que exista el endpoint de interpretación con IA. */
export async function getInterpretation(_chart: NatalChart): Promise<Interpretation> {
  const [{ MOCK_INTERPRETATION }] = await Promise.all([
    import("../mocks/interpretation"),
    new Promise((r) => setTimeout(r, 6000 + Math.random() * 2000)),
  ]);
  return MOCK_INTERPRETATION;
}
