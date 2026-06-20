import { useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";

const DEFAULT_ARR = [2, 5, 3, 4, 1, 7, 6, 8];

interface LISStep {
  dp: number[];
  prev: number[];
  current: number;
  extendFrom: number;
  phase: "init" | "filling" | "done";
  lisIndices: Set<number>;
}

function computeLISSteps(arr: number[]): LISStep[] {
  const n = arr.length;
  const dp = Array(n).fill(1);
  const prev = Array(n).fill(-1);
  const steps: LISStep[] = [];

  steps.push({
    dp: [...dp], prev: [...prev],
    current: -1, extendFrom: -1,
    phase: "init", lisIndices: new Set(),
  });

  for (let i = 0; i < n; i++) {
    let bestJ = -1;
    for (let j = 0; j < i; j++) {
      if (arr[j] < arr[i] && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1;
        prev[i] = j;
        bestJ = j;
      }
    }
    steps.push({
      dp: [...dp], prev: [...prev],
      current: i, extendFrom: bestJ,
      phase: "filling", lisIndices: new Set(),
    });
  }

  // Find LIS
  let maxLen = 0;
  let endIdx = 0;
  for (let i = 0; i < n; i++) {
    if (dp[i] > maxLen) { maxLen = dp[i]; endIdx = i; }
  }
  const lisIndices = new Set<number>();
  let cur = endIdx;
  while (cur !== -1) {
    lisIndices.add(cur);
    cur = prev[cur];
  }

  steps.push({
    dp: [...dp], prev: [...prev],
    current: -1, extendFrom: -1,
    phase: "done", lisIndices,
  });

  return steps;
}

export function LISDemo() {
  const { t } = useLang();
  const [rawInput, setRawInput] = useState(DEFAULT_ARR.join(", "));
  const [committed, setCommitted] = useState(DEFAULT_ARR);
  const [error, setError] = useState("");

  const steps = useMemo(() => computeLISSteps(committed), [committed]);

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep(steps, { intervalMs: 700 });

  function applySettings() {
    const parts = rawInput.split(/[,\s]+/).filter(Boolean);
    const nums = parts.map(Number);
    if (parts.length === 0 || nums.some(isNaN)) { setError(t("dp.lis.err.invalid")); return; }
    if (nums.length === 0) { setError(t("dp.lis.err.empty")); return; }
    if (nums.length > 10) { setError(t("dp.lis.err.long")); return; }
    setError("");
    setCommitted(nums);
  }

  const { dp, current, extendFrom, phase, lisIndices } = frame;

  let statusMsg = "";
  if (phase === "init") {
    statusMsg = t("dp.lis.phase.init");
  } else if (phase === "filling") {
    if (extendFrom === -1) {
      statusMsg = t("dp.lis.phase.filling.none", { i: current });
    } else {
      statusMsg = t("dp.lis.phase.filling", {
        i: current,
        v: dp[current],
        j: extendFrom,
        jv: committed[extendFrom],
      });
    }
  } else {
    const lisArr = [...lisIndices].sort((a, b) => a - b).map((i) => committed[i]);
    statusMsg = t("dp.lis.phase.done", { n: lisArr.length, lis: lisArr.join(", ") });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("dp.lis.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("dp.lis.desc")}</p>
        <div className="inline-block rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-xs font-mono text-[var(--color-accent-2)]">
          {t("dp.lis.recurrence")}
        </div>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-[var(--color-muted)] block mb-1">
            {t("dp.lis.array.label")}
          </label>
          <input
            className="w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-sm font-mono text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
          />
        </div>
        <button
          onClick={applySettings}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
        >
          {t("dp.lis.apply")}
        </button>
        {error && <p className="text-xs text-red-400 self-center">{error}</p>}
      </div>

      {/* Visualization */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="overflow-x-auto mb-6">
          <div className="flex gap-2 min-w-max">
            {committed.map((val, i) => {
              const isActive = i === current && phase === "filling";
              const isPredecessor = i === extendFrom && phase === "filling";
              const inLIS = lisIndices.has(i) && phase === "done";

              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-[var(--color-muted)] font-mono">{i}</div>

                  {/* Array value */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-mono font-bold border-2 transition-all duration-300 ${
                      isActive
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] scale-110"
                        : isPredecessor
                        ? "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/20 text-[var(--color-accent-3)]"
                        : inLIS
                        ? "border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)]"
                        : phase !== "init" && i < (current === -1 ? committed.length : current)
                        ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                        : "border-[var(--color-border)]/40 bg-[var(--color-surface)] text-[var(--color-muted)]/40"
                    }`}
                  >
                    {val}
                  </div>

                  {/* dp[i] label */}
                  <div
                    className={`w-12 h-8 rounded flex items-center justify-center text-sm font-mono border transition-all duration-300 ${
                      isActive
                        ? "border-[var(--color-accent)]/60 bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : inLIS
                        ? "border-[var(--color-accent-2)]/60 bg-[var(--color-accent-2)]/10 text-[var(--color-accent-2)]"
                        : phase !== "init" && i <= (current === -1 ? committed.length - 1 : current)
                        ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                        : "border-transparent text-[var(--color-muted)]/20"
                    }`}
                  >
                    {phase !== "init" && i <= (current === -1 ? committed.length - 1 : current)
                      ? dp[i]
                      : "·"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend row labels */}
          <div className="flex gap-2 mt-1 min-w-max">
            <div className="w-full flex flex-col gap-0">
              <div className="text-xs text-[var(--color-muted)] mt-1 ml-0">
                <span className="font-mono">arr[i]</span>
              </div>
              <div className="text-xs text-[var(--color-muted)] mt-1">
                <span className="font-mono">dp[i]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="min-h-[2rem] mb-4">
          <p className="text-sm text-[var(--color-muted)]">{statusMsg}</p>
          {phase === "done" && lisIndices.size > 0 && (
            <div className="mt-2 flex flex-wrap gap-3 items-center">
              <span className="text-xs text-[var(--color-muted)]">{t("dp.lis.length.label")}</span>
              <span className="font-mono font-bold text-[var(--color-accent)]">{lisIndices.size}</span>
              <span className="text-xs text-[var(--color-muted)]">{t("dp.lis.result.label")}</span>
              {[...lisIndices].sort((a, b) => a - b).map((i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-[var(--color-accent-2)]/20 border border-[var(--color-accent-2)]/40 text-[var(--color-accent-2)] text-xs font-mono font-semibold"
                >
                  {committed[i]}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/20 inline-block" />
            current i
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border-2 border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/20 inline-block" />
            best predecessor j
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border-2 border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/20 inline-block" />
            in LIS
          </span>
        </div>

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
    </div>
  );
}
