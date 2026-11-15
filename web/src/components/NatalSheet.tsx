import { useEffect, useRef } from "react";

export interface SheetPoint {
  sign?: string;
  deg?: number;
  lon?: number;
}

export interface SheetBody extends SheetPoint {
  id: string;
  retro?: boolean;
}

export interface NatalSheetData {
  name?: string;
  asc: SheetPoint;
  mc: SheetPoint;
  houses?: SheetPoint[];
  bodies?: SheetBody[];
}

/** Carta fija del generador de ejemplo. Emparejarla con el endpoint queda para después. */
export const PREVIEW_CHART: NatalSheetData = {
  name: "Carta de ejemplo",
  asc: { sign: "sag", deg: 7 },
  mc: { sign: "vir", deg: 29 },
  bodies: [
    { id: "sun", sign: "cap", deg: 20 },
    { id: "moon", sign: "can", deg: 22 },
    { id: "mer", sign: "cap", deg: 8, retro: true },
    { id: "ven", sign: "aqu", deg: 3, retro: true },
    { id: "mar", sign: "sag", deg: 16 },
    { id: "jup", sign: "can", deg: 3, retro: true },
    { id: "sat", sign: "cap", deg: 16 },
    { id: "ura", sign: "cap", deg: 6 },
    { id: "nep", sign: "cap", deg: 10 },
    { id: "plu", sign: "sco", deg: 17 },
    { id: "node", sign: "aqu", deg: 16 },
    { id: "chi", sign: "can", deg: 13, retro: true },
    { id: "lil", sign: "sco", deg: 7 },
    { id: "for", sign: "gem", deg: 7 },
  ],
};

