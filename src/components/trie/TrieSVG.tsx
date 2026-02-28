import { useMemo } from "react";
import type { TrieData, TrieLayout, AnimPhase } from "@/types/trie";
import { layoutTrie } from "./trieOps";

const NODE_R = 16;

interface TrieSVGProps {
  trie: TrieData;
  layout?: TrieLayout;          // if omitted, computed internally
  hiddenIds?: Set<number>;
  highlightIds?: number[];      // path nodes (sky blue)
  activeId?: number | null;     // current node
  newIds?: number[];            // newly created nodes (violet)
  phase?: AnimPhase;
  autocompleteSet?: Set<number>;// for autocomplete highlighting
  subtreeSet?: Set<number>;     // subtree nodes (lighter highlight)
}

function edgeLabelPos(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: mx - (dy / len) * 11, y: my + (dx / len) * 11 };
}

export function TrieSVG({
  trie,
  layout: layoutProp,
  hiddenIds = new Set(),
  highlightIds = [],
  activeId = null,
  newIds = [],
  phase = "idle",
  autocompleteSet,
  subtreeSet,
}: TrieSVGProps) {
  const layout = useMemo(
    () => layoutProp ?? layoutTrie(trie),
    [layoutProp, trie],
  );

  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);
  const newSet = useMemo(() => new Set(newIds), [newIds]);

  function fillColor(id: number): string {
    if (id === activeId) {
      if (phase === "found") return "var(--color-accent-3)";
      if (phase === "not_found") return "var(--color-danger)";
      return "var(--color-warn)";
    }
    if (newSet.has(id)) return "var(--color-accent)";
    if (highlightSet.has(id)) return "var(--color-accent-2)";
    if (subtreeSet?.has(id)) return "var(--color-accent-3)";
    if (autocompleteSet?.has(id)) return "var(--color-accent-2)";
    return "var(--color-surface-2)";
  }

  function strokeColor(id: number): string {
    const node = trie.nodes.get(id)!;
    if (id === activeId) return fillColor(id);
    if (newSet.has(id)) return "var(--color-accent)";
    if (highlightSet.has(id)) return "var(--color-accent-2)";
    if (subtreeSet?.has(id)) return "var(--color-accent-3)";
    if (autocompleteSet?.has(id)) return "var(--color-accent-2)";
    if (node.isEnd) return "var(--color-accent-3)";
    return "var(--color-border)";
  }

  function textColor(id: number): string {
    if (
      id === activeId ||
      newSet.has(id) ||
      highlightSet.has(id) ||
      subtreeSet?.has(id) ||
      autocompleteSet?.has(id)
    ) return "white";
    return "var(--color-text)";
  }

  function edgeColor(parentId: number, childId: number): string {
    if (highlightSet.has(parentId) && (highlightSet.has(childId) || childId === activeId || newSet.has(childId))) {
      if (phase === "not_found" && childId === activeId) return "var(--color-danger)";
      if (newSet.has(childId)) return "var(--color-accent)";
      return "var(--color-accent-2)";
    }
    if (subtreeSet?.has(parentId) && subtreeSet?.has(childId)) return "var(--color-accent-3)";
    if (autocompleteSet?.has(parentId) && autocompleteSet?.has(childId)) return "var(--color-accent-2)";
    return "var(--color-border)";
  }

  const { width, height } = layout;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: "block" }}
      aria-label="Trie visualization"
    >
      {/* Edges first (behind nodes) */}
      {Array.from(trie.nodes.values()).map((node) => {
        if (node.parentId === null) return null;
        if (hiddenIds.has(node.id)) return null;

        const px = layout.x.get(node.parentId)!;
        const py = layout.y.get(node.parentId)!;
        const cx = layout.x.get(node.id)!;
        const cy = layout.y.get(node.id)!;
        const eColor = edgeColor(node.parentId, node.id);
        const lp = edgeLabelPos(px, py, cx, cy);
        const isHighlightedEdge = highlightSet.has(node.parentId) &&
          (highlightSet.has(node.id) || node.id === activeId || newSet.has(node.id));

        return (
          <g key={`edge-${node.id}`}>
            {/* Edge line — from parent circle rim to child circle rim */}
            <line
              x1={px} y1={py + NODE_R}
              x2={cx} y2={cy - NODE_R}
              stroke={eColor}
              strokeWidth={isHighlightedEdge ? 2 : 1.5}
              strokeLinecap="round"
            />
            {/* Character label on edge */}
            <rect
              x={lp.x - 9} y={lp.y - 8}
              width={18} height={16}
              rx={3}
              fill="var(--color-bg)"
              stroke={eColor}
              strokeWidth={0.8}
            />
            <text
              x={lp.x} y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="var(--font-mono, monospace)"
              fontWeight={isHighlightedEdge ? "bold" : "normal"}
              fill={eColor}
            >
              {node.char}
            </text>
          </g>
        );
      })}

      {/* Nodes */}
      {Array.from(trie.nodes.values()).map((node) => {
        if (hiddenIds.has(node.id)) return null;
        const nx = layout.x.get(node.id)!;
        const ny = layout.y.get(node.id)!;
        const fill = fillColor(node.id);
        const stroke = strokeColor(node.id);
        const isHighlighted = node.id === activeId || newSet.has(node.id) || highlightSet.has(node.id);

        return (
          <g key={`node-${node.id}`} style={{ transition: "opacity 0.3s" }}>
            {/* Double circle for isEnd */}
            {node.isEnd && !isHighlighted && (
              <circle cx={nx} cy={ny} r={NODE_R + 4} fill="none"
                stroke="var(--color-accent-3)" strokeWidth={1.5} opacity={0.4}
              />
            )}
            {node.isEnd && isHighlighted && (
              <circle cx={nx} cy={ny} r={NODE_R + 4} fill="none"
                stroke={fill} strokeWidth={1.5} opacity={0.5}
              />
            )}
            <circle
              cx={nx} cy={ny} r={NODE_R}
              fill={fill} stroke={stroke} strokeWidth={2}
              style={{ transition: "fill 0.3s, stroke 0.3s" }}
            />
            <text
              x={nx} y={ny}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={node.char === "" ? 11 : 13}
              fontWeight="bold"
              fontFamily="var(--font-mono, monospace)"
              fill={textColor(node.id)}
              style={{ transition: "fill 0.3s" }}
            >
              {node.char === "" ? "·" : node.char}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
