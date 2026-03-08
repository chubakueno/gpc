import { useState, useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";
import { computeKMPFrames, computeFailFrames } from "./kmpOps";
import type { KMPFrame, FailFrame } from "@/types/kmp";

const DEFAULT_TEXT    = "aababacabababa";
const DEFAULT_PATTERN = "ababa";
const CELL_W = 32; // px per character cell
const INTERVAL = 650;

// ─── Character cell ───────────────────────────────────────────────────────────

type CellState = "default" | "matched" | "current_match" | "current_mismatch" | "current_compare" | "found" | "prev_match";

function CharCell({ ch, state, idx }: { ch: string; state: CellState; idx?: number }) {
  const styles: Record<CellState, string> = {
    default:           "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]",
    matched:           "border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)]",
    current_match:     "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/30 text-[var(--color-accent-3)] font-bold",
    current_mismatch:  "border-[var(--color-danger)] bg-[var(--color-danger)]/20 text-[var(--color-danger)] font-bold",
    current_compare:   "border-[var(--color-warn)] bg-[var(--color-warn)]/20 text-[var(--color-warn)]",
    found:             "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/30 text-[var(--color-accent-3)] font-bold",
    prev_match:        "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]",
  };

  return (
    <div className="flex flex-col items-center" style={{ width: CELL_W }}>
      <div
        className={`w-7 h-7 flex items-center justify-center rounded border text-sm font-mono transition-colors duration-150 ${styles[state]}`}
      >
        {ch}
      </div>
      {idx !== undefined && (
        <span className="text-[9px] text-[var(--color-muted)] font-mono leading-none mt-0.5">{idx}</span>
      )}
    </div>
  );
}

// ─── Fail table ───────────────────────────────────────────────────────────────

function FailTable({
  pattern,
  fail,
  highlightI,
}: {
  pattern: string;
  fail: number[];
  highlightI?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs font-mono border-collapse">
        <tbody>
          <tr>
            <td className="pr-3 text-[var(--color-muted)] text-right">i</td>
            {Array.from(pattern).map((_, i) => (
              <td key={i} className="w-7 text-center text-[var(--color-muted)]">{i}</td>
            ))}
          </tr>
          <tr>
            <td className="pr-3 text-[var(--color-muted)] text-right">P[i]</td>
            {Array.from(pattern).map((ch, i) => (
              <td key={i}
                className={`w-7 text-center font-bold ${i === highlightI ? "text-[var(--color-warn)]" : "text-[var(--color-text)]"}`}>
                {ch}
              </td>
            ))}
          </tr>
          <tr>
            <td className="pr-3 text-[var(--color-muted)] text-right">fail</td>
            {fail.map((v, i) => (
              <td key={i}
                className={`w-7 text-center ${
                  i === highlightI
                    ? "text-[var(--color-accent-3)] font-bold"
                    : "text-[var(--color-accent-2)]"
                }`}>
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ─── KMP Search sub-tab ───────────────────────────────────────────────────────

function SearchTab({ text, pattern }: { text: string; pattern: string }) {
  const { t } = useLang();
  const [frames, setFrames] = useState<KMPFrame[]>([]);
  const [fail, setFail]     = useState<number[]>([]);
  const [idx, setIdx]       = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (text && pattern) {
      const result = computeKMPFrames(text, pattern);
      setFrames(result.frames);
      setFail(result.fail);
      setIdx(0);
      setPlaying(false);
    }
  }, [text, pattern]);

  useEffect(() => {
    if (!playing || idx >= frames.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setIdx(i => i + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, idx, frames.length]);

  const frame = frames[idx] ?? null;
  const m = pattern.length;

  function textState(pos: number): CellState {
    if (!frame) return "default";
    const { i, j, action, matches } = frame;
    // Previously found complete matches
    for (const start of matches) {
      if (action !== "found" || start !== i - m + 1) {
        if (pos >= start && pos < start + m) return "prev_match";
      }
    }
    const offset = i - j;
    if (action === "found") {
      if (pos >= offset && pos <= i) return "found";
      return "default";
    }
    if (pos === i) {
      if (action === "match") return "current_match";
      if (action === "mismatch" || action === "no_match") return "current_mismatch";
      if (action === "fallback") return "current_compare";
    }
    if (pos >= offset && pos < i) return "matched";
    return "default";
  }

  function patternState(pos: number): CellState {
    if (!frame) return "default";
    const { j, action } = frame;
    if (action === "found") return "found";
    if (action === "done") return "default";
    if (pos === j) {
      if (action === "match") return "current_match";
      if (action === "mismatch" || action === "no_match") return "current_mismatch";
      if (action === "fallback") return "current_compare";
    }
    if (pos < j) return "matched";
    return "default";
  }

  const offset = frame ? Math.max(0, frame.i - frame.j) : 0;

  const statusColor = !frame ? "var(--color-muted)"
    : frame.action === "found"  ? "var(--color-accent-3)"
    : frame.action === "done"   ? (frame.matches.length > 0 ? "var(--color-accent-3)" : "var(--color-muted)")
    : frame.action === "mismatch" || frame.action === "no_match" ? "var(--color-danger)"
    : frame.action === "match"  ? "var(--color-accent-3)"
    : frame.action === "fallback" ? "var(--color-warn)"
    : "var(--color-accent-2)";

  return (
    <div className="space-y-4">
      {/* Visualization */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-x-auto">
        <p className="text-xs text-[var(--color-muted)] mb-2 font-mono">{t("kmp.demo.text.label")}</p>
        <div className="flex flex-nowrap mb-1">
          {Array.from(text).map((ch, i) => (
            <CharCell key={i} ch={ch} state={textState(i)} idx={i} />
          ))}
        </div>

        <p className="text-xs text-[var(--color-muted)] mt-3 mb-1 font-mono">{t("kmp.demo.pattern.label")}</p>
        <div className="flex flex-nowrap" style={{ paddingLeft: `${offset * CELL_W}px` }}>
          {Array.from(pattern).map((ch, i) => (
            <CharCell key={i} ch={ch} state={patternState(i)} />
          ))}
        </div>

        {/* i/j pointers */}
        {frame && frame.action !== "done" && (
          <div className="flex flex-nowrap mt-1 relative" style={{ height: 14 }}>
            <div style={{ width: frame.i * CELL_W + CELL_W / 2, position: "relative" }}>
              <span className="absolute right-0 text-[9px] font-mono text-[var(--color-warn)] -translate-x-1/2">i={frame.i}</span>
            </div>
          </div>
        )}
      </div>

      {/* Step message */}
      <div className="px-3 py-2 rounded-lg border text-sm font-mono min-h-[2.2rem]"
        style={{ borderColor: statusColor, color: statusColor, background: "var(--color-surface)" }}>
        {frame ? frame.message : t("kmp.demo.hint")}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setIdx(0)} disabled={idx <= 0}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">|◀</button>
        <button onClick={() => { setPlaying(false); setIdx(i => Math.max(0, i - 1)); }} disabled={idx <= 0}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">{t("controls.prev")}</button>
        <button onClick={() => playing ? setPlaying(false) : setPlaying(true)} disabled={idx >= frames.length - 1}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 disabled:opacity-30 cursor-pointer disabled:cursor-default">
          {playing ? t("controls.pause") : t("controls.play")}
        </button>
        <button onClick={() => { setPlaying(false); setIdx(i => Math.min(frames.length - 1, i + 1)); }} disabled={idx >= frames.length - 1}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">{t("controls.step")}</button>
        <span className="text-xs text-[var(--color-muted)] ml-1">
          {t("controls.step.of").replace("{n}", String(idx + 1)).replace("{total}", String(frames.length))}
        </span>
      </div>

      {/* Fail table */}
      {fail.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-xs font-semibold text-[var(--color-muted)] mb-2 uppercase tracking-wide">{t("kmp.demo.fail.title")}</p>
          <FailTable pattern={pattern} fail={fail} />
        </div>
      )}

      {/* Legend */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap gap-4">
          {[
            { color: "var(--color-accent-2)",  label: t("kmp.legend.matched") },
            { color: "var(--color-accent-3)",  label: t("kmp.legend.match") },
            { color: "var(--color-danger)",    label: t("kmp.legend.mismatch") },
            { color: "var(--color-warn)",      label: t("kmp.legend.fallback") },
            { color: "var(--color-accent)",    label: t("kmp.legend.prev_match") },
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

// ─── Failure Function sub-tab ─────────────────────────────────────────────────

function FailureTab({ pattern }: { pattern: string }) {
  const { t } = useLang();
  const [frames, setFrames] = useState<FailFrame[]>([]);
  const [idx, setIdx]       = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (pattern) {
      setFrames(computeFailFrames(pattern));
      setIdx(0);
      setPlaying(false);
    }
  }, [pattern]);

  useEffect(() => {
    if (!playing || idx >= frames.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setIdx(i => i + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [playing, idx, frames.length]);

  const frame = frames[idx] ?? null;

  function pState(pos: number): CellState {
    if (!frame) return "default";
    const { i, j, action } = frame;
    if (pos === i) {
      if (action === "match" || action === "set" && j > 0) return "current_match";
      if (action === "mismatch") return "current_mismatch";
      if (action === "compare" || action === "fallback") return "current_compare";
    }
    if (pos === j && pos !== i) {
      if (action === "match") return "current_match";
      if (action === "mismatch") return "current_mismatch";
      if (action === "compare" || action === "fallback") return "current_compare";
    }
    if (pos < i) return "matched";
    return "default";
  }

  const statusColor = !frame ? "var(--color-muted)"
    : frame.action === "done"      ? "var(--color-accent-3)"
    : frame.action === "match"     ? "var(--color-accent-3)"
    : frame.action === "set"       ? "var(--color-accent)"
    : frame.action === "mismatch"  ? "var(--color-danger)"
    : frame.action === "fallback"  ? "var(--color-warn)"
    : "var(--color-accent-2)";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-x-auto">
        <p className="text-xs text-[var(--color-muted)] mb-2 font-mono">{t("kmp.fail.pattern.label")}</p>
        <div className="flex flex-nowrap mb-4">
          {Array.from(pattern).map((ch, i) => (
            <CharCell key={i} ch={ch} state={pState(i)} idx={i} />
          ))}
        </div>

        {frame && (
          <div className="mt-2">
            <p className="text-xs text-[var(--color-muted)] mb-2 font-mono">{t("kmp.fail.table.label")}</p>
            <FailTable
              pattern={pattern}
              fail={frame.fail}
              highlightI={frame.action !== "done" ? frame.i : undefined}
            />
          </div>
        )}

        {/* i / j pointers */}
        {frame && frame.action !== "done" && (
          <div className="mt-3 text-xs font-mono text-[var(--color-muted)]">
            <span className="text-[var(--color-warn)]">i={frame.i}</span>
            <span className="mx-2">·</span>
            <span className="text-[var(--color-accent-2)]">j={frame.j}</span>
            <span className="ml-3 text-[var(--color-muted)]">
              ({t("kmp.fail.j.desc")})
            </span>
          </div>
        )}
      </div>

      {/* Step message */}
      <div className="px-3 py-2 rounded-lg border text-sm font-mono min-h-[2.2rem]"
        style={{ borderColor: statusColor, color: statusColor, background: "var(--color-surface)" }}>
        {frame ? frame.message : t("kmp.demo.hint")}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setIdx(0)} disabled={idx <= 0}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">|◀</button>
        <button onClick={() => { setPlaying(false); setIdx(i => Math.max(0, i - 1)); }} disabled={idx <= 0}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">{t("controls.prev")}</button>
        <button onClick={() => playing ? setPlaying(false) : setPlaying(true)} disabled={idx >= frames.length - 1}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 disabled:opacity-30 cursor-pointer disabled:cursor-default">
          {playing ? t("controls.pause") : t("controls.play")}
        </button>
        <button onClick={() => { setPlaying(false); setIdx(i => Math.min(frames.length - 1, i + 1)); }} disabled={idx >= frames.length - 1}
          className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default">{t("controls.step")}</button>
        <span className="text-xs text-[var(--color-muted)] ml-1">
          {t("controls.step.of").replace("{n}", String(idx + 1)).replace("{total}", String(frames.length))}
        </span>
      </div>
    </div>
  );
}

// ─── Main demo ────────────────────────────────────────────────────────────────

const MAX_TEXT_LEN    = 22;
const MAX_PATTERN_LEN = 10;

export function KMPDemo() {
  const { t } = useLang();
  const [subTab, setSubTab]   = useState("search");
  const [text, setText]       = useState(DEFAULT_TEXT);
  const [pattern, setPattern] = useState(DEFAULT_PATTERN);
  const [inputText, setInputText]     = useState(DEFAULT_TEXT);
  const [inputPattern, setInputPattern] = useState(DEFAULT_PATTERN);
  const [error, setError]     = useState("");

  const subTabs = [
    { id: "search",  label: t("kmp.demo.tab.search") },
    { id: "failure", label: t("kmp.demo.tab.failure") },
  ];

  function apply() {
    const t2 = inputText.trim().toLowerCase();
    const p2 = inputPattern.trim().toLowerCase();
    if (!/^[a-z]+$/.test(t2)) { setError(t("kmp.demo.err.text")); return; }
    if (!/^[a-z]+$/.test(p2)) { setError(t("kmp.demo.err.pattern")); return; }
    if (t2.length > MAX_TEXT_LEN) { setError(t("kmp.demo.err.textlong")); return; }
    if (p2.length > MAX_PATTERN_LEN) { setError(t("kmp.demo.err.patlong")); return; }
    setError("");
    setText(t2);
    setPattern(p2);
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("kmp.demo.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("kmp.demo.desc")}</p>
      </SectionCard>

      {/* Inputs */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">{t("kmp.demo.input.text")}</label>
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              maxLength={MAX_TEXT_LEN}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] w-56"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-muted)] mb-1">{t("kmp.demo.input.pattern")}</label>
            <input
              value={inputPattern}
              onChange={e => setInputPattern(e.target.value)}
              maxLength={MAX_PATTERN_LEN}
              className="px-3 py-1.5 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] w-36"
            />
          </div>
          <button
            onClick={apply}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 cursor-pointer"
          >{t("kmp.demo.apply")}</button>
        </div>
        {error && <p className="text-xs text-[var(--color-danger)] mt-2">{error}</p>}
      </div>

      <TabGroup tabs={subTabs} activeTab={subTab} onChange={setSubTab} />

      {subTab === "search"  && <SearchTab text={text} pattern={pattern} />}
      {subTab === "failure" && <FailureTab pattern={pattern} />}
    </div>
  );
}
