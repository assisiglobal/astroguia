import { readFileSync } from "node:fs";
import path from "node:path";
import { apiRoot, openAiKey } from "./env.js";

export const MODELS = ["gpt-4.1", "gpt-4.1-mini", "gpt-4o"] as const;
export const TONES = ["alto", "medio", "bajo"] as const;
export const CLOSENESS = ["confianza", "frialdad"] as const;
export const AREA_TITLES = [
  "Personalidad",
  "Amor",
  "Disfrute",
  "Viajes",
  "Trabajo",
  "Amistades",
  "Familia",
] as const;

const TONE_LABEL = {
  alto: "ALTO",
  medio: "MEDIO",
  bajo: "BAJO",
} as const;

const TRADITIONAL_RULER: Record<string, string> = {
  aries: "mars",
  taurus: "venus",
  gemini: "mercury",
  cancer: "moon",
  leo: "sun",
  virgo: "mercury",
  libra: "venus",
  scorpio: "mars",
  sagittarius: "jupiter",
  capricorn: "saturn",
  aquarius: "saturn",
  pisces: "jupiter",
};

const SKILL_FILES = [
  "SKILL.md",
  "references/parseo_input.md",
  "references/ponderacion.md",
  "references/areas_vida.md",
  "references/significados_signos_casas.md",
  "references/aspectos.md",
  "references/estilo_narrativo.md",
];

export class InterpretError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "InterpretError";
    this.status = status;
  }
}

export interface ReadingArea {
  title: (typeof AREA_TITLES)[number];
  text: string;
}

export interface Reading {
  synthesis: string;
  areas: ReadingArea[];
}

interface InterpretRequest {
  chart?: unknown;
  tone?: unknown;
  closeness?: unknown;
  model?: unknown;
  name?: unknown;
  hasTime?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function skillPrompt(): string {
  const root = path.join(apiRoot(), "skills", "carta-natal");
  return SKILL_FILES.map((file) => readFileSync(path.join(root, file), "utf8").trim()).join("\n\n");
}

function pointForPrompt(value: unknown, hasTime: boolean): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  if (value.sign == null && value.longitude == null) return null;
  const point: Record<string, unknown> = {
    sign: value.sign ?? null,
    degree: value.degree ?? null,
    longitude: value.longitude ?? null,
    retrograde: value.retrograde ?? null,
  };
  if (hasTime) point.house = value.house ?? null;
  return point;
}

function chartForPrompt(chart: Record<string, unknown>, hasTime: boolean): Record<string, unknown> {
  const planets: Record<string, unknown> = {};
  if (isRecord(chart.planets)) {
    for (const [key, value] of Object.entries(chart.planets)) {
      const point = pointForPrompt(value, hasTime);
      if (point) planets[key] = point;
    }
  }
  if (!hasTime) {
    delete planets.partOfFortune;
    delete planets.partOfMisfortune;
    return {
      planets,
      aspects: Array.isArray(chart.aspects) ? chart.aspects : [],
    };
  }

  const rulers: Record<string, { sign: string; traditionalRuler: string }> = {};
  if (isRecord(chart.houses)) {
    for (const [id, house] of Object.entries(chart.houses)) {
      if (!isRecord(house) || typeof house.startSign !== "string") continue;
      rulers[id] = {
        sign: house.startSign,
        traditionalRuler: TRADITIONAL_RULER[house.startSign] ?? "desconocido",
      };
    }
  }

  return {
    angles: chart.angles ?? null,
    houses: chart.houses ?? null,
    rulers,
    planets,
    aspects: Array.isArray(chart.aspects) ? chart.aspects : [],
  };
}

function stripLongDash(text: string): string {
  return text.replaceAll("—", ", ").replaceAll("―", ", ").replace(/[ ]{2,}/g, " ").trim();
}

function areaText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = stripLongDash(value);
  return text ? text : null;
}

function readingFromModel(raw: unknown): Reading {
  if (!isRecord(raw)) {
    throw new InterpretError("La interpretación no llegó en el formato esperado.", 502);
  }
  const synthesis = areaText(raw.synthesis);
  if (!synthesis) {
    throw new InterpretError("La interpretación no trajo la síntesis.", 502);
  }

  const byTitle = new Map<string, string>();
  if (Array.isArray(raw.areas)) {
    raw.areas.forEach((area, index) => {
      if (!isRecord(area)) return;
      const title = typeof area.title === "string" ? area.title.trim() : AREA_TITLES[index];
      const text = areaText(area.text);
      if (title && text) byTitle.set(title.toLowerCase(), text);
    });
  } else if (isRecord(raw.areas)) {
    for (const title of AREA_TITLES) {
      const text = areaText(raw.areas[title] ?? raw.areas[title.toLowerCase()]);
      if (text) byTitle.set(title.toLowerCase(), text);
    }
  }

  const areas = AREA_TITLES.map((title) => {
    const text = byTitle.get(title.toLowerCase());
    return text ? { title, text } : null;
  });
  if (areas.some((area) => !area)) {
    throw new InterpretError("La interpretación no trajo las 7 áreas.", 502);
  }
  return { synthesis, areas: areas as ReadingArea[] };
}

