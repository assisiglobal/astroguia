import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeName = "night" | "day";

const KEY = "astroguia:theme";

function readTheme(): ThemeName {
  const current = document.documentElement.dataset.theme;
  if (current === "day" || current === "night") return current;
  try {
    return localStorage.getItem(KEY) === "day" ? "day" : "night";
  } catch {
    return "night";
  }
}

export function applyThemeColor(theme: ThemeName): void {
  if (document.documentElement.dataset.surface === "admin") return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "day" ? "#F7F2EA" : "#3A2240");
}

interface ThemeContextValue {
  theme: ThemeName;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* el modo sigue en esta visita */
    }
    applyThemeColor(theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggle: () => setTheme((current) => (current === "night" ? "day" : "night")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return value;
}
