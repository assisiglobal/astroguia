import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import Shell from "../components/Shell";
import { matchesForCity, searchCityNames } from "../lib/cities";
import { useFeatures } from "../lib/features";
import { saveNatalSession } from "../lib/natal";

export default function NatalFormPage() {
  const navigate = useNavigate();
  const { features } = useFeatures();
  const natal = features.find((feature) => feature.id === "natal");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string | null>(null);
  const [timeMode, setTimeMode] = useState<"unknown" | "exact" | "noon">("unknown");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const exact = useMemo(() => matchesForCity(query), [query]);
  const unique = exact.length === 1 ? exact[0] : null;
  const repeated = exact.length > 1 ? exact : null;
  const suggestions = unique || repeated ? [] : searchCityNames(query);
  const resolvedProvince = unique
    ? unique.province
    : repeated && province && repeated.some((item) => item.province === province)
      ? province
      : null;
  const resolvedCity = unique?.city ?? repeated?.find((item) => item.province === resolvedProvince)?.city ?? null;

  if (natal && natal.status !== "on") return <Navigate to="/" replace />;

  function onQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && suggestions.length > 0) {
      event.preventDefault();
      setQuery(suggestions[0]);
      setProvince(null);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) {
      setError("La fecha es obligatoria.");
      return;
    }
    if (!resolvedCity || !resolvedProvince) {
      setError(repeated ? "Elige la provincia." : "Elige una ciudad de la lista.");
      return;
    }
    if (timeMode === "exact" && !/^\d{2}:\d{2}$/.test(time)) {
      setError("Pon la hora.");
      return;
    }
    const sentTime = timeMode === "noon" ? "12:00" : timeMode === "exact" ? time : undefined;
    const trimmed = name.trim();
    saveNatalSession({
      request: {
        date,
        province: resolvedProvince,
        city: resolvedCity,
        ...(trimmed ? { name: trimmed } : {}),
        ...(sentTime ? { time: sentTime } : {}),
      },
      withHouses: Boolean(sentTime),
      chart: null,
    });
    navigate("/carga");
  }

  return (
    <Shell title="Carta natal">
      <form className="stack stack-lg" onSubmit={onSubmit} noValidate>
        <div className="intro-block">
          <h1>Tu carta natal</h1>
          <p>Cuéntanos cuándo y dónde naciste. El país queda en Argentina.</p>
        </div>

        <label className="field" htmlFor="nombre">
          <span>Nombre</span>
          <input
            id="nombre"
            name="nombre"
            value={name}
            autoComplete="name"
            placeholder="Opcional"
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        <label className="field" htmlFor="fecha">
          <span>Fecha de nacimiento</span>
          <input id="fecha" name="fecha" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <p className="fixed-country">
          <span>País</span> Argentina
        </p>

        <div className="field">
          <label htmlFor="ciudad">Ciudad</label>
          <input
            id="ciudad"
            name="ciudad"
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-autocomplete="list"
            aria-controls="ciudades"
            value={query}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Busca tu ciudad"
            onChange={(event) => {
              setQuery(event.target.value);
              setProvince(null);
              setError(null);
            }}
            onKeyDown={onQueryKeyDown}
          />
          {suggestions.length > 0 ? (
            <ul className="suggestions" id="ciudades" role="listbox">
              {suggestions.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    role="option"
                    onClick={() => {
                      setQuery(city);
                      setProvince(null);
                      setError(null);
                    }}
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {unique && resolvedProvince ? (
            <p className="confirm">
              <span>Provincia</span> {resolvedProvince}
            </p>
          ) : null}
          {repeated ? (
            <div className="stack">
              <p id="province-help">Hay más de una {repeated[0].city}. Elige la provincia.</p>
              <div className="province-pick" role="group" aria-describedby="province-help" aria-label="Elige la provincia">
                {repeated.map((item) => (
                  <button
                    key={item.province}
                    type="button"
                    className="btn btn-secondary"
                    aria-pressed={province === item.province}
                    onClick={() => {
                      setProvince(item.province);
                      setError(null);
                    }}
                  >
                    {item.province}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <fieldset className="stack">
          <legend>Hora de nacimiento</legend>
          <label className="field" htmlFor="hora">
            <span>Hora</span>
            <input
              id="hora"
              name="hora"
              type="time"
              value={timeMode === "noon" ? "12:00" : time}
              disabled={timeMode !== "exact"}
              onFocus={() => setTimeMode("exact")}
              onChange={(event) => {
                setTime(event.target.value);
                setTimeMode("exact");
                setError(null);
              }}
            />
          </label>
          <label className="choice">
            <input
              type="radio"
              name="hora-modo"
              checked={timeMode === "unknown"}
              onChange={() => setTimeMode("unknown")}
            />
            <span>No sé mi hora, calcular sin casas</span>
          </label>
          <label className="choice">
            <input type="radio" name="hora-modo" checked={timeMode === "exact"} onChange={() => setTimeMode("exact")} />
            <span>Poner la hora</span>
          </label>
          <label className="choice">
            <input type="radio" name="hora-modo" checked={timeMode === "noon"} onChange={() => setTimeMode("noon")} />
            <span>Calcular con las 12</span>
          </label>
        </fieldset>

        {error ? (
          <p className="alert" role="alert">
            {error}
          </p>
        ) : null}

        <button className="btn btn-primary" type="submit">
          Calcular mi carta
        </button>
        <Link className="text-link" to="/">
          Volver al inicio
        </Link>
      </form>
    </Shell>
  );
}
