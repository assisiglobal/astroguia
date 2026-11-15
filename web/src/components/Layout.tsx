import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import Starfield from "./Starfield";
import Footer from "./Footer";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <Starfield />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.2em] text-white">
          ASTRO<span className="text-gradient">GUÍA</span>
        </Link>
        {pathname !== "/carta-natal" && (
          <Link
            to="/carta-natal"
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 transition hover:border-magenta/60 hover:text-white"
          >
            Carta natal
          </Link>
        )}
      </header>
      <main className="relative flex-1">{children}</main>
      <Footer />
    </div>
  );
}
