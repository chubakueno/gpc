import { useLang } from "@/i18n/LanguageContext";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";

const GROWTH_ROWS: [string, string, string][] = [
  ["0", "n + 1", "5"],
  ["1", "n + 2", "6"],
  ["2", "2n + 3", "11"],
  ["3", "2^(n+3) − 3", "61"],
  ["4", "tower of 2s of height n+3 − 3", "2^{2^{65536}} - 3"],
];

const INVERSE_ROWS: [string, string][] = [
  ["1 to 3", "1"],
  ["4 to 7", "2"],
  ["8 to 2047", "3"],
  ["2048 to A(4,4) ≈ 10^{19728}", "4"],
  ["A(5,5) (incomprehensibly large)", "5"],
];

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
        <p className="text-sm text-[var(--color-text)] font-medium mb-3">{t("ufds.ack.tarjanHopcroft")}</p>
        <MathBlock math="T(n) = O(n \cdot \alpha(n))" />
        <p className="text-xs text-[var(--color-muted)] mt-2">{t("ufds.ack.alphaNote")}</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* Step 1: Ackermann function */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("ufds.ack.fn.title")}</p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">{t("ufds.ack.fn.desc")}</p>
          <div className="overflow-x-auto">
            <MathBlock math={`A(m, n) = \\begin{cases} n + 1 & m = 0 \\\\ A(m-1, 1) & m > 0,\\; n = 0 \\\\ A(m-1, A(m, n-1)) & m > 0,\\; n > 0 \\end{cases}`} />
          </div>
        </div>

        {/* Step 2: Growth rate table */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("ufds.ack.growth.title")}</p>
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                  <th className="pb-2 text-left pr-6">{t("ufds.ack.growth.col.m")}</th>
                  <th className="pb-2 text-left pr-6">{t("ufds.ack.growth.col.formula")}</th>
                  <th className="pb-2 text-left">{t("ufds.ack.growth.col.val")}</th>
                </tr>
              </thead>
              <tbody>
                {GROWTH_ROWS.map(([m, formula, val]) => (
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
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("ufds.ack.inverse.title")}</p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">{t("ufds.ack.inverse.desc")}</p>
          <div className="overflow-x-auto mb-3">
            <MathBlock math="\alpha(n) = \min\{m \mid A(m, m) \geq n\}" />
          </div>
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                  <th className="pb-2 text-left pr-6">{t("ufds.ack.inverse.col.n")}</th>
                  <th className="pb-2 text-left">{t("ufds.ack.inverse.col.alpha")}</th>
                </tr>
              </thead>
              <tbody>
                {INVERSE_ROWS.map(([range, alpha]) => (
                  <tr key={range} className="border-b border-[var(--color-border)]/50">
                    <td className="py-1.5 pr-6 font-mono text-sm text-[var(--color-muted)]">{range}</td>
                    <td className="py-1.5 font-mono font-bold text-[var(--color-accent)]">{alpha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-3">{t("ufds.ack.inverse.note")}</p>
        </div>

        {/* Step 4: Proof sketch */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("ufds.ack.sketch.title")}</p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">{t("ufds.ack.sketch.desc")}</p>
          <ol className="text-sm text-[var(--color-muted)] list-decimal list-inside space-y-2 mb-3">
            <li>{t("ufds.ack.sketch.item1")}</li>
            <li>{t("ufds.ack.sketch.item2")}</li>
            <li>{t("ufds.ack.sketch.item3")}</li>
          </ol>
          <div className="overflow-x-auto">
            <MathBlock math="\sum_{\text{all finds}} \text{path length} = O(n \cdot \alpha(n))" />
          </div>
        </div>

        {/* Practical takeaway */}
        <div className="p-4 rounded-xl bg-[var(--color-accent-3)]/10 border border-[var(--color-accent-3)]/30">
          <p className="text-sm font-semibold text-[var(--color-accent-3)] mb-2">{t("ufds.ack.practical.title")}</p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            {t("ufds.ack.practical.desc").split(t("ufds.ack.practical.emphasis")).length > 1
              ? (
                <>
                  {t("ufds.ack.practical.desc").split(t("ufds.ack.practical.emphasis"))[0]}
                  <strong className="text-[var(--color-text)]">{t("ufds.ack.practical.emphasis")}</strong>
                  {t("ufds.ack.practical.desc").split(t("ufds.ack.practical.emphasis"))[1]}
                </>
              )
              : (
                <>
                  <strong className="text-[var(--color-text)]">{t("ufds.ack.practical.emphasis")}</strong>
                  {" — "}
                  {t("ufds.ack.practical.desc")}
                </>
              )
            }
          </p>
          <div className="mt-3 overflow-x-auto">
            <MathBlock math="\alpha(10^{18}) = 4 \quad \Rightarrow \quad \text{4 steps, always}" />
          </div>
        </div>

      </div>
    </SectionCard>
  );
}
