import { useLang } from "@/i18n/LanguageContext";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";

export function ComplexityProof() {
  const { t } = useLang();

  const steps = [
    {
      title: t("ufds.proof.step1.title"),
      body: t("ufds.proof.step1.body"),
      math: "\\text{rank}(x) = \\text{height of subtree rooted at } x \\text{ (upper bound on tree depth)}",
    },
    {
      title: t("ufds.proof.step2.title"),
      body: t("ufds.proof.step2.body"),
      math: "\\text{rank}(\\text{root}) = \\begin{cases} \\max(r_1, r_2) & \\text{if } r_1 \\neq r_2 \\\\ r_1 + 1 & \\text{if } r_1 = r_2 \\end{cases}",
    },
    {
      title: t("ufds.proof.step3.title"),
      body: t("ufds.proof.step3.body"),
      math: "|\\text{subtree}(x)| \\geq 2^{\\text{rank}(x)}",
    },
    {
      title: t("ufds.proof.step4.title"),
      body: t("ufds.proof.step4.body"),
      math: "2^{\\text{rank}(x)} \\leq n \\implies \\text{rank}(x) \\leq \\lfloor \\log_2 n \\rfloor",
    },
    {
      title: t("ufds.proof.step5.title"),
      body: t("ufds.proof.step5.body"),
      math: "\\text{depth}(x) \\leq \\text{rank}(\\text{root}) \\leq \\lfloor \\log_2 n \\rfloor",
    },
    {
      title: t("ufds.proof.step6.title"),
      body: t("ufds.proof.step6.body"),
      math: "T(m, n) = O(m \\log n) \\quad \\text{(m find operations, each } O(\\log n)\\text{)}",
    },
    {
      title: t("ufds.proof.step7.title"),
      body: t("ufds.proof.step7.body"),
      math: "\\text{e.g. } n=8:\\; \\text{tree height} = \\log_2 8 = 3",
    },
  ];

  const variants: [string, string, string, string][] = [
    [t("ufds.proof.variant.naive"),       "O(n)",              "O(n)",              "O(n²)"],
    [t("ufds.proof.variant.rank"),        "O(\\log n)",        "O(\\log n)",        "O(n \\log n)"],
    [t("ufds.proof.variant.compression"), "O(\\log n)\\text{ amort.}", "O(1)",     "O(n \\log n)"],
    [t("ufds.proof.variant.both"),        "O(\\alpha(n))",     "O(\\alpha(n))",     "O(n\\,\\alpha(n))"],
  ];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("ufds.proof.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("ufds.proof.subtitle")}</p>

      {/* Summary box */}
      <div className="mb-8 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
        <p className="text-sm text-[var(--color-text)] font-medium mb-3">{t("ufds.proof.keyInsight")}</p>
        <MathBlock math="\text{Union by rank} \Rightarrow \text{tree height} \leq \lfloor \log_2 n \rfloor \Rightarrow \text{find} = O(\log n)" />
      </div>

      {/* Proof steps */}
      <div className="flex flex-col gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-xs font-mono text-[var(--color-accent)] mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--color-text)] mb-1">{step.title}</p>
              <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">{step.body}</p>
              {step.math && (
                <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-x-auto">
                  <MathBlock math={step.math} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mt-8">
        <p className="text-sm font-medium text-[var(--color-text)] mb-3">{t("ufds.proof.table.title")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="pb-2 pr-6">{t("ufds.proof.table.variant")}</th>
                <th className="pb-2 pr-6">{t("ufds.proof.table.find")}</th>
                <th className="pb-2 pr-6">{t("ufds.proof.table.union")}</th>
                <th className="pb-2">{t("ufds.proof.table.total")}</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(([variant, find, union, total]) => (
                <tr key={variant} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-6 text-[var(--color-text)]">{variant}</td>
                  <td className="py-2 pr-6 font-mono text-[var(--color-accent-2)] text-xs">
                    <MathBlock math={find} inline />
                  </td>
                  <td className="py-2 pr-6 font-mono text-[var(--color-accent-2)] text-xs">
                    <MathBlock math={union} inline />
                  </td>
                  <td className="py-2 font-mono text-[var(--color-accent)] text-xs">
                    <MathBlock math={total} inline />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
