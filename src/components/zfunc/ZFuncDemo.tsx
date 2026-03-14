import { useState, useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { computeZFrames } from "./zfuncOps";
import type { ZFrame, ZAction } from "@/types/zfunc";

const DEFAULT_STR = "aabaabaab";
const CELL_W      = 32;
const INTERVAL    = 700;
const MAX_LEN     = 18;

// ─── Cell ─────────────────────────────────────────────────────────────────────

type CellState =
  | "default" | "zbox" | "current"
  | "match" | "mismatch" | "compare" | "set";

function cellState(pos: number, frame: ZFrame): CellState {
  const { i, l, r, action, prefixPos, strPos } = frame;
  if (action === "done" || action === "start") return "default";

  const isCompare = pos === prefixPos || pos === strPos;
  if (isCompare) {
    if (action === "extend_match")    return "match";
    if (action === "extend_mismatch") return "mismatch";
    if (action === "cache")           return "compare";
  }
  if (pos === i && action !== "set") return "current";
  if (l > 0 && pos >= l && pos <= r) return "zbox";
  return "default";
}

function CharCell({ ch, state, idx }: { ch: string; state: CellState; idx?: number }) {
  const style: Record<CellState, string> = {
    default:  "border-[var(--color-border)]  bg-[var(--color-surface-2)] text-[var(--color-text)]",
    zbox:     "border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/15 text-[var(--color-text)]",
    current:  "border-[var(--color-warn)]    bg-[var(--color-warn)]/20 text-[var(--color-warn)] font-bold",
    match:    "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/30 text-[var(--color-accent-3)] font-bold",
    mismatch: "border-[var(--color-danger)]   bg-[var(--color-danger)]/20 text-[var(--color-danger)] font-bold",
    compare:  "border-[var(--color-accent)]   bg-[var(--color-accent)]/20 text-[var(--color-accent)]",
    set:      "border-[var(--color-border)]  bg-[var(--color-surface-2)] text-[var(--color-text)]",
  };
  return (
    <div className="flex flex-col items-center" style={{ width: CELL_W }}>
      <div className={`w-7 h-7 flex items-center justify-center rounded border text-sm font-mono transition-colors duration-150 ${style[state]}`}>
        {ch}
      </div>
      {idx !== undefined && (
        <span className="text-[9px] text-[var(--color-muted)] font-mono leading-none mt-0.5">{idx}</span>
      )}
    </div>
  );
}

// ─── Z-array table ─────────────────────────────────────────────────────────────

function ZTable({ s, z, highlightI }: { s: string; z: number[]; highlightI?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs font-mono border-collapse">
        <tbody>
          <tr>
            <td className="pr-3 text-[var(--color-muted)] text-right whitespace-nowrap">i</td>
            {Array.from(s).map((_, i) => (
              <td key={i} className="w-7 text-center text-[var(--color-muted)]">{i}</td>
            ))}
          </tr>
          <tr>
            <td className="pr-3 text-[var(--color-muted)] text-right whitespace-nowrap">s[i]</td>
            {Array.from(s).map((ch, i) => (
              <td key={i} className={`w-7 text-center font-bold ${i === highlightI ? "text-[var(--color-warn)]" : "text-[var(--color-text)]"}`}>
                {ch}
              </td>
            ))}
          </tr>
          <tr>
            <td className="pr-3 text-[var(--color-muted)] text-right whitespace-nowrap">z[i]</td>
            {z.map((v, i) => (
              <td key={i} className={`w-7 text-center ${
                v === -1 ? "text-[var(--color-border)]" :
                i === highlightI ? "text-[var(--color-accent-3)] font-bold" :
                "text-[var(--color-accent-2)]"
              }`}>
                {v === -1 ? "·" : v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Status color ──────────────────────────────────────────────────────────────

function statusColor(action: ZAction): string {
  switch (action) {
    case "extend_match":    return "var(--color-accent-3)";
    case "extend_mismatch": return "var(--color-danger)";
    case "cache":           return "var(--color-accent)";
    case "set":             return "var(--color-accent-2)";
    case "done":            return "var(--color-accent-3)";
    default:                return "var(--color-muted)";
  }
}

// ─── Main demo ─────────────────────────────────────────────────────────────────

export function ZFuncDemo() {
  const { t } = useLang();
  const [input,   setInput]   = useState(DEFAULT_STR);
  const [str,     setStr]     = useState(DEFAULT_STR);
  const [frames,  setFrames]  = useState<ZFrame[]>([]);
  const [idx,     setIdx]     = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (str) {
      setFrames(computeZFrames(str));
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
    if (!/^[a-z]+$/.test(s)) { setError(t("zfunc.demo.err.alpha")); return; }
    if (s.length < 2)        { setError(t("zfunc.demo.err.short")); return; }
    if (s.length > MAX_LEN)  { setError(t("zfunc.demo.err.long"));  return; }
    setError("");
    setStr(s);
  }

  const frame = frames[idx] ?? null;
  const sc    = frame ? statusColor(frame.action) : "var(--color-muted)";
  const highlightI = frame && frame.action !== "done" && frame.action !== "start" ? frame.i : undefined;

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("zfunc.demo.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("zfunc.demo.desc")}</p>
      </SectionCard>

      {/* Input */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">{t("zfunc.demo.input.string")}</label>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              maxLength={MAX_LEN}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] w-48"
            />
          </div>
          <button onClick={apply}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 cursor-pointer">
            {t("zfunc.demo.apply")}
          </button>
        </div>
        {error && <p className="text-xs text-[var(--color-danger)] mt-2">{error}</p>}
      </div>

      {/* Visualization */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-x-auto space-y-4">
        {/* String cells */}
        <div>
          <p className="text-xs text-[var(--color-muted)] mb-2 font-mono">{t("zfunc.demo.string.label")}</p>
          <div className="flex flex-nowrap">
            {Array.from(str).map((ch, i) => (
              <CharCell key={i} ch={ch} idx={i}
                state={frame ? cellState(i, frame) : "default"} />
            ))}
          </div>
          {/* L / R markers */}
          {frame && frame.action !== "start" && frame.action !== "done" && (
            <div className="flex flex-nowrap mt-0.5">
              {Array.from(str).map((_, i) => {
                const isL = i === frame.l;
                const isR = i === frame.r;
                const label = isL && isR ? "[l=r]" : isL ? "[l" : isR ? "r]" : "";
                return (
                  <div key={i} className="flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{ width: CELL_W, color: label ? "var(--color-accent-2)" : "transparent" }}>
                    {label || "·"}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Z-box info */}
        {frame && frame.action !== "start" && frame.action !== "done" && (
          <div className="text-xs font-mono text-[var(--color-accent-2)]">
            {t("zfunc.demo.zbox.label")}:&nbsp;
            {frame.l > 0 ? (
              <>
                <span className="font-bold">[{frame.l}, {frame.r}]</span>
                <span className="text-[var(--color-muted)]"> — s[{frame.l}..{frame.r}] = s[0..{frame.r - frame.l}]</span>
              </>
            ) : (
              <span className="text-[var(--color-muted)]">{t("zfunc.demo.zbox.empty")}</span>
            )}
          </div>
        )}

        {/* Z-array table */}
        {frame && (
          <div>
            <p className="text-xs text-[var(--color-muted)] mb-2 font-mono">{t("zfunc.demo.table.label")}</p>
            <ZTable s={str} z={frame.z} highlightI={highlightI} />
          </div>
        )}
      </div>

      {/* Step message */}
      <div className="px-3 py-2 rounded-lg border text-sm font-mono min-h-[2.2rem]"
        style={{ borderColor: sc, color: sc, background: "var(--color-surface)" }}>
        {frame ? frame.message : t("zfunc.demo.hint")}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setIdx(0)} disabled={idx <= 0}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">|◀</button>
        <button onClick={() => { setPlaying(false); setIdx(i => Math.max(0, i - 1)); }} disabled={idx <= 0}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">{t("controls.prev")}</button>
        <button onClick={() => setPlaying(p => !p)} disabled={idx >= frames.length - 1}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 disabled:opacity-30 cursor-pointer disabled:cursor-default">
          {playing ? t("controls.pause") : t("controls.play")}
        </button>
        <button onClick={() => { setPlaying(false); setIdx(i => Math.min(frames.length - 1, i + 1)); }} disabled={idx >= frames.length - 1}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">{t("controls.step")}</button>
        <span className="text-xs text-[var(--color-muted)] ml-1">
          {t("controls.step.of").replace("{n}", String(idx + 1)).replace("{total}", String(frames.length))}
        </span>
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap gap-4">
          {[
            { color: "var(--color-warn)",      label: t("zfunc.legend.current") },
            { color: "var(--color-accent-2)",  label: t("zfunc.legend.zbox") },
            { color: "var(--color-accent)",    label: t("zfunc.legend.compare") },
            { color: "var(--color-accent-3)",  label: t("zfunc.legend.match") },
            { color: "var(--color-danger)",    label: t("zfunc.legend.mismatch") },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border-2 flex-shrink-0" style={{ borderColor: color, background: color + "33" }} />
              <span className="text-xs text-[var(--color-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
