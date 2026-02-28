import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { RangeSlider } from "@/components/shared/RangeSlider";
import type { RollingHashStep } from "@/types/hashing";

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return result;
}

function computeSteps(input: string, k: number, base: number, mod: number): RollingHashStep[] {
  if (input.length < k || k < 1) return [];
  const steps: RollingHashStep[] = [];

  // Compute initial hash of window [0..k-1]
  let hash = 0;
  for (let i = 0; i < k; i++) {
    hash = (hash * base + input.charCodeAt(i)) % mod;
  }
  steps.push({
    windowStart: 0,
    windowEnd: k - 1,
    window: input.slice(0, k),
    hash,
    removing: null,
    adding: null,
    formula: `\\text{Initial: } H_0 = \\sum_{i=0}^{${k - 1}} s[i] \\cdot ${base}^{${k - 1}-i} \\bmod ${mod} = ${hash}`,
  });

  const basePowK = modPow(base, k - 1, mod);

  for (let i = 1; i + k - 1 < input.length; i++) {
    const removing = input[i - 1];
    const adding = input[i + k - 1];
    const removingCode = input.charCodeAt(i - 1);
    const addingCode = input.charCodeAt(i + k - 1);
    const newHash = ((hash - removingCode * basePowK % mod + mod) * base + addingCode) % mod;

    steps.push({
      windowStart: i,
      windowEnd: i + k - 1,
      window: input.slice(i, i + k),
      hash: newHash,
      removing,
      adding,
      formula: `H_{${i}} = (H_{${i-1}} - \\text{'${removing}'} \\cdot ${base}^{${k-1}}) \\cdot ${base} + \\text{'${adding}'} \\bmod ${mod} = ${newHash}`,
    });
    hash = newHash;
  }

  return steps;
}

export function RollingHashDemo() {
  const { t } = useLang();
  const [input, setInput] = useState("abracadabra");
  const [windowSize, setWindowSize] = useState(4);
  const [base] = useState(31);
  const [mod] = useState(1000003);

  const maxWindow = Math.max(1, (input || "abracadabra").length - 1);
  const clampedK = Math.min(windowSize, maxWindow);

  const steps = useMemo(
    () => computeSteps(input || "abracadabra", clampedK, base, mod),
    [input, clampedK, base, mod]
  );

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<RollingHashStep>(steps, { intervalMs: 1000 });

  const str = input || "abracadabra";

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("hashing.rolling.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("hashing.rolling.desc")}</p>

      {/* Config */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">{t("hashing.rolling.input.label")}</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 24))}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-52"
          />
        </div>
        <div className="flex-1 min-w-48">
          <RangeSlider
            label={t("hashing.rolling.window.label")}
            value={clampedK}
            min={1}
            max={maxWindow}
            onChange={setWindowSize}
          />
        </div>
      </div>

      {/* String visualization */}
      <div className="flex flex-wrap gap-1.5 mb-6 select-none">
        {str.split("").map((ch, i) => {
          const inWindow = frame && i >= frame.windowStart && i <= frame.windowEnd;
          const isRemoving = frame?.removing !== null && i === frame?.windowStart - 1;
          const isAdding = frame?.adding !== null && i === frame?.windowEnd;

          return (
            <div
              key={i}
              className={`flex flex-col items-center rounded-lg border-2 px-2.5 py-2 transition-all duration-300 ${
                inWindow
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : isRemoving
                  ? "border-[var(--color-danger)] bg-[var(--color-danger)]/10 scale-95"
                  : isAdding
                  ? "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/10 scale-110"
                  : "border-[var(--color-border)] bg-[var(--color-surface-2)]"
              }`}
            >
              <span className="text-base font-mono font-bold text-[var(--color-text)]">{ch}</span>
              <span className="text-[10px] text-[var(--color-muted)]">{i}</span>
            </div>
          );
        })}
      </div>

      {/* Current step info */}
      {frame && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            <div>
              <span className="text-[var(--color-muted)]">{t("hashing.rolling.window")}: </span>
              <span className="font-mono text-[var(--color-accent)]">"{frame.window}"</span>
              <span className="text-[var(--color-muted)] text-xs ml-2">[{frame.windowStart}..{frame.windowEnd}]</span>
            </div>
            {frame.removing && (
              <div>
                <span className="text-[var(--color-muted)]">{t("hashing.rolling.removing")}: </span>
                <span className="font-mono text-[var(--color-danger)]">'{frame.removing}'</span>
              </div>
            )}
            {frame.adding && (
              <div>
                <span className="text-[var(--color-muted)]">{t("hashing.rolling.adding")}: </span>
                <span className="font-mono text-[var(--color-accent-3)]">'{frame.adding}'</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <MathBlock math={frame.formula} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)]">{t("hashing.rolling.hash")}:</span>
            <span className="font-mono text-[var(--color-accent)] font-bold">{frame.hash}</span>
          </div>
        </div>
      )}

      {/* All hashes so far */}
      {steps.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-[var(--color-muted)] mb-2">{t("hashing.rolling.all")}:</p>
          <div className="flex flex-wrap gap-2">
            {steps.slice(0, stepIdx + 1).map((s, i) => (
              <div
                key={i}
                className={`text-xs font-mono px-2 py-1 rounded-lg border ${
                  i === stepIdx
                    ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                    : "border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                "{s.window}" → {s.hash}
              </div>
            ))}
          </div>
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
