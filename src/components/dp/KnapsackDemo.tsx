import { useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";

interface Item {
  name: string;
  w: number;
  v: number;
}

const DEFAULT_ITEMS: Item[] = [
  { name: "A", w: 1, v: 2 },
  { name: "B", w: 3, v: 5 },
  { name: "C", w: 4, v: 7 },
];
const DEFAULT_CAP = 5;

interface KSStep {
  dp: number[][];
  row: number;
  col: number;
  phase: "init" | "filling" | "done";
  selected: number[];
}

function computeKSSteps(items: Item[], capacity: number): KSStep[] {
  const n = items.length;
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));
  const steps: KSStep[] = [];

  steps.push({ dp: dp.map((r) => [...r]), row: -1, col: -1, phase: "init", selected: [] });

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (items[i - 1].w <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - items[i - 1].w] + items[i - 1].v);
      }
      steps.push({ dp: dp.map((r) => [...r]), row: i, col: w, phase: "filling", selected: [] });
    }
  }

  const selected: number[] = [];
  let w = capacity;
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(i - 1);
      w -= items[i - 1].w;
    }
  }
  steps.push({ dp: dp.map((r) => [...r]), row: -1, col: -1, phase: "done", selected });

  return steps;
}

export function KnapsackDemo() {
  const { t } = useLang();
  const [items] = useState<Item[]>(DEFAULT_ITEMS);
  const [capInput, setCapInput] = useState(DEFAULT_CAP);
  const [committed, setCommitted] = useState({ items: DEFAULT_ITEMS, capacity: DEFAULT_CAP });

  const steps = useMemo(
    () => computeKSSteps(committed.items, committed.capacity),
    [committed]
  );

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep(steps, { intervalMs: 500 });

  function applySettings() {
    setCommitted({ items: [...items], capacity: capInput });
  }

  const { dp, row, col, phase, selected } = frame;
  const n = committed.items.length;
  const capacity = committed.capacity;

  let statusMsg = "";
  if (phase === "init") {
    statusMsg = t("dp.knapsack.phase.init");
  } else if (phase === "filling") {
    statusMsg = t("dp.knapsack.phase.filling", { i: row, w: col, v: dp[row][col] });
  } else {
    const selNames = selected.map((i) => committed.items[i].name).reverse().join(", ");
    statusMsg = t("dp.knapsack.phase.done", { v: dp[n][capacity], items: selNames });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("dp.knapsack.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("dp.knapsack.desc")}</p>
        <div className="inline-block rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-xs font-mono text-[var(--color-accent-2)]">
          {t("dp.knapsack.recurrence")}
        </div>
      </div>

      {/* Items table + capacity control */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-wrap gap-6 items-start">
        <div>
          <div className="text-xs font-medium text-[var(--color-muted)] mb-2">{t("dp.knapsack.items.label")}</div>
          <table className="text-sm border-collapse">
            <thead>
              <tr className="text-xs text-[var(--color-muted)]">
                <th className="pr-4 pb-1 text-left font-medium">{t("dp.knapsack.col.item")}</th>
                <th className="pr-4 pb-1 text-left font-medium">{t("dp.knapsack.col.w")}</th>
                <th className="pb-1 text-left font-medium">{t("dp.knapsack.col.v")}</th>
              </tr>
            </thead>
            <tbody>
              {committed.items.map((item, idx) => {
                const isSelected = phase === "done" && selected.includes(idx);
                return (
                  <tr key={idx} className={isSelected ? "text-[var(--color-accent-2)]" : "text-[var(--color-text)]"}>
                    <td className="pr-4 py-0.5 font-mono font-semibold">{item.name}</td>
                    <td className="pr-4 py-0.5 font-mono">{item.w}</td>
                    <td className="py-0.5 font-mono">{item.v}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <div className="text-xs font-medium text-[var(--color-muted)] mb-2">
            {t("dp.knapsack.cap.label")}: <span className="text-[var(--color-text)]">{capInput}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={capInput}
            onChange={(e) => setCapInput(Number(e.target.value))}
            className="w-36 accent-[var(--color-accent)]"
          />
        </div>
        <button
          onClick={applySettings}
          className="self-end px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
        >
          {t("dp.knapsack.apply")}
        </button>
      </div>

      {/* DP 2D Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="text-xs font-medium text-[var(--color-muted)] mb-4">{t("dp.knapsack.table.label")}</div>

        <div className="overflow-x-auto mb-5">
          <table className="border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className="pr-3 pb-2 text-right text-[var(--color-muted)] font-normal w-16"></th>
                {Array.from({ length: capacity + 1 }, (_, w) => (
                  <th
                    key={w}
                    className={`w-9 h-7 text-center font-normal pb-2 ${
                      col === w && phase === "filling"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    w={w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: n + 1 }, (_, i) => (
                <tr key={i}>
                  <td
                    className={`pr-3 text-right text-[var(--color-muted)] font-normal py-0.5 ${
                      row === i && phase === "filling" ? "text-[var(--color-accent)]" : ""
                    }`}
                  >
                    {i === 0 ? t("dp.knapsack.row.none") : `${t("dp.knapsack.col.item")} ${committed.items[i - 1].name}`}
                  </td>
                  {Array.from({ length: capacity + 1 }, (_, w) => {
                    const isActive = i === row && w === col && phase === "filling";
                    const isSelected =
                      phase === "done" &&
                      i > 0 &&
                      selected.includes(i - 1) &&
                      dp[i][w] !== dp[i - 1][w];
                    const isFilled = phase === "done" || (i < row) || (i === row && w <= col);

                    return (
                      <td key={w} className="py-0.5 px-0.5">
                        <div
                          className={`w-9 h-8 rounded flex items-center justify-center font-semibold border transition-all duration-200 ${
                            isActive
                              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] scale-110"
                              : isSelected
                              ? "border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)]"
                              : isFilled
                              ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                              : "border-[var(--color-border)]/30 text-[var(--color-muted)]/30"
                          }`}
                        >
                          {isFilled ? dp[i][w] : "·"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status */}
        <div className="min-h-[2rem] mb-4">
          <p className="text-sm text-[var(--color-muted)]">{statusMsg}</p>
          {phase === "done" && (
            <div className="mt-2 flex flex-wrap gap-3 items-center">
              <span className="text-xs text-[var(--color-muted)]">{t("dp.knapsack.maxval.label")}</span>
              <span className="font-mono font-bold text-[var(--color-accent)]">{dp[n][capacity]}</span>
              <span className="text-xs text-[var(--color-muted)]">{t("dp.knapsack.selected.label")}</span>
              {selected.length === 0 ? (
                <span className="text-xs text-[var(--color-muted)]">∅</span>
              ) : (
                [...selected].reverse().map((idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-[var(--color-accent-2)]/20 border border-[var(--color-accent-2)]/40 text-[var(--color-accent-2)] text-xs font-mono font-semibold"
                  >
                    {committed.items[idx].name} (w={committed.items[idx].w}, v={committed.items[idx].v})
                  </span>
                ))
              )}
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
