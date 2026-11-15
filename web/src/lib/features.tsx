import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type FeatureStatus = "on" | "soon" | "off";

export type FeatureId = "natal" | "solar" | "lunar" | "synastry" | "daily";

export interface Feature {
  id: FeatureId;
  title: string;
  line: string;
  status: FeatureStatus;
}

export const FEATURE_DEFAULTS: Feature[] = [
  { id: "natal", title: "Carta natal", line: "El cielo del momento en que naciste", status: "on" },
  { id: "solar", title: "Revolución solar", line: "El año que empieza en tu cumpleaños", status: "on" },
  { id: "lunar", title: "Revolución lunar", line: "El mes según tu luna", status: "on" },
  { id: "synastry", title: "Sinastrías", line: "El cruce entre dos cartas", status: "on" },
  { id: "daily", title: "Horóscopo diario", line: "Una nota breve para tu día", status: "on" },
];

const KEY = "astroguia:features";

function isStatus(value: unknown): value is FeatureStatus {
  return value === "on" || value === "soon" || value === "off";
}

export function loadFeatures(): Feature[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return FEATURE_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Feature>[];
    return FEATURE_DEFAULTS.map((fallback) => {
      const saved = parsed.find((item) => item?.id === fallback.id);
      if (!saved) return fallback;
      return {
        id: fallback.id,
        title: typeof saved.title === "string" && saved.title.trim() ? saved.title.trim() : fallback.title,
        line: typeof saved.line === "string" ? saved.line.trim() : fallback.line,
        status: isStatus(saved.status) ? saved.status : fallback.status,
      };
    });
  } catch {
    return FEATURE_DEFAULTS;
  }
}

export function saveFeatures(features: Feature[]): void {
  localStorage.setItem(KEY, JSON.stringify(features));
}

export function featurePath(id: FeatureId): string {
  return id === "natal" ? "/carta-natal" : `/abrir/${id}`;
}

export function isFeatureId(value: string): value is FeatureId {
  return FEATURE_DEFAULTS.some((feature) => feature.id === value);
}

interface FeaturesContextValue {
  features: Feature[];
  save: (features: Feature[]) => void;
}

const FeaturesContext = createContext<FeaturesContextValue | null>(null);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<Feature[]>(loadFeatures);
  const save = useCallback((next: Feature[]) => {
    saveFeatures(next);
    setFeatures(next);
  }, []);
  const value = useMemo(() => ({ features, save }), [features, save]);
  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>;
}

export function useFeatures(): FeaturesContextValue {
  const value = useContext(FeaturesContext);
  if (!value) throw new Error("useFeatures debe usarse dentro de FeaturesProvider");
  return value;
}
