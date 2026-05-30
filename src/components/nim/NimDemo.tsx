import { useState, useEffect } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";

// ── Game logic ─────────────────────────────────────────────────────────────────

const DEFAULTS_NORMAL = [3, 5, 7];
const DEFAULTS_MISERE  = [2, 1, 1];
const DEFAULTS = DEFAULTS_NORMAL;
const MIN_PILE = 0;
const MAX_PILE = 15;
const BITS = 4; // binary display width

type Phase = "player" | "ai" | "over";
type LogEntry = { who: "player" | "ai"; pile: number; n: number };

const PILE_ACCENTS = [
  { border: "border-[var(--color-accent)]",   bg: "bg-[var(--color-accent)]/20",   text: "text-[var(--color-accent)]",   stone: "var(--color-accent)"   },
  { border: "border-[var(--color-accent-2)]", bg: "bg-[var(--color-accent-2)]/20", text: "text-[var(--color-accent-2)]", stone: "var(--color-accent-2)" },
  { border: "border-[var(--color-accent-3)]", bg: "bg-[var(--color-accent-3)]/20", text: "text-[var(--color-accent-3)]", stone: "var(--color-accent-3)" },
];

function xorAll(piles: number[]) {
  return piles.reduce((a, b) => a ^ b, 0);
}

function aiMove(piles: number[]): { pile: number; n: number } {
  const x = xorAll(piles);
  if (x === 0) {
    const i = piles.findIndex((p) => p > 0);
    return { pile: i, n: 1 };
  }
  for (let i = 0; i < piles.length; i++) {
    const target = piles[i] ^ x;
    if (target < piles[i]) return { pile: i, n: piles[i] - target };
  }
  return { pile: 0, n: 1 };
}

// Misère: last to take loses. Strategy = normal Nim EXCEPT in the endgame
// (all piles ≤ 1), where we leave an ODD number of 1-piles instead of even.
function misereIsWinning(piles: number[]): boolean {
  const allSmall = piles.every((p) => p <= 1);
  const xor = xorAll(piles);
  return allSmall ? xor === 0 : xor !== 0;
}

function misereAIMove(piles: number[]): { pile: number; n: number } {
  const allSmall = piles.every((p) => p <= 1);
  if (allSmall) {
    // N-position: even number of 1s. Take one to leave odd (P for opponent).
    const i = piles.findIndex((p) => p === 1);
    return { pile: i, n: 1 };
  }
  // Try every move; pick one that leaves a Misère P-position for the opponent.
  for (let i = 0; i < piles.length; i++) {
    for (let t = 1; t <= piles[i]; t++) {
      const next = piles.map((p, j) => (j === i ? p - t : p));
      const nextAllSmall = next.every((p) => p <= 1);
      const nextXor = xorAll(next);
      const nextIsP = nextAllSmall ? nextXor !== 0 : nextXor === 0;
      if (nextIsP) return { pile: i, n: t };
    }
  }
  // P-position fallback: any move
  const i = piles.findIndex((p) => p > 0);
  return { pile: i, n: 1 };
}

// ── Stones visual ──────────────────────────────────────────────────────────────

