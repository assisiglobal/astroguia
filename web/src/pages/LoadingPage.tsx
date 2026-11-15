import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import NatalSheet, { type NatalSheetData } from "../components/NatalSheet";
import { chartToSheet } from "../lib/chartSheet";
import { postNatal, readNatalSession, saveNatalSession } from "../lib/natal";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function LoadingPage() {
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<NatalSheetData | null>(null);
  const [closing, setClosing] = useState(false);
  const [aspectsOn, setAspectsOn] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = readNatalSession();
    if (!session) {
      navigate("/carta-natal", { replace: true });
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    const started = performance.now();

    async function run() {
      if (!session) return;
      let failed: string | null = null;
      let chart = session.chart;
      try {
        chart = await postNatal(session.request, controller.signal);
      } catch (caught) {
        if (cancelled || (caught instanceof DOMException && caught.name === "AbortError")) return;
        failed = caught instanceof Error ? caught.message : "No pudimos calcular la carta.";
      }
      if (cancelled) return;
      if (failed || !chart) {
        setError(failed ?? "No pudimos calcular la carta.");
        return;
      }
      const next = chartToSheet(chart, session.withHouses);
      if (!next) {
        setError("No pudimos armar la carta.");
        return;
      }
      saveNatalSession({ ...session, chart });
      setSheet(next);
      const elapsed = performance.now() - started;
      await wait(Math.max(1600, 3600 - elapsed));
      if (cancelled) return;
      setClosing(true);
      await wait(950);
      if (cancelled) return;
      setAspectsOn(true);
      await wait(1200);
      if (cancelled) return;
      setMarked(true);
      await wait(850);
      if (!cancelled) navigate("/lectura", { replace: true });
    }

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [navigate]);

  return (
    <div className={["loading-screen", closing ? "is-closing" : "", marked ? "is-done" : ""].filter(Boolean).join(" ")}>
      <div className="wheel">
        {sheet ? <NatalSheet data={sheet} mode="orbit" settle={closing} showAspects={aspectsOn} /> : null}
      </div>
      <h1 aria-live="polite">{marked ? "Listo" : "Estamos leyendo tu cielo"}</h1>
      {error ? (
        <div className="stack loading-error">
          <p role="alert">{error}</p>
          <Link className="btn btn-primary" to="/carta-natal">
            Volver al formulario
          </Link>
        </div>
      ) : null}
    </div>
  );
}
