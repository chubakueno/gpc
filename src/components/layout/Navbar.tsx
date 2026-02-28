import { NavLink } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";

export function Navbar() {
  const { t, lang, setLang } = useLang();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 text-[var(--color-text)] no-underline"
        >
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <span className="text-white text-sm font-bold font-mono">G</span>
          </div>
          <span className="font-semibold text-sm hidden sm:block">GPC Algorithms</span>
        </NavLink>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm transition-colors no-underline ${
                isActive
                  ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`
            }
          >
            {t("nav.home")}
          </NavLink>
          <NavLink
            to="/hashing"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm transition-colors no-underline ${
                isActive
                  ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`
            }
          >
            {t("nav.hashing")}
          </NavLink>
          <NavLink
            to="/ufds"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-sm transition-colors no-underline ${
                isActive
                  ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`
            }
          >
            {t("nav.ufds")}
          </NavLink>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-mono font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
            aria-label="Toggle language"
          >
            {t("nav.lang")}
          </button>
        </div>
      </div>
    </nav>
  );
}
