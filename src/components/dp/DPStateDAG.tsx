const SPACING_X = 88;
const SPACING_Y = 76;
const MARGIN_X = 56;
const MARGIN_Y = 40;
const HEADER_H = 24;
const R = 17;

function key(i: number, j: number) {
  return `${i},${j}`;
}

function nodeX(j: number) {
  return MARGIN_X + j * SPACING_X;
}

function nodeY(i: number) {
  return MARGIN_Y + HEADER_H + i * SPACING_Y;
}

function trim(x1: number, y1: number, x2: number, y2: number, rStart: number, rEnd: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x1: x1 + ux * rStart, y1: y1 + uy * rStart, x2: x2 - ux * rEnd, y2: y2 - uy * rEnd };
}

interface DPStateDAGProps {
  rows: number;
  cols: number;
  filledKeys: Set<string>;
  inScopeKeys: Set<string>;
  currentKey?: string | null;
  targetKey?: string | null;
  onCellClick?: (i: number, j: number) => void;
}

export function DPStateDAG({
  rows,
  cols,
  filledKeys,
  inScopeKeys,
  currentKey = null,
  targetKey = null,
  onCellClick,
}: DPStateDAGProps) {
  const width = MARGIN_X * 2 + (cols - 1) * SPACING_X;
  const height = MARGIN_Y + HEADER_H + (rows - 1) * SPACING_Y + MARGIN_Y;

  const edges: { from: [number, number]; to: [number, number] }[] = [];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i === 0 || j === 0) continue;
      edges.push({ from: [i - 1, j], to: [i, j] });
      edges.push({ from: [i, j - 1], to: [i, j] });
      edges.push({ from: [i - 1, j - 1], to: [i, j] });
    }
  }

  function edgeColor(toKey: string) {
    if (!inScopeKeys.has(toKey)) return "var(--color-muted)";
    if (toKey === currentKey) return "var(--color-warn)";
    if (filledKeys.has(toKey)) return "var(--color-accent)";
    return "var(--color-muted)";
  }

  function edgeOpacity(toKey: string) {
    if (!inScopeKeys.has(toKey)) return 0.12;
    if (toKey === currentKey) return 1;
    if (filledKeys.has(toKey)) return 0.7;
    return 0.35;
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: 620, display: "block" }}
      aria-label="2D DP states as a DAG"
    >
      <defs>
        <marker id="dagArrowMuted" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-muted)" />
        </marker>
        <marker id="dagArrowAccent" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-accent)" />
        </marker>
        <marker id="dagArrowWarn" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-warn)" />
        </marker>
      </defs>

      {/* Column headers */}
      {Array.from({ length: cols }, (_, j) => (
        <text
          key={`col-${j}`}
          x={nodeX(j)}
          y={MARGIN_Y}
          textAnchor="middle"
          fontSize={11}
          fontFamily="var(--font-mono, monospace)"
          fill="var(--color-muted)"
        >
          j={j}
        </text>
      ))}
      {/* Row headers */}
      {Array.from({ length: rows }, (_, i) => (
        <text
          key={`row-${i}`}
          x={MARGIN_X - 30}
          y={nodeY(i)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={11}
          fontFamily="var(--font-mono, monospace)"
          fill="var(--color-muted)"
        >
          i={i}
        </text>
      ))}

      {/* Edges */}
      {edges.map(({ from, to }) => {
        const toKey = key(to[0], to[1]);
        const color = edgeColor(toKey);
        const marker =
          color === "var(--color-accent)"
            ? "dagArrowAccent"
            : color === "var(--color-warn)"
            ? "dagArrowWarn"
            : "dagArrowMuted";
        const line = trim(
          nodeX(from[1]), nodeY(from[0]),
          nodeX(to[1]), nodeY(to[0]),
          R + 1, R + 7
        );
        return (
          <line
            key={`${key(from[0], from[1])}->${toKey}`}
            x1={line.x1} y1={line.y1}
            x2={line.x2} y2={line.y2}
            stroke={color}
            strokeWidth={toKey === currentKey ? 2 : 1.3}
            opacity={edgeOpacity(toKey)}
            markerEnd={`url(#${marker})`}
          />
        );
      })}

      {/* Nodes */}
      {Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => {
          const k = key(i, j);
          const isBase = i === 0 || j === 0;
          const inScope = inScopeKeys.has(k);
          const filled = filledKeys.has(k);
          const isCurrent = k === currentKey;
          const isTarget = k === targetKey;
          const clickable = !!onCellClick && !isBase;

          let fill = "var(--color-surface-2)";
          let stroke = "var(--color-border)";
          let text = "var(--color-muted)";
          let opacity = 1;

          if (!inScope) {
            fill = "var(--color-surface)";
            stroke = "var(--color-border)";
            text = "var(--color-muted)";
            opacity = 0.3;
          } else if (isCurrent) {
            fill = "var(--color-warn)";
            stroke = "var(--color-warn)";
            text = "white";
          } else if (isBase) {
            fill = "var(--color-accent-3)";
            stroke = "var(--color-accent-3)";
            text = "white";
          } else if (filled) {
            fill = "var(--color-accent)";
            stroke = "var(--color-accent)";
            text = "white";
          }

          return (
            <g
              key={k}
              opacity={opacity}
              onClick={clickable ? () => onCellClick!(i, j) : undefined}
              style={{ cursor: clickable ? "pointer" : "default" }}
            >
              {isTarget && (
                <circle
                  cx={nodeX(j)} cy={nodeY(i)}
                  r={R + 5}
                  fill="none"
                  stroke="var(--color-accent-2)"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )}
              <circle
                cx={nodeX(j)} cy={nodeY(i)}
                r={R}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
                style={{ transition: "fill 0.25s, stroke 0.25s" }}
              />
              <text
                x={nodeX(j)} y={nodeY(i)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9.5}
                fontWeight="bold"
                fontFamily="var(--font-mono, monospace)"
                fill={text}
              >
                {i},{j}
              </text>
            </g>
          );
        })
      )}
    </svg>
  );
}
