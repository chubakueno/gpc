import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";

export default function HomePage() {
  const { t } = useLang();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-accent)]/20 mb-6">
          <span className="text-3xl font-bold text-[var(--color-accent)] font-mono">G</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)] mb-4">
          {t("home.title")}
        </h1>
        <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link
          to="/hashing"
          className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 no-underline hover:border-[var(--color-accent)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center mb-4">
            <span className="text-[var(--color-accent)] text-xl font-mono">#</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
            {t("home.card.hashing.title")}
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
            {t("home.card.hashing.desc")}
          </p>
          <div className="flex flex-wrap gap-2">
            {["Rabin-Karp", "Rolling Hash", "Birthday Paradox"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-[var(--color-accent)] font-medium">
            {t("home.explore")}
          </div>
        </Link>

        <Link
          to="/ufds"
          className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 no-underline hover:border-[var(--color-accent-2)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-2)]/10"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-2)]/20 flex items-center justify-center mb-4">
            <span className="text-[var(--color-accent-2)] text-xl font-mono">∪</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent-2)] transition-colors">
            {t("home.card.ufds.title")}
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
            {t("home.card.ufds.desc")}
          </p>
          <div className="flex flex-wrap gap-2">
            {["Path Compression", "Union by Rank", "α(n)"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-[var(--color-accent-2)] font-medium">
            {t("home.explore")}
          </div>
        </Link>

        <Link
          to="/mst"
          className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 no-underline hover:border-[var(--color-accent-3)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-3)]/10"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-3)]/20 flex items-center justify-center mb-4">
            <span className="text-[var(--color-accent-3)] text-xl font-mono">T</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent-3)] transition-colors">
            {t("home.card.mst.title")}
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
            {t("home.card.mst.desc")}
          </p>
          <div className="flex flex-wrap gap-2">
            {["Kruskal", "Prim", "Cut Property"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-[var(--color-accent-3)] font-medium">
            {t("home.explore")}
          </div>
        </Link>

        <Link
          to="/kmp"
          className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 no-underline hover:border-[var(--color-accent-2)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-accent-2)]/10"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-2)]/20 flex items-center justify-center mb-4">
            <span className="text-[var(--color-accent-2)] text-xl font-mono">KM</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-accent-2)] transition-colors">
            {t("home.card.kmp.title")}
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
            {t("home.card.kmp.desc")}
          </p>
          <div className="flex flex-wrap gap-2">
            {["Failure Function", "O(N+M)", "Period"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-[var(--color-accent-2)] font-medium">
            {t("home.explore")}
          </div>
        </Link>

        <Link
          to="/trie"
          className="group block rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 no-underline hover:border-[var(--color-warn)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--color-warn)]/10"
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--color-warn)]/20 flex items-center justify-center mb-4">
            <span className="text-[var(--color-warn)] text-xl font-mono">T*</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-warn)] transition-colors">
            {t("home.card.trie.title")}
          </h2>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
            {t("home.card.trie.desc")}
          </p>
          <div className="flex flex-wrap gap-2">
            {["O(L) Insert", "Autocomplete", "XOR Trie"].map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-4 text-sm text-[var(--color-warn)] font-medium">
            {t("home.explore")}
          </div>
        </Link>
      </div>
    </main>
  );
}
