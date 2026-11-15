/**
 * Lookup offline de coordenadas y timezone a partir de provincia/ciudad (Argentina).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "..", "data", "argentina.json");

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export interface Province {
  name: string;
  cities: City[];
}

export interface CountryData {
  country: string;
  timezone: string;
  utcOffsetHours: number;
  provinces: Province[];
}

export interface GeoResult {
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffsetHours: number;
}

let cache: CountryData | null = null;

export function getCountryData(): CountryData {
  if (!cache) {
    const raw = readFileSync(DATA_PATH, "utf-8");
    cache = JSON.parse(raw) as CountryData;
  }
  return cache;
}

/** Normaliza para comparar sin acentos ni mayúsculas */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Resuelve lat/lon/timezone para una ciudad dentro de una provincia.
 * Lanza error si no encuentra la ciudad.
 */
export function resolveCity(provinceName: string, cityName: string): GeoResult {
  const data = getCountryData();
  const province = data.provinces.find(
    (p) => normalize(p.name) === normalize(provinceName)
  );
  if (!province) {
    throw new Error(`Provincia no encontrada: "${provinceName}"`);
  }
  const city = province.cities.find(
    (c) => normalize(c.name) === normalize(cityName)
  );
  if (!city) {
    throw new Error(
      `Ciudad no encontrada: "${cityName}" en provincia "${provinceName}"`
    );
  }
  return {
    latitude: city.lat,
    longitude: city.lon,
    timezone: data.timezone,
    utcOffsetHours: data.utcOffsetHours,
  };
}
