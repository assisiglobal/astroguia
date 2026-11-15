import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import Shell from "../components/Shell";
import { cityLabel, matchesForCity, searchCities, type CityMatch } from "../lib/cities";
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
  const [timeMode, setTimeMode] = useState<"unknown" | "exact">("exact");
  const [time, setTime] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exact = useMemo(() => matchesForCity(query), [query]);
  const unique = exact.length === 1 ? exact[0] : null;
  const repeated = exact.length > 1 ? exact : null;
  const suggestions = cityOpen ? searchCities(query) : [];
  const resolvedProvince = unique
    ? unique.province
    : repeated && province && repeated.some((item) => item.province === province)
      ? province
      : null;
  const resolvedCity = unique?.city ?? repeated?.find((item) => item.province === resolvedProvince)?.city ?? null;

  if (natal && natal.status !== "on") return <Navigate to="/" replace />;

  function chooseCity(item: CityMatch) {
    setQuery(item.city);
    setProvince(item.province);
    setCityOpen(false);
    setError(null);
  }

  function onQueryKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && suggestions.length > 0) {
      event.preventDefault();
      chooseCity(suggestions[0]);
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
    const sentTime = timeMode === "exact" ? time : undefined;
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
        <Link className="text-link" to="/">
          Volver al inicio
        </Link>
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

        <label className="field field-date" htmlFor="fecha">
          <span>Fecha de nacimiento</span>
          <input id="fecha" name="fecha" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <label className="field" htmlFor="pais">
          <span>País</span>
          <select id="pais" name="pais" value="Argentina" disabled>
            <option value="Argentina">Argentina (próximamente otros países)</option>
          </select>
        </label>

        <div className="field">
          <label htmlFor="ciudad">Ciudad</label>
          <input
            id="ciudad"
            name="ciudad"
            role="combobox"
            aria-expanded={cityOpen && suggestions.length > 0}
            aria-autocomplete="list"
            aria-controls="ciudades"
            value={query}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Busca tu ciudad"
            onFocus={() => setCityOpen(true)}
            onBlur={() => setCityOpen(false)}
            onChange={(event) => {
              setQuery(event.target.value);
              setProvince(null);
              setCityOpen(true);
              setError(null);
            }}
            onKeyDown={onQueryKeyDown}
          />
          {cityOpen && suggestions.length > 0 ? (
            <ul className="suggestions" id="ciudades" role="listbox">
              {suggestions.map((item) => (
                <li key={`${item.city}-${item.province}`}>
                  <button
                    type="button"
                    role="option"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseCity(item)}
                  >
                    {cityLabel(item)}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {resolvedProvince && (unique || repeated) ? (
            <p className="confirm">
              <span>Provincia</span> {resolvedProvince}
            </p>
          ) : null}
          {repeated && !resolvedProvince ? (
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
          <label className="field field-time" htmlFor="hora">
            <input
              id="hora"
              name="hora"
              type="time"
              aria-label="Hora"
              value={time}
              disabled={timeMode === "unknown"}
              onChange={(event) => {
                setTime(event.target.value);
                setError(null);
              }}
            />
          </label>
          <label className="choice">
            <input
              type="checkbox"
              checked={timeMode === "unknown"}
              onChange={(event) => {
                setTimeMode(event.target.checked ? "unknown" : "exact");
                setError(null);
              }}
            />
            <span>No sé mi hora, calcular sin casas</span>
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
      </form>
    </Shell>
  );
}
