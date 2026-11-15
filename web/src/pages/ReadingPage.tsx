import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router";
import NatalWheel from "../components/NatalWheel";
import Shell from "../components/Shell";
import { readNatalSession, type NatalAngle } from "../lib/natal";

const SIGNS: Record<string, string> = {
  aries: "Aries",
  taurus: "Tauro",
  gemini: "Géminis",
  cancer: "Cáncer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Escorpio",
  sagittarius: "Sagitario",
  capricorn: "Capricornio",
  aquarius: "Acuario",
  pisces: "Piscis",
};

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

function formatAngle(angle?: NatalAngle): string {
  if (!angle?.sign || angle.degree == null) return "";
  const sign = SIGNS[angle.sign] ?? angle.sign;
  const degree = angle.degree.toLocaleString("es-AR", { maximumFractionDigits: 2 });
  return `${sign} ${degree}°`;
}

function Fold({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  return (
    <div className="fold">
      <h2>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
          <span>{title}</span>
          <span aria-hidden="true">{open ? "–" : "+"}</span>
        </button>
      </h2>
      {open ? <div id={panelId} className="fold-panel">{children}</div> : null}
    </div>
  );
}

export default function ReadingPage() {
  const session = readNatalSession();
  if (!session) {
    return (
      <Shell title="Interpretación">
        <div className="stack">
          <h1>Todavía no hay una carta</h1>
          <Link className="btn btn-primary" to="/carta-natal">
            Calcular mi carta
          </Link>
        </div>
      </Shell>
    );
  }

  const { request, withHouses, chart } = session;
  const asc = formatAngle(chart?.angles?.asc);
  const mc = formatAngle(chart?.angles?.mc);

  return (
    <Shell title="Interpretación">
      <article className="stack stack-lg">
        <header className="intro-block">
          <h1>{request.name?.trim() || "Tu carta natal"}</h1>
          <p>
            {request.city}, {request.province} · {formatDate(request.date)}
          </p>
          <p>{withHouses && request.time ? `Calculada a las ${request.time}` : "Sin hora de nacimiento"}</p>
        </header>

        <section className="chart-slot" aria-label="Lugar reservado para tu carta">
          <NatalWheel mode="still" showHouses={withHouses} />
          <p>Tu carta va a verse aquí</p>
          {withHouses ? (
            <ul className="chart-facts">
              <li>Casas</li>
              <li>Ascendente{asc ? ` · ${asc}` : ""}</li>
              <li>Medio cielo{mc ? ` · ${mc}` : ""}</li>
            </ul>
          ) : null}
        </section>

        <p className="prose">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
          dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
          ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur.
        </p>

        <div className="folds">
          <Fold title="Amor">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </p>
          </Fold>
          <Fold title="Amistad">
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </Fold>
          <Fold title="Trabajo">
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
          </Fold>
        </div>

        <Link className="btn btn-secondary" to="/carta-natal">
          Calcular otra carta
        </Link>
      </article>
    </Shell>
  );
}
