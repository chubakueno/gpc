import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

export function ACAnalysis() {
  const { t } = useLang();

  return (
    <div className="space-y-6">

      {/* What is Aho-Corasick? */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          {t("ac.analysis.intro.title")}
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          {t("ac.analysis.intro.body")}
        </p>
      </SectionCard>

      {/* Phase 1 — Build the Trie */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          {t("ac.analysis.trie.title")}
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">
          {t("ac.analysis.trie.body")}
        </p>
      </SectionCard>

      {/* Phase 2 — Failure Links */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          {t("ac.analysis.fail.title")}
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {t("ac.analysis.fail.body")}
        </p>
        <MathBlock math={String.raw`\text{fail}[u] = \text{longest proper suffix of } \text{path}(u) \text{ that is a prefix in the trie}`} />
        <div className="mt-4 p-3 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5">
          <p className="text-xs font-mono text-[var(--color-accent)]">{t("ac.analysis.fail.def")}</p>
        </div>
      </SectionCard>

      {/* Phase 3 — Dictionary Links */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          {t("ac.analysis.dict.title")}
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {t("ac.analysis.dict.body")}
        </p>
        <div className="mt-2 p-3 rounded-xl border border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/5">
          <p className="text-xs font-mono text-[var(--color-accent-2)]">{t("ac.analysis.dict.def")}</p>
        </div>
      </SectionCard>

      {/* Searching in O(N + M) */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          {t("ac.analysis.search.title")}
        </h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {t("ac.analysis.search.body")}
        </p>
        <MathBlock math={String.raw`\text{Total time} = O\!\left(\sum|P_i| + N + M\right)`} />
        <p className="text-xs text-[var(--color-muted)] mt-2">
          where N = |T| (text length) and M = total number of match occurrences
        </p>
      </SectionCard>

      {/* Applications */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          {t("ac.analysis.apps.title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              color: "var(--color-accent)",
              title: t("ac.analysis.apps.ids.title"),
              desc: t("ac.analysis.apps.ids.desc"),
              code: "Snort / AC automaton",
            },
            {
              color: "var(--color-accent-2)",
              title: t("ac.analysis.apps.virus.title"),
              desc: t("ac.analysis.apps.virus.desc"),
              code: "multi-pattern binary scan",
            },
            {
              color: "var(--color-accent-3)",
              title: t("ac.analysis.apps.nlp.title"),
              desc: t("ac.analysis.apps.nlp.desc"),
              code: "dictionary tokenization",
            },
            {
              color: "var(--color-warn)",
              title: t("ac.analysis.apps.filter.title"),
              desc: t("ac.analysis.apps.filter.desc"),
              code: "keyword blocklist",
            },
          ].map(({ color, title, desc, code }) => (
            <div
              key={title}
              className="p-4 rounded-xl border bg-[var(--color-surface-2)]"
              style={{ borderColor: color + "40" }}
            >
              <p className="font-semibold text-sm mb-1" style={{ color }}>{title}</p>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-2">{desc}</p>
              <code
                className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-bg)]"
                style={{ color }}
              >
                {code}
              </code>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Complexity Comparison */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
          {t("ac.analysis.compare.title")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[
                  t("ac.analysis.compare.algo"),
                  t("ac.analysis.compare.build"),
                  t("ac.analysis.compare.search"),
                  t("ac.analysis.compare.multi"),
                ].map((h) => (
                  <th key={h} className="text-left py-2 pr-4 text-[var(--color-muted)] font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "KMP",          build: "O(M)",       search: "O(N+M)",     multi: "Must run k times" },
                { name: "Rabin-Karp",   build: "O(M)",       search: "O(N+M) avg", multi: "Rolling hash trick" },
                { name: "Aho-Corasick", build: "O(∑|Pᵢ|)",  search: "O(N+M)",     multi: "Yes, single pass" },
                { name: "Suffix Array", build: "O(N log² N)", search: "O(M log N)", multi: "Binary search" },
              ].map((row) => (
                <tr
                  key={row.name}
                  className={`border-b border-[var(--color-border)]/40 ${row.name === "Aho-Corasick" ? "bg-[var(--color-accent)]/5" : ""}`}
                >
                  <td className={`py-2 pr-4 font-mono font-semibold ${row.name === "Aho-Corasick" ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"}`}>
                    {row.name}
                  </td>
                  <td className="py-2 pr-4 font-mono text-[var(--color-accent-3)]">{row.build}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--color-accent-3)]">{row.search}</td>
                  <td className="py-2 pr-4 text-[var(--color-muted)] text-xs">{row.multi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

    </div>
  );
}
