type WheelMode = "live" | "assemble" | "still";

interface NatalWheelProps {
  mode?: WheelMode;
  showHouses?: boolean;
}

const SIGNS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
const CUSPS = [0, 32, 61, 92, 124, 156, 180, 214, 244, 274, 304, 334];
const PLANETS = [
  { glyph: "☉", angle: 318, r: 102, label: "03°" },
  { glyph: "☽", angle: 52, r: 112, label: "08°" },
  { glyph: "☿", angle: 336, r: 88, label: "01°" },
  { glyph: "♀", angle: 148, r: 104, label: "19°" },
  { glyph: "♂", angle: 24, r: 94, label: "16°" },
  { glyph: "♃", angle: 86, r: 78, label: "19°" },
  { glyph: "♄", angle: 196, r: 108, label: "13°" },
  { glyph: "♅", angle: 232, r: 84, label: "17°" },
  { glyph: "♆", angle: 268, r: 72, label: "16°" },
  { glyph: "♇", angle: 162, r: 68, label: "17°" },
];
const ASPECTS: [number, number][] = [
  [0, 1],
  [0, 4],
  [1, 6],
  [2, 5],
  [3, 7],
  [4, 8],
  [5, 9],
  [6, 2],
  [7, 0],
  [8, 3],
];
const CONSTELLATIONS = [
  [[28, 22], [40, 30], [54, 24], [66, 36]],
  [[300, 26], [314, 18], [328, 32], [340, 22]],
  [[24, 328], [36, 316], [50, 330]],
  [[292, 332], [308, 320], [322, 336], [336, 324]],
  [[168, 14], [180, 26], [194, 16]],
  [[150, 338], [166, 326], [182, 340]],
];

const CX = 180;
const CY = 180;

function polar(angle: number, radius: number): [number, number] {
  const rad = (angle * Math.PI) / 180;
  return [CX - radius * Math.cos(rad), CY + radius * Math.sin(rad)];
}

function wedge(start: number, end: number, radius: number): string {
  let span = (end - start + 360) % 360;
  if (span === 0) span = 360;
  const [x0, y0] = polar(start, radius);
  const [x1, y1] = polar(end, radius);
  const large = span > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x0} ${y0} A ${radius} ${radius} 0 ${large} 0 ${x1} ${y1} Z`;
}

export default function NatalWheel({ mode = "still", showHouses = true }: NatalWheelProps) {
  return (
    <svg className={`natal-chart natal-${mode}`} viewBox="0 0 360 360" role="img" aria-hidden="true">
      <g className="constellations">
        {CONSTELLATIONS.map((star, index) => (
          <polyline key={index} points={star.map((point) => point.join(",")).join(" ")} />
        ))}
      </g>

      <circle className="ring-draw outer" cx={CX} cy={CY} r={154} />
      <circle className="band" cx={CX} cy={CY} r={141} />
      <circle className="ring-draw inner" cx={CX} cy={CY} r={128} />

      {Array.from({ length: 72 }, (_, index) => {
        const angle = index * 5;
        const major = index % 6 === 0;
        const [x1, y1] = polar(angle, major ? 128 : 132);
        const [x2, y2] = polar(angle, 152);
        return <line key={angle} className={major ? "tick major" : "tick"} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}

      {SIGNS.map((sign, index) => {
        const [x, y] = polar(index * 30 + 15, 141);
        return (
          <text key={sign} className="sign" x={x} y={y} style={{ animationDelay: `${0.15 + index * 0.04}s` }}>
            {sign}
          </text>
        );
      })}

      <circle className="well" cx={CX} cy={CY} r={126} />

      {showHouses
        ? CUSPS.map((cusp, index) => {
            const next = CUSPS[(index + 1) % CUSPS.length];
            return <path key={cusp} className={index % 2 ? "house-a" : "house-b"} d={wedge(cusp, next, 126)} />;
          })
        : null}

      {showHouses
        ? CUSPS.map((cusp, index) => {
            const [x1, y1] = polar(cusp, 40);
            const [x2, y2] = polar(cusp, 126);
            return <line key={cusp} className="cusp" x1={x1} y1={y1} x2={x2} y2={y2} style={{ animationDelay: `${0.2 + index * 0.04}s` }} />;
          })
        : null}

      <circle className="hub" cx={CX} cy={CY} r={38} />

      {mode === "live"
        ? null
        : ASPECTS.map(([from, to], index) => {
        const a = PLANETS[from];
        const b = PLANETS[to];
        const [x1, y1] = polar(a.angle, a.r - 12);
        const [x2, y2] = polar(b.angle, b.r - 12);
        return (
          <line
            key={`${from}-${to}`}
            className={index % 2 ? "aspect lilac" : "aspect"}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            style={{ animationDelay: `${2.05 + (index % 5) * 0.06}s` }}
          />
        );
      })}

      {PLANETS.map((planet, index) => (
        <g
          key={planet.glyph}
          className="sky-planet"
          style={{
            transformOrigin: "180px 180px",
            ["--to" as string]: `${-planet.angle}deg`,
            ["--from" as string]: `${-planet.angle - 210 - index * 16}deg`,
            ["--i" as string]: String(index),
            animationDelay: `${0.45 + index * 0.07}s`,
          }}
        >
          <g transform={`translate(${180 - planet.r} 180)`}>
            <g className="sky-upright" style={{ animationDelay: `${0.45 + index * 0.07}s` }}>
              <text className="glyph" textAnchor="middle" dominantBaseline="central">
                {planet.glyph}
              </text>
              <text className="deg" y="13" textAnchor="middle">
                {planet.label}
              </text>
            </g>
          </g>
        </g>
      ))}

      {showHouses
        ? (
            [
              ["AC", 0],
              ["IC", 90],
              ["DC", 180],
              ["MC", 270],
            ] as const
          ).map(([label, angle]) => {
            const [x1, y1] = polar(angle, 156);
            const [x2, y2] = polar(angle, 168);
            const [x, y] = polar(angle, 176);
            return (
              <g key={label} className="angle-mark">
                <line x1={x1} y1={y1} x2={x2} y2={y2} />
                <text x={x} y={y}>
                  {label}
                </text>
              </g>
            );
          })
        : null}

      {showHouses
        ? CUSPS.map((cusp, index) => {
            const next = CUSPS[(index + 1) % CUSPS.length];
            let span = (next - cusp + 360) % 360;
            if (span === 0) span = 360;
            const [x, y] = polar(cusp + span / 2, 118);
            return (
              <text key={cusp} className="house-no" x={x} y={y}>
                {index + 1}
              </text>
            );
          })
        : null}
    </svg>
  );
}