function userPrompt(input: {
  chart: Record<string, unknown>;
  tone: (typeof TONES)[number];
  closeness: (typeof CLOSENESS)[number];
  name?: string;
  hasTime: boolean;
}): string {
  const lines = [
    "Interpretá esta carta y devolvé solo JSON, sin markdown.",
    'Forma exacta: {"synthesis":"...","areas":[{"title":"Personalidad","text":"..."},{"title":"Amor","text":"..."},{"title":"Disfrute","text":"..."},{"title":"Viajes","text":"..."},{"title":"Trabajo","text":"..."},{"title":"Amistades","text":"..."},{"title":"Familia","text":"..."}]}',
    "Los títulos van en ese orden y no se cambian. Cada text tiene varios párrafos, separados por una línea en blanco.",
    "No uses el carácter — en ningún lado.",
    "No calcules posiciones nuevas. Usá solo los datos de abajo.",
    `Nivel de detalle ya elegido: ${TONE_LABEL[input.tone]}. No preguntes ni lo cambies.`,
    input.name?.trim() ? `Nombre de la persona: ${input.name.trim()}.` : "No hay nombre.",
  ];
  if (input.closeness === "confianza") {
    lines.push(
      "Cercanía: confianza. Voseo argentino, cercana, la persona como sujeto de la oración y el planeta como evidencia.",
    );
  } else {
    lines.push(
      "Cercanía: frialdad. Esta instrucción pisa la persona gramatical de la skill: escribí más como un manual y poné el planeta como sujeto de la oración. Seguís en español y sin el carácter —.",
    );
  }
  if (input.hasTime) {
    lines.push("Hay hora de nacimiento real. Usá ángulos, casas y regentes tradicionales que vienen en la carta.");
  } else {
    lines.push(
      "No hay hora de nacimiento real. Los datos no incluyen casas ni ASC, DSC, MC ni IC. No los inventes. En la síntesis, decilo en una sola frase.",
    );
  }
  lines.push("Carta:", JSON.stringify(chartForPrompt(input.chart, input.hasTime), null, 2));
  return lines.join("\n");
}

export async function interpretChart(body: InterpretRequest): Promise<Reading> {
  if (!openAiKey()) {
    throw new InterpretError(
      "Falta OPENAI_API_KEY en el servidor. No se puede generar la interpretación.",
      503,
    );
  }
  if (!MODELS.includes(body.model as (typeof MODELS)[number])) {
    throw new InterpretError("El modelo tiene que ser gpt-4.1, gpt-4.1-mini o gpt-4o.", 400);
  }
  if (!TONES.includes(body.tone as (typeof TONES)[number])) {
    throw new InterpretError("El tono tiene que ser alto, medio o bajo.", 400);
  }
  if (!CLOSENESS.includes(body.closeness as (typeof CLOSENESS)[number])) {
    throw new InterpretError("La cercanía tiene que ser confianza o frialdad.", 400);
  }
  if (typeof body.hasTime !== "boolean") {
    throw new InterpretError("Falta indicar si hay hora real.", 400);
  }
  if (!isRecord(body.chart) || !isRecord(body.chart.planets)) {
    throw new InterpretError("Falta la carta que devolvió el cálculo.", 400);
  }
  const name = typeof body.name === "string" ? body.name : undefined;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: body.model,
      temperature: 0.7,
      max_tokens: 5000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: skillPrompt() },
        {
          role: "user",
          content: userPrompt({
            chart: body.chart,
            tone: body.tone as (typeof TONES)[number],
            closeness: body.closeness as (typeof CLOSENESS)[number],
            name,
            hasTime: body.hasTime,
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(180_000),
  });

  const payload = (await response.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[];
  } | null;
  if (!response.ok) {
    throw new InterpretError("OpenAI no pudo interpretar la carta.", 502);
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    throw new InterpretError("OpenAI no devolvió texto.", 502);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new InterpretError("La interpretación no llegó como JSON.", 502);
  }
  return readingFromModel(parsed);
}
