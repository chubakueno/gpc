import type { LCALayoutPos } from "@/types/lca";

// ── Fixed tree data ──────────────────────────────────────────────────────────
// index = node id, value = parent id (-1 = root). Two branch points (3→{4,9},
// 4→{5,8}) give interesting LCA queries across depths up to 7.
export const TREE_PARENT: number[] = [-1, 0, 1, 2, 3, 4, 5, 6, 4, 3, 9, 10, 11];
export const NODE_COUNT = TREE_PARENT.length;

export const DEPTH: number[] = (() => {
  const d = new Array(NODE_COUNT).fill(0);
  for (let v = 1; v < NODE_COUNT; v++) d[v] = d[TREE_PARENT[v]] + 1;
  return d;
})();

export const LOG = Math.max(1, Math.ceil(Math.log2(NODE_COUNT)));

// up[k][v] = the 2^k-th ancestor of v, or -1 if it doesn't exist
export const UP: number[][] = (() => {
  const up: number[][] = Array.from({ length: LOG }, () => new Array(NODE_COUNT).fill(-1));
  up[0] = TREE_PARENT.slice();
  for (let k = 1; k < LOG; k++) {
    for (let v = 0; v < NODE_COUNT; v++) {
      const mid = up[k - 1][v];
      up[k][v] = mid === -1 ? -1 : up[k - 1][mid];
    }
  }
  return up;
})();

export function kthAncestor(v: number, k: number): number {
  let cur = v;
  for (let i = 0; i < LOG && cur !== -1; i++) {
    if ((k >> i) & 1) cur = UP[i][cur];
  }
  return cur;
}

// ── Layout — same recursive "subtree width" algorithm as UFDS's layoutForest ──
const NODE_RADIUS = 16;
const H_GAP = 46;
const LEVEL_HEIGHT = 54;
const TOP_MARGIN = 30;
const SIDE_MARGIN = 26;

interface LayoutNode {
  id: number;
  children: LayoutNode[];
  width: number;
  x: number;
  y: number;
}

function buildLayoutTree(id: number, childrenOf: number[][]): LayoutNode {
  const children = childrenOf[id].map((c) => buildLayoutTree(c, childrenOf));
  const width =
    children.length === 0
      ? NODE_RADIUS * 2 + H_GAP
      : children.reduce((s, c) => s + c.width, 0);
  return { id, children, width, x: 0, y: DEPTH[id] * LEVEL_HEIGHT + TOP_MARGIN };
}

function assignX(node: LayoutNode, startX: number): void {
  if (node.children.length === 0) {
    node.x = startX + node.width / 2;
    return;
  }
  let cursor = startX;
  for (const child of node.children) {
    assignX(child, cursor);
    cursor += child.width;
  }
  const first = node.children[0];
  const last = node.children[node.children.length - 1];
  node.x = (first.x + last.x) / 2;
}

function flatten(node: LayoutNode, out: Map<number, LCALayoutPos>): void {
  out.set(node.id, { x: node.x, y: node.y });
  for (const c of node.children) flatten(c, out);
}

export const TREE_LAYOUT: Map<number, LCALayoutPos> = (() => {
  const childrenOf: number[][] = Array.from({ length: NODE_COUNT }, () => []);
  for (let v = 1; v < NODE_COUNT; v++) childrenOf[TREE_PARENT[v]].push(v);
  const root = buildLayoutTree(0, childrenOf);
  assignX(root, SIDE_MARGIN);
  const out = new Map<number, LCALayoutPos>();
  flatten(root, out);
  return out;
})();

const positions = Array.from(TREE_LAYOUT.values());
export const TREE_WIDTH = Math.max(...positions.map((p) => p.x)) + NODE_RADIUS + SIDE_MARGIN;
export const TREE_HEIGHT = Math.max(...DEPTH) * LEVEL_HEIGHT + TOP_MARGIN + NODE_RADIUS + 20;

// ── SVG renderer ──────────────────────────────────────────────────────────────

interface LCATreeProps {
  p1?: number | null;
  p2?: number | null;
  lca?: number | null;
  onNodeClick?: (id: number) => void;
}

export function LCATree({ p1 = null, p2 = null, lca = null, onNodeClick }: LCATreeProps) {
  function nodeFill(id: number) {
    if (id === lca) return "var(--color-warn)";
    if (id === p1) return "var(--color-accent-2)";
    if (id === p2) return "var(--color-accent-3)";
    return "var(--color-surface-2)";
  }
  function nodeStroke(id: number) {
    if (id === lca) return "var(--color-warn)";
    if (id === p1) return "var(--color-accent-2)";
    if (id === p2) return "var(--color-accent-3)";
    return "var(--color-border)";
  }
  function nodeText(id: number) {
    if (id === lca || id === p1 || id === p2) return "white";
    return "var(--color-text)";
  }

  return (
    <svg
      viewBox={`0 0 ${TREE_WIDTH} ${TREE_HEIGHT}`}
      width="100%"
      style={{ maxWidth: 380, display: "block" }}
      aria-label="Rooted tree for LCA queries"
    >
      {/* Edges */}
      {TREE_PARENT.map((p, id) => {
        if (p === -1) return null;
        const a = TREE_LAYOUT.get(p)!;
        const b = TREE_LAYOUT.get(id)!;
        return (
          <line
            key={id}
            x1={a.x} y1={a.y}
            x2={b.x} y2={b.y}
            stroke="var(--color-border)"
            strokeWidth={1.6}
          />
        );
      })}

      {/* Nodes */}
      {Array.from({ length: NODE_COUNT }, (_, id) => {
        const pos = TREE_LAYOUT.get(id)!;
        const clickable = !!onNodeClick;
        return (
          <g
            key={id}
            onClick={clickable ? () => onNodeClick!(id) : undefined}
            style={{ cursor: clickable ? "pointer" : "default" }}
          >
            <circle
              cx={pos.x} cy={pos.y}
              r={NODE_RADIUS}
              fill={nodeFill(id)}
              stroke={nodeStroke(id)}
              strokeWidth={2}
              style={{ transition: "fill 0.25s, stroke 0.25s" }}
            />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontWeight="bold"
              fontFamily="var(--font-mono, monospace)"
              fill={nodeText(id)}
            >
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
