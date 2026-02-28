import type { UFDSNode as UFDSNodeType } from "@/types/ufds";
import type { OptimizationMode } from "@/types/ufds";

const NODE_RADIUS = 22;

interface UFDSNodeProps {
  node: UFDSNodeType;
  isHighlighted: boolean;
  isDragSource: boolean;
  isDragTarget: boolean;
  isRoot: boolean;
  mode: OptimizationMode;
  onPointerDown: (id: number, e: React.PointerEvent<SVGGElement>) => void;
}

export function UFDSNodeComponent({
  node,
  isHighlighted,
  isDragSource,
  isDragTarget,
  isRoot,
  mode,
  onPointerDown,
}: UFDSNodeProps) {
  const fill = isDragSource
    ? "var(--color-accent-2)"
    : isDragTarget
    ? "var(--color-accent-3)"
    : isHighlighted
    ? "var(--color-warn)"
    : isRoot
    ? "var(--color-accent)"
    : "var(--color-surface-3)";

  const stroke = isRoot ? "var(--color-accent)" : "var(--color-border)";
  const strokeWidth = isRoot ? 2.5 : 1.5;

  const showRank = mode === "rank" || mode === "both";

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onPointerDown={(e) => onPointerDown(node.id, e)}
      style={{ cursor: "pointer" }}
    >
      {/* Glow for root */}
      {isRoot && (
        <circle
          r={NODE_RADIUS + 6}
          fill="var(--color-accent)"
          opacity="0.12"
        />
      )}

      <circle
        r={NODE_RADIUS}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        style={{ transition: "fill 0.3s ease, stroke 0.3s ease" }}
      />

      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill="var(--color-text)"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {node.label}
      </text>

      {/* Rank badge */}
      {showRank && (
        <text
          x={NODE_RADIUS - 4}
          y={-NODE_RADIUS + 6}
          textAnchor="end"
          fontSize="9"
          fill="var(--color-muted)"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          r:{node.rank}
        </text>
      )}
    </g>
  );
}
