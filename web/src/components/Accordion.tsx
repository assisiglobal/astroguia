import { AnimatePresence, m } from "motion/react";
import { useId, type ReactNode } from "react";

interface AccordionItemProps {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function AccordionItem({ title, open, onToggle, children }: AccordionItemProps) {
  const id = useId();
  return (
    <div className={`glass overflow-hidden rounded-3xl transition-colors ${open ? "border-magenta/30" : ""}`}>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
        >
          <span className="font-display text-lg font-medium tracking-wide text-white">{title}</span>
          <span
            aria-hidden
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-transform duration-300 ${
              open ? "rotate-45 border-magenta/50 text-magenta" : ""
            }`}
          >
            +
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={id}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 pb-6 sm:px-6">{children}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
