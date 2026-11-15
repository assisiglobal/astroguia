/**
 * Cálculo de carta natal usando Swiss Ephemeris (@swisseph/node).
 * Función determinística: mismos inputs -> mismo output.
 */
import {
  dateToJulianDay,
  calculatePosition,
  calculateHouses,
  Planet,
  LunarPoint,
  Asteroid,
  HouseSystem,
} from "@swisseph/node";

// -------------------- Constantes --------------------

/** Signos en inglés (lowercase) tal como los espera API.md ("taurus", "gemini", ...) */
export const SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type Sign = (typeof SIGNS)[number];

/** Cuerpos que se calculan directamente con efemérides */
const EPHEMERIS_BODIES: { key: string; body: number }[] = [
  { key: "sun", body: Planet.Sun },
  { key: "moon", body: Planet.Moon },
  { key: "mercury", body: Planet.Mercury },
  { key: "venus", body: Planet.Venus },
  { key: "mars", body: Planet.Mars },
  { key: "jupiter", body: Planet.Jupiter },
  { key: "saturn", body: Planet.Saturn },
  { key: "uranus", body: Planet.Uranus },
  { key: "neptune", body: Planet.Neptune },
  { key: "pluto", body: Planet.Pluto },
  { key: "northNode", body: LunarPoint.MeanNode },
  { key: "lilith", body: LunarPoint.MeanApogee },
  { key: "chiron", body: Asteroid.Chiron },
];

/** Cuerpos que participan del cálculo de aspectos */
const ASPECT_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "northNode",
  "chiron",
  "lilith",
];

/** Definición de aspectos mayores con su ángulo exacto y orbe por defecto */
const ASPECT_DEFS: { name: string; angle: number; orb: number }[] = [
  { name: "conjunction", angle: 0, orb: 8 },
  { name: "sextile", angle: 60, orb: 6 },
  { name: "square", angle: 90, orb: 8 },
  { name: "trine", angle: 120, orb: 8 },
  { name: "opposition", angle: 180, orb: 8 },
];

const LUMINARIES = new Set(["sun", "moon"]);

// -------------------- Tipos de salida --------------------

export interface PositionData {
  sign: Sign | null;
  degree: number | null;
  longitude: number | null;
  house: number | null;
  retrograde: boolean | null;
  stationary?: boolean;
  speed?: number | null;
}

export interface AngleData {
  sign: Sign;
  degree: number;
  longitude: number;
}

export interface HouseRange {
  startSign: Sign;
  startDegree: number;
  endSign: Sign;
  endDegree: number;
  startLongitude: number;
  endLongitude: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  angle: number;
  orb: number;
  phase: "applying" | "separating" | "exact";
  label: string;
}

export interface BirthData {
  name?: string;
  date: string;
  time: string;
  country: string;
  province: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utcOffsetHours: number;
}

export interface NatalChart {
  metadata: {
    julianDay: number;
    houseSystem: string;
    birthData: BirthData;
  };
  angles: {
    asc: AngleData;
    desc: AngleData;
    mc: AngleData;
    ic: AngleData;
  };
  planets: Record<string, PositionData>;
  houses: Record<string, HouseRange>;
  aspects: AspectData[];
}

// -------------------- Helpers --------------------

