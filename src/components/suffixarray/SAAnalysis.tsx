import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

export function SAAnalysis() {
  const { t } = useLang();

  // "banana" walkthrough data
  const s = "banana";
  const suffixes = [
    { i: 0, text: "banana", sa: 3 },
    { i: 1, text: "anana",  sa: 2 },
    { i: 2, text: "nana",   sa: 5 },
    { i: 3, text: "ana",    sa: 1 },
    { i: 4, text: "na",     sa: 4 },
    { i: 5, text: "a",      sa: 0 },
  ];
  const sortedSuffixes = [
    { i: 5, text: "a",      lcp: "—" },
    { i: 3, text: "ana",    lcp: "1" },
    { i: 1, text: "anana",  lcp: "3" },
    { i: 0, text: "banana", lcp: "0" },
    { i: 4, text: "na",     lcp: "0" },
    { i: 2, text: "nana",   lcp: "2" },
  ];

  return (
    <div className="space-y-6">

      {/* Definition */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("sa.analysis.def.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{t("sa.analysis.def.p1")}</p>
        <MathBlock math={String.raw`\text{SA}[i] = \text{start of the } i\text{-th lexicographically smallest suffix}`} />
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mt-4 mb-4">{t("sa.analysis.def.p2")}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* All suffixes */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">{t("sa.analysis.def.col.original")}</p>
            <div className="space-y-0.5">
              {suffixes.map(({ i, text }) => (
                <div key={i} className="flex gap-3 text-sm font-mono">
                  <span className="text-[var(--color-accent)] w-4">{i}</span>
                  <span className="text-[var(--color-text)]">{s[i]}</span>
                  <span className="text-[var(--color-muted)]">{text.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Sorted */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">{t("sa.analysis.def.col.sorted")}</p>
            <div className="space-y-0.5">
              {sortedSuffixes.map(({ i, text, lcp }, pos) => (
                <div key={i} className="flex gap-3 text-sm font-mono">
                  <span className="text-[var(--color-muted)] w-4">{pos}</span>
                  <span className="text-[var(--color-accent)] w-4">{i}</span>
                  <span className="text-[var(--color-accent-3)] w-4">{lcp}</span>
                  <span className="text-[var(--color-text)]">{text}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-2 font-mono">pos · SA[pos] · LCP · suffix</p>
          </div>
        </div>
      </SectionCard>

      {/* Prefix doubling */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("sa.analysis.build.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{t("sa.analysis.build.p1")}</p>

        <div className="space-y-3 mb-4">
          {[
            { label: "1", text: t("sa.analysis.build.step1") },
            { label: "2", text: t("sa.analysis.build.step2") },
            { label: "3", text: t("sa.analysis.build.step3") },
            { label: "4", text: t("sa.analysis.build.step4") },
          ].map(({ label, text }) => (
            <div key={label} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{label}</span>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-[var(--color-accent-3)]/30 bg-[var(--color-accent-3)]/5">
          <p className="text-sm font-semibold text-[var(--color-accent-3)] mb-2">{t("sa.analysis.build.complexity")}</p>
          <MathBlock math={String.raw`O(N \log^2 N) \text{ with comparison sort},\quad O(N \log N) \text{ with radix sort}`} />
        </div>
      </SectionCard>

      {/* Kasai's LCP */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("sa.analysis.lcp.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{t("sa.analysis.lcp.p1")}</p>
        <MathBlock math={String.raw`\text{LCP}[i] = \text{longest common prefix of } \text{SA}[i{-}1] \text{ and } \text{SA}[i]`} />
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mt-4 mb-4">{t("sa.analysis.lcp.p2")}</p>
        <div className="p-4 rounded-xl border border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/5">
          <p className="text-sm font-semibold text-[var(--color-accent-2)] mb-1">{t("sa.analysis.lcp.kasai")}</p>
          <p className="text-sm text-[var(--color-muted)]">{t("sa.analysis.lcp.kasai.desc")}</p>
          <MathBlock math={String.raw`O(N) \text{ time, } O(N) \text{ space}`} />
        </div>
      </SectionCard>

      {/* Comparison + Applications */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("sa.analysis.apps.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { color: "var(--color-accent)",   title: t("sa.analysis.apps.search.title"),    desc: t("sa.analysis.apps.search.desc"),    code: "binary search on SA" },
            { color: "var(--color-accent-2)",  title: t("sa.analysis.apps.distinct.title"),  desc: t("sa.analysis.apps.distinct.desc"),  code: "N*(N+1)/2 − Σ LCP[i]" },
            { color: "var(--color-accent-3)",  title: t("sa.analysis.apps.lcs.title"),       desc: t("sa.analysis.apps.lcs.desc"),       code: "max LCP in range" },
            { color: "var(--color-warn)",      title: t("sa.analysis.apps.repeats.title"),   desc: t("sa.analysis.apps.repeats.desc"),   code: "LCP ≥ k sliding window" },
          ].map(({ color, title, desc, code }) => (
            <div key={title} className="p-4 rounded-xl border bg-[var(--color-surface-2)]"
              style={{ borderColor: color + "40" }}>
              <p className="font-semibold text-sm mb-1" style={{ color }}>{title}</p>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-2">{desc}</p>
              <code className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-bg)]" style={{ color }}>{code}</code>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">{t("sa.analysis.compare.title")}</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[t("sa.analysis.compare.structure"), t("sa.analysis.compare.build"), t("sa.analysis.compare.search"), t("sa.analysis.compare.space")].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-[var(--color-muted)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "SA (std::sort)",   build: "O(N log² N)", search: "O(M log N)",  space: "O(N)" },
                { name: "SA (radix sort)",  build: "O(N log N)",  search: "O(M log N)",  space: "O(N)" },
                { name: "+ LCP (Kasai)",    build: "+ O(N)",      search: "O(M + occ)",  space: "O(N)" },
                { name: "Suffix Tree",      build: "O(N)",        search: "O(M)",        space: "O(N·Σ)" },
                { name: "Naive sort",       build: "O(N² log N)", search: "O(M log N)",  space: "O(N²)" },
              ].map(row => (
                <tr key={row.name} className="border-b border-[var(--color-border)]/40">
                  <td className="py-2 pr-4 font-mono font-semibold text-[var(--color-text)]">{row.name}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--color-accent-3)]">{row.build}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--color-accent-3)]">{row.search}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--color-accent-2)]">{row.space}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
