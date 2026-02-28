interface UFDSEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isNew?: boolean;
  isCompressing?: boolean;
}

const NODE_RADIUS = 22;

function edgeEndpoints(
  x1: number, y1: number, x2: number, y2: number
): { ex1: number; ey1: number; ex2: number; ey2: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const r = NODE_RADIUS + 2;
  return {
    ex1: x1 + (dx / len) * r,
    ey1: y1 + (dy / len) * r,
    ex2: x2 - (dx / len) * r,
    ey2: y2 - (dy / len) * r,
  };
}

export function UFDSEdge({ x1, y1, x2, y2, isNew, isCompressing }: UFDSEdgeProps) {
  const { ex1, ey1, ex2, ey2 } = edgeEndpoints(x1, y1, x2, y2);

  // Arrow marker direction: from child to parent
  const dx = ex2 - ex1;
  const dy = ey2 - ey1;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  let strokeColor = "var(--color-muted)";
  let strokeWidth = 1.5;
  let opacity = 0.7;
  let className = "";
  let strokeDash = "none";

  if (isCompressing) {
    strokeColor = "var(--color-warn)";
    strokeWidth = 2;
    className = "edge-compressing";
    opacity = 1;
  } else if (isNew) {
    strokeColor = "var(--color-accent)";
    strokeWidth = 2;
    className = "edge-new";
    opacity = 1;
  }

  const len = Math.hypot(dx, dy);

  return (
    <g className={className}>
      <line
        x1={ex1}
        y1={ey1}
        x2={ex2}
        y2={ey2}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDash}
        opacity={opacity}
        style={{ transition: "stroke 0.3s ease" }}
      />
      {/* Arrowhead */}
      {!isCompressing && len > 5 && (
        <polygon
          points="-6,-4 0,0 -6,4"
          fill={strokeColor}
          opacity={opacity}
          transform={`translate(${ex2},${ey2}) rotate(${angle})`}
        />
      )}
    </g>
  );
}
