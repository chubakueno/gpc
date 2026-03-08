import { useState, useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { computeSAFrames, computeLCP } from "./saOps";
import type { SAFrame } from "@/types/suffixarray";

const DEFAULT_STR = "banana";
const INTERVAL    = 800;
const MAX_LEN     = 14;

// ─── Suffix row ────────────────────────────────────────────────────────────────

function SuffixRow({
  pos, idx, suffix, k, rank, isNew,
}: {
  pos: number; idx: number; suffix: string; k: number; rank: number; isNew?: boolean;
}) {
  const pivot = Math.min(k, suffix.length);
  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-mono transition-colors duration-300 ${isNew ? "bg-[var(--color-accent)]/10" : ""}`}>
      <span className="w-6 text-right text-[var(--color-muted)] text-xs flex-shrink-0">{pos}</span>
      <span className="w-6 text-right text-[var(--color-accent)] flex-shrink-0">{idx}</span>
      <span className="flex-1 min-w-0">
        {k > 0 ? (
          <>
            <span className="text-[var(--color-accent-3)] font-bold">{suffix.slice(0, pivot)}</span>
            <span className="text-[var(--color-muted)]">{suffix.slice(pivot)}</span>
          </>
        ) : (
          <span className="text-[var(--color-text)]">{suffix}</span>
        )}
      </span>
      <span className="w-10 text-right text-[var(--color-accent-2)] text-xs flex-shrink-0">{rank}</span>
    </div>
  );
}

// ─── LCP display ───────────────────────────────────────────────────────────────

function LCPDisplay({ s, sa, lcp }: { s: string; sa: number[]; lcp: number[] }) {
  return (
    <div className="overflow-x-auto mt-4">
      <p className="text-xs text-[var(--color-muted)] mb-2 font-mono uppercase tracking-wide">LCP array (Kasai)</p>
      <table className="text-xs font-mono border-collapse">
        <tbody>
          <tr>
            <td className="pr-4 text-[var(--color-muted)]">SA[i]</td>
            {sa.map((v, i) => (
              <td key={i} className="w-8 text-center text-[var(--color-accent)]">{v}</td>
            ))}
          </tr>
          <tr>
            <td className="pr-4 text-[var(--color-muted)]">suffix</td>
            {sa.map((v, i) => (
              <td key={i} className="w-8 text-center text-[var(--color-text)]">{s[v]}</td>
            ))}
          </tr>
          <tr>
            <td className="pr-4 text-[var(--color-muted)]">LCP</td>
            {lcp.map((v, i) => (
              <td key={i} className={`w-8 text-center font-bold ${v > 0 ? "text-[var(--color-accent-3)]" : "text-[var(--color-border)]"}`}>
                {i === 0 ? "—" : v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── Status color ──────────────────────────────────────────────────────────────

function statusColor(action: SAFrame["action"]): string {
  if (action === "done")      return "var(--color-accent-3)";
  if (action === "sort_step") return "var(--color-accent-2)";
  return "var(--color-muted)";
}

// ─── Main demo ─────────────────────────────────────────────────────────────────

export function SADemo() {
  const { t } = useLang();
  const [input,   setInput]   = useState(DEFAULT_STR);
  const [str,     setStr]     = useState(DEFAULT_STR);
  const [frames,  setFrames]  = useState<SAFrame[]>([]);
  const [lcp,     setLcp]     = useState<number[]>([]);
  const [idx,     setIdx]     = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (str) {
      const fs = computeSAFrames(str);
      setFrames(fs);
      setIdx(0);
      setPlaying(false);
      // Compute LCP from the final SA
      const finalOrder = fs[fs.length - 1].order;
      setLcp(computeLCP(str, finalOrder));
    }
  }, [str]);

  useEffect(() => {
    if (!playing || idx >= frames.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setIdx(i => i + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, idx, frames.length]);

  function apply() {
    const s = input.trim().toLowerCase();
    if (!/^[a-z]+$/.test(s)) { setError(t("sa.demo.err.alpha")); return; }
    if (s.length < 2)        { setError(t("sa.demo.err.short")); return; }
    if (s.length > MAX_LEN)  { setError(t("sa.demo.err.long"));  return; }
    setError("");
    setStr(s);
  }

  const frame = frames[idx] ?? null;
  const sc    = frame ? statusColor(frame.action) : "var(--color-muted)";
  const isDone = frame?.action === "done";

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("sa.demo.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("sa.demo.desc")}</p>
      </SectionCard>

      {/* Input */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">{t("sa.demo.input.string")}</label>
            <input value={input} onChange={e => setInput(e.target.value)} maxLength={MAX_LEN}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] w-44" />
          </div>
          <button onClick={apply}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 cursor-pointer">
            {t("sa.demo.apply")}
          </button>
        </div>
        {error && <p className="text-xs text-[var(--color-danger)] mt-2">{error}</p>}
      </div>

      {/* Suffix table */}
      {frame && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-1">
          {/* Header */}
          <div className="flex items-center gap-3 px-3 pb-2 border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] font-mono">
            <span className="w-6 text-right flex-shrink-0">{t("sa.demo.col.pos")}</span>
            <span className="w-6 text-right flex-shrink-0">{t("sa.demo.col.idx")}</span>
            <span className="flex-1">{t("sa.demo.col.suffix")}</span>
            <span className="w-10 text-right flex-shrink-0">{t("sa.demo.col.rank")}</span>
          </div>

          {frame.order.map((suffixIdx, pos) => (
            <SuffixRow
              key={suffixIdx}
              pos={pos}
              idx={suffixIdx}
              suffix={str.slice(suffixIdx)}
              k={frame.k}
              rank={frame.rank[suffixIdx]}
            />
          ))}

          {/* LCP table shown when done */}
          {isDone && lcp.length > 0 && (
            <LCPDisplay s={str} sa={frame.order} lcp={lcp} />
          )}
        </div>
      )}

      {/* Step message */}
      <div className="px-3 py-2 rounded-lg border text-sm font-mono min-h-[2.2rem]"
        style={{ borderColor: sc, color: sc, background: "var(--color-surface)" }}>
        {frame ? frame.message : t("sa.demo.hint")}
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
            { color: "var(--color-accent)",    label: t("sa.legend.index") },
            { color: "var(--color-accent-3)",  label: t("sa.legend.prefix") },
            { color: "var(--color-accent-2)",  label: t("sa.legend.rank") },
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