function PileColumn({
  idx,
  count,
  selected,
  takeCount,
  onClick,
}: {
  idx: number;
  count: number;
  selected: boolean;
  takeCount: number;
  onClick: () => void;
}) {
  const { t } = useLang();
  const accent = PILE_ACCENTS[idx];
  const DISPLAY = MAX_PILE;

  return (
    <button
      onClick={onClick}
      disabled={count === 0}
      className={`flex flex-col-reverse items-center gap-1 px-4 pt-3 pb-2 rounded-2xl border-2 transition-all cursor-pointer select-none
        ${count === 0 ? "opacity-30 cursor-not-allowed border-[var(--color-border)]" : ""}
        ${selected ? `${accent.border} ${accent.bg}` : "border-[var(--color-border)] hover:border-[var(--color-muted)]"}
      `}
    >
      {/* Stone slots */}
      <div className="flex flex-col-reverse gap-1 min-h-[200px] justify-start">
        {Array.from({ length: DISPLAY }, (_, i) => {
          const filled = i < count;
          const willBeRemoved = selected && filled && i >= count - takeCount;
          return (
            <div
              key={i}
              className={`w-8 h-3 rounded-sm transition-all ${
                !filled
                  ? "opacity-0"
                  : willBeRemoved
                  ? "opacity-40 border border-dashed border-[var(--color-muted)]"
                  : ""
              }`}
              style={{
                backgroundColor: filled
                  ? willBeRemoved
                    ? "var(--color-muted)"
                    : accent.stone
                  : "transparent",
              }}
            />
          );
        })}
      </div>
      {/* Label */}
      <span className={`text-sm font-mono font-bold mt-1 ${selected ? accent.text : "text-[var(--color-muted)]"}`}>
        {t("nim.game.pile.label", { n: String(idx + 1) })}
      </span>
      <span className={`text-xl font-bold font-mono ${selected ? accent.text : "text-[var(--color-text)]"}`}>
        {count}
      </span>
    </button>
  );
}

// ── XOR table ──────────────────────────────────────────────────────────────────

