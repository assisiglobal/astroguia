import { m } from "motion/react";

export interface God {
  greek: string;
  planet: string;
  glyph: string;
  phrase: string;
  color: string;
}

export default function GodCard({ god, index }: { god: God; index: number }) {
  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: "easeOut" }}
      className="glass group relative w-[72vw] max-w-72 shrink-0 snap-center overflow-hidden rounded-3xl p-6 sm:w-auto sm:max-w-none"
    >
      <div
        aria-hidden
        className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition group-hover:opacity-60"
        style={{ background: god.color }}
      />
      <span
        className="block animate-float text-4xl"
        style={{ color: god.color, textShadow: `0 0 18px ${god.color}`, animationDelay: `${index * 0.6}s` }}
      >
        {god.glyph + "\uFE0E"}
      </span>
      <h3 className="mt-4 font-display text-xl font-bold tracking-wider text-white">{god.greek}</h3>
      <p className="text-xs tracking-[0.2em] text-white/50 uppercase">{god.planet}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{god.phrase}</p>
    </m.article>
  );
}
