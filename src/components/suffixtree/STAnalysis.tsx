import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

export function STAnalysis() {
  const { t } = useLang();

  return (
    <div className="space-y-6">

      {/* Definition */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("st.analysis.def.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{t("st.analysis.def.body")}</p>
        <MathBlock math={String.raw`\text{N leaves},\quad \leq N{-}1 \text{ internal nodes},\quad O(N) \text{ total nodes \& edges}`} />
      </SectionCard>

      {/* Naive O(N²) */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("st.analysis.naive.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{t("st.analysis.naive.body")}</p>
        <div className="p-4 rounded-xl border border-[var(--color-warn)]/30 bg-[var(--color-warn)]/5">
          <MathBlock math={String.raw`\sum_{i=1}^{N} O(i) = O\!\left(\frac{N(N+1)}{2}\right) = O(N^2)`} />
        </div>
      </SectionCard>

      {/* Ukkonen O(N) */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("st.analysis.ukk.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">{t("st.analysis.ukk.body")}</p>
        <div className="space-y-3">
          {[
            { n: "1", text: "Leaf edges extend implicitly — no need to update all N leaves each step. End pointer advances globally." },
            { n: "2", text: "The active point (activeNode, activeEdge, activeLen) tracks exactly where to continue after each extension." },
            { n: "3", text: "Suffix links connect internal nodes to their longest proper suffix node — jumping between them costs O(1) amortized." },
          ].map(({ n, text }) => (
            <div key={n} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                {n}
              </span>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl border border-[var(--color-accent-3)]/30 bg-[var(--color-accent-3)]/5">
          <MathBlock math={String.raw`O(N) \text{ time},\quad O(N \cdot |\Sigma|) \text{ space}`} />
        </div>
      </SectionCard>

      {/* Key Properties */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("st.analysis.props.title")}</h2>
        <ul className="space-y-2">
          {[
            t("st.analysis.props.leaves"),
            t("st.analysis.props.internal"),
            t("st.analysis.props.total"),
            t("st.analysis.props.match"),
          ].map((prop, i) => (
            <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
              <span className="text-[var(--color-accent-2)] mt-0.5 flex-shrink-0">•</span>
              <span>{prop}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Applications */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("st.analysis.apps.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              color: "var(--color-accent)",
              title: t("st.analysis.apps.search.title"),
              desc: t("st.analysis.apps.search.desc"),
            },
            {
              color: "var(--color-accent-2)",
              title: t("st.analysis.apps.lrs.title"),
              desc: t("st.analysis.apps.lrs.desc"),
            },
            {
              color: "var(--color-accent-3)",
              title: t("st.analysis.apps.lcs.title"),
              desc: t("st.analysis.apps.lcs.desc"),
            },
            {
              color: "var(--color-warn)",
              title: t("st.analysis.apps.repeats.title"),
              desc: t("st.analysis.apps.repeats.desc"),
            },
          ].map(({ color, title, desc }) => (
            <div
              key={title}
              className="p-4 rounded-xl border bg-[var(--color-surface-2)]"
              style={{ borderColor: color + "40" }}
            >
              <p className="font-semibold text-sm mb-1" style={{ color }}>{title}</p>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Comparison table */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("st.analysis.compare.title")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[
                  t("st.analysis.compare.structure"),
                  t("st.analysis.compare.build"),
                  t("st.analysis.compare.search"),
                  t("st.analysis.compare.space"),
                ].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-[var(--color-muted)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Suffix Tree (Ukkonen)", build: "O(N)", search: "O(M)", space: "O(N·Σ)" },
                { name: "Suffix Tree (naive)", build: "O(N²)", search: "O(M)", space: "O(N·Σ)" },
                { name: "Suffix Array + LCP", build: "O(N log N)", search: "O(M log N)", space: "O(N)" },
                { name: "SA (radix sort) + LCP", build: "O(N log N)", search: "O(M log N)", space: "O(N)" },
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
