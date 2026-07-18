import { useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";
import { UP, LOG, NODE_COUNT } from "./LCATree";

interface UPStep {
  k: number;
}

export function BinaryLiftingExplainer() {
  const { t } = useLang();
  const steps = useMemo<UPStep[]>(() => Array.from({ length: LOG }, (_, k) => ({ k })), []);
  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<UPStep>(steps, { intervalMs: 900 });

  const currentK = frame.k;

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("lca.bl.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("lca.bl.desc")}</p>

      {/* DP framing callout — deliberate callback to the DP Fundamentals tab */}
      <div className="mb-6 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
        <p className="text-sm font-medium text-[var(--color-text)] mb-2">{t("lca.bl.dpframe.title")}</p>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("lca.bl.dpframe.body")}</p>
        <MathBlock math="\text{up}[0][v] = \text{parent}[v] \qquad \text{up}[k][v] = \text{up}[k-1]\big[\,\text{up}[k-1][v]\,\big]" />
      </div>

      {/* Animated up[][] table fill */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-6">
        <p className="text-xs font-medium text-[var(--color-muted)] mb-3">{t("lca.bl.table.label")}</p>

        <div className="overflow-x-auto mb-4">
          <table className="border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className="pr-3 pb-2 text-right text-[var(--color-muted)] font-normal">v =</th>
                {Array.from({ length: NODE_COUNT }, (_, v) => (
                  <th key={v} className="w-8 h-7 text-center font-normal pb-2 text-[var(--color-muted)]">
                    {v}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: LOG }, (_, k) => {
                const isCurrent = k === currentK;
                const isFilled = k <= currentK;
                return (
                  <tr key={k}>
                    <td
                      className={`pr-3 text-right font-normal py-0.5 ${
                        isCurrent ? "text-[var(--color-warn)]" : "text-[var(--color-muted)]"
                      }`}
                    >
                      k={k} (2^{k})
                    </td>
                    {Array.from({ length: NODE_COUNT }, (_, v) => (
                      <td key={v} className="py-0.5 px-0.5">
                        <div
                          className={`w-8 h-7 rounded flex items-center justify-center font-semibold border transition-all duration-200 ${
                            isCurrent
                              ? "border-[var(--color-warn)] bg-[var(--color-warn)]/20 text-[var(--color-warn)]"
                              : isFilled
                              ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                              : "border-[var(--color-border)]/30 text-[var(--color-muted)]/30"
                          }`}
                        >
                          {isFilled ? (UP[k][v] === -1 ? "–" : UP[k][v]) : "?"}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-[var(--color-muted)] mb-4">
          {currentK === 0 ? t("lca.bl.table.row0") : t("lca.bl.table.rowk", { k: currentK, prev: currentK - 1 })}
        </p>

        <StepControls
          isPlaying={isPlaying}
          isAtEnd={isAtEnd}
          stepIdx={stepIdx}
          totalSteps={totalSteps}
          onPlay={play}
          onPause={pause}
          onNext={next}
          onPrev={prev}
          onReset={reset}
        />
      </div>

      {/* Correctness + complexity */}
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("lca.bl.correct.title")}</p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t("lca.bl.correct.body")}</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("lca.bl.complexity.title")}</p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">{t("lca.bl.complexity.body")}</p>
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto">
            <MathBlock math="\text{Preprocess: } O(n \log n) \quad\quad \text{Query: } O(\log n)" />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
