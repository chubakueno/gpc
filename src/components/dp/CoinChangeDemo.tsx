import { useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";

const ALL_COINS = [1, 2, 3, 4, 5, 7];
const DEFAULT_COINS = [1, 3, 4];
const DEFAULT_TARGET = 9;

interface CCStep {
  dp: number[];
  bestFrom: number[];
  current: number;
  bestCoin: number;
  phase: "init" | "filling" | "done";
  solution: number[];
}

function computeCCSteps(coins: number[], target: number): CCStep[] {
  const INF = 1e9;
  const dp = Array(target + 1).fill(INF);
  const bestFrom = Array(target + 1).fill(-1);
  const bestCoinUsed = Array(target + 1).fill(-1);
  dp[0] = 0;

  const steps: CCStep[] = [];
  steps.push({ dp: [...dp], bestFrom: [...bestFrom], current: -1, bestCoin: -1, phase: "init", solution: [] });

  for (let i = 1; i <= target; i++) {
    for (const c of coins) {
      if (c <= i && dp[i - c] + 1 < dp[i]) {
        dp[i] = dp[i - c] + 1;
        bestFrom[i] = i - c;
        bestCoinUsed[i] = c;
      }
    }
    steps.push({ dp: [...dp], bestFrom: [...bestFrom], current: i, bestCoin: bestCoinUsed[i], phase: "filling", solution: [] });
  }

  const solution: number[] = [];
  if (dp[target] < INF) {
    let x = target;
    while (x > 0) {
      const from = bestFrom[x];
      solution.push(x - from);
      x = from;
    }
  }
  steps.push({ dp: [...dp], bestFrom: [...bestFrom], current: -1, bestCoin: -1, phase: "done", solution });

  return steps;
}

export function CoinChangeDemo() {
  const { t } = useLang();
  const [selectedCoins, setSelectedCoins] = useState<number[]>(DEFAULT_COINS);
  const [targetInput, setTargetInput] = useState(DEFAULT_TARGET);
  const [committed, setCommitted] = useState({ coins: DEFAULT_COINS, target: DEFAULT_TARGET });

  const steps = useMemo(
    () => computeCCSteps(committed.coins, committed.target),
    [committed]
  );

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep(steps, { intervalMs: 600 });

  function applySettings() {
    if (selectedCoins.length === 0) return;
    setCommitted({ coins: [...selectedCoins].sort((a, b) => a - b), target: targetInput });
  }

  function toggleCoin(c: number) {
    setSelectedCoins((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  const INF = 1e9;
  const { dp, current, bestCoin, bestFrom, phase, solution } = frame;

  let statusMsg = "";
  if (phase === "init") {
    statusMsg = t("dp.coins.phase.init");
  } else if (phase === "filling") {
    if (dp[current] >= INF) {
      statusMsg = t("dp.coins.phase.unreachable", { i: current });
    } else {
      statusMsg = t("dp.coins.phase.filling", { i: current, v: dp[current], c: bestCoin, f: bestFrom[current] });
    }
  } else {
    if (solution.length > 0) {
      statusMsg = t("dp.coins.phase.done", { n: solution.length, coins: solution.join(", ") });
    } else {
      statusMsg = t("dp.coins.phase.done.impossible", { target: committed.target });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("dp.coins.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("dp.coins.desc")}</p>
        <div className="inline-block rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-xs font-mono text-[var(--color-accent-2)]">
          {t("dp.coins.recurrence")}
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-wrap gap-6 items-end">
        <div>
          <div className="text-xs font-medium text-[var(--color-muted)] mb-2">{t("dp.coins.coins.label")}</div>
          <div className="flex flex-wrap gap-2">
            {ALL_COINS.map((c) => (
              <button
                key={c}
                onClick={() => toggleCoin(c)}
                className={`w-9 h-9 rounded-lg text-sm font-mono font-semibold border transition-all cursor-pointer ${
                  selectedCoins.includes(c)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-[var(--color-muted)] mb-2">
            {t("dp.coins.target.label")}: <span className="text-[var(--color-text)]">{targetInput}</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={targetInput}
            onChange={(e) => setTargetInput(Number(e.target.value))}
            className="w-36 accent-[var(--color-accent)]"
          />
        </div>
        <button
          onClick={applySettings}
          disabled={selectedCoins.length === 0}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {t("dp.coins.apply")}
        </button>
      </div>

      {/* DP Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="text-xs font-medium text-[var(--color-muted)] mb-4">{t("dp.coins.table.label")}</div>

        <div className="overflow-x-auto mb-5">
          <div className="flex gap-2 min-w-max">
            {dp.map((val, i) => {
              const isActive = i === current && phase === "filling";
              const isInPath = phase === "done" && solution.length > 0 && (() => {
                let x = committed.target;
                while (x > 0) {
                  if (x === i) return true;
                  x = bestFrom[x];
                }
                return false;
              })();
              const isReachable = val < INF;

              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="text-xs font-mono text-[var(--color-muted)]">{i}</div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold border-2 transition-all duration-300 ${
                      isActive
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] scale-110"
                        : isInPath
                        ? "border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)]"
                        : isReachable
                        ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                        : "border-[var(--color-border)]/40 bg-[var(--color-surface)] text-[var(--color-muted)]/40"
                    }`}
                  >
                    {isReachable ? val : "∞"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status message */}
        <div className="min-h-[2rem] mb-4">
          <p className="text-sm text-[var(--color-muted)]">{statusMsg}</p>
          {phase === "done" && solution.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[var(--color-muted)]">{t("dp.coins.solution.label")}</span>
              {solution.map((c, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full bg-[var(--color-accent-2)]/20 border border-[var(--color-accent-2)]/40 text-[var(--color-accent-2)] text-xs font-mono font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
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
