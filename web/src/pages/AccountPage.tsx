import { Link } from "react-router";
import Shell from "../components/Shell";

export default function AccountPage() {
  return (
    <Shell title="Crear cuenta">
      <div className="stack">
        <h1>Crear cuenta</h1>
        <div className="empty-stage" aria-label="Pantalla vacía" />
        <Link className="text-link" to="/">
          Volver al inicio
        </Link>
      </div>
    </Shell>
  );
}
