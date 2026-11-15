import { memo } from "react";

const TEXT = "\uFE0E";

const ORBITS = [
  { size: 34, duration: 14, planet: "☿", color: "var(--color-cyan)", dot: 8 },
  { size: 50, duration: 22, planet: "♀", color: "var(--color-magenta)", dot: 10 },
  { size: 66, duration: 34, planet: "♂", color: "#ff6b6b", dot: 9 },
  { size: 82, duration: 52, planet: "♃", color: "var(--color-gold)", dot: 14 },
  { size: 98, duration: 80, planet: "♄", color: "var(--color-violet)", dot: 12 },
];

function OrbitSystem() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative aspect-square w-[min(118vw,760px)]">
        <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-white/[0.06]" />
        <div className="absolute top-1/2 left-1/2 h-[18%] w-[18%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--color-gold)_0%,var(--color-magenta)_45%,transparent_72%)] opacity-70 blur-md" />
        {ORBITS.map((o, i) => (
          <div
            key={o.planet}
            className="absolute top-1/2 left-1/2 rounded-full border border-white/[0.13]"
            style={{
              width: `${o.size}%`,
              height: `${o.size}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="absolute inset-0 animate-orbit"
              style={{
                animationDuration: `${o.duration}s`,
                animationDelay: `-${i * 7}s`,
              }}
            >
              <span
                className="absolute top-0 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                style={{
                  width: o.dot * 2.6,
                  height: o.dot * 2.6,
                  color: o.color,
                  textShadow: `0 0 12px ${o.color}`,
                  fontSize: o.dot * 1.5,
                }}
              >
                {o.planet + TEXT}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(OrbitSystem);