/** Normaliza un ángulo al rango [0, 360) */
function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Convierte una longitud eclíptica en {signo, grado} */
function toSignDegree(longitude: number): { sign: Sign; degree: number } {
  const lon = norm360(longitude);
  const signIndex = Math.floor(lon / 30);
  const degree = lon - signIndex * 30;
  return { sign: SIGNS[signIndex], degree: round2(degree) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Determina en qué casa (1-12) cae una longitud, dadas las 12 cúspides.
 * cusps[i] es la longitud de inicio de la casa i (1..12).
 */
function houseOf(longitude: number, cusps: number[]): number {
  const lon = norm360(longitude);
  for (let i = 1; i <= 12; i++) {
    const start = norm360(cusps[i]);
    const end = norm360(cusps[i === 12 ? 1 : i + 1]);
    if (start <= end) {
      if (lon >= start && lon < end) return i;
    } else {
      // la casa cruza los 0°
      if (lon >= start || lon < end) return i;
    }
  }
  return 12;
}

/** Diferencia angular mínima entre dos longitudes (0-180) */
function angularDiff(a: number, b: number): number {
  let d = Math.abs(norm360(a) - norm360(b));
  if (d > 180) d = 360 - d;
  return d;
}

// -------------------- Input --------------------

export interface NatalInput {
  name?: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (hora local) */
  time: string;
  country: string;
  province: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  /** Offset horario en horas respecto a UTC (ej: -3 para Argentina) */
  utcOffsetHours: number;
}

// -------------------- Cálculo principal --------------------

export function computeNatalChart(input: NatalInput): NatalChart {
  const [year, month, day] = input.date.split("-").map(Number);
  const [hour, minute] = input.time.split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    throw new Error(
      "Formato de fecha/hora inválido. Esperado date=YYYY-MM-DD, time=HH:MM"
    );
  }

  // Hora local -> UTC. Ej: Argentina UTC-3 => UTC = local - (-3) = local + 3h
  const utcMillis = Date.UTC(
    year,
    month - 1,
    day,
    hour - input.utcOffsetHours,
    minute
  );
  const utcDate = new Date(utcMillis);
  const jd = dateToJulianDay(utcDate);

  // Casas y ángulos (Placidus)
  const houseData = calculateHouses(
    jd,
    input.latitude,
    input.longitude,
    HouseSystem.Placidus
  );
  const cusps = houseData.cusps; // índices 1..12

  const ascLon = norm360(houseData.ascendant);
  const mcLon = norm360(houseData.mc);
  const descLon = norm360(ascLon + 180);
  const icLon = norm360(mcLon + 180);

  const angles = {
    asc: buildAngle(ascLon),
    desc: buildAngle(descLon),
    mc: buildAngle(mcLon),
    ic: buildAngle(icLon),
  };

  // Planetas
  const planets: Record<string, PositionData> = {};
  const longitudes: Record<string, number> = {};
  const speeds: Record<string, number> = {};

  for (const { key, body } of EPHEMERIS_BODIES) {
    try {
      const pos = calculatePosition(jd, body);
      const lon = norm360(pos.longitude);
      const { sign, degree } = toSignDegree(lon);
      const speed = pos.longitudeSpeed;
      const stationary = Math.abs(speed) < 0.001;
      planets[key] = {
        sign,
        degree,
        longitude: round2(lon),
        house: houseOf(lon, cusps),
        retrograde: speed < 0,
        stationary,
        speed: round2(speed),
      };
      longitudes[key] = lon;
      speeds[key] = speed;
    } catch {
      planets[key] = {
        sign: null,
        degree: null,
        longitude: null,
        house: null,
        retrograde: null,
      };
    }
  }

  // Nodo sur = nodo norte + 180
  if (longitudes.northNode !== undefined) {
    const southLon = norm360(longitudes.northNode + 180);
    const { sign, degree } = toSignDegree(southLon);
    planets.southNode = {
      sign,
      degree,
      longitude: round2(southLon),
      house: houseOf(southLon, cusps),
      retrograde: planets.northNode.retrograde,
      stationary: planets.northNode.stationary,
      speed: planets.northNode.speed,
    };
  }

  // Partes árabes (Fortuna / Infortunio)
  // Diurna: ASC + Luna - Sol ; Nocturna: ASC - Luna + Sol
  if (longitudes.sun !== undefined && longitudes.moon !== undefined) {
    const isDay = isDayChart(longitudes.sun, ascLon);
    const fortuneLon = isDay
      ? norm360(ascLon + longitudes.moon - longitudes.sun)
      : norm360(ascLon - longitudes.moon + longitudes.sun);
    planets.partOfFortune = buildPoint(fortuneLon, cusps);
    planets.partOfMisfortune = buildPoint(norm360(fortuneLon + 180), cusps);
  }

  // Earth: no aplica en carta geocéntrica
  planets.earth = {
    sign: null,
    degree: null,
    longitude: null,
    house: null,
    retrograde: null,
  };

  // Casas
  const houses: Record<string, HouseRange> = {};
  for (let i = 1; i <= 12; i++) {
    const startLon = norm360(cusps[i]);
    const endLon = norm360(cusps[i === 12 ? 1 : i + 1]);
    const start = toSignDegree(startLon);
    const end = toSignDegree(endLon);
    houses[String(i)] = {
      startSign: start.sign,
      startDegree: start.degree,
      endSign: end.sign,
      endDegree: end.degree,
      startLongitude: round2(startLon),
      endLongitude: round2(endLon),
    };
  }

  // Aspectos
  const aspects = computeAspects(longitudes, speeds);

  const birthData: BirthData = {
    name: input.name,
    date: input.date,
    time: input.time,
    country: input.country,
    province: input.province,
    city: input.city,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    utcOffsetHours: input.utcOffsetHours,
  };

  return {
    metadata: {
      julianDay: jd,
      houseSystem: "Placidus",
      birthData,
    },
    angles,
    planets,
    houses,
    aspects,
  };
}

function buildAngle(longitude: number): AngleData {
  const { sign, degree } = toSignDegree(longitude);
  return { sign, degree, longitude: round2(norm360(longitude)) };
}

function buildPoint(longitude: number, cusps: number[]): PositionData {
  const { sign, degree } = toSignDegree(longitude);
  return {
    sign,
    degree,
    longitude: round2(longitude),
    house: houseOf(longitude, cusps),
    retrograde: false,
  };
}

/** Carta diurna si el Sol está sobre el horizonte (casas 7-12, es decir entre DESC y ASC por arriba) */
function isDayChart(sunLon: number, ascLon: number): boolean {
  // El Sol está por encima del horizonte si su longitud está entre el DESC y el ASC
  // medido en el hemisferio superior. Aproximación estándar: día si el Sol está en
  // las casas 7..12 (mitad occidental-superior). Usamos la posición relativa al ASC/DESC.
  const rel = norm360(sunLon - ascLon);
  return rel >= 180; // entre DESC (180 desde ASC) y ASC de nuevo -> hemisferio superior
}

function computeAspects(
  longitudes: Record<string, number>,
  speeds: Record<string, number>
): AspectData[] {
  const result: AspectData[] = [];
  const keys = ASPECT_BODIES.filter((k) => longitudes[k] !== undefined);

  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const a = keys[i];
      const b = keys[j];
      const diff = angularDiff(longitudes[a], longitudes[b]);

      for (const def of ASPECT_DEFS) {
        const involvesLuminary = LUMINARIES.has(a) || LUMINARIES.has(b);
        const maxOrb = involvesLuminary ? def.orb + 2 : def.orb;
        const orb = Math.abs(diff - def.angle);
        if (orb <= maxOrb) {
          const phase = computePhase(
            longitudes[a],
            longitudes[b],
            speeds[a] ?? 0,
            speeds[b] ?? 0,
            def.angle
          );
          result.push({
            planet1: a,
            planet2: b,
            aspect: def.name,
            angle: def.angle,
            orb: round2(orb),
            phase,
            label: `${a} ${def.name} ${b} (${phase})`,
          });
          break; // un par sólo puede formar un aspecto mayor
        }
      }
    }
  }

  // Ordenar por orbe ascendente (aspectos más exactos primero)
  result.sort((x, y) => x.orb - y.orb);
  return result;
}

/**
 * Determina si un aspecto es aplicativo (applying) o separativo (separating).
 * Se compara la separación actual con la separación un instante después.
 */
function computePhase(
  lonA: number,
  lonB: number,
  speedA: number,
  speedB: number,
  targetAngle: number
): "applying" | "separating" | "exact" {
  const currentDiff = angularDiff(lonA, lonB);
  const nextDiff = angularDiff(lonA + speedA / 24, lonB + speedB / 24);
  const currentOrb = Math.abs(currentDiff - targetAngle);
  const nextOrb = Math.abs(nextDiff - targetAngle);
  if (Math.abs(currentOrb) < 0.05) return "exact";
  return nextOrb < currentOrb ? "applying" : "separating";
}
