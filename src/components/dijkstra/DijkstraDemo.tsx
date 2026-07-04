import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { SectionCard } from "@/components/layout/SectionCard";
import { DijkstraGraph, GRAPH_NODES, makeEdges, randomWeights, DEFAULT_WEIGHTS } from "./DijkstraGraph";
import type { DijkstraStep, DijkstraPQEntry, DijkstraRelaxedEdge, DirectedWeightedEdge } from "@/types/dijkstra";

interface AdjEntry { to: number; weight: number; edgeKey: string; }

function buildAdj(edges: DirectedWeightedEdge[], nodeCount: number): AdjEntry[][] {
  const adj: AdjEntry[][] = Array.from({ length: nodeCount }, () => []);
  for (const e of edges) adj[e.from].push({ to: e.to, weight: e.weight, edgeKey: e.key });
  return adj;
}

function sortedPQ(arr: DijkstraPQEntry[]): DijkstraPQEntry[] {
  return [...arr].sort((a, b) => a.dist - b.dist || a.node - b.node);
}

function computeDijkstraSteps(
  edges: DirectedWeightedEdge[],
  nodeCount: number,
  source: number
): DijkstraStep[] {
  const adj = buildAdj(edges, nodeCount);
  const dist = Array(nodeCount).fill(Infinity);
  const settled = Array(nodeCount).fill(false);
  const parentEdgeKey: (string | null)[] = Array(nodeCount).fill(null);
  dist[source] = 0;
  let pq: DijkstraPQEntry[] = [{ node: source, dist: 0 }];

  const steps: DijkstraStep[] = [
    {
      dist: [...dist],
      settled: [...settled],
      parentEdgeKey: [...parentEdgeKey],
      pq: sortedPQ(pq),
      currentNode: null,
      poppedStale: [],
      relaxed: [],
      done: false,
    },
  ];

  while (pq.length > 0) {
    const sorted = sortedPQ(pq);
    let idx = 0;
    const poppedStale: DijkstraPQEntry[] = [];
    while (idx < sorted.length && settled[sorted[idx].node]) {
      poppedStale.push(sorted[idx]);
      idx++;
    }
    if (idx >= sorted.length) break;

    const top = sorted[idx];
    pq = sorted.slice(idx + 1);
    const u = top.node;
    settled[u] = true;

    const relaxed: DijkstraRelaxedEdge[] = [];
    for (const { to, weight, edgeKey } of adj[u]) {
      const nd = dist[u] + weight;
      const improved = nd < dist[to];
      if (improved) {
        dist[to] = nd;
        parentEdgeKey[to] = edgeKey;
        pq.push({ node: to, dist: nd });
      }
      relaxed.push({ edgeKey, from: u, to, improved, newDist: dist[to] });
    }

    steps.push({
      dist: [...dist],
      settled: [...settled],
      parentEdgeKey: [...parentEdgeKey],
      pq: sortedPQ(pq),
      currentNode: u,
      poppedStale,
      relaxed,
      done: pq.length === 0,
    });
  }

  return steps;
}

