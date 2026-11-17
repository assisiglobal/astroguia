import { useEffect, useId, useRef, useState } from "react";

const TERMS: Record<string, string> = {
  ascendente: "El signo que asomaba en el horizonte este cuando naciste. Marca cómo te presentás.",
  regente: "El planeta que gobierna un signo o una casa y muestra cómo se expresa ese tema.",
  descendente: "El punto opuesto al ascendente. Habla de los vínculos y de a quién atraés.",
  casa: "Cada una de las doce partes de la carta. Nombra un área de la vida.",
  IC: "El fondo de cielo, la cúspide de la casa 4. Habla de raíces, hogar y vida íntima.",
  "fondo de cielo": "El punto más bajo de la carta, el mismo que el IC. Tiene que ver con el origen y lo privado.",
  MC: "El mediocielo, la cúspide de la casa 10. Habla de la vocación y de cómo te ven en público.",
  mediocielo: "El punto más alto de la carta, el mismo que el MC. Tiene que ver con el oficio y la imagen pública.",
};

const TERM_RE =
  /\bfondo de cielo\b|\bmedio cielo\b|\bmediocielo\b|\bascendentes?\b|\bregentes?\b|\bdescendentes?\b|\bcasas?\b|\bIC\b|\bMC\b/gi;

function termKey(match: string): string {
  const value = match.toLowerCase();
  if (value === "fondo de cielo") return "fondo de cielo";
  if (value === "mediocielo" || value === "medio cielo") return "mediocielo";
  if (value.startsWith("ascendente")) return "ascendente";
  if (value.startsWith("descendente")) return "descendente";
  if (value.startsWith("regente")) return "regente";
  if (value.startsWith("casa")) return "casa";
  if (value === "ic") return "IC";
  return "MC";
}

export default function GlossaryText({ text }: { text: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const baseId = useId();
  const parts: { text: string; key?: string }[] = [];
  let cursor = 0;
  TERM_RE.lastIndex = 0;
  for (const match of text.matchAll(TERM_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) parts.push({ text: text.slice(cursor, index) });
    parts.push({ text: match[0], key: termKey(match[0]) });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });

  useEffect(() => {
    if (open == null) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={rootRef}>
      {parts.map((part, index) => {
        if (!part.key) return <span key={`${baseId}-${index}`}>{part.text}</span>;
        const tipId = `${baseId}-tip-${index}`;
        return (
          <button
            key={`${baseId}-${index}`}
            type="button"
            className={open === index ? "term is-open" : "term"}
            aria-expanded={open === index}
            aria-describedby={tipId}
            onClick={(event) => {
              event.stopPropagation();
              setOpen((current) => (current === index ? null : index));
            }}
          >
            {part.text}
            <span className="term-pop" role="tooltip" id={tipId}>
              {TERMS[part.key]}
            </span>
          </button>
        );
      })}
    </span>
  );
}
