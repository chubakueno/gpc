import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { DPStateDAG } from "./DPStateDAG";

const ROWS = 4;
const COLS = 6;
const TOTAL = ROWS * COLS;
const DEFAULT_TARGET = { i: 2, j: 3 };

type Mode = "bottomup" | "topdown";

function cellList(maxI: number, maxJ: number) {
  const list: { i: number; j: number }[] = [];
  for (let i = 0; i <= maxI; i++) {
    for (let j = 0; j <= maxJ; j++) list.push({ i, j });
  }
  return list;
}

interface AnimatedDAGProps {
  mode: Mode;
  maxI: number;
  maxJ: number;
  targetKey: string | null;
  onCellClick?: (i: number, j: number) => void;
}

function AnimatedDAG({ mode, maxI, maxJ, targetKey, onCellClick }: AnimatedDAGProps) {
  const { t } = useLang();
  const steps = useMemo(() => cellList(maxI, maxJ), [maxI, maxJ]);
  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep(steps, { intervalMs: 400 });

  const filledKeys = useMemo(() => {
    const s = new Set<string>();
    for (let idx = 0; idx <= stepIdx; idx++) s.add(`${steps[idx].i},${steps[idx].j}`);
    return s;
  }, [steps, stepIdx]);

  const inScopeKeys = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (i <= maxI && j <= maxJ) s.add(`${i},${j}`);
      }
    }
    return s;
  }, [maxI, maxJ]);

  const currentKey = `${frame.i},${frame.j}`;
  const n = steps.length;

  const status =
    mode === "bottomup"
      ? isAtEnd
        ? t("dp.fund.dag.status.done.bottomup", { total: TOTAL })
        : t("dp.fund.dag.status.bottomup", { i: frame.i, j: frame.j })
      : isAtEnd
      ? t("dp.fund.dag.status.done.topdown", { i: maxI, j: maxJ, n, total: TOTAL })
      : t("dp.fund.dag.status.topdown", { i: maxI, j: maxJ, n, total: TOTAL });

  return (
    <div>
      <div className="overflow-x-auto mb-4">
        <DPStateDAG
          rows={ROWS}
          cols={COLS}
          filledKeys={filledKeys}
          inScopeKeys={inScopeKeys}
          currentKey={currentKey}
          targetKey={targetKey}
          onCellClick={onCellClick}
        />
      </div>

      <div className="min-h-[1.5rem] mb-3">
        <p className="text-sm text-[var(--color-muted)]">{status}</p>
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
  );
}

function LegendDot({ color, dashed = false }: { color: string; dashed?: boolean }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full"
      style={
        dashed
          ? { border: `2px dashed ${color}`, background: "transparent" }
          : { background: color, border: `2px solid ${color}` }
      }
    />
  );
}

export function DAGVisualization() {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("bottomup");
  const [target, setTarget] = useState(DEFAULT_TARGET);

  const maxI = mode === "bottomup" ? ROWS - 1 : target.i;
  const maxJ = mode === "bottomup" ? COLS - 1 : target.j;
  const targetKey = mode === "topdown" ? `${target.i},${target.j}` : null;

  function handleCellClick(i: number, j: number) {
    if (i === 0 || j === 0) return;
    setTarget({ i, j });
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
        {t("dp.fund.dag.title")}
      </h3>
      <p className="text-sm text-[var(--color-muted)] mb-4">{t("dp.fund.dag.desc")}</p>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setMode("bottomup")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              mode === "bottomup"
                ? "bg-[var(--color-warn)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {t("dp.fund.dag.mode.bottomup")}
          </button>
          <button
            onClick={() => setMode("topdown")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              mode === "topdown"
                ? "bg-[var(--color-accent-2)] text-white"
                : "bg-[var(--color-surface-2)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {t("dp.fund.dag.mode.topdown")}
          </button>
        </div>

        {mode === "topdown" && (
          <p className="text-xs text-[var(--color-accent-2)] mb-3">{t("dp.fund.dag.hint.topdown")}</p>
        )}

        <AnimatedDAG
          key={`${mode}-${target.i}-${target.j}`}
          mode={mode}
          maxI={maxI}
          maxJ={maxJ}
          targetKey={targetKey}
          onCellClick={mode === "topdown" ? handleCellClick : undefined}
        />

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--color-muted)] mt-4 pt-4 border-t border-[var(--color-border)]">
          <span className="flex items-center gap-1.5">
            <LegendDot color="var(--color-accent-3)" /> {t("dp.fund.dag.legend.base")}
          </span>
          <span className="flex items-center gap-1.5">
            <LegendDot color="var(--color-surface-2)" /> {t("dp.fund.dag.legend.pending")}
          </span>
          <span className="flex items-center gap-1.5">
            <LegendDot color="var(--color-warn)" /> {t("dp.fund.dag.legend.current")}
          </span>
          <span className="flex items-center gap-1.5">
            <LegendDot color="var(--color-accent)" /> {t("dp.fund.dag.legend.computed")}
          </span>
          {mode === "topdown" && (
            <>
              <span className="flex items-center gap-1.5 opacity-50">
                <LegendDot color="var(--color-muted)" /> {t("dp.fund.dag.legend.notneeded")}
              </span>
              <span className="flex items-center gap-1.5">
                <LegendDot color="var(--color-accent-2)" dashed /> {t("dp.fund.dag.legend.target")}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
