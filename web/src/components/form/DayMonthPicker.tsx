import { m, AnimatePresence } from "motion/react";
import { useState } from "react";
import { MONTHS } from "../../lib/constants";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

interface DayMonthPickerProps {
  year: number;
  /** 0-11 */
  month: number;
  day: number | null;
  onChange: (month: number, day: number) => void;
  onMonthChange: (month: number) => void;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function DayMonthPicker({ year, month, day, onChange, onMonthChange }: DayMonthPickerProps) {
  const [direction, setDirection] = useState(0);
  const total = daysInMonth(year, month);
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date();

  const go = (delta: number) => {
    setDirection(delta);
    onMonthChange((month + delta + 12) % 12);
  };

  const isFuture = (d: number) => new Date(year, month, d) > today;

  return (
    <div className="glass rounded-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Mes anterior"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 active:scale-90"
        >
          ‹
        </button>
        <p className="font-display text-base tracking-widest text-white" aria-live="polite">
          {MONTHS[month]} <span className="text-white/40">{year}</span>
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Mes siguiente"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 active:scale-90"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-white/35">
        {WEEKDAYS.map((w, i) => (
          <span key={i} className="py-1">{w}</span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <m.div
            key={`${year}-${month}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-7 gap-1"
            role="grid"
          >
            {Array.from({ length: offset }, (_, i) => (
              <span key={`e${i}`} />
            ))}
            {Array.from({ length: total }, (_, i) => {
              const d = i + 1;
              const selected = d === day;
              const disabled = isFuture(d);
              return (
                <button
                  key={d}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(month, d)}
                  aria-pressed={selected}
                  aria-label={`${d} de ${MONTHS[month]}`}
                  className={`aspect-square rounded-full text-sm transition active:scale-90 disabled:opacity-20 ${
                    selected
                      ? "bg-hypnotic font-semibold text-white shadow-[0_0_18px_-2px_var(--color-magenta)]"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
