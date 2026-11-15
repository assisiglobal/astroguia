import { inputClass } from "./Field";

interface TimeFieldProps {
  id?: string;
  value: string;
  unknown: boolean;
  onChange: (time: string) => void;
  onUnknownChange: (unknown: boolean) => void;
}

export default function TimeField({ id, value, unknown, onChange, onUnknownChange }: TimeFieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <input
        id={id}
        type="time"
        value={unknown ? "" : value}
        disabled={unknown}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} [&::-webkit-calendar-picker-indicator]:invert`}
      />
      <label className="flex cursor-pointer items-center gap-3 text-sm text-white/70 select-none">
        <input
          type="checkbox"
          checked={unknown}
          onChange={(e) => onUnknownChange(e.target.checked)}
          className="h-5 w-5 accent-magenta"
        />
        No sé mi hora de nacimiento
      </label>
      {unknown && (
        <p className="rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-xs leading-relaxed text-gold/90">
          Usaremos las 12:00 del mediodía. Los planetas en signos serán correctos, pero el ascendente y las casas pueden no
          ser precisos.
        </p>
      )}
    </div>
  );
}
