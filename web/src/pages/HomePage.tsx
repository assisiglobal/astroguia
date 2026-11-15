import { Link } from "react-router";
import NatalWheel from "../components/NatalWheel";
import Shell from "../components/Shell";
import { featurePath, useFeatures, type Feature } from "../lib/features";

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
          <NatalWheel mode="live" />
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
