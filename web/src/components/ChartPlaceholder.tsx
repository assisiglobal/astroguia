import { ZODIAC } from "../lib/constants";

export default function ChartPlaceholder() {
  return (
    <div
      id="natal-chart"
      className="glass relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-[2rem]"
    >
      <div aria-hidden className="absolute inset-[6%] animate-spin-slow rounded-full border border-dashed border-white/15">
        {ZODIAC.map((z, i) => (
          <span
            key={z.name}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-xs text-white/20"
            style={{
              left: `${50 + 46 * Math.sin((i * Math.PI) / 6)}%`,
              top: `${50 - 46 * Math.cos((i * Math.PI) / 6)}%`,
            }}
          >
            {z.glyph + "\uFE0E"}
          </span>
        ))}
      </div>
      <div aria-hidden className="absolute inset-[22%] rounded-full border border-white/10" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        <span aria-hidden className="text-2xl text-gold/60">✦</span>
        <p className="mt-2 font-display text-sm tracking-[0.2em] text-white/50 uppercase">Tu rueda natal</p>
        <p className="mt-1 text-xs text-white/35">Muy pronto vas a ver tu carta dibujada acá.</p>
      </div>
    </div>
  );
}
