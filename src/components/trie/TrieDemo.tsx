import { useState, useEffect, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { TrieSVG } from "./TrieSVG";
import {
  createTrie, insertWord, layoutTrie,
  computeInsertFrames, computeSearchFrames,
} from "./trieOps";
import type { TrieData, AnimFrame } from "@/types/trie";

const DEFAULT_WORDS = ["app", "apple", "apt", "car", "card", "care", "cat", "bat", "bad"];
const MAX_WORDS = 22;
const MAX_LEN   = 10;

function buildDefault(): TrieData {
  let t = createTrie();
  for (const w of DEFAULT_WORDS) t = insertWord(t, w);
  return t;
}

const INTERVAL = 700; // ms per frame

export function TrieDemo() {
  const { t } = useLang();

  // Committed trie (words actually in the trie)
  const [committed, setCommitted] = useState<TrieData>(buildDefault);

  // Animation state
  const [animTrie, setAnimTrie]     = useState<TrieData | null>(null);
  const [frames, setFrames]         = useState<AnimFrame[]>([]);
  const [frameIdx, setFrameIdx]     = useState(-1);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [lastMode, setLastMode]     = useState<"insert" | "search">("insert");

  // UI state
  const [inputWord, setInputWord]   = useState("");
  const [mode, setMode]             = useState<"insert" | "search">("insert");
  const [errorMsg, setErrorMsg]     = useState("");

  // The trie displayed in the SVG
  const displayTrie = animTrie ?? committed;
  const layout = useMemo(() => layoutTrie(displayTrie), [displayTrie]);

  // Current frame (null if no animation)
  const frame: AnimFrame | null = frameIdx >= 0 && frameIdx < frames.length
    ? frames[frameIdx] : null;

  // Auto-play
  useEffect(() => {
    if (!isPlaying || frameIdx >= frames.length - 1) {
      if (frameIdx >= frames.length - 1 && frames.length > 0) setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => setFrameIdx(i => i + 1), INTERVAL);
    return () => clearTimeout(timer);
  }, [isPlaying, frameIdx, frames.length]);

  // Commit insert on animation end
  useEffect(() => {
    if (
      frames.length > 0 &&
      frameIdx === frames.length - 1 &&
      lastMode === "insert" &&
      animTrie !== null
    ) {
      setCommitted(animTrie);
    }
  }, [frameIdx, frames.length, lastMode, animTrie]);

  function validate(w: string): string {
    if (!w) return t("trie.demo.err.empty");
    if (!/^[a-z]+$/.test(w)) return t("trie.demo.err.invalid");
    if (w.length > MAX_LEN) return t("trie.demo.err.toolong");
    return "";
  }

  function startAnimation(word: string, m: "insert" | "search") {
    const err = validate(word);
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");

    if (m === "insert") {
      if (committed.words.includes(word)) {
        setErrorMsg(t("trie.demo.err.exists"));
        return;
      }
      if (committed.words.length >= MAX_WORDS) {
        setErrorMsg(t("trie.demo.err.max"));
        return;
      }
      const { frames: fs, finalTrie } = computeInsertFrames(committed, word);
      setAnimTrie(finalTrie);
      setFrames(fs);
    } else {
      setAnimTrie(committed);
      setFrames(computeSearchFrames(committed, word));
    }
    setLastMode(m);
    setFrameIdx(0);
    setIsPlaying(true);
    setMode(m);
  }

  function handleInsert() { startAnimation(inputWord.trim().toLowerCase(), "insert"); }
  function handleSearch() { startAnimation(inputWord.trim().toLowerCase(), "search"); }

  function handleReset() {
    setCommitted(buildDefault());
    setAnimTrie(null);
    setFrames([]);
    setFrameIdx(-1);
    setIsPlaying(false);
    setInputWord("");
    setErrorMsg("");
  }

  function handleStep(dir: 1 | -1) {
    setIsPlaying(false);
    setFrameIdx(i => Math.max(0, Math.min(frames.length - 1, i + dir)));
  }

  const statusColor = frame
    ? frame.phase === "found" ? "var(--color-accent-3)"
    : frame.phase === "not_found" ? "var(--color-danger)"
    : frame.phase === "new" ? "var(--color-accent)"
    : "var(--color-accent-2)"
    : "var(--color-muted)";

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("trie.demo.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("trie.demo.desc")}</p>
      </SectionCard>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* SVG area */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-x-auto">
            <TrieSVG
              trie={displayTrie}
              layout={layout}
              hiddenIds={frame?.hiddenIds ?? new Set()}
              highlightIds={frame?.highlightIds ?? []}
              activeId={frame?.activeId ?? null}
              newIds={frame?.newIds ?? []}
              phase={frame?.phase ?? "idle"}
            />
          </div>

          {/* Step message */}
          <div
            className="mt-2 min-h-[2rem] text-sm font-mono px-3 py-2 rounded-lg border"
            style={{ borderColor: statusColor, color: statusColor, background: "var(--color-surface)" }}
          >
            {frame ? frame.message : t("trie.demo.hint")}
          </div>

          {/* Step controls */}
          {frames.length > 0 && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFrameIdx(0)}
                disabled={frameIdx <= 0}
                className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >|◀</button>
              <button
                onClick={() => handleStep(-1)}
                disabled={frameIdx <= 0}
                className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >{t("controls.prev")}</button>
              <button
                onClick={() => isPlaying ? setIsPlaying(false) : setIsPlaying(true)}
                disabled={frameIdx >= frames.length - 1}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >{isPlaying ? t("controls.pause") : t("controls.play")}</button>
              <button
                onClick={() => handleStep(1)}
                disabled={frameIdx >= frames.length - 1}
                className="px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 cursor-pointer disabled:cursor-default"
              >{t("controls.step")}</button>
              <span className="text-xs text-[var(--color-muted)] ml-1">
                {t("controls.step.of").replace("{n}", String(frameIdx + 1)).replace("{total}", String(frames.length))}
              </span>
            </div>
          )}
        </div>

        {/* Controls panel */}
        <div className="w-full lg:w-72 space-y-4">
          {/* Input */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <div>
              <label className="block text-xs text-[var(--color-muted)] mb-1">{t("trie.demo.input.label")}</label>
              <input
                value={inputWord}
                onChange={e => { setInputWord(e.target.value); setErrorMsg(""); }}
                onKeyDown={e => { if (e.key === "Enter") (mode === "insert" ? handleInsert : handleSearch)(); }}
                placeholder={t("trie.demo.input.placeholder")}
                maxLength={MAX_LEN}
                className="w-full px-3 py-2 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
              />
              {errorMsg && <p className="text-xs text-[var(--color-danger)] mt-1">{errorMsg}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleInsert}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/30 cursor-pointer"
              >{t("trie.demo.insert")}</button>
              <button
                onClick={handleSearch}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)] hover:bg-[var(--color-accent-2)]/30 cursor-pointer"
              >{t("trie.demo.search")}</button>
            </div>

            <button
              onClick={handleReset}
              className="w-full px-3 py-1.5 rounded-lg text-sm border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] cursor-pointer"
            >{t("trie.demo.reset")}</button>
          </div>

          {/* Legend */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold text-[var(--color-muted)] mb-2 uppercase tracking-wide">{t("trie.demo.legend.title")}</p>
            {[
              { color: "var(--color-accent-2)", label: t("trie.demo.legend.visiting") },
              { color: "var(--color-warn)",     label: t("trie.demo.legend.active") },
              { color: "var(--color-accent)",   label: t("trie.demo.legend.new") },
              { color: "var(--color-accent-3)", label: t("trie.demo.legend.found") },
              { color: "var(--color-danger)",   label: t("trie.demo.legend.notfound") },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs text-[var(--color-muted)]">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ borderColor: "var(--color-accent-3)", background: "transparent" }} />
              <span className="text-xs text-[var(--color-muted)]">{t("trie.demo.legend.endofword")}</span>
            </div>
          </div>

          {/* Words list */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-xs font-semibold text-[var(--color-muted)] mb-2 uppercase tracking-wide">
              {t("trie.demo.words.title")} ({committed.words.length})
            </p>
            <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto">
              {[...committed.words].sort().map(w => (
                <span key={w} className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted)]">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
