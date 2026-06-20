import { useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";

const DEFAULT_A = "ABCBD";
const DEFAULT_B = "ADBC";

type Arrow = "D" | "U" | "L" | "";

interface LCSStep {
  dp: number[][];
  arrows: Arrow[][];
  row: number;
  col: number;
  isMatch: boolean;
  phase: "init" | "filling" | "done";
  lcsPath: Set<string>;
  lcsString: string;
}

function computeLCSSteps(a: string, b: string): LCSStep[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  const arrows: Arrow[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill("" as Arrow));
  const steps: LCSStep[] = [];

  steps.push({
    dp: dp.map((r) => [...r]),
    arrows: arrows.map((r) => [...r]),
    row: -1, col: -1, isMatch: false,
    phase: "init", lcsPath: new Set(), lcsString: "",
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const isMatch = a[i - 1] === b[j - 1];
      if (isMatch) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        arrows[i][j] = "D";
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        dp[i][j] = dp[i - 1][j];
        arrows[i][j] = "U";
      } else {
        dp[i][j] = dp[i][j - 1];
        arrows[i][j] = "L";
      }
      steps.push({
        dp: dp.map((r) => [...r]),
        arrows: arrows.map((r) => [...r]),
        row: i, col: j, isMatch,
        phase: "filling", lcsPath: new Set(), lcsString: "",
      });
    }
  }

  // Reconstruct
  const lcsPath = new Set<string>();
  let lcsStr = "";
  let pi = m, pj = n;
  while (pi > 0 && pj > 0) {
    if (arrows[pi][pj] === "D") {
      lcsPath.add(`${pi},${pj}`);
      lcsStr = a[pi - 1] + lcsStr;
      pi--; pj--;
    } else if (arrows[pi][pj] === "U") {
      pi--;
    } else {
      pj--;
    }
  }

  steps.push({
    dp: dp.map((r) => [...r]),
    arrows: arrows.map((r) => [...r]),
    row: -1, col: -1, isMatch: false,
    phase: "done", lcsPath, lcsString: lcsStr,
  });

  return steps;
}

