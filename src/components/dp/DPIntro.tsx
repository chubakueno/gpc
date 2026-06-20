import { useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";

interface FibStep {
  dp: (number | null)[];
  current: number;
}

function computeFibSteps(n: number): FibStep[] {
  const dp: (number | null)[] = Array(n + 1).fill(null);
  const steps: FibStep[] = [];
  dp[0] = 0;
  steps.push({ dp: [...dp], current: 0 });
  if (n >= 1) {
    dp[1] = 1;
    steps.push({ dp: [...dp], current: 1 });
  }
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1]! + dp[i - 2]!;
    steps.push({ dp: [...dp], current: i });
  }
  return steps;
}

function countNaiveCalls(n: number): number {
  if (n <= 1) return 1;
  return 1 + countNaiveCalls(n - 1) + countNaiveCalls(n - 2);
}

const FIB_N = 9;

export function DPIntro() {
  const { t } = useLang();
  const steps = useMemo(() => computeFibSteps(FIB_N), []);
  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep(steps, { intervalMs: 700 });

  const naiveCalls = useMemo(() => countNaiveCalls(10), []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("dp.intro.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.desc")}</p>
      </div>

      {/* Four concept cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)] p-4">
          <h3 className="text-sm font-semibold text-[var(--color-accent)] mb-1.5">
            {t("dp.intro.concepts.overlap.title")}
          </h3>
          <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.concepts.overlap.body")}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-accent-2)]/30 bg-[var(--color-surface)] p-4">
          <h3 className="text-sm font-semibold text-[var(--color-accent-2)] mb-1.5">
            {t("dp.intro.concepts.optimal.title")}
          </h3>
          <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.concepts.optimal.body")}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-accent-3)]/30 bg-[var(--color-surface)] p-4">
          <h3 className="text-sm font-semibold text-[var(--color-accent-3)] mb-1.5">
            {t("dp.intro.concepts.memo.title")}
          </h3>
          <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.concepts.memo.body")}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-warn)]/30 bg-[var(--color-surface)] p-4">
          <h3 className="text-sm font-semibold text-[var(--color-warn)] mb-1.5">
            {t("dp.intro.concepts.tab.title")}
          </h3>
          <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.concepts.tab.body")}</p>
        </div>
      </div>

      {/* Bottom-up Fibonacci animation */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
          {t("dp.intro.table.title")}
        </h3>
        <p className="text-sm text-[var(--color-muted)] mb-5">{t("dp.intro.table.desc")}</p>

        <div className="overflow-x-auto mb-4">
          <div className="flex gap-2 min-w-max">
            {frame.dp.map((val, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="text-xs text-[var(--color-muted)] font-mono">fib({i})</div>
                <div
                  className={`w-12 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold border-2 transition-all duration-300 ${
                    i === frame.current
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] scale-110"
                      : val !== null
                      ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                      : "border-[var(--color-border)]/40 bg-[var(--color-surface)] text-[var(--color-muted)] opacity-25"
                  }`}
                >
                  {val !== null ? val : "?"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8 mb-4 flex items-center">
          {frame.current >= 2 ? (
            <p className="text-sm font-mono text-[var(--color-muted)]">
              fib({frame.current}) = fib({frame.current - 1}) + fib({frame.current - 2}) ={" "}
              {frame.dp[frame.current - 1] ?? 0} + {frame.dp[frame.current - 2] ?? 0} ={" "}
              <span className="text-[var(--color-accent)] font-bold">{frame.dp[frame.current]}</span>
            </p>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">{t("dp.intro.table.base")}</p>
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

      {/* Call count comparison */}
      <div className="rounded-xl border border-[var(--color-warn)]/30 bg-[var(--color-surface)] p-6">
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">
          {t("dp.intro.calls.title")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-[var(--color-surface-2)] p-4 border border-red-500/20">
            <div className="text-xs text-[var(--color-muted)] mb-1">Naive O(2ⁿ)</div>
            <div className="text-2xl font-bold font-mono text-red-400">{naiveCalls}</div>
            <div className="text-xs text-[var(--color-muted)] mt-1">
              {t("dp.intro.calls.naive", { n: naiveCalls })}
            </div>
          </div>
          <div className="rounded-lg bg-[var(--color-surface-2)] p-4 border border-[var(--color-accent-2)]/20">
            <div className="text-xs text-[var(--color-muted)] mb-1">Memoized O(n)</div>
            <div className="text-2xl font-bold font-mono text-[var(--color-accent-2)]">11</div>
            <div className="text-xs text-[var(--color-muted)] mt-1">
              {t("dp.intro.calls.memo", { n: 11 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
