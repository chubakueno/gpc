import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { RangeSlider } from "@/components/shared/RangeSlider";
import { TabGroup } from "@/components/shared/TabGroup";
import type { RollingHashStep } from "@/types/hashing";

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % mod;
    b = (b * b) % mod;
    e = Math.floor(e / 2);
  }
  return result;
}

// ── Prefix Hash ───────────────────────────────────────────────────────────────

interface PrefixBuildStep {
  idx: number;
  H: number[];
  pw: number[];
  hFormula: string;
  pwFormula: string;
  n: number;
}

function computePrefixSteps(input: string, base: number, mod: number): PrefixBuildStep[] {
  const n = input.length;
  if (n === 0) return [];
  const H: number[] = [0];
  const pw: number[] = [1];
  const steps: PrefixBuildStep[] = [{
    idx: 0, H: [0], pw: [1],
    hFormula: "H[0] = 0",
    pwFormula: "pw[0] = 1",
    n,
  }];
  for (let i = 1; i <= n; i++) {
    const hi = (H[i - 1] * base + input.charCodeAt(i - 1)) % mod;
    const pwi = (pw[i - 1] * base) % mod;
    H.push(hi);
    pw.push(pwi);
    steps.push({
      idx: i,
      H: [...H],
      pw: [...pw],
      hFormula: `H[${i}] = (H[${i - 1}] \\times ${base} + \\text{'${input[i - 1]}'}) \\bmod ${mod} = ${hi}`,
      pwFormula: `pw[${i}] = pw[${i - 1}] \\times ${base} \\bmod ${mod} = ${pwi}`,
      n,
    });
  }
  return steps;
}

function queryHash(H: number[], pw: number[], l: number, r: number, mod: number): number {
  return ((H[r + 1] - (H[l] * pw[r - l + 1]) % mod) % mod + mod) % mod;
}

// ── Prefix Hash Tab ───────────────────────────────────────────────────────────

