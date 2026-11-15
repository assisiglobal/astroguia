import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import marca from "../assets/logo/marca.svg";
import { applyThemeColor, useTheme } from "../lib/theme";

interface ShellProps {
  title: string;
  children: ReactNode;
  admin?: boolean;
  wide?: boolean;
  home?: boolean;
  footer?: ReactNode;
}

export default function Shell({ title, children, admin = false, wide = false, home = false, footer }: ShellProps) {
  const { theme, toggle } = useTheme();

  useEffect(() => {
    document.title = title ? `Astroguía · ${title}` : "Astroguía";
  }, [title]);

  useEffect(() => {
    if (!admin) return;
    document.documentElement.dataset.surface = "admin";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#ffffff");
    return () => {
      delete document.documentElement.dataset.surface;
      const stored = document.documentElement.dataset.theme === "day" ? "day" : "night";
      applyThemeColor(stored);
    };
  }, [admin]);

  return (
    <div className={["shell", wide ? "wide" : "", home ? "shell-home" : ""].filter(Boolean).join(" ")}>
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Astroguía">
          <img className="brand-mark" src={marca} alt="" />
          <span className="brand-text">
            <span className="brand-name">AstroGuía</span>
            <span className="brand-line">Estudio astrológico, místico y predictivo</span>
          </span>
        </Link>
        {admin ? (
          <span className="panel-mark">Panel</span>
        ) : (
          <button type="button" className="theme-toggle" onClick={toggle} aria-label={theme === "night" ? "Cambiar a día" : "Cambiar a noche"}>
            {theme === "night" ? "Noche" : "Día"}
          </button>
        )}
      </header>
      <main className="frame">{children}</main>
      {footer ? <footer className="foot">{footer}</footer> : null}
    </div>
  );
}
