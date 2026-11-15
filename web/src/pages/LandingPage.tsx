import { Link } from "react-router";
import { m } from "motion/react";
import OrbitSystem from "../components/OrbitSystem";
import ZodiacMarquee from "../components/ZodiacMarquee";
import GodCard, { type God } from "../components/GodCard";

const GODS: God[] = [
  { greek: "Zeus", planet: "Júpiter", glyph: "♃", color: "#F5C76B", phrase: "Expansión, fe y abundancia. Donde Júpiter toca, la vida se agranda." },
  { greek: "Afrodita", planet: "Venus", glyph: "♀", color: "#E946A8", phrase: "El arte de amar y de disfrutar. Lo que te atrae dice quién sos." },
  { greek: "Hermes", planet: "Mercurio", glyph: "☿", color: "#22D3EE", phrase: "Mensajero de los dioses: tu forma de pensar, hablar y conectar." },
  { greek: "Ares", planet: "Marte", glyph: "♂", color: "#FF6B6B", phrase: "El fuego que te mueve. Deseo, coraje y la manera en que peleás." },
  { greek: "Cronos", planet: "Saturno", glyph: "♄", color: "#A78BFA", phrase: "El maestro del tiempo. Límites que, con paciencia, se vuelven estructura." },
  { greek: "Selene", planet: "Luna", glyph: "☽", color: "#E0E7FF", phrase: "Tu mundo emocional, tus raíces y aquello que te hace sentir en casa." },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center px-5">
        <OrbitSystem />
        <m.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex max-w-md flex-col items-center text-center"
        >
          <p className="mb-4 text-[11px] tracking-[0.4em] text-cyan/80 uppercase">El cielo el día que naciste</p>
          <h1 className="font-display text-4xl leading-tight font-bold text-white sm:text-6xl">
            Descubrí tu <span className="text-gradient">carta natal</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
            Cada planeta es un dios que habla de vos. Calculá tu mapa del cielo y recibí una lectura profunda sobre tu
            personalidad, el amor, el trabajo y más.
          </p>
          <Link
            to="/carta-natal"
            className="group relative isolate mt-9 inline-flex animate-glow items-center gap-3 overflow-hidden rounded-full px-8 py-4 font-semibold text-white transition active:scale-95"
          >
            <span aria-hidden className="absolute inset-0 -z-10 bg-hypnotic" />
            <span aria-hidden className="text-lg text-gold transition group-hover:rotate-180">✦</span>
            Calcular mi carta natal
          </Link>
          <p className="mt-4 text-xs text-white/40">Gratis · Sin registro · Argentina</p>
        </m.div>
      </section>

      <ZodiacMarquee />

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <h2 className="text-center font-display text-2xl font-bold tracking-wider text-white sm:text-3xl">
          Los dioses en tu cielo
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-white/55">
          Los griegos le pusieron rostro a cada planeta. Tu carta cuenta cómo conviven en vos.
        </p>
        <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {GODS.map((g, i) => (
            <GodCard key={g.greek} god={g} index={i} />
          ))}
        </div>
      </section>

      <m.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="mx-auto max-w-2xl px-5 pt-16 text-center"
      >
        <span aria-hidden className="text-3xl text-gold">☉{"\uFE0E"}</span>
        <blockquote className="mt-4 font-display text-xl leading-relaxed text-white/85 sm:text-2xl">
          “Como es arriba, es abajo; como es adentro, es afuera.”
        </blockquote>
        <p className="mt-3 text-xs tracking-[0.3em] text-white/40 uppercase">Hermes Trismegisto</p>
        <Link
          to="/carta-natal"
          className="mt-8 inline-block text-sm font-medium text-cyan underline-offset-4 hover:underline"
        >
          Empezar mi lectura →
        </Link>
      </m.section>
    </>
  );
}
