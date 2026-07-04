import type { DijkstraNodePos, DirectedWeightedEdge } from "@/types/dijkstra";

// Fixed node positions — layered left to right (source at left, sink at right)
export const GRAPH_NODES: DijkstraNodePos[] = [
  { id: 0, x: 60,  y: 220 },
  { id: 1, x: 230, y: 90  },
  { id: 2, x: 230, y: 350 },
  { id: 3, x: 420, y: 90  },
  { id: 4, x: 420, y: 350 },
  { id: 5, x: 600, y: 220 },
];

// Fixed directed topology — chosen so relaxation improves some distances twice
export const EDGE_TOPOLOGY: [number, number][] = [
  [0, 1],
  [0, 2],
  [2, 1],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 4],
  [4, 5],
  [3, 5],
];

export const DEFAULT_WEIGHTS = [4, 1, 2, 5, 8, 4, 1, 3, 9];

export function makeEdges(weights: number[]): DirectedWeightedEdge[] {
  return EDGE_TOPOLOGY.map(([from, to], i) => ({
    from,
    to,
    weight: weights[i],
    key: `${from}-${to}`,
  }));
}

export function randomWeights(): number[] {
  return EDGE_TOPOLOGY.map(() => Math.floor(Math.random() * 9) + 1);
}

function labelPos(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: mx - (dy / len) * 13, y: my + (dx / len) * 13 };
}

function trim(x1: number, y1: number, x2: number, y2: number, rStart: number, rEnd: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x1: x1 + ux * rStart, y1: y1 + uy * rStart, x2: x2 - ux * rEnd, y2: y2 - uy * rEnd };
}

interface DijkstraGraphProps {
  edges: DirectedWeightedEdge[];
  dist: number[];
  settled: boolean[];
  currentNode?: number | null;
  treeEdgeKeys?: Set<string>;
  relaxingEdgeKeys?: Set<string>;
  sourceNode: number;
}

export function DijkstraGraph({
  edges,
  dist,
  settled,
  currentNode = null,
  treeEdgeKeys = new Set(),
  relaxingEdgeKeys = new Set(),
  sourceNode,
}: DijkstraGraphProps) {
  const nodeMap = new Map(GRAPH_NODES.map((n) => [n.id, n]));

  function edgeColor(key: string) {
    if (relaxingEdgeKeys.has(key)) return "var(--color-warn)";
    if (treeEdgeKeys.has(key)) return "var(--color-accent)";
    return "var(--color-muted)";
  }

  function edgeMarker(key: string) {
    if (relaxingEdgeKeys.has(key)) return "dijkstraArrowWarn";
    if (treeEdgeKeys.has(key)) return "dijkstraArrowAccent";
    return "dijkstraArrowMuted";
  }

  function nodeColor(id: number) {
    if (id === currentNode) return "var(--color-warn)";
    if (settled[id]) return "var(--color-accent)";
    if (dist[id] !== Infinity) return "var(--color-accent-2)";
    return "var(--color-surface-2)";
  }

  function nodeTextColor(id: number) {
    if (id === currentNode || settled[id] || dist[id] !== Infinity) return "white";
    return "var(--color-muted)";
  }

  return (
    <svg
      viewBox="0 0 660 410"
      width="100%"
      style={{ maxWidth: 660, display: "block" }}
      aria-label="Dijkstra graph visualization"
    >
      <defs>
        <marker id="dijkstraArrowMuted" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-muted)" />
        </marker>
        <marker id="dijkstraArrowAccent" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-accent)" />
        </marker>
        <marker id="dijkstraArrowWarn" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-warn)" />
        </marker>
      </defs>

      {/* Edges */}
      {edges.map((e) => {
        const u = nodeMap.get(e.from)!;
        const v = nodeMap.get(e.to)!;
        const lp = labelPos(u.x, u.y, v.x, v.y);
        const color = edgeColor(e.key);
        const isHot = relaxingEdgeKeys.has(e.key) || treeEdgeKeys.has(e.key);
        const line = trim(u.x, u.y, v.x, v.y, 20, 26);
        return (
          <g key={e.key}>
            <line
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke={color}
              strokeWidth={isHot ? 2.5 : 1.4}
              strokeLinecap="round"
              markerEnd={`url(#${edgeMarker(e.key)})`}
            />
            <rect
              x={lp.x - 11} y={lp.y - 9}
              width={22} height={16}
              rx={3}
              fill="var(--color-bg)"
              stroke={color}
              strokeWidth={1}
            />
            <text
              x={lp.x} y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="var(--font-mono, monospace)"
              fill={color}
              fontWeight={isHot ? "bold" : "normal"}
            >
              {e.weight}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {GRAPH_NODES.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={18}
            fill={nodeColor(node.id)}
            stroke={node.id === sourceNode ? "var(--color-text)" : nodeColor(node.id)}
            strokeWidth={node.id === sourceNode ? 2.5 : 2}
            style={{ transition: "fill 0.3s, stroke 0.3s" }}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={13}
            fontWeight="bold"
            fontFamily="var(--font-mono, monospace)"
            fill={nodeTextColor(node.id)}
            style={{ transition: "fill 0.3s" }}
          >
            {node.id}
          </text>
          <text
            x={node.x}
            y={node.y + 32}
            textAnchor="middle"
            fontSize={12}
            fontFamily="var(--font-mono, monospace)"
            fontWeight="bold"
            fill={dist[node.id] !== Infinity ? "var(--color-text)" : "var(--color-muted)"}
          >
            {dist[node.id] === Infinity ? "∞" : dist[node.id]}
          </text>
        </g>
      ))}
    </svg>
  );
}
