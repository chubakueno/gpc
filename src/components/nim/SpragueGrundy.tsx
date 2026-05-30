import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

// ── Mex visualizer ────────────────────────────────────────────────────────────

const MEX_RANGE = 10;

function computeMex(inSet: boolean[]): number {
  for (let i = 0; i < inSet.length; i++) {
    if (!inSet[i]) return i;
  }
  return inSet.length;
}

function MexVisualizer() {
  const { t } = useLang();
  const [inSet, setInSet] = useState<boolean[]>(() =>
    Array.from({ length: MEX_RANGE }, (_, i) => i <= 2)
  );

  const mex = computeMex(inSet);

  function toggle(i: number) {
    setInSet((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
          {t("nim.grundy.mex.title")}
        </h3>
        <p className="text-sm text-[var(--color-muted)]">{t("nim.grundy.mex.desc")}</p>
      </div>

      <p className="text-xs text-[var(--color-muted)]">{t("nim.grundy.mex.toggle")}</p>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: MEX_RANGE }, (_, i) => {
          const isMex = i === mex;
          const isIn = inSet[i];
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={`w-10 h-10 rounded-full font-mono text-sm font-bold border-2 transition-all cursor-pointer
                ${isMex
                  ? "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/20 text-[var(--color-accent-3)] ring-2 ring-[var(--color-accent-3)]/30"
                  : isIn
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]"
                }`}
            >
              {i}
            </button>
          );
        })}
        {/* Show mex if it's beyond the range */}
        {mex >= MEX_RANGE && (
          <div className="w-10 h-10 rounded-full font-mono text-sm font-bold border-2 border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/20 text-[var(--color-accent-3)] flex items-center justify-center ring-2 ring-[var(--color-accent-3)]/30">
            {mex}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--color-muted)]">{t("nim.grundy.mex.result")}</span>
        <span className="text-2xl font-bold font-mono text-[var(--color-accent-3)]">{mex}</span>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/20 inline-block" />
          In S
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface-2)] inline-block" />
          Not in S
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/20 inline-block" />
          mex(S)
        </span>
      </div>
    </div>
  );
}

// ── Grundy computation ────────────────────────────────────────────────────────

function computeGrundy(moves: number[], maxN: number): number[] {
  const g = new Array<number>(maxN + 1).fill(0);
  for (let n = 1; n <= maxN; n++) {
    const reachable = new Set<number>();
    for (const m of moves) {
      if (n - m >= 0) reachable.add(g[n - m]);
    }
    let mex = 0;
    while (reachable.has(mex)) mex++;
    g[n] = mex;
  }
  return g;
}

function detectPeriod(g: number[]): number | null {
  const half = Math.floor(g.length / 2);
  for (let p = 1; p <= half; p++) {
    let ok = true;
    for (let i = p; i < g.length; i++) {
      if (g[i] !== g[i - p]) { ok = false; break; }
    }
    if (ok) return p;
  }
  return null;
}

// Color palette for Grundy values 0-7
const GRUNDY_COLORS = [
  "bg-[var(--color-surface-3)] text-[var(--color-muted)]",
  "bg-[var(--color-accent)]/20 text-[var(--color-accent)]",
  "bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)]",
  "bg-[var(--color-accent-3)]/20 text-[var(--color-accent-3)]",
  "bg-[var(--color-warn)]/20 text-[var(--color-warn)]",
  "bg-purple-500/20 text-purple-400",
  "bg-pink-500/20 text-pink-400",
  "bg-cyan-500/20 text-cyan-400",
];

const MAX_ROWS = 20;
const AVAILABLE_MOVES = [1, 2, 3, 4, 5, 6];

