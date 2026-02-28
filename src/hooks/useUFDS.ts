import { useCallback, useEffect, useReducer, useRef } from "react";
import type {
  UFDSAction,
  UFDSNode,
  UFDSState,
  OptimizationMode,
} from "@/types/ufds";

// ─── Layout ───────────────────────────────────────────────────────────────────

const LEVEL_HEIGHT = 90;
const NODE_RADIUS = 22;
const H_GAP = 60;
const TREE_GAP = 80;
const SVG_WIDTH = 800;

interface LayoutNode {
  id: number;
  children: LayoutNode[];
  width: number;
  x: number;
  y: number;
}

function buildTree(nodes: UFDSNode[], rootId: number, depth: number): LayoutNode {
  const children = nodes
    .filter((n) => n.parent === rootId && n.id !== rootId)
    .map((n) => buildTree(nodes, n.id, depth + 1));

  const width =
    children.length === 0
      ? NODE_RADIUS * 2 + H_GAP
      : children.reduce((s, c) => s + c.width, 0);

  return { id: rootId, children, width, x: 0, y: depth * LEVEL_HEIGHT + 60 };
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

function flattenTree(node: LayoutNode, result: Map<number, { x: number; y: number }>): void {
  result.set(node.id, { x: node.x, y: node.y });
  for (const child of node.children) {
    flattenTree(child, result);
  }
}

export function layoutForest(nodes: UFDSNode[]): Map<number, { x: number; y: number }> {
  const roots = nodes.filter((n) => n.parent === n.id);
  const trees = roots.map((r) => buildTree(nodes, r.id, 0));

  // Assign X positions for each tree, then offset
  let cursor = (SVG_WIDTH - trees.reduce((s, t) => s + t.width, 0) - (trees.length - 1) * TREE_GAP) / 2;
  cursor = Math.max(cursor, 40);

  const result = new Map<number, { x: number; y: number }>();
  for (const tree of trees) {
    assignX(tree, cursor);
    flattenTree(tree, result);
    cursor += tree.width + TREE_GAP;
  }
  return result;
}

// ─── Pure UFDS functions ───────────────────────────────────────────────────────

function findRoot(nodes: UFDSNode[], x: number): number {
  let curr = x;
  while (nodes[curr].parent !== curr) {
    curr = nodes[curr].parent;
  }
  return curr;
}

function findPath(nodes: UFDSNode[], x: number): number[] {
  const path: number[] = [];
  let curr = x;
  while (nodes[curr].parent !== curr) {
    path.push(curr);
    curr = nodes[curr].parent;
  }
  path.push(curr); // root
  return path;
}

function applyCompression(nodes: UFDSNode[], path: number[]): UFDSNode[] {
  const root = path[path.length - 1];
  return nodes.map((n) => {
    if (path.includes(n.id) && n.id !== root) {
      return { ...n, parent: root };
    }
    return n;
  });
}

function applyUnion(
  nodes: UFDSNode[],
  rootA: number,
  rootB: number,
  mode: OptimizationMode
): UFDSNode[] {
  if (rootA === rootB) return nodes;
  const newNodes = nodes.map((n) => ({ ...n }));

  if (mode === "rank" || mode === "both") {
    const rankA = newNodes[rootA].rank;
    const rankB = newNodes[rootB].rank;
    if (rankA < rankB) {
      newNodes[rootA].parent = rootB;
      newNodes[rootB].size += newNodes[rootA].size;
    } else if (rankA > rankB) {
      newNodes[rootB].parent = rootA;
      newNodes[rootA].size += newNodes[rootB].size;
    } else {
      newNodes[rootB].parent = rootA;
      newNodes[rootA].rank += 1;
      newNodes[rootA].size += newNodes[rootB].size;
    }
  } else {
    // naive: always attach B to A
    newNodes[rootB].parent = rootA;
    newNodes[rootA].size += newNodes[rootB].size;
  }
  return newNodes;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

const NODE_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function makeNode(id: number): UFDSNode {
  return {
    id,
    label: NODE_LABELS[id % NODE_LABELS.length] ?? String(id),
    parent: id,
    rank: 0,
    size: 1,
    x: 0,
    y: 0,
  };
}

function applyLayout(nodes: UFDSNode[]): UFDSNode[] {
  const positions = layoutForest(nodes);
  return nodes.map((n) => {
    const pos = positions.get(n.id);
    return pos ? { ...n, x: pos.x, y: pos.y } : n;
  });
}

function initialState(nodeCount: number = 5): UFDSState {
  const nodes = applyLayout(
    Array.from({ length: nodeCount }, (_, i) => makeNode(i))
  );
  return {
    nodes,
    optimizationMode: "both",
    highlightedPath: [],
    animationPhase: "idle",
    operationLog: [],
    newEdges: [],
    removedEdges: [],
  };
}

function reducer(state: UFDSState, action: UFDSAction): UFDSState {
  switch (action.type) {
    case "ADD_NODE": {
      if (state.nodes.length >= 20) return state;
      const id = state.nodes.length;
      const newNodes = applyLayout([...state.nodes, makeNode(id)]);
      return { ...state, nodes: newNodes, newEdges: [], removedEdges: [] };
    }

    case "RESET": {
      return initialState(5);
    }

    case "SET_MODE": {
      return { ...state, optimizationMode: action.mode };
    }

    case "FIND": {
      if (state.animationPhase !== "idle") return state;
      const { x } = action;
      const path = findPath(state.nodes, x);
      const root = path[path.length - 1];
      const useCompression =
        state.optimizationMode === "compression" || state.optimizationMode === "both";

      const logMsg = `find(${state.nodes[x].label}) → root: ${state.nodes[root].label}`;

      if (path.length <= 1 || !useCompression) {
        // No compression needed (already root or no compression mode)
        return {
          ...state,
          highlightedPath: path,
          animationPhase: "finding",
          operationLog: [logMsg, ...state.operationLog].slice(0, 20),
          newEdges: [],
          removedEdges: [],
        };
      }

      return {
        ...state,
        highlightedPath: path,
        animationPhase: "finding",
        operationLog: [logMsg, ...state.operationLog].slice(0, 20),
        newEdges: [],
        removedEdges: [],
      };
    }

    case "UNION": {
      if (state.animationPhase !== "idle") return state;
      const { a, b } = action;
      const rootA = findRoot(state.nodes, a);
      const rootB = findRoot(state.nodes, b);
      const labelA = state.nodes[a].label;
      const labelB = state.nodes[b].label;
      const labelRootA = state.nodes[rootA].label;

      if (rootA === rootB) {
        const logMsg = `union(${labelA}, ${labelB}): already same set (root: ${labelRootA})`;
        return {
          ...state,
          operationLog: [logMsg, ...state.operationLog].slice(0, 20),
        };
      }

      const newNodes = applyLayout(
        applyUnion(state.nodes, rootA, rootB, state.optimizationMode)
      );

      // Determine new edge
      const finalRootA = findRoot(newNodes, a);
      const newEdge = finalRootA === rootA
        ? { from: rootB, to: rootA }
        : { from: rootA, to: rootB };

      const logMsg = `union(${labelA}, ${labelB}) → root: ${newNodes[finalRootA].label}`;

      return {
        ...state,
        nodes: newNodes,
        operationLog: [logMsg, ...state.operationLog].slice(0, 20),
        newEdges: [newEdge],
        removedEdges: [],
        animationPhase: "idle",
      };
    }

    case "TICK": {
      if (state.animationPhase === "finding") {
        const path = state.highlightedPath;
        const root = path[path.length - 1];
        const useCompression =
          state.optimizationMode === "compression" || state.optimizationMode === "both";

        if (!useCompression || path.length <= 1) {
          return {
            ...state,
            highlightedPath: [],
            animationPhase: "idle",
            newEdges: [],
            removedEdges: [],
          };
        }

        // Compute which edges will be removed (intermediate ones)
        const removedEdges = path.slice(0, -1).flatMap((nodeId, i) => {
          if (i === path.length - 2) return []; // already points to root
          return [{ from: nodeId, to: path[i + 1] }];
        });

        // Apply compression
        const compressedNodes = applyLayout(applyCompression(state.nodes, path));

        // New edges: all intermediate nodes now point to root
        const newEdges = path
          .slice(0, -1)
          .filter((nodeId) => nodeId !== root)
          .map((nodeId) => ({ from: nodeId, to: root }));

        const compressLog = `Path compressed: ${path.map((id) => state.nodes[id].label).join(" → ")}`;

        return {
          ...state,
          nodes: compressedNodes,
          animationPhase: "compressing",
          removedEdges,
          newEdges,
          operationLog: [compressLog, ...state.operationLog].slice(0, 20),
        };
      }

      if (state.animationPhase === "compressing") {
        return {
          ...state,
          highlightedPath: [],
          animationPhase: "idle",
          newEdges: [],
          removedEdges: [],
        };
      }

      return state;
    }

    case "LOG": {
      return {
        ...state,
        operationLog: [action.message, ...state.operationLog].slice(0, 20),
      };
    }

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUFDS() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState(5));
  const tickTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Orchestrate animation ticks
  useEffect(() => {
    if (state.animationPhase === "finding") {
      tickTimeout.current = setTimeout(() => {
        dispatch({ type: "TICK" });
      }, 700);
    } else if (state.animationPhase === "compressing") {
      tickTimeout.current = setTimeout(() => {
        dispatch({ type: "TICK" });
      }, 900);
    }
    return () => {
      if (tickTimeout.current) clearTimeout(tickTimeout.current);
    };
  }, [state.animationPhase]);

  const union = useCallback((a: number, b: number) => {
    dispatch({ type: "UNION", a, b });
  }, []);

  const find = useCallback((x: number) => {
    dispatch({ type: "FIND", x });
  }, []);

  const addNode = useCallback(() => {
    dispatch({ type: "ADD_NODE" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const setMode = useCallback((mode: OptimizationMode) => {
    dispatch({ type: "SET_MODE", mode });
  }, []);

  return { state, union, find, addNode, reset, setMode };
}
