import { useCallback } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useDrag } from "@/hooks/useDrag";
import type { UFDSState } from "@/types/ufds";
import { UFDSNodeComponent } from "./UFDSNode";
import { UFDSEdge } from "./UFDSEdge";

const SVG_WIDTH = 800;
const SVG_HEIGHT = 420;
const NODE_RADIUS = 22;
const HIT_RADIUS = NODE_RADIUS + 12;

interface UFDSGraphProps {
  state: UFDSState;
  onUnion: (a: number, b: number) => void;
  onFind: (x: number) => void;
}

export function UFDSGraph({ state, onUnion, onFind }: UFDSGraphProps) {
  const { t } = useLang();
  const { nodes, highlightedPath, newEdges, removedEdges, optimizationMode } = state;

  const hitTest = useCallback(
    (pt: { x: number; y: number }, excludeId: number): number | null => {
      for (const node of nodes) {
        if (node.id === excludeId) continue;
        if (Math.hypot(node.x - pt.x, node.y - pt.y) < HIT_RADIUS) {
          return node.id;
        }
      }
      return null;
    },
    [nodes]
  );

  const { dragSourceId, dragCurrentPt, dragTargetId, isDragging,
    handleNodePointerDown, handleSvgPointerMove, handleSvgPointerUp, svgRef } =
    useDrag({
      hitTest,
      onDragEnd: (sourceId, targetId) => {
        if (targetId !== null) {
          onUnion(sourceId, targetId);
        } else {
          onFind(sourceId);
        }
      },
    });

  // Build edge list from parent relationships (skip self-loops = roots)
  const edges = nodes
    .filter((n) => n.parent !== n.id)
    .map((n) => ({ from: n.id, to: n.parent }));

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)]"
        style={{ touchAction: "none" }}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
      >
        {/* Defs for any reusable markers */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((e) => {
          const from = nodes[e.from];
          const to = nodes[e.to];
          if (!from || !to) return null;
          const isNew = newEdges.some((ne) => ne.from === e.from && ne.to === e.to);
          const isCompressing = removedEdges.some((re) => re.from === e.from && re.to === e.to);
          return (
            <UFDSEdge
              key={`${e.from}-${e.to}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              isNew={isNew}
              isCompressing={isCompressing}
            />
          );
        })}

        {/* Ghost drag edge */}
        {isDragging && dragCurrentPt && dragSourceId !== null && (
          <line
            x1={nodes[dragSourceId]?.x ?? 0}
            y1={nodes[dragSourceId]?.y ?? 0}
            x2={dragCurrentPt.x}
            y2={dragCurrentPt.y}
            stroke="var(--color-accent-2)"
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.7"
          />
        )}

        {/* Nodes */}
        {nodes.map((node) => (
          <UFDSNodeComponent
            key={node.id}
            node={node}
            isHighlighted={highlightedPath.includes(node.id)}
            isDragSource={dragSourceId === node.id}
            isDragTarget={dragTargetId === node.id}
            isRoot={node.parent === node.id}
            mode={optimizationMode}
            onPointerDown={handleNodePointerDown}
          />
        ))}

        {/* Hint text when no operations yet */}
        {nodes.length > 0 && nodes.every((n) => n.parent === n.id) && (
          <text
            x={SVG_WIDTH / 2}
            y={SVG_HEIGHT - 16}
            textAnchor="middle"
            fontSize="12"
            fill="var(--color-muted)"
            style={{ pointerEvents: "none" }}
          >
            {t("ufds.controls.drag.hint")}
          </text>
        )}
      </svg>

      {/* Animation phase indicator */}
      {state.animationPhase !== "idle" && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-warn)]/20 border border-[var(--color-warn)]/40 text-[var(--color-warn)]">
          {state.animationPhase === "finding" ? "Finding root…" : "Compressing path…"}
        </div>
      )}
    </div>
  );
}