function XORTable({ piles, misere }: { piles: number[]; misere: boolean }) {
  const { t } = useLang();
  const xorVal = xorAll(piles);
  const allSmall = piles.every((p) => p <= 1);
  const isWinning = misere ? misereIsWinning(piles) : xorVal !== 0;

  // Bit positions that are set in xorVal (these are the "conflicting" bits)
  const xorBits = Array.from({ length: BITS }, (_, b) => (xorVal >> (BITS - 1 - b)) & 1);

  if (piles.every((p) => p === 0)) {
    return <p className="text-sm text-[var(--color-muted)] italic text-center py-4">{t("nim.xor.empty")}</p>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[var(--color-text)]">{t("nim.xor.title")}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse font-mono">
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 text-[var(--color-muted)] text-xs w-24" />
              {Array.from({ length: BITS }, (_, b) => (
                <th
                  key={b}
                  className={`w-10 text-center py-2 text-xs font-semibold ${
                    xorBits[b] ? "text-[var(--color-warn)]" : "text-[var(--color-muted)]"
                  }`}
                >
                  2<sup>{BITS - 1 - b}</sup>
                </th>
              ))}
              <th className="w-12 text-center py-2 text-xs font-semibold text-[var(--color-muted)]">dec</th>
            </tr>
          </thead>
          <tbody>
            {piles.map((p, i) => {
              const acc = PILE_ACCENTS[i];
              return (
                <tr key={i} className="border-t border-[var(--color-border)]/40">
                  <td className={`py-2 pr-4 text-xs font-semibold ${acc.text}`}>
                    {t("nim.xor.pile", { n: String(i + 1) })}
                  </td>
                  {Array.from({ length: BITS }, (_, b) => {
                    const bit = (p >> (BITS - 1 - b)) & 1;
                    const conflict = bit === 1 && xorBits[b] === 1;
                    return (
                      <td
                        key={b}
                        className={`w-10 text-center py-2 font-bold text-sm ${
                          conflict
                            ? "text-[var(--color-warn)]"
                            : bit
                            ? "text-[var(--color-text)]"
                            : "text-[var(--color-muted)]/50"
                        }`}
                      >
                        {bit}
                      </td>
                    );
                  })}
                  <td className="w-12 text-center py-2 text-[var(--color-muted)]">{p}</td>
                </tr>
              );
            })}
            {/* XOR row */}
            <tr className="border-t-2 border-[var(--color-border)]">
              <td className="py-2 pr-4 text-xs font-semibold text-[var(--color-muted)]">
                {t("nim.xor.result")}
              </td>
              {xorBits.map((bit, b) => (
                <td
                  key={b}
                  className={`w-10 text-center py-2 font-bold text-sm ${
                    bit ? "text-[var(--color-warn)]" : "text-[var(--color-muted)]/50"
                  }`}
                >
                  {bit}
                </td>
              ))}
              <td
                className={`w-12 text-center py-2 font-bold ${
                  isWinning ? "text-[var(--color-warn)]" : "text-[var(--color-accent-2)]"
                }`}
              >
                {xorVal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
          isWinning
            ? "bg-[var(--color-warn)]/10 border border-[var(--color-warn)]/30 text-[var(--color-warn)]"
            : "bg-[var(--color-accent-2)]/10 border border-[var(--color-accent-2)]/30 text-[var(--color-accent-2)]"
        }`}
      >
        {isWinning ? t("nim.xor.winning") : t("nim.xor.losing")}
      </div>
      {misere && (
        <p className="text-xs text-[var(--color-muted)] italic">
          {allSmall
            ? `All piles ≤ 1 — count of 1s: ${xorVal} (${xorVal % 2 === 1 ? "odd → P" : "even → N"})`
            : t("nim.xor.misere.note")}
        </p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function NimDemo() {
  const { t } = useLang();

  const [initPiles, setInitPiles] = useState(DEFAULTS);
  const [piles, setPiles] = useState(DEFAULTS);
  const [selected, setSelected] = useState<number | null>(null);
  const [takeCount, setTakeCount] = useState(1);
  const [phase, setPhase] = useState<Phase>("player");
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [misere, setMisere] = useState(false);

  function reset(pileOverride?: number[]) {
    const start = pileOverride ?? initPiles;
    setPiles([...start]);
    setSelected(null);
    setTakeCount(1);
    setPhase("player");
    setWinner(null);
    setLog([]);
  }

  function switchMode(newMisere: boolean) {
    const newDefaults = newMisere ? DEFAULTS_MISERE : DEFAULTS_NORMAL;
    setMisere(newMisere);
    setInitPiles(newDefaults);
    reset(newDefaults);
  }

  function handleSelectPile(i: number) {
    if (phase !== "player" || piles[i] === 0) return;
    setSelected(i);
    setTakeCount(1);
  }

  function handleConfirm() {
    if (selected === null || phase !== "player") return;
    const newPiles = piles.map((p, i) => (i === selected ? p - takeCount : p));
    setLog((prev) => [{ who: "player", pile: selected + 1, n: takeCount }, ...prev]);
    setPiles(newPiles);
    setSelected(null);
    if (newPiles.every((p) => p === 0)) {
      setPhase("over");
      // Misère: taking the last stone = you LOSE
      setWinner(misere ? "ai" : "player");
    } else {
      setPhase("ai");
    }
  }

  // AI responds after a short delay
  useEffect(() => {
    if (phase !== "ai") return;
    const timer = setTimeout(() => {
      const move = misere ? misereAIMove(piles) : aiMove(piles);
      const newPiles = piles.map((p, i) => (i === move.pile ? p - move.n : p));
      setLog((prev) => [{ who: "ai", pile: move.pile + 1, n: move.n }, ...prev]);
      setPiles(newPiles);
      if (newPiles.every((p) => p === 0)) {
        setPhase("over");
        // Misère: AI taking the last stone = AI LOSES
        setWinner(misere ? "player" : "ai");
      } else {
        setPhase("player");
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [phase, piles, misere]);

  const statusText =
    phase === "over"
      ? winner === "player"
        ? t(misere ? "nim.game.you.won.misere" : "nim.game.you.won")
        : t(misere ? "nim.game.ai.won.misere" : "nim.game.ai.won")
      : phase === "ai"
      ? t("nim.game.ai.turn")
      : t("nim.game.your.turn");

  const statusColor =
    phase === "over"
      ? winner === "player"
        ? "text-[var(--color-accent-2)]"
        : "text-[var(--color-warn)]"
      : phase === "ai"
      ? "text-[var(--color-muted)]"
      : "text-[var(--color-text)]";

  return (
    <div className="space-y-6">
      {/* Game */}
      <SectionCard>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("nim.game.title")}</h2>
            <p className="text-sm text-[var(--color-muted)] max-w-xl">
              {misere ? t("nim.game.desc.misere") : t("nim.game.desc")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mode toggle */}
            <div className="flex rounded-xl border border-[var(--color-border)] overflow-hidden text-xs font-medium">
              <button
                onClick={() => switchMode(false)}
                className={`px-3 py-1.5 cursor-pointer transition-colors ${
                  !misere
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {t("nim.game.mode.normal")}
              </button>
              <button
                onClick={() => switchMode(true)}
                className={`px-3 py-1.5 cursor-pointer transition-colors ${
                  misere
                    ? "bg-[var(--color-warn)] text-white"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {t("nim.game.mode.misere")}
              </button>
            </div>
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
            >
              {t("nim.game.reset")}
            </button>
          </div>
        </div>

        {/* Status */}
        <div
          className={`text-sm font-medium mb-5 min-h-[20px] ${statusColor} ${phase === "ai" ? "animate-pulse" : ""}`}
        >
          {statusText}
        </div>

        {/* Piles */}
        <div className="flex justify-center gap-4 sm:gap-8 mb-6">
          {piles.map((p, i) => (
            <PileColumn
              key={i}
              idx={i}
              count={p}
              selected={selected === i}
              takeCount={selected === i ? takeCount : 0}
              onClick={() => handleSelectPile(i)}
            />
          ))}
        </div>

        {/* Take controls */}
        {phase === "player" && selected !== null && (
          <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
            <p className="text-sm font-medium text-[var(--color-text)]">
              {t("nim.game.take.label", { n: String(selected + 1) })}
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={piles[selected]}
                value={takeCount}
                onChange={(e) => setTakeCount(Number(e.target.value))}
                className="flex-1 accent-[var(--color-accent)]"
              />
              <span className="font-mono text-lg font-bold text-[var(--color-text)] w-8 text-center">
                {takeCount}
              </span>
              <button
                onClick={handleConfirm}
                className="px-5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                {t("nim.game.confirm")}
              </button>
            </div>
          </div>
        )}

        {/* Selection hint when no pile selected */}
        {phase === "player" && selected === null && !piles.every((p) => p === 0) && (
          <p className="text-xs text-[var(--color-muted)] italic text-center mt-2">
            {t("nim.game.select.pile")}
          </p>
        )}
      </SectionCard>

      {/* XOR table */}
      <SectionCard>
        <XORTable piles={piles} misere={misere} />
      </SectionCard>

      {/* Customize + log */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* Customize initial piles */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">
            {t("nim.game.customize.label")}
          </h3>
          <div className="flex gap-3 items-end">
            {initPiles.map((val, i) => (
              <div key={i} className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-[var(--color-muted)]">
                  {t("nim.game.pile.label", { n: String(i + 1) })}
                </label>
                <input
                  type="number"
                  min={0}
                  max={MAX_PILE}
                  value={val}
                  onChange={(e) => {
                    const v = Math.max(MIN_PILE, Math.min(MAX_PILE, Number(e.target.value)));
                    setInitPiles((prev) => prev.map((p, j) => (j === i ? v : p)));
                  }}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2 py-1.5 text-center font-mono text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
            ))}
            <button
              onClick={() => reset()}
              className="px-4 py-1.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t("nim.game.reset")}
            </button>
          </div>
        </SectionCard>

        {/* Move log */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">{t("nim.game.log.title")}</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {log.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)] italic">—</p>
            ) : (
              log.map((entry, i) => {
                const isPlayer = entry.who === "player";
                return (
                  <div
                    key={i}
                    className={`text-xs font-mono px-2 py-1 rounded-lg ${
                      isPlayer
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "bg-[var(--color-surface-2)] text-[var(--color-muted)]"
                    }`}
                  >
                    {isPlayer
                      ? t("nim.game.log.you", { pile: String(entry.pile), n: String(entry.n) })
                      : t("nim.game.log.ai", { pile: String(entry.pile), n: String(entry.n) })}
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
