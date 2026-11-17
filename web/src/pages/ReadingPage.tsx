import { useId, useState, type ReactNode } from "react";
import { Link } from "react-router";
import GlossaryText from "../components/GlossaryText";
import NatalSheet from "../components/NatalSheet";
import Shell from "../components/Shell";
import { chartToSheet } from "../lib/chartSheet";
import { fillerReading, readingParagraphs } from "../lib/interpretation";
import { readNatalSession, type NatalReading } from "../lib/natal";

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
  const sheet = chart ? chartToSheet(chart, withHouses) : null;
  const reading: NatalReading = session.reading ?? fillerReading();

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

        <section className="chart-slot" aria-label="Carta natal">
          {sheet ? <NatalSheet data={sheet} /> : <p className="prose">No pudimos armar la carta.</p>}
        </section>

        <div className="reading-copy prose">
          {readingParagraphs(reading.synthesis).map((paragraph, index) => (
            <p key={`sintesis-${index}`}>
              <GlossaryText text={paragraph} />
            </p>
          ))}
        </div>

        <div className="folds reading-copy">
          {reading.areas.map((area) => (
            <Fold key={area.title} title={area.title}>
              {readingParagraphs(area.text).map((paragraph, index) => (
                <p key={`${area.title}-${index}`}>
                  <GlossaryText text={paragraph} />
                </p>
              ))}
            </Fold>
          ))}
        </div>

        <Link className="btn btn-secondary" to="/carta-natal">
          Calcular otra carta
        </Link>
      </article>
    </Shell>
  );
}