function PrefixHashTab() {
  const { t } = useLang();
  const [input, setInput] = useState("abracadabra");
  const [queryL, setQueryL] = useState(0);
  const [queryR, setQueryR] = useState(3);
  const base = 31;
  const mod = 1000003;

  const str = input || "abracadabra";
  const n = str.length;

  const steps = useMemo(() => computePrefixSteps(str, base, mod), [str]);

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<PrefixBuildStep>(steps, { intervalMs: 800 });

  const buildDone = isAtEnd;

  const l = Math.max(0, Math.min(queryL, n - 1));
  const r = Math.max(l, Math.min(queryR, n - 1));
  const len = r - l + 1;

  const qResult = buildDone && frame
    ? queryHash(frame.H, frame.pw, l, r, mod)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Config */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">
            {t("hashing.rolling.prefix.input.label")}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value.slice(0, 16)); reset(); }}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-48"
          />
        </div>
        <div className="flex gap-4 text-xs text-[var(--color-muted)] pb-2">
          <span>base = <span className="text-[var(--color-text)] font-mono">{base}</span></span>
          <span>P = <span className="text-[var(--color-text)] font-mono">{mod}</span></span>
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          !buildDone
            ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30"
            : "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]"
        }`}>
          {t("hashing.rolling.prefix.phase.build")}
        </span>
        <span className="text-[var(--color-muted)]">→</span>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          buildDone
            ? "bg-[var(--color-accent-3)]/20 text-[var(--color-accent-3)] border border-[var(--color-accent-3)]/30"
            : "bg-[var(--color-surface-2)] text-[var(--color-muted)]/50 border border-[var(--color-border)]/40"
        }`}>
          {t("hashing.rolling.prefix.phase.query")}
        </span>
      </div>

      {/* Arrays */}
      {frame && (
        <div className="flex flex-col gap-3 overflow-x-auto pb-1">
          {/* H array */}
          <div>
            <p className="text-xs text-[var(--color-muted)] mb-1.5 font-mono">
              {t("hashing.rolling.prefix.h.label")}
            </p>
            <div className="flex gap-1.5">
              {Array.from({ length: n + 1 }, (_, i) => {
                const computed = i < frame.H.length;
                const current = !buildDone && i === frame.idx;
                const qHL = buildDone && i === l;
                const qHR = buildDone && i === r + 1;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center rounded-lg border-2 px-2 py-1.5 min-w-[3.5rem] flex-shrink-0 transition-all duration-300 ${
                      qHL || qHR
                        ? "border-[var(--color-warn)] bg-[var(--color-warn)]/15"
                        : current
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                        : computed
                        ? "border-[var(--color-border)] bg-[var(--color-surface-2)]"
                        : "border-[var(--color-border)]/20 bg-[var(--color-surface-2)]/20 opacity-40"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-[var(--color-text)] leading-tight">
                      {computed ? frame.H[i] : "?"}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted)] mt-0.5">H[{i}]</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* pw array */}
          <div>
            <p className="text-xs text-[var(--color-muted)] mb-1.5 font-mono">
              {t("hashing.rolling.prefix.pw.label")}
            </p>
            <div className="flex gap-1.5">
              {Array.from({ length: n + 1 }, (_, i) => {
                const computed = i < frame.pw.length;
                const current = !buildDone && i === frame.idx;
                const qPw = buildDone && i === len;
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center rounded-lg border-2 px-2 py-1.5 min-w-[3.5rem] flex-shrink-0 transition-all duration-300 ${
                      qPw
                        ? "border-[var(--color-accent-2)] bg-[var(--color-accent-2)]/15"
                        : current
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                        : computed
                        ? "border-[var(--color-border)] bg-[var(--color-surface-2)]"
                        : "border-[var(--color-border)]/20 bg-[var(--color-surface-2)]/20 opacity-40"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-[var(--color-text)] leading-tight">
                      {computed ? frame.pw[i] : "?"}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted)] mt-0.5">pw[{i}]</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Build step formula */}
      {frame && !buildDone && (
        <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-x-auto space-y-2">
          <MathBlock math={frame.hFormula} />
          <MathBlock math={frame.pwFormula} />
        </div>
      )}

      {/* Step controls */}
      <StepControls
        isPlaying={isPlaying}
        isAtEnd={isAtEnd}
        stepIdx={stepIdx}
        totalSteps={totalSteps}
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrev={prev}
        onReset={reset}
      />

      {/* Query panel — shown after build is complete */}
      {buildDone && frame && (
        <div className="p-4 rounded-xl bg-[var(--color-accent-3)]/10 border border-[var(--color-accent-3)]/30">
          <p className="text-sm font-semibold text-[var(--color-accent-3)] mb-4">
            {t("hashing.rolling.prefix.phase.query")}
          </p>

          {/* String visualization */}
          <div className="flex flex-wrap gap-1.5 mb-4 select-none">
            {str.split("").map((ch, i) => (
              <div
                key={i}
                className={`flex flex-col items-center rounded-lg border-2 px-2.5 py-2 transition-all ${
                  i >= l && i <= r
                    ? "border-[var(--color-warn)] bg-[var(--color-warn)]/20"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)]"
                }`}
              >
                <span className="text-base font-mono font-bold text-[var(--color-text)]">{ch}</span>
                <span className="text-[10px] text-[var(--color-muted)]">{i}</span>
              </div>
            ))}
          </div>

          {/* l / r sliders */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-44">
              <RangeSlider
                label={t("hashing.rolling.prefix.query.l")}
                value={l}
                min={0}
                max={n - 1}
                onChange={(v) => { setQueryL(v); if (v > queryR) setQueryR(v); }}
              />
            </div>
            <div className="flex-1 min-w-44">
              <RangeSlider
                label={t("hashing.rolling.prefix.query.r")}
                value={r}
                min={l}
                max={n - 1}
                onChange={setQueryR}
              />
            </div>
          </div>

          {/* Formula with values */}
          <div className="p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-x-auto mb-3 space-y-2">
            <MathBlock math={`\\text{hash}(s[${l}..${r}]) = (H[${r + 1}] - H[${l}] \\times pw[${len}]) \\bmod P`} />
            <MathBlock math={`= (${frame.H[r + 1]} - ${frame.H[l]} \\times ${frame.pw[len]}) \\bmod ${mod} = ${qResult}`} />
          </div>

          {/* Substring + result */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-[var(--color-muted)] text-xs">
                {t("hashing.rolling.prefix.query.substring")}:{" "}
              </span>
              <span className="font-mono text-[var(--color-warn)]">
                &quot;{str.slice(l, r + 1)}&quot;
              </span>
            </div>
            <div>
              <span className="text-[var(--color-muted)] text-xs">
                {t("hashing.rolling.prefix.query.result")}:{" "}
              </span>
              <span className="font-mono font-bold text-[var(--color-accent)]">{qResult}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sliding Window Tab ─────────────────────────────────────────────────────────

function computeSlidingSteps(input: string, k: number, base: number, mod: number): RollingHashStep[] {
  if (input.length < k || k < 1) return [];
  const steps: RollingHashStep[] = [];

  let hash = 0;
  for (let i = 0; i < k; i++) {
    hash = (hash * base + input.charCodeAt(i)) % mod;
  }
  steps.push({
    windowStart: 0,
    windowEnd: k - 1,
    window: input.slice(0, k),
    hash,
    removing: null,
    adding: null,
    formula: `\\text{Initial: } H_0 = \\sum_{i=0}^{${k - 1}} s[i] \\cdot ${base}^{${k - 1}-i} \\bmod ${mod} = ${hash}`,
  });

  const basePowK = modPow(base, k - 1, mod);

  for (let i = 1; i + k - 1 < input.length; i++) {
    const removing = input[i - 1];
    const adding = input[i + k - 1];
    const removingCode = input.charCodeAt(i - 1);
    const addingCode = input.charCodeAt(i + k - 1);
    const newHash = ((hash - removingCode * basePowK % mod + mod) * base + addingCode) % mod;

    steps.push({
      windowStart: i,
      windowEnd: i + k - 1,
      window: input.slice(i, i + k),
      hash: newHash,
      removing,
      adding,
      formula: `H_{${i}} = (H_{${i - 1}} - \\text{'${removing}'} \\cdot ${base}^{${k - 1}}) \\cdot ${base} + \\text{'${adding}'} \\bmod ${mod} = ${newHash}`,
    });
    hash = newHash;
  }

  return steps;
}

function SlidingWindowTab() {
  const { t } = useLang();
  const [input, setInput] = useState("abracadabra");
  const [windowSize, setWindowSize] = useState(4);
  const [base] = useState(31);
  const [mod] = useState(1000003);

  const maxWindow = Math.max(1, (input || "abracadabra").length - 1);
  const clampedK = Math.min(windowSize, maxWindow);

  const steps = useMemo(
    () => computeSlidingSteps(input || "abracadabra", clampedK, base, mod),
    [input, clampedK, base, mod]
  );

  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<RollingHashStep>(steps, { intervalMs: 1000 });

  const str = input || "abracadabra";

  return (
    <div className="flex flex-col gap-6">
      {/* Config */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">{t("hashing.rolling.input.label")}</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 24))}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-52"
          />
        </div>
        <div className="flex-1 min-w-48">
          <RangeSlider
            label={t("hashing.rolling.window.label")}
            value={clampedK}
            min={1}
            max={maxWindow}
            onChange={setWindowSize}
          />
        </div>
      </div>

      {/* String visualization */}
      <div className="flex flex-wrap gap-1.5 select-none">
        {str.split("").map((ch, i) => {
          const inWindow = frame && i >= frame.windowStart && i <= frame.windowEnd;
          const isRemoving = frame?.removing !== null && i === (frame?.windowStart ?? -2) - 1;
          const isAdding = frame?.adding !== null && i === frame?.windowEnd;

          return (
            <div
              key={i}
              className={`flex flex-col items-center rounded-lg border-2 px-2.5 py-2 transition-all duration-300 ${
                inWindow
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                  : isRemoving
                  ? "border-[var(--color-danger)] bg-[var(--color-danger)]/10 scale-95"
                  : isAdding
                  ? "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/10 scale-110"
                  : "border-[var(--color-border)] bg-[var(--color-surface-2)]"
              }`}
            >
              <span className="text-base font-mono font-bold text-[var(--color-text)]">{ch}</span>
              <span className="text-[10px] text-[var(--color-muted)]">{i}</span>
            </div>
          );
        })}
      </div>

      {/* Current step info */}
      {frame && (
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <div className="flex flex-wrap gap-4 mb-3 text-sm">
            <div>
              <span className="text-[var(--color-muted)]">{t("hashing.rolling.window")}: </span>
              <span className="font-mono text-[var(--color-accent)]">"{frame.window}"</span>
              <span className="text-[var(--color-muted)] text-xs ml-2">
                [{frame.windowStart}..{frame.windowEnd}]
              </span>
            </div>
            {frame.removing && (
              <div>
                <span className="text-[var(--color-muted)]">{t("hashing.rolling.removing")}: </span>
                <span className="font-mono text-[var(--color-danger)]">'{frame.removing}'</span>
              </div>
            )}
            {frame.adding && (
              <div>
                <span className="text-[var(--color-muted)]">{t("hashing.rolling.adding")}: </span>
                <span className="font-mono text-[var(--color-accent-3)]">'{frame.adding}'</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <MathBlock math={frame.formula} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)]">{t("hashing.rolling.hash")}:</span>
            <span className="font-mono text-[var(--color-accent)] font-bold">{frame.hash}</span>
          </div>
        </div>
      )}

      {/* All hashes so far */}
      {steps.length > 0 && (
        <div>
          <p className="text-xs text-[var(--color-muted)] mb-2">{t("hashing.rolling.all")}:</p>
          <div className="flex flex-wrap gap-2">
            {steps.slice(0, stepIdx + 1).map((s, i) => (
              <div
                key={i}
                className={`text-xs font-mono px-2 py-1 rounded-lg border ${
                  i === stepIdx
                    ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/10"
                    : "border-[var(--color-border)] text-[var(--color-muted)]"
                }`}
              >
                "{s.window}" → {s.hash}
              </div>
            ))}
          </div>
        </div>
      )}

      <StepControls
        isPlaying={isPlaying}
        isAtEnd={isAtEnd}
        stepIdx={stepIdx}
        totalSteps={totalSteps}
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrev={prev}
        onReset={reset}
      />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function RollingHashDemo() {
  const { t } = useLang();
  const [subTab, setSubTab] = useState<"prefix" | "sliding">("prefix");

  const subTabs = [
    { id: "prefix", label: t("hashing.rolling.tab.prefix") },
    { id: "sliding", label: t("hashing.rolling.tab.sliding") },
  ];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("hashing.rolling.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("hashing.rolling.desc")}</p>

      <TabGroup
        tabs={subTabs}
        activeTab={subTab}
        onChange={(id) => setSubTab(id as "prefix" | "sliding")}
        className="mb-6"
      />

      {subTab === "prefix" ? <PrefixHashTab /> : <SlidingWindowTab />}
    </SectionCard>
  );
}
