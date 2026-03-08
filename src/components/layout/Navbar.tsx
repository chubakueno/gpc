import { NavLink, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-lg text-sm transition-colors no-underline ${
    isActive
      ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
      : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
  }`;

interface DropdownItem { to: string; label: string }

function NavDropdown({ label, items }: { label: string; items: DropdownItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isGroupActive = items.some(({ to }) => location.pathname.startsWith(to));

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  // Close dropdown on navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
          isGroupActive || open
            ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
            : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
        }`}
      >
        {label}
        <svg
          width="10" height="6" viewBox="0 0 10 6" fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 py-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl shadow-black/20 min-w-[160px] z-50">
          {items.map(({ to, label: itemLabel }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 mx-1 rounded-lg text-sm no-underline transition-colors ${
                  isActive
                    ? "bg-[var(--color-surface-2)] text-[var(--color-text)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                }`
              }
            >
              {itemLabel}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <NavLink to="/" end className={linkClass}>
            {t("nav.home")}
          </NavLink>

          <NavDropdown
            label={t("nav.strings")}
            items={[
              { to: "/hashing", label: t("nav.hashing") },
              { to: "/kmp",     label: t("nav.kmp") },
              { to: "/trie",    label: t("nav.trie") },
              { to: "/zfunc",  label: t("nav.zfunc") },
              { to: "/sa",     label: t("nav.sa") },
            ]}
          />

          <NavDropdown
            label={t("nav.graphs")}
            items={[
              { to: "/ufds", label: t("nav.ufds") },
              { to: "/mst",  label: t("nav.mst") },
            ]}
          />

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
