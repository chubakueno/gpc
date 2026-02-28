import { useMemo, useState, useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { SectionCard } from "@/components/layout/SectionCard";
import { MSTGraph, GRAPH_NODES, makeEdges, randomWeights, DEFAULT_WEIGHTS } from "./MSTGraph";
import type { PrimStep, PrimPQEntry, WeightedEdge } from "@/types/mst";

// ── Build adjacency list ──────────────────────────────────────────────────────

interface AdjEntry { neighbor: number; weight: number; edgeKey: string; }

function buildAdj(edges: WeightedEdge[], nodeCount: number): AdjEntry[][] {
  const adj: AdjEntry[][] = Array.from({ length: nodeCount }, () => []);
  for (const e of edges) {
    adj[e.u].push({ neighbor: e.v, weight: e.weight, edgeKey: e.key });
    adj[e.v].push({ neighbor: e.u, weight: e.weight, edgeKey: e.key });
  }
  return adj;
}

// ── Precompute Prim steps ─────────────────────────────────────────────────────

function computePrimSteps(edges: WeightedEdge[], nodeCount: number, startNode: number): PrimStep[] {
  const adj = buildAdj(edges, nodeCount);
  const inMST = new Array<boolean>(nodeCount).fill(false);
  inMST[startNode] = true;

  const mstEdgeKeys: string[] = [];
  let mstWeight = 0;
  const steps: PrimStep[] = [];

  function validPQ(): PrimPQEntry[] {
    const candidates: PrimPQEntry[] = [];
    const seen = new Set<string>();
    for (let n = 0; n < nodeCount; n++) {
      if (!inMST[n]) continue;
      for (const { neighbor, weight, edgeKey } of adj[n]) {
        if (!inMST[neighbor] && !seen.has(edgeKey)) {
          seen.add(edgeKey);
          candidates.push({ from: n, to: neighbor, weight, edgeKey });
        }
      }
    }
    return candidates.sort((a, b) => a.weight - b.weight || a.edgeKey.localeCompare(b.edgeKey));
  }

  // Initial step
  steps.push({
    inMST: [...inMST],
    mstEdgeKeys: [],
    currentEdgeKey: null,
    currentNode: startNode,
    pqEntries: validPQ(),
    mstWeight: 0,
    done: false,
  });

  while (mstEdgeKeys.length < nodeCount - 1) {
    const pq = validPQ();
    if (pq.length === 0) break;

    const chosen = pq[0];
    inMST[chosen.to] = true;
    mstEdgeKeys.push(chosen.edgeKey);
    mstWeight += chosen.weight;
    const done = mstEdgeKeys.length === nodeCount - 1;

    steps.push({
      inMST: [...inMST],
      mstEdgeKeys: [...mstEdgeKeys],
      currentEdgeKey: chosen.edgeKey,
      currentNode: chosen.to,
      pqEntries: done ? [] : validPQ(),
      mstWeight,
      done,
    });

    if (done) break;
  }

  return steps;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PrimDemo() {
  const { t } = useLang();
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS);
  const [startNode, setStartNode] = useState(0);

  const edges = useMemo(() => makeEdges(weights), [weights]);
  const steps = useMemo(
    () => computePrimSteps(edges, GRAPH_NODES.length, startNode),
    [edges, startNode]
  );

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<PrimStep>(steps, { intervalMs: 1100 });

  useEffect(() => { reset(); }, [weights, startNode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!frame) return null;

  const mstSet = new Set(frame.mstEdgeKeys);
  const currentEdge = frame.currentEdgeKey
    ? edges.find((e) => e.key === frame.currentEdgeKey) ?? null
    : null;

  // Step description
  let stepDesc: string;
  if (frame.done) {
    stepDesc = t("mst.prim.step.done", { n: GRAPH_NODES.length, w: frame.mstWeight });
  } else if (currentEdge) {
    stepDesc = t("mst.prim.step.add", {
      u: currentEdge.u,
      v: currentEdge.v,
      w: currentEdge.weight,
    });
  } else {
    stepDesc = t("mst.prim.step.initial", { v: startNode });
  }

  // For currently-considering edge in the graph: the top PQ entry
  const topPQEdgeKey = frame.pqEntries[0]?.edgeKey ?? null;

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("mst.prim.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("mst.prim.desc")}</p>

      {/* Controls: randomize + start node */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setWeights(randomWeights())}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
        >
          {t("mst.graph.randomize")}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">{t("mst.prim.start.label")}:</span>
          {GRAPH_NODES.map((n) => (
            <button
              key={n.id}
              onClick={() => setStartNode(n.id)}
              className={`w-7 h-7 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                startNode === n.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]"
              }`}
            >
              {n.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main layout: graph + PQ */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* SVG Graph */}
        <div className="flex-1 min-w-0">
          <MSTGraph
            edges={edges}
            mstEdgeKeys={mstSet}
            consideringEdgeKey={!frame.done ? topPQEdgeKey : null}
            inMSTNodes={frame.inMST}
            activeNode={frame.currentNode}
          />
        </div>

        {/* Priority Queue */}
        <div className="lg:w-56 flex-shrink-0">
          <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">
            {t("mst.prim.pq.title")}
          </p>
          {frame.pqEntries.length === 0 ? (
            <p className="text-xs text-[var(--color-muted)] italic">{t("mst.prim.pq.empty")}</p>
          ) : (
            <div className="space-y-1">
              {frame.pqEntries.map((entry, i) => (
                <div
                  key={`${entry.edgeKey}-${i}`}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    i === 0
                      ? "bg-[var(--color-warn)]/15 border border-[var(--color-warn)] text-[var(--color-text)]"
                      : "border border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  <span className="flex-1">
                    {entry.from}→{entry.to}
                  </span>
                  <span className="text-[10px] opacity-70">w=</span>
                  <span className="font-bold">{entry.weight}</span>
                  {i === 0 && <span className="ml-auto text-[11px]">→</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Step description */}
      <div
        className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
          frame.done
            ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-accent)]"
            : currentEdge
            ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-text)]"
            : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)]"
        }`}
      >
        {stepDesc}
      </div>

      {/* MST weight */}
      {frame.mstWeight > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-[var(--color-muted)] text-xs">{t("mst.mst.weight")}:</span>
          <span className="font-mono font-bold text-[var(--color-accent)]">{frame.mstWeight}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted)] mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-warn)]" />
          {t("mst.legend.considering")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
          {t("mst.legend.mst")}
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
