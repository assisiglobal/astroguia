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

export function searchCityNames(query: string): string[] {
  const needle = normalize(query);
  if (!needle) return [];
  const names: string[] = [];
  const seen = new Set<string>();
  for (const item of ALL) {
    const key = normalize(item.city);
    if (!key.includes(needle) || seen.has(key)) continue;
    seen.add(key);
    names.push(item.city);
    if (names.length === 8) break;
  }
  return names;
}

export function matchesForCity(query: string): CityMatch[] {
  const needle = normalize(query);
  if (!needle) return [];
  return ALL.filter((item) => normalize(item.city) === needle);
}
