import { Link, Navigate, useParams } from "react-router";
import Shell from "../components/Shell";
import { isFeatureId, useFeatures } from "../lib/features";

export default function OpenedFeaturePage() {
  const { featureId = "" } = useParams();
  const { features } = useFeatures();
  const feature = isFeatureId(featureId) ? features.find((item) => item.id === featureId) : undefined;

  if (!feature || feature.status !== "on" || feature.id === "natal") {
    const natalOpen = feature?.id === "natal" && feature.status === "on";
    return <Navigate to={natalOpen ? "/carta-natal" : "/"} replace />;
  }

  return (
    <Shell title={feature.title}>
      <div className="stack">
        <div className="intro-block">
          <h1>{feature.title}</h1>
          {feature.line ? <p>{feature.line}</p> : null}
        </div>
        <div className="empty-stage" aria-label="Lectura sin contenido" />
        <Link className="text-link" to="/">
          Volver al inicio
        </Link>
      </div>
    </Shell>
  );
}
