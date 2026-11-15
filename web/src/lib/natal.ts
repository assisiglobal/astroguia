const SESSION_KEY = "astroguia:natal";

export interface NatalRequest {
  name?: string;
  date: string;
  time?: string;
  province: string;
  city: string;
}

export interface NatalAngle {
  sign: string | null;
  degree: number | null;
}

export interface NatalChart {
  angles?: {
    asc?: NatalAngle;
    mc?: NatalAngle;
  };
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
  if (request.time) body.time = request.time;
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
    response = await fetch("http://localhost:3001/api/natal", {
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
  return (body ?? {}) as NatalChart;
}
