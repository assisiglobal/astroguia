const SESSION_KEY = "astroguia:natal";

export interface NatalRequest {
  name?: string;
  date: string;
  time?: string;
  province: string;
  city: string;
}

export interface NatalPosition {
  sign: string | null;
  degree: number | null;
  longitude: number | null;
  house: number | null;
  retrograde: boolean | null;
}

export interface NatalAngle {
  sign: string;
  degree: number;
  longitude: number;
}

export interface NatalHouse {
  startLongitude: number;
  endLongitude: number;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  angle: number;
  orb: number;
}

export interface NatalChart {
  angles: {
    asc: NatalAngle;
    desc: NatalAngle;
    mc: NatalAngle;
    ic: NatalAngle;
  };
  planets: Record<string, NatalPosition>;
  houses: Record<string, NatalHouse>;
  aspects: NatalAspect[];
}

export interface NatalSession {
  request: NatalRequest;
  withHouses: boolean;
  chart: NatalChart | null;
}

export class NatalError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "NatalError";
    this.status = status;
  }
}

export function natalPayload(request: NatalRequest): Record<string, string> {
  const body: Record<string, string> = {
    date: request.date,
    province: request.province,
    city: request.city,
  };
  const name = request.name?.trim();
  if (name) body.name = name;
  body.time = request.time || "12:00";
  return body;
}

export function saveNatalSession(session: NatalSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readNatalSession(): NatalSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as NatalSession;
    if (!parsed?.request?.date || !parsed.request.province || !parsed.request.city) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function postNatal(request: NatalRequest, signal?: AbortSignal): Promise<NatalChart> {
  let response: Response;
  try {
    response = await fetch("/api/natal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(natalPayload(request)),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NatalError("No pudimos hablar con el cálculo. Revisa que la API esté en marcha.", 0);
  }

  const body = (await response.json().catch(() => null)) as { error?: string } | NatalChart | null;
  if (!response.ok) {
    const message =
      body && "error" in body && typeof body.error === "string"
        ? body.error
        : "No pudimos calcular la carta.";
    throw new NatalError(message, response.status);
  }
  if (!body || !("planets" in body) || !body.planets || !body.angles?.asc || !body.angles.mc) {
    throw new NatalError("La respuesta de la carta llegó incompleta.", response.status);
  }
  return body;
}
