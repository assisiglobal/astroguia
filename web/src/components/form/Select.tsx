import type { SelectHTMLAttributes } from "react";
import { inputClass } from "./Field";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: (string | { value: string | number; label: string })[];
}

export default function Select({ options, className = "", ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select {...rest} className={`${inputClass} appearance-none pr-10 ${className}`}>
        {options.map((o) => {
          const { value, label } = typeof o === "string" ? { value: o, label: o } : o;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-white/50"
        fill="currentColor"
      >
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" />
      </svg>
    </div>
  );
}