export function LCSDemo() {
  const { t } = useLang();
  const [inputA, setInputA] = useState(DEFAULT_A);
  const [inputB, setInputB] = useState(DEFAULT_B);
  const [committed, setCommitted] = useState({ a: DEFAULT_A, b: DEFAULT_B });
  const [error, setError] = useState("");

  const steps = useMemo(() => computeLCSSteps(committed.a, committed.b), [committed]);

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep(steps, { intervalMs: 500 });

  function applySettings() {
    const ua = inputA.toUpperCase().replace(/[^A-Z]/g, "");
    const ub = inputB.toUpperCase().replace(/[^A-Z]/g, "");
    if (!ua || !ub) { setError(t("dp.lcs.err.empty")); return; }
    if (ua.length > 8 || ub.length > 8) { setError(t("dp.lcs.err.long")); return; }
    setError("");
    setInputA(ua);
    setInputB(ub);
    setCommitted({ a: ua, b: ub });
  }

  const { dp, arrows, row, col, isMatch, phase, lcsPath, lcsString } = frame;
  const m = committed.a.length;
  const n = committed.b.length;

  let statusMsg = "";
  if (phase === "init") {
    statusMsg = t("dp.lcs.phase.init");
  } else if (phase === "filling") {
    if (isMatch) {
      statusMsg = t("dp.lcs.phase.match", {
        i: row, j: col, c: committed.a[row - 1],
        pi: row - 1, pj: col - 1, v: dp[row][col],
      });
    } else {
      statusMsg = t("dp.lcs.phase.nomatch", {
        i: row, j: col,
        u: dp[row - 1][col], l: dp[row][col - 1], v: dp[row][col],
      });
    }
  } else {
    statusMsg = t("dp.lcs.phase.done", { lcs: lcsString, n: lcsString.length });
  }

  const arrowChar: Record<Arrow, string> = { D: "↖", U: "↑", L: "←", "": "" };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("dp.lcs.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("dp.lcs.desc")}</p>
        <div className="flex flex-wrap gap-2">
          <div className="inline-block rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-xs font-mono text-[var(--color-accent-2)]">
            {t("dp.lcs.recurrence.match")}
          </div>
          <div className="inline-block rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2 text-xs font-mono text-[var(--color-muted)]">
            {t("dp.lcs.recurrence.no")}
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-[var(--color-muted)] block mb-1">{t("dp.lcs.seq1.label")}</label>
          <input
            className="w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-sm font-mono text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] uppercase"
            value={inputA}
            maxLength={8}
            onChange={(e) => setInputA(e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--color-muted)] block mb-1">{t("dp.lcs.seq2.label")}</label>
          <input
            className="w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-sm font-mono text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] uppercase"
            value={inputB}
            maxLength={8}
            onChange={(e) => setInputB(e.target.value.toUpperCase())}
          />
        </div>
        <button
          onClick={applySettings}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
        >
          {t("dp.lcs.apply")}
        </button>
        {error && <p className="text-xs text-red-400 self-center">{error}</p>}
      </div>

      {/* 2D Table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="text-xs font-medium text-[var(--color-muted)] mb-4">{t("dp.lcs.table.label")}</div>

        <div className="overflow-x-auto mb-5">
          <table className="border-collapse text-xs font-mono">
            <thead>
              <tr>
                <th className="w-10 h-8"></th>
                <th className="w-10 h-8 text-center text-[var(--color-muted)] font-normal">ε</th>
                {committed.b.split("").map((ch, j) => (
                  <th
                    key={j}
                    className={`w-10 h-8 text-center font-semibold ${
                      col === j + 1 && phase === "filling" ? "text-[var(--color-accent)]" : "text-[var(--color-accent-3)]"
                    }`}
                  >
                    {ch}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: m + 1 }, (_, i) => (
                <tr key={i}>
                  <td
                    className={`w-10 h-10 text-center font-semibold ${
                      i === 0
                        ? "text-[var(--color-muted)]"
                        : row === i && phase === "filling"
                        ? "text-[var(--color-accent)]"
                        : "text-[var(--color-accent-2)]"
                    }`}
                  >
                    {i === 0 ? "ε" : committed.a[i - 1]}
                  </td>
                  {Array.from({ length: n + 1 }, (_, j) => {
                    const isActive = i === row && j === col && phase === "filling";
                    const inPath = lcsPath.has(`${i},${j}`);
                    const isFilled =
                      i === 0 || j === 0 ||
                      phase === "done" ||
                      i < row ||
                      (i === row && j <= col);

                    return (
                      <td key={j} className="p-0.5">
                        <div
                          className={`w-10 h-10 rounded flex flex-col items-center justify-center border transition-all duration-200 ${
                            isActive
                              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)] scale-110"
                              : inPath
                              ? "border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)]"
                              : isFilled
                              ? "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
                              : "border-[var(--color-border)]/20 text-[var(--color-muted)]/20"
                          }`}
                        >
                          <span className="font-bold text-sm leading-none">{isFilled ? dp[i][j] : "·"}</span>
                          {isFilled && arrows[i][j] && (
                            <span className="text-[0.6rem] leading-none opacity-60">
                              {arrowChar[arrows[i][j]]}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border border-[var(--color-accent)] bg-[var(--color-accent)]/20 inline-block" />
            {t("dp.lcs.legend.current")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/20 inline-block" />
            {t("dp.lcs.legend.path")}
          </span>
          <span>{t("dp.lcs.legend.match")}</span>
          <span>{t("dp.lcs.legend.up")}</span>
          <span>{t("dp.lcs.legend.left")}</span>
        </div>

        {/* Status */}
        <div className="min-h-[2rem] mb-4">
          <p className="text-sm text-[var(--color-muted)]">{statusMsg}</p>
          {phase === "done" && lcsString && (
            <div className="mt-2 flex flex-wrap gap-3 items-center">
              <span className="text-xs text-[var(--color-muted)]">{t("dp.lcs.result.label")}</span>
              <span className="font-mono font-bold text-[var(--color-accent-2)] text-base">{lcsString}</span>
              <span className="text-xs text-[var(--color-muted)]">{t("dp.lcs.length.label")}</span>
              <span className="font-mono font-bold text-[var(--color-accent)]">{lcsString.length}</span>
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