function SubtractionGame() {
  const { t } = useLang();
  const [moves, setMoves] = useState<Set<number>>(new Set([1, 2, 3]));

  function toggleMove(m: number) {
    setMoves((prev) => {
      const next = new Set(prev);
      if (next.has(m)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(m);
      } else {
        next.add(m);
      }
      return next;
    });
  }

  const sortedMoves = Array.from(moves).sort((a, b) => a - b);
  const g = computeGrundy(sortedMoves, MAX_ROWS);
  const period = detectPeriod(g);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
          {t("nim.grundy.sub.title")}
        </h3>
        <p className="text-sm text-[var(--color-muted)]">{t("nim.grundy.sub.desc")}</p>
      </div>

      {/* Move toggles */}
      <div>
        <p className="text-xs text-[var(--color-muted)] mb-2">{t("nim.grundy.sub.moves.label")}</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_MOVES.map((m) => {
            const active = moves.has(m);
            return (
              <button
                key={m}
                onClick={() => toggleMove(m)}
                className={`w-9 h-9 rounded-lg font-mono text-sm font-bold border-2 transition-all cursor-pointer
                  ${active
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]"
                  }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Period badge */}
      {period !== null && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent-2)]/10 border border-[var(--color-accent-2)]/30">
          <span className="text-xs font-semibold text-[var(--color-accent-2)]">
            {t("nim.grundy.sub.period", { p: String(period) })}
          </span>
        </div>
      )}
      {period === null && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-muted)]">
            {t("nim.grundy.sub.no.period", { n: String(MAX_ROWS) })}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b border-[var(--color-border)]">
              <th className="py-2 pr-4 font-semibold text-[var(--color-muted)] w-10 text-center">
                {t("nim.grundy.sub.col.n")}
              </th>
              <th className="py-2 pr-4 font-semibold text-[var(--color-muted)]">
                {t("nim.grundy.sub.col.reach")}
              </th>
              <th className="py-2 font-semibold text-[var(--color-muted)] w-16 text-center">
                {t("nim.grundy.sub.col.g")}
              </th>
            </tr>
          </thead>
          <tbody>
            {g.map((gn, n) => {
              const reachable = new Set<number>();
              for (const m of sortedMoves) {
                if (n - m >= 0) reachable.add(g[n - m]);
              }
              const colorClass = GRUNDY_COLORS[gn % GRUNDY_COLORS.length];

              return (
                <tr
                  key={n}
                  className="border-b border-[var(--color-border)]/40 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <td className="py-1.5 pr-4 font-mono text-[var(--color-text)] text-center">{n}</td>
                  <td className="py-1.5 pr-4 font-mono text-xs text-[var(--color-muted)]">
                    {n === 0 ? (
                      <span className="italic">— (terminal)</span>
                    ) : (
                      <span>{"{ "}{Array.from(reachable).sort((a, b) => a - b).join(", ")}{" }"}</span>
                    )}
                  </td>
                  <td className="py-1 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${colorClass}`}>
                      {gn}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function SpragueGrundy() {
  const { t } = useLang();

  return (
    <div className="space-y-6">
      {/* Mex visualizer */}
      <SectionCard>
        <MexVisualizer />
      </SectionCard>

      {/* Grundy numbers definition */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("nim.grundy.def.title")}</h2>
        <div className="rounded-xl bg-[var(--color-surface-2)] p-4 font-mono text-sm space-y-1 mb-4">
          <div className="text-[var(--color-accent-2)]">{t("nim.grundy.def.1")}</div>
          <div className="text-[var(--color-text)]">{t("nim.grundy.def.2")}</div>
        </div>
        <div className="space-y-2 text-sm text-[var(--color-muted)]">
          <p>{t("nim.grundy.def.nim")}</p>
          <p>{t("nim.grundy.def.pn")}</p>
        </div>
      </SectionCard>

      {/* Theorem */}
      <SectionCard className="border-[var(--color-accent-3)]/40">
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-3">{t("nim.grundy.theorem.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">{t("nim.grundy.theorem.body")}</p>
        <div className="rounded-xl bg-[var(--color-surface-2)] p-4 mb-4 text-center">
          <MathBlock math="G(G_1 + G_2 + \cdots + G_k) = G(G_1) \oplus G(G_2) \oplus \cdots \oplus G(G_k)" />
        </div>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t("nim.grundy.theorem.corollary")}</p>
      </SectionCard>

      {/* Subtraction game table */}
      <SectionCard>
        <SubtractionGame />
      </SectionCard>
    </div>
  );
}
