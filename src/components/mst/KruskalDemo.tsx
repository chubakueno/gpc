import { useMemo, useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { SectionCard } from "@/components/layout/SectionCard";
import { MSTGraph, makeEdges, randomWeights, DEFAULT_WEIGHTS } from "./MSTGraph";
import type { KruskalStep, WeightedEdge } from "@/types/mst";
import { useState } from "react";

// ── Union-Find (pure, no mutation of shared state) ────────────────────────────

function makeUF(n: number) {
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function unite(x: number, y: number): boolean {
    const rx = find(x), ry = find(y);
    if (rx === ry) return false;
    if (rank[rx] < rank[ry]) parent[rx] = ry;
    else if (rank[rx] > rank[ry]) parent[ry] = rx;
    else { parent[ry] = rx; rank[rx]++; }
    return true;
  }
  return { find, unite };
}

// ── Precompute Kruskal steps ──────────────────────────────────────────────────

function computeKruskalSteps(edges: WeightedEdge[], nodeCount: number): KruskalStep[] {
  const sorted = [...edges].sort((a, b) => a.weight - b.weight || a.key.localeCompare(b.key));
  const steps: KruskalStep[] = [];

  // Initial step: show sorted edges, nothing processed yet
  steps.push({
    sortedEdges: sorted,
    considerIdx: -1,
    mstEdgeKeys: [],
    rejectedEdgeKeys: [],
    decision: "none",
    mstWeight: 0,
    done: false,
  });

  const uf = makeUF(nodeCount);
  const mstEdgeKeys: string[] = [];
  const rejectedEdgeKeys: string[] = [];
  let mstWeight = 0;

  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i];
    const accepted = uf.unite(e.u, e.v);
    if (accepted) {
      mstEdgeKeys.push(e.key);
      mstWeight += e.weight;
    } else {
      rejectedEdgeKeys.push(e.key);
    }
    const done = mstEdgeKeys.length === nodeCount - 1;
    steps.push({
      sortedEdges: sorted,
      considerIdx: i,
      mstEdgeKeys: [...mstEdgeKeys],
      rejectedEdgeKeys: [...rejectedEdgeKeys],
      decision: accepted ? "accept" : "reject",
      mstWeight,
      done,
    });
    if (done) break;
  }

  return steps;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function KruskalDemo() {
  const { t } = useLang();
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS);

  const edges = useMemo(() => makeEdges(weights), [weights]);
  const steps = useMemo(() => computeKruskalSteps(edges, 7), [edges]);

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<KruskalStep>(steps, { intervalMs: 1100 });

  // Reset when weights change
  useEffect(() => { reset(); }, [weights]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!frame) return null;

  const mstSet = new Set(frame.mstEdgeKeys);
  const rejectedSet = new Set(frame.rejectedEdgeKeys);
  const consideringKey = frame.considerIdx >= 0 ? frame.sortedEdges[frame.considerIdx].key : null;

  // Step description
  let stepDesc = t("mst.kruskal.step.initial");
  if (frame.done) {
    stepDesc = t("mst.kruskal.step.done", {
      k: frame.mstEdgeKeys.length,
      w: frame.mstWeight,
    });
  } else if (frame.considerIdx >= 0) {
    const e = frame.sortedEdges[frame.considerIdx];
    stepDesc = frame.decision === "accept"
      ? t("mst.kruskal.step.accept", { u: e.u, v: e.v, w: e.weight })
      : t("mst.kruskal.step.reject", { u: e.u, v: e.v, w: e.weight });
  }

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("mst.kruskal.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("mst.kruskal.desc")}</p>

      {/* Randomize button */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setWeights(randomWeights())}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
        >
          {t("mst.graph.randomize")}
        </button>
      </div>

      {/* Main layout: graph + sorted edge list */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* SVG Graph */}
        <div className="flex-1 min-w-0">
          <MSTGraph
            edges={edges}
            mstEdgeKeys={mstSet}
            rejectedEdgeKeys={rejectedSet}
            consideringEdgeKey={consideringKey}
          />
        </div>

        {/* Sorted edge list */}
        <div className="lg:w-56 flex-shrink-0">
          <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">
            {t("mst.kruskal.sorted.title")}
          </p>
          <div className="space-y-1">
            {frame.sortedEdges.map((e, i) => {
              const isCurrent = i === frame.considerIdx;
              const isAccepted = mstSet.has(e.key);
              const isRejected = rejectedSet.has(e.key);
              const isFuture = i > frame.considerIdx && frame.considerIdx >= 0;

              return (
                <div
                  key={e.key}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isCurrent
                      ? "bg-[var(--color-warn)]/15 border border-[var(--color-warn)] text-[var(--color-text)]"
                      : isAccepted
                      ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)]"
                      : isRejected
                      ? "opacity-40 bg-[var(--color-danger)]/5 border border-[var(--color-border)] text-[var(--color-danger)] line-through"
                      : isFuture
                      ? "opacity-40 border border-[var(--color-border)]/50 text-[var(--color-muted)]"
                      : "border border-[var(--color-border)]/50 text-[var(--color-muted)]"
                  }`}
                >
                  <span className="flex-1">
                    {e.u}—{e.v}
                  </span>
                  <span className="text-[10px] opacity-70">w=</span>
                  <span className="font-bold">{e.weight}</span>
                  <span className="ml-auto text-[11px]">
                    {isAccepted ? "✓" : isRejected ? "✗" : isCurrent ? "→" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step description */}
      <div
        className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
          frame.done
            ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]"
            : frame.decision === "accept"
            ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-text)]"
            : frame.decision === "reject"
            ? "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-text)]"
            : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)]"
        }`}
      >
        {stepDesc}
      </div>

      {/* MST weight tracker */}
      {frame.mstWeight > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-[var(--color-muted)] text-xs">{t("mst.mst.weight")}:</span>
          <span className="font-mono font-bold text-[var(--color-accent)]">{frame.mstWeight}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted)] mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-[var(--color-warn)]" />
          {t("mst.legend.considering")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-[var(--color-accent)]" />
          {t("mst.legend.mst")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1.5 rounded-full bg-[var(--color-danger)]" />
          {t("mst.legend.rejected")}
        </div>
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
    </SectionCard>
  );
}