const SIGNS = ["ari", "tau", "gem", "can", "leo", "vir", "lib", "sco", "sag", "cap", "aqu", "pis"] as const;
const ELEMENTS = {
  fire: ["#F2A39B", "#C62828"],
  earth: ["#A8D5A2", "#2E7D32"],
  air: ["#F8C48A", "#E67E22"],
  water: ["#A9D6E8", "#1F6FA8"],
} as const;
const SIGN_COLOR: Record<(typeof SIGNS)[number], readonly [string, string]> = {
  ari: ELEMENTS.fire,
  tau: ELEMENTS.earth,
  gem: ELEMENTS.air,
  can: ELEMENTS.water,
  leo: ELEMENTS.fire,
  vir: ELEMENTS.earth,
  lib: ELEMENTS.air,
  sco: ELEMENTS.water,
  sag: ELEMENTS.fire,
  cap: ELEMENTS.earth,
  aqu: ELEMENTS.air,
  pis: ELEMENTS.water,
};
const BODY_COLOR: Record<string, string> = {
  sun: "#B8741D",
  moon: "#2A1F7A",
  mer: "#7A2A1A",
  ven: "#7B4FB0",
  mar: "#6B1C26",
  jup: "#5B2060",
  sat: "#2E6B2E",
  ura: "#A23C9F",
  nep: "#2F78B8",
  plu: "#B8741D",
  node: "#111111",
  chi: "#7C9A22",
  lil: "#111111",
  for: "#D63B9A",
};
const GLYPHS: Record<string, [string, string, number?]> = {
  ari: ["M0 9V-3C0 -9 -4 -10 -7 -8C-10 -6 -9 -2 -6 -2M0 -3C0 -9 4 -10 7 -8C10 -6 9 -2 6 -2", ""],
  tau: ["M-8 -9C-7 -2 7 -2 8 -9", '<circle cy="4" r="6"/>'],
  gem: ["M-5 -7V7M5 -7V7M-9 -9C-4 -6 4 -6 9 -9M-9 9C-4 6 4 6 9 9", ""],
  can: ["M-8 -3C-6 -9 4 -9 8 -5M8 3C6 9 -4 9 -8 5", '<circle cx="-5" cy="-3" r="2.4"/><circle cx="5" cy="3" r="2.4"/>'],
  leo: ["M-2 0C-2 -8 2 -10 6 -8C10 -5 8 0 6 4C5 7 6 9 8 8", '<circle cx="-5" cy="3" r="3.6"/>'],
  vir: ["M-9 -8V6M-9 -5C-9 -9 -3 -9 -3 -5V6M-3 -5C-3 -9 3 -9 3 -5V4C3 8 7 9 9 5C10 2 5 1 3 4", ""],
  lib: ["M-9 7H9M-9 3H-4C-8 3 -8 -6 0 -6C8 -6 8 3 4 3H9", ""],
  sco: ["M-9 -8V6M-9 -5C-9 -9 -3 -9 -3 -5V6M-3 -5C-3 -9 3 -9 3 -5V6C3 9 6 10 9 7M9 7H6M9 7V4", ""],
  sag: ["M-8 8L8 -8M2 -8H8V-2M-7 0L0 7", ""],
  cap: ["M-9 -8L-5 2L-1 -8C1 -2 3 4 5 5C9 6 9 -1 5 -1C3 -1 3 6 6 9", ""],
  aqu: ["M-9 -3L-6 -6L-3 -3L0 -6L3 -3L6 -6L9 -3M-9 4L-6 1L-3 4L0 1L3 4L6 1L9 4", ""],
  pis: ["M-5 -9C-1 -5 -1 5 -5 9M5 -9C1 -5 1 5 5 9M-8 0H8", ""],
  sun: ["", '<circle r="9"/><circle r="1.6" fill="currentColor"/>'],
  moon: ["M3 -9A9 9 0 1 0 3 9A6 9 0 0 1 3 -9Z", "", 1],
  mer: ["M-4 -10A4.5 4.5 0 0 0 4 -10M0 6V13M-3.5 9.5H3.5", '<circle cy="1" r="4.5"/>'],
  ven: ["M0 1V11M-3.5 7H3.5", '<circle cy="-4" r="5"/>'],
  mar: ["M2.2 -1.2L9 -8M3 -8H9V-2", '<circle cx="-2" cy="3" r="6"/>'],
  jup: ["M-8 -4C-8 -9 0 -10 0 -4C0 1 -6 5 -9 5H9M4 -9V10", ""],
  sat: ["M-4 -10V6M-8 -6H0M-4 -2C2 -8 8 -4 4 3C2 7 3 9 6 9", ""],
  ura: ["M-6 -9V3M6 -9V3M-6 -3H6M0 -9V3", '<circle cy="7" r="3"/>'],
  nep: ["M0 -10V10M-3.5 6H3.5M-7 -9C-7 0 7 0 7 -9M-7 -9V-5M7 -9V-5", ""],
  plu: ["M-7 -5A7 7 0 0 0 7 -5M0 2V11M-3.5 7H3.5", '<circle cy="-5" r="3.5"/>'],
  node: ["M-9 7H-5C-10 -9 10 -9 5 7H9", ""],
  chi: ["M-3 -11V3M-3 -4L5 -11M-3 -4L5 3", '<circle cx="-3" cy="7" r="3"/>'],
  lil: ["M-3 -10A6 6 0 1 0 -3 2A4 6 0 0 1 -3 -10ZM0 3V11M-3.5 7H3.5", "", 1],
  for: ["M-5.6 -5.6L5.6 5.6M5.6 -5.6L-5.6 5.6", '<circle r="8"/>'],
};
const ASPECTS: [number, string, number][] = [
  [60, "#46B3E6", 4],
  [90, "#E8352E", 6],
  [120, "#46B3E6", 6],
  [150, "#3DBB4A", 3],
  [180, "#E8352E", 7],
];
const MAIN = ["sun", "moon", "mer", "ven", "mar", "jup", "sat", "ura", "nep", "plu"];
const R1 = 470;
const R2 = 345;
const R3 = 235;

function longitude(point: SheetPoint): number {
  if (point.lon != null) return ((+point.lon % 360) + 360) % 360;
  const index = SIGNS.indexOf(point.sign as (typeof SIGNS)[number]);
  if (index < 0) throw new Error(`Signo inválido: ${point.sign ?? ""}`);
  return index * 30 + (+point.deg! || 0);
}

function polar(radius: number, longitudeValue: number, asc: number): [number, number] {
  const angle = ((180 + longitudeValue - asc) * Math.PI) / 180;
  return [500 + radius * Math.cos(angle), 500 - radius * Math.sin(angle)];
}

function pair(point: [number, number]): string {
  return `${point[0].toFixed(1)} ${point[1].toFixed(1)}`;
}

function wedge(outer: number, inner: number, start: number, end: number, asc: number): string {
  return `M${pair(polar(outer, start, asc))}A${outer} ${outer} 0 0 0 ${pair(polar(outer, end, asc))}L${pair(polar(inner, end, asc))}A${inner} ${inner} 0 0 1 ${pair(polar(inner, start, asc))}Z`;
}

