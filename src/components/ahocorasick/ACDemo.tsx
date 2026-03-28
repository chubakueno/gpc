import { useState, useEffect, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { computeACFrames, layoutAC, getPath, NODE_R } from "./acOps";
import type { ACFrame } from "@/types/ahocorasick";

const DEFAULT_PATTERNS = ["he", "she", "his", "hers", "ache", "apache"];
const INTERVAL = 900;

// ─── Edge label position ──────────────────────────────────────────────────────
function edgeLabelPos(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: mx - (dy / len) * 12, y: my + (dx / len) * 12 };
}

// ─── SVG ──────────────────────────────────────────────────────────────────────
function ACSVG({ frame }: { frame: ACFrame }) {
  const layout = useMemo(() => layoutAC(frame.nodes), [frame.nodes]);
  const { positions, width, height } = layout;

  const visibleFailSet = useMemo(
    () => new Set(frame.visibleFailIds),
    [frame.visibleFailIds]
  );
  const visibleDictSet = useMemo(
    () => new Set(frame.visibleDictIds),
    [frame.visibleDictIds]
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: "block", minWidth: width }}
      aria-label="Aho-Corasick automaton visualization"
    >
      <defs>
        <marker id="arrow-fail" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--color-warn)" />
        </marker>
        <marker id="arrow-dict" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="var(--color-accent-2)" />
        </marker>
      </defs>

      {/* ── Tree edges ───────────────────────────────────────────────────── */}
      {frame.nodes.map((node) => {
        if (node.parentId === null) return null;
        const pPos = positions.get(node.parentId);
        const cPos = positions.get(node.id);
        if (!pPos || !cPos) return null;

        const px = pPos.x;
        const py = pPos.y;
        const cx = cPos.x;
        const cy = cPos.y;
        const dx = cx - px;
        const dy = cy - py;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const sx = px + (dx / dist) * NODE_R;
        const sy = py + (dy / dist) * NODE_R;
        const ex = cx - (dx / dist) * NODE_R;
        const ey = cy - (dy / dist) * NODE_R;
        const lp = edgeLabelPos(sx, sy, ex, ey);

        return (
          <g key={`edge-${node.id}`}>
            <line
              x1={sx} y1={sy}
              x2={ex} y2={ey}
              stroke="var(--color-border)"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <rect
              x={lp.x - 9} y={lp.y - 8}
              width={18} height={16}
              rx={3}
              fill="var(--color-bg)"
              stroke="var(--color-border)"
              strokeWidth={0.8}
            />
            <text
              x={lp.x} y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fontFamily="var(--font-mono, monospace)"
              fill="var(--color-muted)"
            >
              {node.char}
            </text>
          </g>
        );
      })}

      {/* ── Fail links (non-animating, rendered first) ───────────────────── */}
      {frame.nodes.map((node) => {
        if (node.id === 0) return null;
        if (!visibleFailSet.has(node.id)) return null;
        if (node.id === frame.newFailFrom) return null; // render last

        const fromPos = positions.get(node.id);
        const toPos = positions.get(node.failId);
        if (!fromPos || !toPos) return null;

        const x1 = fromPos.x;
        const y1 = fromPos.y;
        const x2 = toPos.x;
        const y2 = toPos.y;
        const offset = Math.max(50, 40 + (y1 - y2) * 0.2);

        return (
          <path
            key={`fail-${node.id}`}
            d={`M ${x1} ${y1} C ${x1 - offset} ${y1} ${x2 - offset} ${y2} ${x2} ${y2}`}
            fill="none"
            stroke="var(--color-warn)"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            markerEnd="url(#arrow-fail)"
            opacity={0.7}
          />
        );
      })}

      {/* ── Dict links (non-animating, rendered first) ───────────────────── */}
      {frame.nodes.map((node) => {
        if (node.id === 0) return null;
        if (!visibleDictSet.has(node.id)) return null;
        if (node.id === frame.newDictFrom) return null; // render last
        if (node.dictId === null) return null;

        const fromPos = positions.get(node.id);
        const toPos = positions.get(node.dictId);
        if (!fromPos || !toPos) return null;

        const x1 = fromPos.x;
        const y1 = fromPos.y;
        const x2 = toPos.x;
        const y2 = toPos.y;
        const offset = Math.max(50, 40 + (y1 - y2) * 0.2);

        return (
          <path
            key={`dict-${node.id}`}
            d={`M ${x1} ${y1} C ${x1 + offset} ${y1} ${x2 + offset} ${y2} ${x2} ${y2}`}
            fill="none"
            stroke="var(--color-accent-2)"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            markerEnd="url(#arrow-dict)"
            opacity={0.7}
          />
        );
      })}

      {/* ── Animating fail link (on top) ─────────────────────────────────── */}
      {frame.newFailFrom !== undefined && (() => {
        const node = frame.nodes.find((n) => n.id === frame.newFailFrom);
        if (!node) return null;
        const fromPos = positions.get(node.id);
        const toPos = positions.get(node.failId);
        if (!fromPos || !toPos) return null;

        const x1 = fromPos.x;
        const y1 = fromPos.y;
        const x2 = toPos.x;
        const y2 = toPos.y;
        const offset = Math.max(50, 40 + (y1 - y2) * 0.2);

        return (
          <path
            key={`fail-anim-${node.id}`}
            d={`M ${x1} ${y1} C ${x1 - offset} ${y1} ${x2 - offset} ${y2} ${x2} ${y2}`}
            fill="none"
            stroke="var(--color-warn)"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            markerEnd="url(#arrow-fail)"
            opacity={1}
          />
        );
      })()}

      {/* ── Animating dict link (on top) ──────────────────────────────────── */}
      {frame.newDictFrom !== undefined && (() => {
        const node = frame.nodes.find((n) => n.id === frame.newDictFrom);
        if (!node || node.dictId === null) return null;
        const fromPos = positions.get(node.id);
        const toPos = positions.get(node.dictId);
        if (!fromPos || !toPos) return null;

        const x1 = fromPos.x;
        const y1 = fromPos.y;
        const x2 = toPos.x;
        const y2 = toPos.y;
        const offset = Math.max(50, 40 + (y1 - y2) * 0.2);

        return (
          <path
            key={`dict-anim-${node.id}`}
            d={`M ${x1} ${y1} C ${x1 + offset} ${y1} ${x2 + offset} ${y2} ${x2} ${y2}`}
            fill="none"
            stroke="var(--color-accent-2)"
            strokeWidth={2.5}
            strokeDasharray="3 3"
            markerEnd="url(#arrow-dict)"
            opacity={1}
          />
        );
      })()}

      {/* ── Nodes ────────────────────────────────────────────────────────── */}
      {frame.nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const { x, y } = pos;
        const isActive = frame.activeId === node.id;
        const isAnimFail = frame.newFailFrom === node.id || frame.newDictFrom === node.id;

        let fill: string;
        let stroke: string;
        let strokeWidth = 2;
        let textFill: string;

        if (isActive) {
          fill = "var(--color-accent)";
          stroke = "var(--color-accent)";
          textFill = "white";
        } else if (isAnimFail) {
          fill = "var(--color-warn)";
          stroke = "var(--color-warn)";
          textFill = "white";
        } else if (node.isEnd) {
          fill = "var(--color-surface-2)";
          stroke = "var(--color-accent-3)";
          strokeWidth = 2.5;
          textFill = "var(--color-text)";
        } else if (node.id === 0) {
          fill = "var(--color-surface-2)";
          stroke = "var(--color-muted)";
          textFill = "var(--color-muted)";
        } else {
          fill = "var(--color-surface-2)";
          stroke = "var(--color-border)";
          textFill = "var(--color-text)";
        }

        const label = node.id === 0 ? "ε" : node.char;
        const pathStr = node.id === 0 ? null : (node.depth <= 3 ? getPath(frame.nodes, node.id) : null);

        return (
          <g key={`node-${node.id}`}>
            {/* Double ring for terminal nodes */}
            {node.isEnd && !isActive && (
              <circle
                cx={x} cy={y} r={NODE_R + 4}
                fill="none"
                stroke="var(--color-accent-3)"
                strokeWidth={1.5}
                opacity={0.4}
              />
            )}
            <circle
              cx={x} cy={y} r={NODE_R}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              style={{ transition: "fill 0.2s, stroke 0.2s" }}
            />
            <text
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={node.id === 0 ? 13 : 14}
              fontWeight="bold"
              fontFamily="var(--font-mono, monospace)"
              fill={textFill}
              style={{ transition: "fill 0.2s" }}
            >
              {label}
            </text>
            {/* Path label below node */}
            {pathStr && (
              <text
                x={x} y={y + NODE_R + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fontFamily="var(--font-mono, monospace)"
                fill="var(--color-muted)"
              >
                {pathStr}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Main Demo ────────────────────────────────────────────────────────────────
export function ACDemo() {
  const { t } = useLang();

  const [patterns, setPatterns] = useState<string[]>(DEFAULT_PATTERNS);
  const [input, setInput] = useState("");
  const [frames, setFrames] = useState<ACFrame[]>(() => computeACFrames(DEFAULT_PATTERNS));
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Auto-play
  useEffect(() => {
    if (!playing || step >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, step, frames.length]);

  function addPattern() {
    const val = input.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (!val || val.length > 10) return;
    if (patterns.length >= 6) return;
    if (patterns.includes(val)) {
      setInput("");
      return;
    }
    const newPatterns = [...patterns, val];
    setPatterns(newPatterns);
    setFrames(computeACFrames(newPatterns));
    setStep(0);
    setPlaying(false);
    setInput("");
  }

  function removePattern(idx: number) {
    const newPatterns = patterns.filter((_, i) => i !== idx);
    setPatterns(newPatterns);
    setFrames(computeACFrames(newPatterns));
    setStep(0);
    setPlaying(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") addPattern();
  }

  const frame = frames[step] ?? null;
  const total = frames.length;

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">
          {t("ac.demo.title")}
        </h2>
      </SectionCard>

      {/* Pattern editor */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-xs text-[var(--color-muted)] mb-2 font-medium uppercase tracking-wide">
          {t("ac.demo.patterns.label")}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {patterns.map((p, i) => (
            <span
              key={p}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-mono bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
            >
              {p}
              <button
                onClick={() => removePattern(i)}
                className="ml-0.5 text-[var(--color-accent)] hover:text-[var(--color-danger)] transition-colors cursor-pointer leading-none"
                aria-label={`Remove pattern ${p}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        {patterns.length >= 8 ? (
          <p className="text-xs text-[var(--color-warn)]">{t("ac.demo.patterns.max")}</p>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10))}
              onKeyDown={handleKeyDown}
              placeholder={t("ac.demo.patterns.placeholder")}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] w-44"
              maxLength={10}
            />
            <button
              onClick={addPattern}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 cursor-pointer"
            >
              {t("ac.demo.patterns.add")}
            </button>
          </div>
        )}
      </div>

      {/* SVG + controls */}
      {patterns.length === 0 || frames.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <p className="text-[var(--color-muted)] text-sm">{t("ac.demo.empty")}</p>
        </div>
      ) : (
        <>
          {/* SVG visualization */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-auto"
            style={{ minHeight: 200 }}>
            {frame && <ACSVG frame={frame} />}
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0 border-t border-[var(--color-border)]" style={{ borderWidth: 1.5 }} />
                <span className="text-xs text-[var(--color-muted)]">{t("ac.demo.legend.tree")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="28" height="10">
                  <line x1="0" y1="5" x2="24" y2="5" stroke="var(--color-warn)" strokeWidth="1.5" strokeDasharray="5 3" />
                  <polygon points="20,2 28,5 20,8" fill="var(--color-warn)" />
                </svg>
                <span className="text-xs text-[var(--color-muted)]">{t("ac.demo.legend.fail")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="28" height="10">
                  <line x1="0" y1="5" x2="24" y2="5" stroke="var(--color-accent-2)" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polygon points="20,2 28,5 20,8" fill="var(--color-accent-2)" />
                </svg>
                <span className="text-xs text-[var(--color-muted)]">{t("ac.demo.legend.dict")}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="20" height="20">
                  <circle cx="10" cy="10" r="7" fill="none" stroke="var(--color-accent-3)" strokeWidth="1.5" opacity="0.6" />
                  <circle cx="10" cy="10" r="5" fill="var(--color-surface-2)" stroke="var(--color-accent-3)" strokeWidth="1.5" />
                </svg>
                <span className="text-xs text-[var(--color-muted)]">{t("ac.demo.legend.terminal")}</span>
              </div>
            </div>
          </div>

          {/* Step message */}
          <div
            className="px-3 py-2 rounded-lg border text-sm font-mono min-h-[2.2rem]"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)", background: "var(--color-surface)" }}
          >
            {frame ? frame.message : ""}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setPlaying(false); setStep(0); }}
              disabled={step <= 0}
              className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >|◀</button>
            <button
              onClick={() => { setPlaying(false); setStep((s) => Math.max(0, s - 1)); }}
              disabled={step <= 0}
              className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >{t("controls.prev")}</button>
            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={step >= total - 1}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >
              {playing ? t("controls.pause") : t("controls.play")}
            </button>
            <button
              onClick={() => { setPlaying(false); setStep((s) => Math.min(total - 1, s + 1)); }}
              disabled={step >= total - 1}
              className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default"
            >{t("controls.step")}</button>
            <span className="text-xs text-[var(--color-muted)] ml-1">
              {t("controls.step.of")
                .replace("{n}", String(step + 1))
                .replace("{total}", String(total))}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
