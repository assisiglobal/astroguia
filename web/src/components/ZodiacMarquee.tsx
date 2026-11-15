import { ZODIAC } from "../lib/constants";

export default function ZodiacMarquee() {
  const items = [...ZODIAC, ...ZODIAC];
  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-white/10 py-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
    >
      <div className="flex w-max animate-marquee gap-10">
        {items.map((z, i) => (
          <span key={i} className="flex items-center gap-3 text-sm whitespace-nowrap text-white/60">
            <span className="text-xl text-gold">{z.glyph + "\uFE0E"}</span>
            <span className="font-display tracking-[0.25em] uppercase">{z.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
