import { NatalError, type NatalChart, type NatalReading } from "./natal";

export type InterpretTone = "alto" | "medio" | "bajo";
export type InterpretCloseness = "confianza" | "frialdad";
export type InterpretModel = "gpt-4.1" | "gpt-4.1-mini" | "gpt-4o";

export interface InterpretationSettings {
  trial: boolean;
  model: InterpretModel;
  tone: InterpretTone;
  closeness: InterpretCloseness;
}

export const AREA_TITLES = [
  "Personalidad",
  "Amor",
  "Disfrute",
  "Viajes",
  "Trabajo",
  "Amistades",
  "Familia",
] as const;

export const MODEL_OPTIONS: { value: InterpretModel; label: string }[] = [
  { value: "gpt-4.1", label: "gpt-4.1 (recomendada)" },
  { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
  { value: "gpt-4o", label: "gpt-4o" },
];

const DEFAULTS: InterpretationSettings = {
  trial: true,
  model: "gpt-4.1",
  tone: "medio",
  closeness: "confianza",
};

const KEY = "astroguia:interpretation";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit",
  "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum",
];

/** Palabras de una lectura real: 24/04/1997 14:36, Buenos Aires, tono medio, confianza, gpt-4.1. */
const MEASURED: { words: number; paragraphs: number }[] = [
  { words: 135, paragraphs: 2 },
  { words: 361, paragraphs: 4 },
  { words: 325, paragraphs: 4 },
  { words: 258, paragraphs: 4 },
  { words: 253, paragraphs: 4 },
  { words: 306, paragraphs: 4 },
  { words: 201, paragraphs: 4 },
  { words: 253, paragraphs: 4 },
];

function isTone(value: unknown): value is InterpretTone {
  return value === "alto" || value === "medio" || value === "bajo";
}

function isCloseness(value: unknown): value is InterpretCloseness {
  return value === "confianza" || value === "frialdad";
}

function isModel(value: unknown): value is InterpretModel {
  return value === "gpt-4.1" || value === "gpt-4.1-mini" || value === "gpt-4o";
}

export function loadInterpretationSettings(): InterpretationSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<InterpretationSettings>;
    return {
      trial: typeof parsed.trial === "boolean" ? parsed.trial : DEFAULTS.trial,
      model: isModel(parsed.model) ? parsed.model : DEFAULTS.model,
      tone: isTone(parsed.tone) ? parsed.tone : DEFAULTS.tone,
      closeness: isCloseness(parsed.closeness) ? parsed.closeness : DEFAULTS.closeness,
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveInterpretationSettings(settings: InterpretationSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

function measuredText(wordCount: number, paragraphs: number, offset: number): string {
  const base = Math.floor(wordCount / paragraphs);
  const extra = wordCount % paragraphs;
  const parts: string[] = [];
  let cursor = offset;
  for (let index = 0; index < paragraphs; index += 1) {
    const count = base + (index < extra ? 1 : 0);
    const words = Array.from({ length: count }, () => {
      const token = LOREM_WORDS[cursor % LOREM_WORDS.length];
      cursor += 1;
      return token;
    });
    if (words.length > 0) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      words[words.length - 1] = `${words[words.length - 1]}.`;
    }
    parts.push(words.join(" "));
  }
  return parts.join("\n\n");
}

/** Relleno con el largo medido de una lectura real, en varios párrafos por área. */
export function fillerReading(): NatalReading {
  const [synthesis, ...areas] = MEASURED;
  return {
    synthesis: measuredText(synthesis.words, synthesis.paragraphs, 0),
    areas: AREA_TITLES.map((title, index) => ({
      title,
      text: measuredText(areas[index].words, areas[index].paragraphs, (index + 1) * 17),
    })),
  };
}

export function readingParagraphs(text: string): string[] {
  const parts = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text.trim()];
}

export async function postInterpret(
  input: {
    chart: NatalChart;
    tone: InterpretTone;
    closeness: InterpretCloseness;
    model: InterpretModel;
    name?: string;
    hasTime: boolean;
  },
  signal?: AbortSignal,
): Promise<NatalReading> {
  let response: Response;
  try {
    response = await fetch("/api/interpret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NatalError("No pudimos hablar con la interpretación. Revisa que la API esté en marcha.", 0);
  }

  const body = (await response.json().catch(() => null)) as { error?: string } | NatalReading | null;
  if (!response.ok) {
    const message = body && "error" in body && typeof body.error === "string" ? body.error : "No pudimos interpretar la carta.";
    throw new NatalError(message, response.status);
  }
  if (
    !body ||
    !("synthesis" in body) ||
    typeof body.synthesis !== "string" ||
    !Array.isArray(body.areas) ||
    body.areas.length !== 7
  ) {
    throw new NatalError("La interpretación llegó incompleta.", response.status);
  }
  return body;
}
