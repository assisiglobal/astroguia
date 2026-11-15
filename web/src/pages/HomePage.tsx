import { Link } from "react-router";
import NatalWheel from "../components/NatalWheel";
import Shell from "../components/Shell";
import { featurePath, useFeatures, type Feature } from "../lib/features";

const SKY: [number, number, number][] = [
  [6, 8, 0.35], [14, 18, 0.18], [22, 6, 0.22], [31, 22, 0.4], [40, 9, 0.16],
  [52, 16, 0.28], [63, 5, 0.18], [71, 20, 0.42], [82, 8, 0.2], [91, 18, 0.3],
  [8, 36, 0.16], [96, 34, 0.24], [4, 58, 0.32], [97, 62, 0.18], [11, 78, 0.2],
  [88, 84, 0.36], [18, 92, 0.16], [46, 94, 0.22], [74, 90, 0.18], [33, 42, 0.14],
  [58, 38, 0.16], [27, 64, 0.14], [68, 70, 0.2], [84, 48, 0.14], [42, 72, 0.16],
];

function RailItem({ feature }: { feature: Feature }) {
  const body = (
    <>
      <span>
        <strong>{feature.title}</strong>
        {feature.line ? <small>{feature.line}</small> : null}
      </span>
      {feature.status === "soon" ? <em>Próximamente</em> : <span className="rail-go" aria-hidden="true">→</span>}
    </>
  );
  if (feature.status === "on") {
    return (
      <Link className="rail-item" to={featurePath(feature.id)}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className="rail-item" disabled>
      {body}
    </button>
  );
}

export default function HomePage() {
  const { features } = useFeatures();
  const natal = features.find((feature) => feature.id === "natal");
  const rest = features.filter((feature) => feature.id !== "natal" && feature.status !== "off");
  const showNatal = natal && natal.status !== "off";
  const empty = !showNatal && rest.length === 0;

  return (
    <Shell
      title="Inicio"
      home
      footer={
        <>
          <Link to="/cuenta">Crear cuenta</Link>
          <Link to="/admin">Admin</Link>
        </>
      }
    >
      <div className="hero">
        <div className="hero-sky">
          <svg className="sky-stars" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {SKY.map(([x, y, r], index) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} style={{ animationDelay: `${(index % 7) * 0.4}s` }} />
            ))}
          </svg>
          <NatalWheel mode="live" homeSky />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">El cielo de tu nacimiento</p>
          <h1>Mira cómo se arma tu carta</h1>
          <p>Empieza por la carta natal. El resto aparece si está prendido.</p>
          {showNatal && natal.status === "on" ? (
            <Link className="btn btn-primary btn-hero" to="/carta-natal">
              <span className="btn-title">{natal.title}</span>
              {natal.line ? <span className="btn-line">{natal.line}</span> : null}
            </Link>
          ) : null}
          {showNatal && natal.status === "soon" ? (
            <button type="button" className="btn btn-primary btn-hero" disabled>
              <span className="btn-title">{natal.title}</span>
              <span className="badge">Próximamente</span>
            </button>
          ) : null}
          {empty ? <p>Ahora no hay lecturas disponibles.</p> : null}
        </div>
      </div>
      {rest.length > 0 ? (
        <div className="rail">
          {rest.map((feature) => (
            <RailItem key={feature.id} feature={feature} />
          ))}
        </div>
      ) : null}
    </Shell>
  );
}
