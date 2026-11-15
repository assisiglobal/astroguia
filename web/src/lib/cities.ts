import data from "../../../data/argentina.json";

export interface CityMatch {
  city: string;
  province: string;
}

const ALL: CityMatch[] = data.provinces.flatMap((province) =>
  province.cities.map((city) => ({ city: city.name, province: province.name })),
);

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function rank(item: CityMatch, needle: string): number {
  const city = normalize(item.city);
  if (city === needle) return 0;
  if (city.startsWith(needle)) return 1;
  return 2;
}

export function cityLabel(item: CityMatch): string {
  return `${item.city} · ${item.province}`;
}

export function browseCities(): CityMatch[] {
  return ALL.filter(
    (item) => item.province === "Ciudad Autónoma de Buenos Aires" || item.province === "Buenos Aires",
  );
}

function matchesQuery(city: string, needle: string): boolean {
  if (city.startsWith(needle)) return true;
  if (needle.length < 4) return false;
  return city.split(" ").some((word) => word.startsWith(needle));
}

export function searchCities(query: string): CityMatch[] {
  const needle = normalize(query);
  if (!needle) return browseCities();
  return ALL.filter((item) => matchesQuery(normalize(item.city), needle))
    .sort((a, b) => rank(a, needle) - rank(b, needle) || a.city.localeCompare(b.city, "es"))
    .slice(0, 12);
}

export function matchesForCity(query: string): CityMatch[] {
  const needle = normalize(query);
  if (!needle) return [];
  return ALL.filter((item) => normalize(item.city) === needle);
}
