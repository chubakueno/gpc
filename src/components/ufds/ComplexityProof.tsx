import { useLang } from "@/i18n/LanguageContext";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";

interface ProofStep {
  title: string;
  body: string;
  math?: string;
}

export function ComplexityProof() {
  const { t } = useLang();

  const steps: ProofStep[] = [
    {
      title: "Setup",
      body: "We have n elements and perform a sequence of union and find operations. We use union by rank (but not path compression). We want to bound the cost of a single find operation.",
      math: "\\text{rank}(x) = \\text{height of subtree rooted at } x \\text{ (upper bound on tree depth)}",
    },
    {
      title: "Lemma 1: Rank only increases on union",
      body: "When we link tree of rank r1 to tree of rank r2:",
      math: "\\text{rank}(\\text{root}) = \\begin{cases} \\max(r_1, r_2) & \\text{if } r_1 \\neq r_2 \\\\ r_1 + 1 & \\text{if } r_1 = r_2 \\end{cases}",
    },
    {
      title: "Lemma 2: A tree of rank r has ≥ 2ʳ nodes",
      body: "Proof by induction: a singleton has rank 0 and 1 = 2⁰ node. When we merge two trees of equal rank r, the new root has rank r+1 and the tree has ≥ 2ʳ + 2ʳ = 2^(r+1) nodes. If ranks differ, the rank doesn't change, and nodes only increase.",
      math: "|\\text{subtree}(x)| \\geq 2^{\\text{rank}(x)}",
    },
    {
      title: "Corollary: Maximum rank is log₂ n",
      body: "Since a rank-r tree has at least 2ʳ nodes, and we have at most n nodes total:",
      math: "2^{\\text{rank}(x)} \\leq n \\implies \\text{rank}(x) \\leq \\lfloor \\log_2 n \\rfloor",
    },
    {
      title: "Theorem: Find is O(log n)",
      body: "Without path compression, find(x) traverses the path from x to its root. The path length equals the depth of x in the tree, which is at most the rank of the root. By the corollary above:",
      math: "\\text{depth}(x) \\leq \\text{rank}(\\text{root}) \\leq \\lfloor \\log_2 n \\rfloor",
    },
    {
      title: "Total complexity: O(n log n)",
      body: "For n union and m find operations (m ≥ n, which is the typical case):",
      math: "T(m, n) = O(m \\log n) \\quad \\text{(m find operations, each O(log n))}",
    },
    {
      title: "Tight example",
      body: "The bound is tight. Consider unioning in a chain: union(0,1), union(1,2), ..., union(n-2, n-1). Without rank, this creates a linear chain. With rank, after all unions the resulting tree has height exactly ⌊log₂ n⌋.",
      math: "\\text{e.g. } n=8: \\text{ tree height} = \\log_2 8 = 3",
    },
  ];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("ufds.proof.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("ufds.proof.subtitle")}</p>

      {/* Summary box */}
      <div className="mb-8 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
        <p className="text-sm text-[var(--color-text)] font-medium mb-3">Key Insight</p>
        <MathBlock math="\\text{Union by rank} \\Rightarrow \\text{tree height} \\leq \\lfloor \\log_2 n \\rfloor \\Rightarrow \\text{find} = O(\\log n)" />
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
        <p className="text-sm font-medium text-[var(--color-text)] mb-3">Complexity Comparison</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="pb-2 pr-6">Variant</th>
                <th className="pb-2 pr-6">Find</th>
                <th className="pb-2 pr-6">Union</th>
                <th className="pb-2">n ops total</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Naive (no optimization)", "O(n)", "O(n)", "O(n²)"],
                ["Union by rank only", "O(log n)", "O(log n)", "O(n log n)"],
                ["Path compression only", "O(log n) amortized", "O(1)", "O(n log n)"],
                ["Both (Tarjan-Hopcroft)", "O(α(n)) ≈ O(1)", "O(α(n))", "O(n α(n))"],
              ].map(([variant, find, union, total]) => (
                <tr key={variant} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-6 text-[var(--color-text)]">{variant}</td>
                  <td className="py-2 pr-6 font-mono text-[var(--color-accent-2)]">{find}</td>
                  <td className="py-2 pr-6 font-mono text-[var(--color-accent-2)]">{union}</td>
                  <td className="py-2 font-mono text-[var(--color-accent)]">{total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
