import { memo } from "react";

interface Star {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const STARS: Star[] = Array.from({ length: 70 }, () => ({
  top: rand() * 100,
  left: rand() * 100,
  size: rand() < 0.85 ? 1 + rand() : 2 + rand() * 1.5,
  delay: rand() * 6,
  duration: 3 + rand() * 5,
}));

function Starfield() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-1/3 -left-1/4 h-[80vmax] w-[80vmax] rounded-full bg-violet/25 blur-[120px]" />
      <div className="absolute -right-1/4 -bottom-1/3 h-[70vmax] w-[70vmax] rounded-full bg-magenta/15 blur-[120px]" />
      <div className="absolute top-1/3 left-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 rounded-full bg-cyan/10 blur-[100px]" />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute animate-twinkle rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default memo(Starfield);
