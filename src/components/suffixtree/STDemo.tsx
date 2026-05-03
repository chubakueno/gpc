import { useState, useEffect, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { StepControls } from "@/components/shared/StepControls";
import { computeSTFrames, layoutST } from "./stOps";
import type { STFrame } from "@/types/suffixtree";

const DEFAULT_STR = "banana";
const INTERVAL = 800;
const MAX_LEN = 9;
const NODE_R = 16;

function edgeLabelPos(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: mx - (dy / len) * 12, y: my + (dx / len) * 12 };
}

function actionColor(action: STFrame["action"]): string {
  if (action === "done") return "var(--color-accent-3)";
  if (action === "split") return "var(--color-warn)";
  if (action === "add_leaf") return "var(--color-accent)";
  return "var(--color-muted)";
}

interface STSVGProps {
  frame: STFrame;
}

function STSVG({ frame }: STSVGProps) {
  const { nodes, str, activeId, highlightIds, newIds } = frame;

  const layout = useMemo(() => layoutST(nodes), [nodes]);
  const { positions, width, height } = layout;

  const highlightSet = useMemo(() => new Set(highlightIds), [highlightIds]);
  const newSet = useMemo(() => new Set(newIds), [newIds]);

  function fillColor(id: number): string {
    if (id === activeId) return "var(--color-warn)";
    if (newSet.has(id)) return "var(--color-accent-2)";
    if (highlightSet.has(id)) return "var(--color-accent-3)";
    const node = nodes[id];
    if (node.isLeaf) return "color-mix(in srgb, var(--color-accent) 15%, transparent)";
    if (id === 0) return "var(--color-surface-2)";
    return "var(--color-surface-2)";
  }

  function strokeColor(id: number): string {
    if (id === activeId) return "var(--color-warn)";
    if (newSet.has(id)) return "var(--color-accent-2)";
    if (highlightSet.has(id)) return "var(--color-accent-3)";
    if (id === 0) return "var(--color-accent-2)";
    const node = nodes[id];
    if (node.isLeaf) return "var(--color-accent)";
    return "var(--color-border)";
  }

  function textColor(id: number): string {
    if (id === activeId || newSet.has(id) || highlightSet.has(id)) return "white";
    return "var(--color-text)";
  }

  function isEdgeNew(childId: number): boolean {
    return newSet.has(childId);
  }

  const svgWidth = Math.max(width, 300);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${svgWidth} ${height}`}
        width={svgWidth}
        height={height}
        aria-label="Suffix Tree visualization"
        style={{ display: "block" }}
      >
        {/* Edges first (behind nodes) */}
        {nodes.map(node => {
          if (node.parentId === null) return null;
          const pos = positions.get(node.id);
          const parentPos = positions.get(node.parentId);
          if (!pos || !parentPos) return null;

          const edgeNew = isEdgeNew(node.id);
          const edgeStroke = edgeNew ? "var(--color-accent-2)" : "var(--color-border)";

          // Edge label: substring from edgeStart to edgeEnd (truncated to 7 chars)
          const rawLabel = str.slice(node.edgeStart, node.edgeEnd);
          const label = rawLabel.length > 7 ? rawLabel.slice(0, 7) + "…" : rawLabel;

          const lp = edgeLabelPos(parentPos.x, parentPos.y, pos.x, pos.y);

          // Direction: from parent bottom to child top
          const x1 = parentPos.x;
          const y1 = parentPos.y + NODE_R;
          const x2 = pos.x;
          const y2 = pos.y - NODE_R;

          return (
            <g key={`edge-${node.id}`}>
              <line
                x1={x1} y1={y1}
                x2={x2} y2={y2}
                stroke={edgeStroke}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fontFamily="var(--font-mono, monospace)"
                fill={edgeNew ? "var(--color-accent-2)" : "var(--color-muted)"}
                className="select-none pointer-events-none"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const fill = fillColor(node.id);
          const stroke = strokeColor(node.id);
          const tcolor = textColor(node.id);

          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={pos.x} cy={pos.y} r={NODE_R}
                fill={fill}
                stroke={stroke}
                strokeWidth={2}
                style={{ transition: "fill 0.3s, stroke 0.3s" }}
              />
              {node.id === 0 && (
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fontFamily="var(--font-mono, monospace)"
                  fill={tcolor}
                  className="select-none pointer-events-none"
                  style={{ transition: "fill 0.3s" }}
                >
                  ε
                </text>
              )}
              {node.isLeaf && node.suffixIndex !== null && (
                <text
                  x={pos.x} y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={9}
                  fontFamily="var(--font-mono, monospace)"
                  fill={tcolor}
                  className="select-none pointer-events-none"
                  style={{ transition: "fill 0.3s" }}
                >
                  {node.suffixIndex}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function STDemo() {
  const { t } = useLang();
  const [input, setInput] = useState(DEFAULT_STR);
  const [str, setStr] = useState(DEFAULT_STR);
  const [frames, setFrames] = useState<STFrame[]>([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (str) {
      const fs = computeSTFrames(str);
      setFrames(fs);
      setIdx(0);
      setPlaying(false);
    }
  }, [str]);

  useEffect(() => {
    if (!playing || idx >= frames.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setIdx(i => i + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, idx, frames.length]);

  function apply() {
    const s = input.trim().toLowerCase();
    if (!/^[a-z]+$/.test(s)) { setError(t("st.demo.err.alpha")); return; }
    if (s.length < 2) { setError(t("st.demo.err.short")); return; }
    if (s.length > MAX_LEN) { setError(t("st.demo.err.long")); return; }
    setError("");
    setStr(s);
  }

  const frame = frames[idx] ?? null;
  const sc = frame ? actionColor(frame.action) : "var(--color-muted)";

  // Current suffix display
  const currentSuffixStr = frame?.currentSuffix !== null && frame?.currentSuffix !== undefined
    ? frame.str.slice(frame.currentSuffix)
    : null;
  const suffixStartIdx = frame?.currentSuffix ?? 0;

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("st.demo.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("st.demo.hint")}</p>
      </SectionCard>

      {/* Input */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">{t("st.demo.input.string")}</label>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={MAX_LEN}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] w-44"
            />
          </div>
          <button
            onClick={apply}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 cursor-pointer"
          >
            {t("st.demo.apply")}
          </button>
        </div>
        {error && <p className="text-xs text-[var(--color-danger)] mt-2">{error}</p>}
      </div>

      <StepControls
        isPlaying={playing}
        isAtEnd={idx >= frames.length - 1}
        stepIdx={idx}
        totalSteps={frames.length}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onNext={() => { setPlaying(false); setIdx(i => Math.min(frames.length - 1, i + 1)); }}
        onPrev={() => { setPlaying(false); setIdx(i => Math.max(0, i - 1)); }}
        onReset={() => { setIdx(0); setPlaying(false); }}
      />

      {/* SVG */}
      {frame && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <STSVG frame={frame} />
        </div>
      )}

      {/* Current suffix being inserted */}
      {frame && frame.currentSuffix !== null && currentSuffixStr && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs text-[var(--color-muted)] mb-2 font-mono uppercase tracking-wide">
            Inserting suffix {frame.currentSuffix}
          </p>
          <div className="flex flex-wrap gap-1">
            {frame.str.split("").map((ch, i) => {
              const inSuffix = i >= suffixStartIdx;
              return (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center rounded text-sm font-mono border"
                  style={{
                    background: inSuffix ? "var(--color-accent)" : "var(--color-surface-2)",
                    borderColor: inSuffix ? "var(--color-accent)" : "var(--color-border)",
                    color: inSuffix ? "white" : "var(--color-muted)",
                    opacity: inSuffix ? 1 : 0.4,
                  }}
                >
                  {ch}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--color-muted)] mt-1 font-mono">
            "{currentSuffixStr}"
          </p>
        </div>
      )}

      {/* Step message */}
      <div
        className="px-3 py-2 rounded-lg border text-sm font-mono min-h-[2.2rem]"
        style={{ borderColor: sc, color: sc, background: "var(--color-surface)" }}
      >
        {frame ? frame.message : t("st.demo.hint")}
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap gap-4">
          {[
            { color: "var(--color-accent-2)", label: t("st.demo.legend.root"), circle: true, stroke: "var(--color-accent-2)" },
            { color: "var(--color-surface-2)", label: t("st.demo.legend.internal"), circle: true, stroke: "var(--color-border)" },
            { color: "rgba(var(--color-accent-rgb, 99,102,241), 0.15)", label: t("st.demo.legend.leaf"), circle: true, stroke: "var(--color-accent)" },
            { color: "var(--color-accent-2)", label: t("st.demo.legend.new"), circle: true, stroke: "var(--color-accent-2)" },
            { color: "var(--color-accent-3)", label: t("st.demo.legend.highlight"), circle: true, stroke: "var(--color-accent-3)" },
          ].map(({ color, label, stroke }) => (
            <div key={label} className="flex items-center gap-1.5">
              <svg width={18} height={18} style={{ flexShrink: 0 }}>
                <circle cx={9} cy={9} r={7} fill={color} stroke={stroke} strokeWidth={1.5} />
              </svg>
              <span className="text-xs text-[var(--color-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
