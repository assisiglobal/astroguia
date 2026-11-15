import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import NatalWheel from "../components/NatalWheel";
import { NatalError, postNatal, readNatalSession, saveNatalSession } from "../lib/natal";

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function LoadingPage() {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
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
        if (!session.withHouses && caught instanceof NatalError && caught.status === 400) {
          chart = null;
        } else {
          failed = caught instanceof Error ? caught.message : "No pudimos calcular la carta.";
        }
      }

      const elapsed = performance.now() - started;
      await wait(Math.max(0, 3600 - elapsed));
      if (cancelled) return;
      if (failed) {
        setError(failed);
        return;
      }
      saveNatalSession({ ...session, chart });
      setClosing(true);
      await wait(700);
      if (!cancelled) navigate("/lectura", { replace: true });
    }

    void run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [navigate]);

  return (
    <div className={closing ? "loading-screen is-closing" : "loading-screen"}>
      <div className="wheel">
        <NatalWheel mode="assemble" />
      </div>
      <h1 aria-live="polite">{closing ? "Listo" : "Estamos leyendo tu cielo"}</h1>
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
