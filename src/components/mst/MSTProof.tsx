import { useLang } from "@/i18n/LanguageContext";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";

const COMPLEXITY_ROWS: [string, string, string][] = [
  ["Kruskal",                 "O(E \\log E)",           "Sort edges + Union-Find"],
  ["Prim (adj. matrix)",      "O(V^2)",                 "Dense graphs"],
  ["Prim (binary heap)",      "O(E \\log V)",           "Sparse graphs — typical"],
  ["Prim (Fibonacci heap)",   "O(E + V \\log V)",       "Theoretical optimum"],
];

export function MSTProof() {
  const { t } = useLang();

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("mst.proof.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("mst.proof.subtitle")}</p>

      {/* Key result box */}
      <div className="mb-8 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
        <p className="text-sm font-medium text-[var(--color-text)] mb-3">
          {t("mst.proof.summary")}
        </p>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("mst.proof.summary.body")}</p>
        <MathBlock math="\text{Cut Property} \Rightarrow \text{Kruskal correct} \quad \text{Cut Property} \Rightarrow \text{Prim correct}" />
      </div>

      <div className="flex flex-col gap-8">

        {/* Cut Property */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
            {t("mst.proof.cut.title")}
          </p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
            {t("mst.proof.cut.def")}
          </p>
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto mb-3">
            <MathBlock math="\text{If } (S, V \setminus S) \text{ is a cut and } e^* = \arg\min_{e \text{ crosses}} w(e), \text{ then } e^* \in \text{some MST}" />
          </div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-2">
            {t("mst.proof.cut.theorem")}
          </p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed italic border-l-2 border-[var(--color-accent)]/40 pl-3">
            {t("mst.proof.cut.proof")}
          </p>
        </div>

        {/* Cycle Property */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
            {t("mst.proof.cycle.title")}
          </p>
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto mb-3">
            <MathBlock math="\text{If } e = \arg\max_{e \in C} w(e) \text{ in cycle } C, \text{ then } e \notin \text{any MST}" />
          </div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-2">
            {t("mst.proof.cycle.theorem")}
          </p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed italic border-l-2 border-[var(--color-accent-2)]/40 pl-3">
            {t("mst.proof.cycle.proof")}
          </p>
        </div>

        {/* Why Kruskal is correct */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
            {t("mst.proof.kruskal.title")}
          </p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
            {t("mst.proof.kruskal.body")}
          </p>
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto">
            <MathBlock math="T(E, V) = O(E \log E) \approx O(E \log V) \quad \text{(since } E \leq V^2\text{)}" />
          </div>
        </div>

        {/* Why Prim is correct */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
            {t("mst.proof.prim.title")}
          </p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
            {t("mst.proof.prim.body")}
          </p>
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto">
            <MathBlock math="\text{cut} = (T,\; V \setminus T) \xrightarrow{\text{Pick min crossing edge}} \text{Cut Property guarantees safety}" />
          </div>
        </div>

        {/* Complexity table */}
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-3">
            {t("mst.proof.table.title")}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                  <th className="pb-2 pr-6">{t("mst.proof.table.algorithm")}</th>
                  <th className="pb-2 pr-6">{t("mst.proof.table.time")}</th>
                  <th className="pb-2">{t("mst.proof.table.notes")}</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_ROWS.map(([algo, time, notes]) => (
                  <tr key={algo} className="border-b border-[var(--color-border)]/50">
                    <td className="py-2 pr-6 text-[var(--color-text)]">{algo}</td>
                    <td className="py-2 pr-6 font-mono text-xs text-[var(--color-accent)]">
                      <MathBlock math={time} inline />
                    </td>
                    <td className="py-2 text-xs text-[var(--color-muted)]">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </SectionCard>
  );
}