export function DijkstraDemo() {
  const { t } = useLang();
  const [weights, setWeights] = useState<number[]>(DEFAULT_WEIGHTS);
  const [source, setSource] = useState(0);

  const edges = useMemo(() => makeEdges(weights), [weights]);
  const steps = useMemo(
    () => computeDijkstraSteps(edges, GRAPH_NODES.length, source),
    [edges, source]
  );

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<DijkstraStep>(steps, { intervalMs: 1100 });

  useEffect(() => { reset(); }, [weights, source]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!frame) return null;

  const treeEdgeKeys = new Set(frame.parentEdgeKey.filter((k): k is string => k !== null));
  const relaxingEdgeKeys = new Set(frame.relaxed.map((r) => r.edgeKey));

  let statusMsg: string;
  if (frame.currentNode === null) {
    statusMsg = t("dijkstra.demo.step.initial", { source });
  } else if (frame.done) {
    statusMsg = t("dijkstra.demo.step.done", { u: frame.currentNode, d: frame.dist[frame.currentNode] });
  } else {
    statusMsg = t("dijkstra.demo.step.settle", { u: frame.currentNode, d: frame.dist[frame.currentNode] });
  }

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("dijkstra.demo.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("dijkstra.demo.desc")}</p>

      {/* Controls: randomize + source node */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setWeights(randomWeights())}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
        >
          {t("dijkstra.graph.randomize")}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-muted)]">{t("dijkstra.demo.source.label")}:</span>
          {GRAPH_NODES.map((n) => (
            <button
              key={n.id}
              onClick={() => setSource(n.id)}
              className={`w-7 h-7 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                source === n.id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]"
              }`}
            >
              {n.id}
            </button>
          ))}
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
        className="mb-6"
      />

      {/* Main layout: graph + distance table */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex-1 min-w-0">
          <DijkstraGraph
            edges={edges}
            dist={frame.dist}
            settled={frame.settled}
            currentNode={frame.currentNode}
            treeEdgeKeys={treeEdgeKeys}
            relaxingEdgeKeys={relaxingEdgeKeys}
            sourceNode={source}
          />
        </div>

        <div className="lg:w-56 flex-shrink-0">
          <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">
            {t("dijkstra.demo.dist.label")}
          </p>
          <div className="space-y-1 mb-4">
            {GRAPH_NODES.map((n) => {
              const isCurrent = n.id === frame.currentNode;
              const isSettled = frame.settled[n.id];
              const isFrontier = !isSettled && frame.dist[n.id] !== Infinity;
              return (
                <div
                  key={n.id}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isCurrent
                      ? "bg-[var(--color-warn)]/15 border border-[var(--color-warn)] text-[var(--color-text)]"
                      : isSettled
                      ? "bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-text)]"
                      : isFrontier
                      ? "bg-[var(--color-accent-2)]/10 border border-[var(--color-accent-2)]/30 text-[var(--color-text)]"
                      : "border border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  <span className="flex-1">{n.id}</span>
                  <span className="font-bold">
                    {frame.dist[n.id] === Infinity ? "∞" : frame.dist[n.id]}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[var(--color-muted)] mb-2 font-medium">
            {t("dijkstra.demo.heap.label")}
          </p>
          {frame.pq.length === 0 ? (
            <p className="text-xs text-[var(--color-muted)] italic">∅</p>
          ) : (
            <p className="text-xs font-mono text-[var(--color-muted)] leading-relaxed break-words">
              {frame.pq.map((e) => `(${e.node},${e.dist})`).join(" ")}
            </p>
          )}
        </div>
      </div>

      {/* Step description */}
      <div
        className={`mb-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
          frame.currentNode !== null
            ? "bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 text-[var(--color-text)]"
            : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)]"
        }`}
      >
        {statusMsg}
      </div>

      {frame.poppedStale.length > 0 && (
        <p className="text-xs text-[var(--color-muted)] mb-2 italic">
          {t("dijkstra.demo.step.stale", { n: frame.poppedStale.length })}
        </p>
      )}

      {frame.relaxed.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {frame.relaxed.map((r) => (
            <span
              key={r.edgeKey}
              className={`text-xs font-mono px-2 py-1 rounded-lg border ${
                r.improved
                  ? "border-[var(--color-accent)]/40 text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : "border-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              {r.from}→{r.to}: {r.improved ? r.newDist : t("dijkstra.demo.relax.nochange")}
            </span>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-warn)]" />
          {t("dijkstra.legend.current")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
          {t("dijkstra.legend.settled")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-accent-2)]" />
          {t("dijkstra.legend.frontier")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]" />
          {t("dijkstra.legend.unreached")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[var(--color-accent)]" />
          {t("dijkstra.legend.tree")}
        </div>
      </div>
    </SectionCard>
  );
}
