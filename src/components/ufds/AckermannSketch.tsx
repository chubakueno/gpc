import { useLang } from "@/i18n/LanguageContext";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";

export function AckermannSketch() {
  const { t } = useLang();

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("ufds.ack.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("ufds.ack.subtitle")}</p>

      {/* Main result box */}
      <div className="mb-8 p-4 rounded-xl bg-[var(--color-accent-2)]/10 border border-[var(--color-accent-2)]/30">
        <p className="text-sm text-[var(--color-text)] font-medium mb-3">Tarjan-Hopcroft (1975)</p>
        <MathBlock math="T(n) = O(n \cdot \alpha(n))" />
        <p className="text-xs text-[var(--color-muted)] mt-2">
          where α(n) is the inverse Ackermann function. For all practical inputs, α(n) ≤ 4.
        </p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Step 1: Ackermann function */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">The Ackermann Function</p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
            A(m, n) is a rapidly growing function defined by double recursion. Even small inputs produce astronomically large outputs.
          </p>
          <div className="overflow-x-auto">
            <MathBlock math={`A(m, n) = \\begin{cases} n + 1 & m = 0 \\\\ A(m-1, 1) & m > 0, n = 0 \\\\ A(m-1, A(m, n-1)) & m > 0, n > 0 \\end{cases}`} />
          </div>
        </div>

        {/* Step 2: How big A gets */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">Growth Rate</p>
          <div className="overflow-x-auto mb-3">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                  <th className="pb-2 text-left pr-6">m</th>
                  <th className="pb-2 text-left pr-6">A(m, n)</th>
                  <th className="pb-2 text-left">A(m, 4)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["0", "n + 1", "5"],
                  ["1", "n + 2", "6"],
                  ["2", "2n + 3", "11"],
                  ["3", "2^(n+3) − 3", "61"],
                  ["4", "tower of 2s of height n+3 − 3", "2^{2^{65536}} - 3 \\approx \\infty"],
                ].map(([m, formula, val]) => (
                  <tr key={m} className="border-b border-[var(--color-border)]/50">
                    <td className="py-1.5 pr-6 font-mono text-[var(--color-accent)]">{m}</td>
                    <td className="py-1.5 pr-6 font-mono text-sm text-[var(--color-text)]">{formula}</td>
                    <td className="py-1.5 font-mono text-xs text-[var(--color-muted)]">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 3: Inverse Ackermann */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">The Inverse α(n)</p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
            The inverse Ackermann function α(n) is the smallest m such that A(m, m) ≥ n.
          </p>
          <div className="overflow-x-auto mb-3">
            <MathBlock math="\alpha(n) = \min\{m \mid A(m, m) \geq n\}" />
          </div>
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                  <th className="pb-2 text-left pr-6">n</th>
                  <th className="pb-2 text-left">α(n)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1 to 3", "1"],
                  ["4 to 7", "2"],
                  ["8 to 2047", "3"],
                  ["2048 to A(4,4) ≈ 10^{19728}", "4"],
                  ["A(5,5) (incomprehensibly large)", "5"],
                ].map(([range, alpha]) => (
                  <tr key={range} className="border-b border-[var(--color-border)]/50">
                    <td className="py-1.5 pr-6 font-mono text-sm text-[var(--color-muted)]">{range}</td>
                    <td className="py-1.5 font-mono font-bold text-[var(--color-accent)]">{alpha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-3">
            Since the observable universe has ~10⁸⁰ atoms, α(n) ≤ 4 for any input you could ever construct.
          </p>
        </div>

        {/* Step 4: Why UFDS achieves this */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">Informal Proof Sketch</p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
            Tarjan's analysis groups nodes into "rank blocks" defined by a function related to iterated logarithm.
            The key observations are:
          </p>
          <ol className="text-sm text-[var(--color-muted)] list-decimal list-inside space-y-2 mb-3">
            <li>Path compression flattens trees, so each node is traversed at most a constant number of times within each rank block.</li>
            <li>Union by rank ensures ranks grow very slowly (bounded by log n), and the number of rank blocks is bounded by α(n).</li>
            <li>The total work across all find operations, across all nodes in all rank blocks, sums to O(n α(n)).</li>
          </ol>
          <div className="overflow-x-auto">
            <MathBlock math="\sum_{\text{all finds}} \text{path length} = O(n \cdot \alpha(n))" />
          </div>
        </div>

        {/* Practical takeaway */}
        <div className="p-4 rounded-xl bg-[var(--color-accent-3)]/10 border border-[var(--color-accent-3)]/30">
          <p className="text-sm font-semibold text-[var(--color-accent-3)] mb-2">Practical Takeaway</p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            In competitive programming, treat UFDS with both optimizations as <strong className="text-[var(--color-text)]">effectively O(1) per operation</strong>.
            The amortized cost per operation is so small it never matters. Use it freely.
          </p>
          <div className="mt-3 overflow-x-auto">
            <MathBlock math="\alpha(10^{18}) = 4 \quad \Rightarrow \quad \text{4 steps, always}" />
          </div>
        </div>

      </div>
    </SectionCard>
  );
}