function thirds(start: number, end: number): [number, number] {
  const span = (end - start + 360) % 360;
  return [start + span / 3, start + (2 * span) / 3];
}

function Glyph({ id, x, y, scale, color }: { id: string; x: number; y: number; scale: number; color: string }) {
  const glyph = GLYPHS[id];
  if (!glyph) return null;
  return (
    <g
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})`}
      color={color}
      stroke={color}
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={glyph[2] ? color : "none"}
    >
      {glyph[0] ? <path d={glyph[0]} /> : null}
      {glyph[1] ? <g dangerouslySetInnerHTML={{ __html: glyph[1] }} /> : null}
    </g>
  );
}

interface NatalSheetProps {
  data?: NatalSheetData;
  mode?: "still" | "orbit";
  settle?: boolean;
  showAspects?: boolean;
}

function usePlanetSpin(active: boolean, settle: boolean) {
  const spinRef = useRef<SVGGElement>(null);
  const settleRef = useRef(settle);
  settleRef.current = settle;

  useEffect(() => {
    const node = spinRef.current;
    if (!active || !node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.removeAttribute("transform");
      return;
    }

    let frame = 0;
    let last = performance.now();
    let value = 130;
    let settling = false;
    let from = 0;
    let started = 0;

    const paint = (angle: number) => {
      node.setAttribute("transform", `rotate(${angle.toFixed(2)} 500 500)`);
    };
    paint(value);

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (settleRef.current && !settling) {
        settling = true;
        from = value;
        started = now;
      }
      if (settling) {
        const t = Math.min(1, (now - started) / 900);
        const eased = 1 - (1 - t) ** 3;
        value = from * (1 - eased);
        paint(value);
        if (t < 1) frame = requestAnimationFrame(tick);
        return;
      }
      const speed = value > 40 ? 22 : 7;
      value = Math.max(16, value - speed * dt);
      paint(value);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return spinRef;
}

export default function NatalSheet({ data = PREVIEW_CHART, mode = "still", settle = false, showAspects = false }: NatalSheetProps) {
  const orbit = mode === "orbit";
  const aspectsVisible = !orbit || showAspects;
  const spinRef = usePlanetSpin(orbit, settle);
  const asc = longitude(data.asc);
  const midheaven = longitude(data.mc);
  const imum = (midheaven + 180) % 360;
  const descendant = (asc + 180) % 360;
  const cusps = data.houses
    ? data.houses.map(longitude)
    : [asc, ...thirds(asc, imum), imum, ...thirds(imum, descendant), descendant, ...thirds(descendant, midheaven), midheaven, ...thirds(midheaven, asc)];

  let ticks = "";
  for (let degree = 0; degree < 360; degree += 1) {
    const length = degree % 10 === 0 ? 11 : degree % 5 === 0 ? 8 : 4;
    ticks += `M${pair(polar(R2, degree, asc))}L${pair(polar(R2 - length, degree, asc))}`;
  }

  const placed = (data.bodies ?? [])
    .filter((body) => GLYPHS[body.id])
    .map((body) => ({ body, longitude: longitude(body), placed: longitude(body) }))
    .sort((a, b) => a.longitude - b.longitude);
  for (let pass = 0; pass < 60; pass += 1) {
    for (let index = 0; index < placed.length && placed.length > 1; index += 1) {
      const next = (index + 1) % placed.length;
      const gap = (placed[next].placed - placed[index].placed + 360) % 360;
      if (gap < 8) {
        const shift = (8 - gap) / 2;
        placed[index].placed -= shift;
        placed[next].placed += shift;
      }
    }
  }

  const aspects: { d: string; color: string }[] = [];
  const main = placed.filter((item) => MAIN.includes(item.body.id));
  for (let i = 0; i < main.length; i += 1) {
    for (let j = i + 1; j < main.length; j += 1) {
      let gap = Math.abs(main[i].longitude - main[j].longitude);
      gap = gap > 180 ? 360 - gap : gap;
      ASPECTS.forEach(([angle, color, orb]) => {
        if (Math.abs(gap - angle) <= orb) {
          aspects.push({
            d: `M${pair(polar(R3, main[i].longitude, asc))}L${pair(polar(R3, main[j].longitude, asc))}`,
            color,
          });
        }
      });
    }
  }

  const wings = [asc, midheaven].flatMap((longitudeValue) => {
    const tip = polar(R1 - 2, longitudeValue, asc);
    const length = Math.hypot(500 - tip[0], 500 - tip[1]);
    const ux = (500 - tip[0]) / length;
    const uy = (500 - tip[1]) / length;
    return [0.5, -0.5].map((turn) => {
      const cosine = Math.cos(turn);
      const sine = Math.sin(turn);
      return `M${pair(tip)}L${(tip[0] + 34 * (ux * cosine - uy * sine)).toFixed(1)} ${(tip[1] + 34 * (ux * sine + uy * cosine)).toFixed(1)}`;
    });
  });

  return (
    <div className="natal-sheet">
      <svg viewBox="0 0 1000 1000" role="img" aria-label={data.name || "Carta natal"}>
        <rect width="1000" height="1000" fill="var(--sheet-paper, #fff)" />
        {SIGNS.map((sign, index) => (
          <g key={sign} className="sheet-band">
            <path d={wedge(R1, R2, index * 30, index * 30 + 30, asc)} fill={SIGN_COLOR[sign][0]} />
            <path d={wedge(R2, R3, index * 30, index * 30 + 30, asc)} fill={SIGN_COLOR[sign][0]} fillOpacity={0.42} />
          </g>
        ))}
        {SIGNS.map((sign, index) => {
          const point = polar(408, index * 30 + 15, asc);
          return (
            <g key={`${sign}-glyph`} className="sheet-sign">
              <Glyph id={sign} x={point[0]} y={point[1]} scale={3} color={SIGN_COLOR[sign][1]} />
            </g>
          );
        })}
        <path className="sheet-ticks" d={ticks} stroke="#8A8498" strokeWidth={0.7} fill="none" />
        <circle className="sheet-frame" cx={500} cy={500} r={R3} fill="var(--sheet-paper, #fff)" stroke="#C9C4D4" strokeWidth={2} />
        <circle className="sheet-frame" cx={500} cy={500} r={R1} fill="none" stroke="#D4D2DA" strokeWidth={5} />
        {cusps.map((cusp, index) => (
          <path
            key={`cusp-${index}`}
            className="sheet-house"
            d={`M${pair(polar(R3, cusp, asc))}L${pair(polar(R1, cusp, asc))}`}
            fill="none"
            stroke="#16123A"
            strokeWidth={2.4}
          />
        ))}
        {wings.map((d, index) => (
          <path key={`wing-${index}`} className="sheet-angle" d={d} stroke="#16123A" strokeWidth={2.4} fill="none" />
        ))}
        {aspectsVisible
          ? aspects.map((aspect, index) => (
              <path
                key={`aspect-${index}`}
                className={orbit ? "sheet-aspect is-drawing" : "sheet-aspect"}
                d={aspect.d}
                fill="none"
                stroke={aspect.color}
                strokeWidth={2}
                opacity={0.9}
                style={orbit ? { animationDelay: `${index * 0.07}s` } : undefined}
              />
            ))
          : null}
        {orbit
          ? null
          : placed.map((item, index) => {
              const color = BODY_COLOR[item.body.id] ?? "#16123A";
              const label = polar(268, item.placed, asc);
              const outer = polar(R2, item.longitude, asc);
              const inner = polar(R2 - 14, item.longitude, asc);
              return (
                <g key={`${item.body.id}-${index}-mark`} className="sheet-body">
                  <path d={`M${pair(outer)}L${pair(inner)}`} stroke={color} strokeWidth={2} />
                  <text
                    x={label[0].toFixed(1)}
                    y={label[1].toFixed(1)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="Jost, Arial, sans-serif"
                    fontSize={22}
                    fontWeight={600}
                    fill={color}
                  >
                    {Math.floor(item.longitude % 30)}°
                    {item.body.retro ? (
                      <tspan fontSize={16} dx={3}>
                        R
                      </tspan>
                    ) : null}
                  </text>
                </g>
              );
            })}
        <g ref={spinRef} transform={orbit ? "rotate(130 500 500)" : undefined}>
          {placed.map((item, index) => {
            const color = BODY_COLOR[item.body.id] ?? "#16123A";
            const glyph = polar(300, item.placed, asc);
            return <Glyph key={`${item.body.id}-${index}`} id={item.body.id} x={glyph[0]} y={glyph[1]} scale={1.6} color={color} />;
          })}
        </g>
      </svg>
    </div>
  );
}
