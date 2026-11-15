import type { NatalSheetData, SheetAspect } from "../components/NatalSheet";
import type { NatalChart } from "./natal";

const VISIBLE: Record<string, string> = {
  sun: "sun",
  moon: "moon",
  mercury: "mer",
  venus: "ven",
  mars: "mar",
  jupiter: "jup",
  saturn: "sat",
  uranus: "ura",
  neptune: "nep",
  pluto: "plu",
  chiron: "chi",
  northNode: "node",
  lilith: "lil",
  partOfFortune: "for",
};

const ASPECTS = new Set(["conjunction", "sextile", "square", "trine", "opposition"]);

export function chartToSheet(chart: NatalChart, withHouses: boolean): NatalSheetData | null {
  if (!chart?.planets || chart.angles?.asc?.longitude == null || chart.angles?.mc?.longitude == null) return null;

  const bodies = Object.entries(VISIBLE).flatMap(([key, id]) => {
    const point = chart.planets[key];
    if (!point || point.longitude == null) return [];
    return [{ id, lon: point.longitude, retro: point.retrograde === true }];
  });
  if (bodies.length === 0) return null;

  const aspects: SheetAspect[] = [];
  for (const aspect of chart.aspects ?? []) {
    const from = VISIBLE[aspect.planet1];
    const to = VISIBLE[aspect.planet2];
    if (!from || !to || !ASPECTS.has(aspect.aspect)) continue;
    aspects.push({ from, to, kind: aspect.aspect as SheetAspect["kind"] });
  }

  if (!withHouses) {
    return { frame: "zodiac", asc: { lon: 0 }, mc: { lon: 0 }, bodies, aspects };
  }

  const houses = [];
  for (let index = 1; index <= 12; index += 1) {
    const house = chart.houses?.[String(index)];
    if (house?.startLongitude == null) return null;
    houses.push({ lon: house.startLongitude });
  }

  return {
    frame: "houses",
    asc: { lon: chart.angles.asc.longitude },
    mc: { lon: chart.angles.mc.longitude },
    houses,
    bodies,
    aspects,
  };
}
