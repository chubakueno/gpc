import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import type { NormalHashStep } from "@/types/hashing";

function computeSteps(input: string, base: number, mod: number): NormalHashStep[] {
  const steps: NormalHashStep[] = [];
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const ascii = input.charCodeAt(i);
    const newHash = (hash * base + ascii) % mod;
    steps.push({
      index: i,
      char: input[i],
      ascii,
      contribution: ascii,
      runningHash: newHash,
      formula: `(${hash} \\times ${base} + ${ascii}) \\bmod ${mod} = ${newHash}`,
    });
    hash = newHash;
  }
  return steps.length > 0 ? steps : [{
    index: -1,
    char: "",
    ascii: 0,
    contribution: 0,
    runningHash: 0,
    formula: "\\text{empty string}",
  }];
}

export function NormalHashDemo() {
  const { t } = useLang();
  const [input, setInput] = useState("hello");
  const [base, setBase] = useState(31);
  const [mod, setMod] = useState(1000000007);

  const steps = useMemo(() => computeSteps(input || "hello", base, mod), [input, base, mod]);
  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<NormalHashStep>(steps, { intervalMs: 900 });

  const currentIndex = frame.index;

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("hashing.normal.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("hashing.normal.desc")}</p>

      {/* Config */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">{t("hashing.normal.input.label")}</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 20))}
            placeholder={t("hashing.normal.input.placeholder")}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">{t("hashing.normal.base.label")}</label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(Math.max(2, Number(e.target.value)))}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-24"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">{t("hashing.normal.mod.label")}</label>
          <input
            type="number"
            value={mod}
            onChange={(e) => setMod(Math.max(2, Number(e.target.value)))}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-36"
          />
        </div>
      </div>

      {/* Character boxes */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(input || "hello").split("").map((ch, i) => (
          <div
            key={i}
            className={`flex flex-col items-center rounded-lg border-2 px-3 py-2 transition-all duration-300 ${
              i === currentIndex
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 scale-110"
                : i < currentIndex
                ? "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/10"
                : "border-[var(--color-border)] bg-[var(--color-surface-2)]"
            }`}
          >
            <span className="text-lg font-mono font-bold text-[var(--color-text)]">{ch}</span>
            <span className="text-xs text-[var(--color-muted)]">{ch.charCodeAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Current step formula */}
      {currentIndex >= 0 && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-muted)] mb-2">
            {t("hashing.normal.step.adding")} '{frame.char}' (ASCII {frame.ascii})
          </div>
          <MathBlock math={frame.formula} />
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)]">{t("hashing.normal.step.running")}:</span>
            <span className="font-mono text-[var(--color-accent)] font-bold">{frame.runningHash}</span>
          </div>
        </div>
      )}

      {/* Table of all steps so far */}
      {currentIndex >= 0 && (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="pb-2 pr-4">i</th>
                <th className="pb-2 pr-4">{t("hashing.normal.char.label")}</th>
                <th className="pb-2 pr-4">{t("hashing.normal.ascii.label")}</th>
                <th className="pb-2">{t("hashing.normal.hash.label")}</th>
              </tr>
            </thead>
            <tbody>
              {steps.slice(0, currentIndex + 1).map((s) => (
                <tr
                  key={s.index}
                  className={`border-b border-[var(--color-border)]/50 ${
                    s.index === currentIndex ? "bg-[var(--color-accent)]/5" : ""
                  }`}
                >
                  <td className="py-1.5 pr-4 font-mono text-[var(--color-muted)]">{s.index}</td>
                  <td className="py-1.5 pr-4 font-mono text-[var(--color-accent-2)]">'{s.char}'</td>
                  <td className="py-1.5 pr-4 font-mono">{s.ascii}</td>
                  <td className="py-1.5 font-mono text-[var(--color-accent)]">{s.runningHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Final hash */}
      {isAtEnd && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
          <span className="text-[var(--color-muted)] text-sm">{t("hashing.normal.final")}:</span>
          <span className="font-mono text-2xl font-bold text-[var(--color-accent)]">
            {frame.runningHash}
          </span>
        </div>
      )}

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
    </SectionCard>
  );
}
