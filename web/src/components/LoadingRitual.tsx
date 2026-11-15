import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { ZODIAC } from "../lib/constants";

const MESSAGES = [
  "Alineando los planetas…",
  "Consultando a Cronos sobre el tiempo exacto…",
  "Trazando tus doce casas…",
  "Midiendo los aspectos entre los astros…",
  "Escuchando lo que Selene tiene para decir…",
  "Hermes está redactando tu lectura…",
  "Tejiendo la síntesis de tu cielo…",
];

export default function LoadingRitual({ done = false }: { done?: boolean }) {
  const [msg, setMsg] = useState(0);
  const [progress, setProgress] = useState(2);

  useEffect(() => {
    const id = setInterval(() => setMsg((i) => (i + 1) % MESSAGES.length), 3200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (done) {
      setProgress(100);
      return;
    }
    const id = setInterval(() => setProgress((p) => p + (95 - p) * 0.035), 400);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <m.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-space-950/95 px-6 text-center backdrop-blur-xl"
    >
      <div aria-hidden className="relative h-64 w-64 sm:h-80 sm:w-80">
        <div className="absolute inset-0 animate-spin-slow rounded-full border border-white/10 [animation-duration:24s]">
          {ZODIAC.map((z, i) => (
            <span
              key={z.name}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-sm text-gold/70"
              style={{
                left: `${50 + 44 * Math.sin((i * Math.PI) / 6)}%`,
                top: `${50 - 44 * Math.cos((i * Math.PI) / 6)}%`,
              }}
            >
              {z.glyph + "\uFE0E"}
            </span>
          ))}
        </div>
        <div className="absolute inset-8 animate-spin-reverse rounded-full border border-dashed border-magenta/30 [animation-duration:18s]" />
        <div className="absolute inset-16 animate-spin-slow rounded-full border border-cyan/30 [animation-duration:10s]">
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan shadow-[0_0_14px_var(--color-cyan)]" />
        </div>
        <div className="absolute inset-[38%] animate-glow rounded-full bg-[radial-gradient(circle,var(--color-gold),var(--color-magenta)_60%,var(--color-violet))]" />
      </div>

      <div className="mt-10 h-14 max-w-sm">
        <AnimatePresence mode="wait">
          <m.p
            key={msg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="font-display text-lg tracking-wide text-white"
          >
            {MESSAGES[msg]}
          </m.p>
        </AnimatePresence>
      </div>

      <div className="mt-4 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-hypnotic transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>

      <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
        Estamos calculando tu carta e interpretándola con calma.
        <br />
        <span className="text-white/75">Este proceso puede demorar algunos minutos.</span> No cierres esta pestaña.
      </p>
    </m.div>
  );
}
