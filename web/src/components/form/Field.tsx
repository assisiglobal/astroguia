import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export default function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium tracking-[0.18em] text-white/60 uppercase">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-magenta">{error}</p>
      ) : hint ? (
        <p className="text-xs text-white/40">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-base text-white placeholder:text-white/30 outline-none transition focus:border-magenta/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-magenta/25 disabled:opacity-40";
