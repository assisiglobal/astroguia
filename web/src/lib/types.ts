export interface LocationsResponse {
  country: string;
  timezone: string;
  provinces: { name: string; cities: string[] }[];
}

export interface NatalFormData {
  name: string;
  country: string;
  province: string;
  city: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  unknownTime: boolean;
}

/** Respuesta de POST /api/natal. Se tipa solo lo que usa el front por ahora. */
export interface NatalChart {
  metadata: {
    julianDay: number;
    houseSystem: string;
    birthData: {
      name?: string;
      date: string;
      time: string;
      country: string;
      province: string;
      city: string;
    };
  };
  [key: string]: unknown;
}

export type SectionId =
  | "personalidad"
  | "amor"
  | "disfrute"
  | "viajes"
  | "trabajo"
  | "amistades"
  | "familia"
  | "sintesis";

export interface InterpretationSection {
  id: SectionId;
  title: string;
  content: string;
}

export interface Interpretation {
  sections: InterpretationSection[];
}

export interface StoredReading {
  form: NatalFormData;
  chart: NatalChart;
  interpretation: Interpretation;
  createdAt: string;
}
