import type { MSTNodePos, WeightedEdge } from "@/types/mst";

// Fixed node positions for the demo graph
export const GRAPH_NODES: MSTNodePos[] = [
  { id: 0, x: 80,  y: 200 },
  { id: 1, x: 240, y: 75  },
  { id: 2, x: 430, y: 75  },
  { id: 3, x: 80,  y: 335 },
  { id: 4, x: 430, y: 285 },
  { id: 5, x: 240, y: 365 },
  { id: 6, x: 560, y: 300 },
];

// Fixed graph topology (11 edges)
export const EDGE_TOPOLOGY: [number, number][] = [
  [0, 1], [0, 3],
  [1, 2], [1, 3], [1, 4],
  [2, 4],
  [3, 4], [3, 5],
  [4, 5], [4, 6],
  [5, 6],
];

export const DEFAULT_WEIGHTS = [7, 5, 8, 9, 7, 5, 15, 6, 8, 9, 11];

export function makeEdges(weights: number[]): WeightedEdge[] {
  return EDGE_TOPOLOGY.map(([u, v], i) => ({
    u,
    v,
    weight: weights[i],
    key: `${Math.min(u, v)}-${Math.max(u, v)}`,
  }));
}

export function randomWeights(): number[] {
  return EDGE_TOPOLOGY.map(() => Math.floor(Math.random() * 19) + 1);
}

// Perpendicular offset for edge weight labels
function labelPos(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: mx - (dy / len) * 13, y: my + (dx / len) * 13 };
}

interface MSTGraphProps {
  edges: WeightedEdge[];
  mstEdgeKeys: Set<string>;
  rejectedEdgeKeys?: Set<string>;
  consideringEdgeKey?: string | null;
  inMSTNodes?: boolean[];
  activeNode?: number | null; // amber highlight (node just added)
}

export function MSTGraph({
  edges,
  mstEdgeKeys,
  rejectedEdgeKeys = new Set(),
  consideringEdgeKey = null,
  inMSTNodes,
  activeNode = null,
}: MSTGraphProps) {
  const nodeMap = new Map(GRAPH_NODES.map((n) => [n.id, n]));

  function edgeColor(key: string) {
    if (key === consideringEdgeKey) return "var(--color-warn)";
    if (mstEdgeKeys.has(key)) return "var(--color-accent)";
    if (rejectedEdgeKeys.has(key)) return "var(--color-danger)";
    return "var(--color-muted)";
  }

  function edgeWidth(key: string) {
    if (key === consideringEdgeKey || mstEdgeKeys.has(key)) return 2.5;
    return 1.5;
  }

  function edgeOpacity(key: string) {
    if (rejectedEdgeKeys.has(key)) return 0.35;
    return 1;
  }

  function nodeColor(id: number) {
    if (id === activeNode) return "var(--color-warn)";
    if (inMSTNodes?.[id]) return "var(--color-accent)";
    return "var(--color-surface-2)";
  }

  function nodeBorder(id: number) {
    if (id === activeNode) return "var(--color-warn)";
    if (inMSTNodes?.[id]) return "var(--color-accent)";
    return "var(--color-border)";
  }

  function nodeTextColor(id: number) {
    if (id === activeNode || inMSTNodes?.[id]) return "white";
    return "var(--color-text)";
  }

  return (
    <svg
      viewBox="0 0 640 410"
      width="100%"
      style={{ maxWidth: 640, display: "block" }}
      aria-label="MST graph visualization"
    >
      {/* Edges */}
      {edges.map((e) => {
        const u = nodeMap.get(e.u)!;
        const v = nodeMap.get(e.v)!;
        const lp = labelPos(u.x, u.y, v.x, v.y);
        const color = edgeColor(e.key);
        const w = edgeWidth(e.key);
        const op = edgeOpacity(e.key);
        return (
          <g key={e.key} opacity={op}>
            <line
              x1={u.x} y1={u.y}
              x2={v.x} y2={v.y}
              stroke={color}
              strokeWidth={w}
              strokeLinecap="round"
            />
            {/* Weight label background */}
            <rect
              x={lp.x - 12} y={lp.y - 9}
              width={24} height={16}
              rx={3}
              fill="var(--color-bg)"
              stroke={color}
              strokeWidth={1}
              opacity={op < 1 ? 0.6 : 1}
            />
            <text
              x={lp.x} y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="var(--font-mono, monospace)"
              fill={color}
              fontWeight={mstEdgeKeys.has(e.key) || e.key === consideringEdgeKey ? "bold" : "normal"}
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
            stroke={nodeBorder(node.id)}
            strokeWidth={2}
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
        </g>
      ))}
    </svg>
  );
}
