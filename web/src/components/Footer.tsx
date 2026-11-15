import { CAFECITO_URL } from "../lib/constants";

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/10 px-5 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-white/50">
          Hecho con polvo de estrellas · <span className="font-display tracking-widest">Astroguía</span>
        </p>
        <a
          href={CAFECITO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 rounded-full bg-gold/10 px-5 py-2.5 text-sm font-medium text-gold ring-1 ring-gold/30 transition hover:bg-gold/20 hover:ring-gold/60"
        >
          <span aria-hidden className="text-base transition group-hover:-rotate-12">☕</span>
          Invitame un cafecito
        </a>
      </div>
    </footer>
  );
}
