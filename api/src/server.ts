/**
 * API de carta natal.
 *  - GET  /api/health          -> estado
 *  - GET  /api/locations       -> provincias y ciudades disponibles (para el form)
 *  - POST /api/natal           -> calcula la carta natal
 */
import express, { type Request, type Response } from "express";
import cors from "cors";
import { computeNatalChart, type NatalInput } from "./astro.js";
import { getCountryData, resolveCity } from "./geo.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/locations", (_req: Request, res: Response) => {
  const data = getCountryData();
  res.json({
    country: data.country,
    timezone: data.timezone,
    provinces: data.provinces.map((p) => ({
      name: p.name,
      cities: p.cities.map((c) => c.name),
    })),
  });
});

interface NatalRequestBody {
  name?: string;
  date?: string;
  time?: string;
  country?: string;
  province?: string;
  city?: string;
}

app.post("/api/natal", (req: Request, res: Response) => {
  try {
    const body = req.body as NatalRequestBody;
    const { name, date, time, province, city } = body;
    const country = body.country ?? "Argentina";

    if (!date || !time || !province || !city) {
      return res.status(400).json({
        error:
          "Faltan campos obligatorios: date (YYYY-MM-DD), time (HH:MM), province, city",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res
        .status(400)
        .json({ error: "Formato de date inválido. Esperado YYYY-MM-DD" });
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res
        .status(400)
        .json({ error: "Formato de time inválido. Esperado HH:MM" });
    }

    const geo = resolveCity(province, city);

    const input: NatalInput = {
      name,
      date,
      time,
      country,
      province,
      city,
      latitude: geo.latitude,
      longitude: geo.longitude,
      timezone: geo.timezone,
      utcOffsetHours: geo.utcOffsetHours,
    };

    const chart = computeNatalChart(input);
    return res.json(chart);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return res.status(400).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Astro Natal API escuchando en http://localhost:${PORT}`);
});
