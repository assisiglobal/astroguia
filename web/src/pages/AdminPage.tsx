import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Shell from "../components/Shell";
import { isAdmin, loginAdmin, logoutAdmin } from "../lib/adminSession";
import { useFeatures, type Feature } from "../lib/features";
import {
  loadInterpretationSettings,
  MODEL_OPTIONS,
  saveInterpretationSettings,
  type InterpretCloseness,
  type InterpretModel,
  type InterpretationSettings,
  type InterpretTone,
} from "../lib/interpretation";

export default function AdminPage() {
  const navigate = useNavigate();
  const { features, save } = useFeatures();
  const [authed, setAuthed] = useState(isAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Feature[]>(features);
  const [reading, setReading] = useState<InterpretationSettings>(loadInterpretationSettings);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim().toLowerCase() === "test@test.com" && password === "admin") {
      loginAdmin();
      setAuthed(true);
      setLoginError(null);
      setPassword("");
      return;
    }
    setLoginError("Ese correo o la contraseña no coinciden.");
  }

  function update(id: Feature["id"], patch: Partial<Feature>) {
    setSaved(false);
    setFormError(null);
    setDraft((current) => current.map((feature) => (feature.id === id ? { ...feature, ...patch } : feature)));
  }

  function updateReading(patch: Partial<InterpretationSettings>) {
    setSaved(false);
    setFormError(null);
    setReading((current) => ({ ...current, ...patch }));
  }

  function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.some((feature) => !feature.title.trim())) {
      setFormError("Cada lectura necesita un título.");
      setSaved(false);
      return;
    }
    const next = draft.map((feature) => ({
      ...feature,
      title: feature.title.trim(),
      line: feature.line.trim(),
    }));
    save(next);
    saveInterpretationSettings(reading);
    setDraft(next);
    setSaved(true);
  }

  function onLogout() {
    logoutAdmin();
    setAuthed(false);
    navigate("/admin", { replace: true });
  }

  if (!authed) {
    return (
      <Shell title="Admin" admin>
        <form className="stack stack-lg" onSubmit={onLogin} noValidate>
          <div className="intro-block">
            <h1>Entra al panel</h1>
            <p>La sesión queda solo en este navegador.</p>
          </div>
          <label className="field" htmlFor="correo">
            <span>Correo</span>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field" htmlFor="clave">
            <span>Contraseña</span>
            <input
              id="clave"
              name="clave"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {loginError ? (
            <p className="alert" role="alert">
              {loginError}
            </p>
          ) : null}
          <button className="btn btn-primary" type="submit">
            Entrar
          </button>
        </form>
      </Shell>
    );
  }

  return (
    <Shell title="Admin" admin wide>
      <form className="stack stack-lg" onSubmit={onSave}>
        <div className="intro-block">
          <h1>Lecturas</h1>
          <p>El interruptor muestra u oculta. Próximamente se ve, pero no se abre.</p>
        </div>
        {draft.map((feature) => (
          <section className="admin-row" key={feature.id}>
            <div className="admin-switchline">
              <strong>{feature.title || "Sin título"}</strong>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={feature.status !== "off"}
                  aria-label={`Mostrar ${feature.title || "la lectura"}`}
                  onChange={(event) =>
                    update(feature.id, { status: event.target.checked ? "on" : "off" })
                  }
                />
                <span />
              </label>
            </div>
            {feature.status !== "off" ? (
              <label className="soon-check">
                <input
                  type="checkbox"
                  checked={feature.status === "soon"}
                  onChange={(event) => update(feature.id, { status: event.target.checked ? "soon" : "on" })}
                />
                Próximamente
              </label>
            ) : null}
            <label className="field" htmlFor={`titulo-${feature.id}`}>
              <span>Título</span>
              <input
                id={`titulo-${feature.id}`}
                value={feature.title}
                onChange={(event) => update(feature.id, { title: event.target.value })}
              />
            </label>
            <label className="field" htmlFor={`linea-${feature.id}`}>
              <span>Línea</span>
              <input
                id={`linea-${feature.id}`}
                value={feature.line}
                onChange={(event) => update(feature.id, { line: event.target.value })}
              />
            </label>
          </section>
        ))}
        <section className="admin-row">
          <h2>Interpretación</h2>
          <div className="admin-switchline">
            <strong>Modo prueba interpretación</strong>
            <label className="switch">
              <input
                type="checkbox"
                checked={reading.trial}
                aria-label="Modo prueba interpretación"
                onChange={(event) => updateReading({ trial: event.target.checked })}
              />
              <span />
            </label>
          </div>
          <p>Encendido no llama a la IA y muestra el relleno. Apagado llama al modelo.</p>
          <label className="field" htmlFor="modelo">
            <span>Modelo</span>
            <select
              id="modelo"
              value={reading.model}
              onChange={(event) => updateReading({ model: event.target.value as InterpretModel })}
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="stack">
            <legend>Tono</legend>
            {(
              [
                ["alto", "Alto"],
                ["medio", "Medio"],
                ["bajo", "Bajo"],
              ] as const
            ).map(([value, label]) => (
              <label className="choice" key={value}>
                <input
                  type="radio"
                  name="tono"
                  value={value}
                  checked={reading.tone === value}
                  onChange={() => updateReading({ tone: value as InterpretTone })}
                />
                {label}
              </label>
            ))}
            <p>Alto nombra aspectos. Medio nombra planetas y casas. Bajo casi no usa vocabulario técnico.</p>
          </fieldset>
          <fieldset className="stack">
            <legend>Cercanía</legend>
            {(
              [
                ["confianza", "Confianza"],
                ["frialdad", "Frialdad"],
              ] as const
            ).map(([value, label]) => (
              <label className="choice" key={value}>
                <input
                  type="radio"
                  name="cercania"
                  value={value}
                  checked={reading.closeness === value}
                  onChange={() => updateReading({ closeness: value as InterpretCloseness })}
                />
                {label}
              </label>
            ))}
            <p>Confianza es cercana, en voseo, con la persona como sujeto. Frialdad es más de manual, con el planeta como sujeto.</p>
          </fieldset>
        </section>
        {formError ? (
          <p className="alert" role="alert">
            {formError}
          </p>
        ) : null}
        {saved ? <p role="status">Guardado en este navegador.</p> : null}
        <button className="btn btn-primary" type="submit">
          Guardar
        </button>
        <button className="btn btn-secondary" type="button" onClick={onLogout}>
          Cerrar sesión
        </button>
      </form>
    </Shell>
  );
}
