import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";
import { RangeSlider } from "@/components/shared/RangeSlider";
import { TabGroup } from "@/components/shared/TabGroup";

// Small primes for the slider snap
const PRIMES = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 79, 83, 89, 97, 101, 127, 149, 199, 251, 307, 401, 503, 601, 701, 809, 907, 997];

function birthdayProb(k: number, p: number): number {
  if (k <= 1) return 0;
  return 1 - Math.exp(-(k * (k - 1)) / (2 * p));
}

// ── Probability Curve ─────────────────────────────────────────────────────────

const CHART_W = 600;
const CHART_H = 280;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };

function ProbabilityCurve({ modulus }: { modulus: number }) {
  const { t } = useLang();
  const [cursorK, setCursorK] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const xMax = Math.min(modulus, 200);
  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const points = useMemo(() => {
    return Array.from({ length: xMax + 1 }, (_, k) => ({
      k,
      prob: birthdayProb(k, modulus),
      x: PAD.left + (k / xMax) * innerW,
      y: PAD.top + (1 - birthdayProb(k, modulus)) * innerH,
    }));
  }, [modulus, xMax, innerW, innerH]);

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // k=50% threshold
  const k50 = points.find((p) => p.prob >= 0.5);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = CHART_W / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;
    const k = Math.round(((svgX - PAD.left) / innerW) * xMax);
    setCursorK(Math.min(Math.max(k, 0), xMax));
  }, [innerW, xMax]);

  const cursorPt = cursorK !== null ? points[cursorK] : null;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCursorK(null)}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => {
          const y = PAD.top + (1 - v) * innerH;
          return (
            <g key={v}>
              <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y}
                stroke="var(--color-border)" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end"
                fill="var(--color-muted)" fontSize="11">{(v * 100).toFixed(0)}%</text>
            </g>
          );
        })}

        {/* X axis ticks */}
        {[0, Math.floor(xMax / 4), Math.floor(xMax / 2), Math.floor(3 * xMax / 4), xMax].map((k) => {
          const x = PAD.left + (k / xMax) * innerW;
          return (
            <text key={k} x={x} y={CHART_H - 8} textAnchor="middle"
              fill="var(--color-muted)" fontSize="11">{k}</text>
          );
        })}

        {/* Axis labels */}
        <text x={PAD.left + innerW / 2} y={CHART_H - 2} textAnchor="middle"
          fill="var(--color-muted)" fontSize="12">{t("hashing.birthday.axis.x")}</text>
        <text x={12} y={PAD.top + innerH / 2} textAnchor="middle"
          fill="var(--color-muted)" fontSize="12"
          transform={`rotate(-90, 12, ${PAD.top + innerH / 2})`}>{t("hashing.birthday.axis.y")}</text>

        {/* 50% line */}
        <line
          x1={PAD.left} y1={PAD.top + innerH / 2}
          x2={PAD.left + innerW} y2={PAD.top + innerH / 2}
          stroke="var(--color-warn)" strokeWidth="1" strokeDasharray="6 3" opacity="0.6"
        />

        {/* Curve */}
        <polyline points={polyline} fill="none" stroke="var(--color-accent)" strokeWidth="2.5"
          strokeLinejoin="round" />

        {/* Fill under curve */}
        <polygon
          points={`${PAD.left},${PAD.top + innerH} ${polyline} ${PAD.left + innerW},${PAD.top + innerH}`}
          fill="var(--color-accent)" opacity="0.08"
        />

        {/* 50% threshold dot */}
        {k50 && (
          <circle cx={k50.x} cy={k50.y} r="5"
            fill="var(--color-warn)" stroke="var(--color-bg)" strokeWidth="2" />
        )}

        {/* Cursor */}
        {cursorPt && (
          <g>
            <line x1={cursorPt.x} y1={PAD.top} x2={cursorPt.x} y2={PAD.top + innerH}
              stroke="var(--color-accent-2)" strokeWidth="1" strokeDasharray="4 2" />
            <circle cx={cursorPt.x} cy={cursorPt.y} r="5"
              fill="var(--color-accent-2)" stroke="var(--color-bg)" strokeWidth="2" />
            <rect x={cursorPt.x + 8} y={cursorPt.y - 24}
              width={130} height={28} rx="4" fill="var(--color-surface)" stroke="var(--color-border)" />
            <text x={cursorPt.x + 14} y={cursorPt.y - 5}
              fill="var(--color-text)" fontSize="11">
              k={cursorK}, P≈{(cursorPt.prob * 100).toFixed(1)}%
            </text>
          </g>
        )}
      </svg>

      <div className="mt-4 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] overflow-x-auto">
        <p className="text-xs text-[var(--color-muted)] mb-2">{t("hashing.birthday.formula")}</p>
        <MathBlock math={`P(\\text{collision among } k) \\approx 1 - e^{-k(k-1)/2P}`} />
        {k50 && (
          <p className="text-sm text-[var(--color-warn)] mt-2">
            {t("hashing.birthday.threshold.display", { k: k50.k, p: modulus })}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Bin Simulation ─────────────────────────────────────────────────────────────

function BinSimulation({ modulus }: { modulus: number }) {
  const { t } = useLang();
  const [bins, setBins] = useState<Map<number, number>>(new Map());
  const [items, setItems] = useState(0);
  const [firstCollision, setFirstCollision] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setBins(new Map());
    setItems(0);
    setFirstCollision(null);
    setRunning(false);
    setSequence([]);
  }, []);

  useEffect(() => reset(), [modulus, reset]);

  const start = useCallback(() => {
    if (firstCollision !== null) { reset(); return; }
    setRunning(true);
  }, [firstCollision, reset]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      const hash = Math.floor(Math.random() * modulus);
      setBins((prev) => {
        const next = new Map(prev);
        next.set(hash, (next.get(hash) ?? 0) + 1);
        return next;
      });
      setSequence((prev) => [...prev, hash]);
      setItems((prev) => {
        const next = prev + 1;
        return next;
      });
    }, 150);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, modulus]);

  // Check collision after each item
  useEffect(() => {
    if (!running) return;
    for (const [, count] of bins) {
      if (count >= 2) {
        setFirstCollision(items);
        setRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        break;
      }
    }
  }, [bins, items, running]);

  const MAX_BINS_VISUAL = 50;
  const showBins = modulus <= MAX_BINS_VISUAL;

  return (
    <div>
      {/* Bin visualization */}
      {showBins ? (
        <div className="flex flex-wrap gap-1.5 mb-4 min-h-16">
          {Array.from({ length: modulus }, (_, i) => {
            const count = bins.get(i) ?? 0;
            const isCollision = count >= 2;
            return (
              <div
                key={i}
                className={`flex flex-col items-center justify-end rounded-lg border-2 transition-all duration-200 w-8 ${
                  isCollision
                    ? "border-[var(--color-danger)] bg-[var(--color-danger)]/20"
                    : count === 1
                    ? "border-[var(--color-accent-3)] bg-[var(--color-accent-3)]/15"
                    : "border-[var(--color-border)] bg-[var(--color-surface-2)]"
                }`}
                style={{ height: Math.max(32, 32 + count * 10) }}
                title={`bin ${i}: ${count} item(s)`}
              >
                <span className="text-[10px] text-[var(--color-muted)] pb-0.5">{i}</span>
                {count > 0 && (
                  <span className={`text-xs font-bold ${isCollision ? "text-[var(--color-danger)]" : "text-[var(--color-accent-3)]"}`}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Heatmap for large P
        <div className="mb-4 flex flex-wrap gap-0.5">
          {Array.from({ length: modulus }, (_, i) => {
            const count = bins.get(i) ?? 0;
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-sm transition-colors duration-200"
                style={{
                  background: count === 0
                    ? "var(--color-surface-3)"
                    : count === 1
                    ? "var(--color-accent-3)"
                    : "var(--color-danger)",
                }}
                title={`bin ${i}`}
              />
            );
          })}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        <div>
          <span className="text-[var(--color-muted)]">{t("hashing.birthday.sim.itemsAdded")} </span>
          <span className="font-mono text-[var(--color-accent)]">{items}</span>
        </div>
        <div>
          <span className="text-[var(--color-muted)]">{t("hashing.birthday.sim.uniqueBins")} </span>
          <span className="font-mono text-[var(--color-accent-2)]">{bins.size}</span>
        </div>
        {firstCollision !== null && (
          <div className="text-[var(--color-danger)] font-medium">
            💥 {t("hashing.birthday.sim.collision")} {firstCollision} {t("hashing.birthday.sim.items")}!
          </div>
        )}
      </div>

      {/* Last 10 hashes */}
      {sequence.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {sequence.slice(-15).map((h, i) => (
            <span key={i} className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-muted)]">
              {h}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={start}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {running ? t("hashing.birthday.sim.running") : t("hashing.birthday.sim.start")}
        </button>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
        >
          {t("hashing.birthday.sim.reset")}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function BirthdayParadox() {
  const { t } = useLang();
  const [modIdx, setModIdx] = useState(10); // default P=97
  const modulus = PRIMES[modIdx] ?? 97;
  const [activeTab, setActiveTab] = useState("curve");

  const tabs = [
    { id: "curve", label: t("hashing.birthday.tab.curve") },
    { id: "sim", label: t("hashing.birthday.tab.sim") },
  ];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("hashing.birthday.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("hashing.birthday.desc")}</p>

      <div className="mb-6">
        <RangeSlider
          label={t("hashing.birthday.mod.label")}
          value={modIdx}
          min={0}
          max={PRIMES.length - 1}
          onChange={setModIdx}
          formatValue={() => `P = ${modulus}`}
        />
      </div>

      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === "curve" ? (
        <ProbabilityCurve modulus={modulus} />
      ) : (
        <BinSimulation key={modulus} modulus={modulus} />
      )}
    </SectionCard>
  );
}
