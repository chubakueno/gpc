import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";

// Miller-Rabin primality test — deterministic for n < 3,317,044,064,679,887,385,961,981
const MR_WITNESSES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

function mulmod(a: number, b: number, mod: number): number {
  // Use BigInt for large numbers to avoid overflow
  return Number(BigInt(a) * BigInt(b) % BigInt(mod));
}

function powmod(base: number, exp: number, mod: number): number {
  let result = 1;
  let b = base % mod;
  let e = exp;
  while (e > 0) {
    if (e & 1) result = mulmod(result, b, mod);
    b = mulmod(b, b, mod);
    e >>= 1;
  }
  return result;
}

function millerRabin(n: number): boolean {
  if (n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0) return false;

  // Write n-1 as 2^r * d
  let d = n - 1;
  let r = 0;
  while (d % 2 === 0) { d >>= 1; r++; }

  for (const a of MR_WITNESSES) {
    if (a >= n) continue;
    let x = powmod(a, d, n);
    if (x === 1 || x === n - 1) continue;
    let composite = true;
    for (let i = 0; i < r - 1; i++) {
      x = mulmod(x, x, n);
      if (x === n - 1) { composite = false; break; }
    }
    if (composite) return false;
  }
  return true;
}

function collisionProb(p: number, x: number): number {
  if (x <= 1) return 0;
  // P(collision) ≈ 1 - e^(-x(x-1)/(2p))
  return 1 - Math.exp(-(x * (x - 1)) / (2 * p));
}

function threshold50(p: number): number {
  // Solve 1 - e^(-k(k-1)/2p) = 0.5 → k ≈ sqrt(2p * ln2)
  return Math.ceil(Math.sqrt(2 * p * Math.LN2));
}

function formatBig(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(3)}×10⁹`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(3)}×10⁶`;
  return String(n);
}

export function CollisionCalculator() {
  const { t } = useLang();
  const [pStr, setPStr] = useState("1000000007");
  const [xStr, setXStr] = useState("100000");

  const p = parseInt(pStr, 10);
  const x = parseInt(xStr, 10);
  const pValid = !isNaN(p) && p >= 2;
  const xValid = !isNaN(x) && x >= 1;
  const isPrime = pValid && millerRabin(p);
  const isTrivial = pValid && xValid && x >= p;
  const prob = pValid && xValid && !isTrivial ? collisionProb(p, x) : isTrivial ? 1 : null;
  const thresh = pValid ? threshold50(p) : null;

  const resultColor =
    prob === null
      ? ""
      : prob < 0.01
      ? "text-[var(--color-accent-3)]"
      : prob < 0.5
      ? "text-[var(--color-warn)]"
      : "text-[var(--color-danger)]";

  const steps = useMemo(() => {
    if (!pValid || !xValid || isTrivial) return [];
    const exact = `P(\\text{no collision}) = \\prod_{i=0}^{X-1} \\frac{P - i}{P} = \\frac{P}{P} \\cdot \\frac{P-1}{P} \\cdots \\frac{P-X+1}{P}`;
    const approx1 = `\\ln P(\\text{no collision}) = \\sum_{i=0}^{X-1} \\ln\\left(1 - \\frac{i}{P}\\right) \\approx -\\sum_{i=0}^{X-1} \\frac{i}{P} = -\\frac{X(X-1)}{2P}`;
    const approx2 = `P(\\text{no collision}) \\approx e^{-X(X-1)/2P}`;
    const result = `P(\\text{collision}) = 1 - e^{-X(X-1)/2P} = 1 - e^{-${x}\\cdot${x-1}/${2*p}} \\approx ${(prob! * 100).toFixed(4)}\\%`;
    return [exact, approx1, approx2, result];
  }, [p, x, pValid, xValid, isTrivial, prob]);

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("hashing.calc.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("hashing.calc.desc")}</p>

      {/* Inputs */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">{t("hashing.calc.p.label")}</label>
          <input
            type="text"
            value={pStr}
            onChange={(e) => setPStr(e.target.value)}
            placeholder={t("hashing.calc.p.placeholder")}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-44"
          />
          {pValid && !isPrime && (
            <span className="text-xs text-[var(--color-warn)]">{t("hashing.calc.not.prime")}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-[var(--color-muted)]">{t("hashing.calc.x.label")}</label>
          <input
            type="text"
            value={xStr}
            onChange={(e) => setXStr(e.target.value)}
            placeholder={t("hashing.calc.x.placeholder")}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:border-[var(--color-accent)] w-36"
          />
        </div>
      </div>

      {/* Trivial case */}
      {isTrivial && (
        <div className="mb-6 p-3 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-sm text-[var(--color-danger)]">
          {t("hashing.calc.trivial")}
        </div>
      )}

      {/* Derivation */}
      {steps.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-[var(--color-text)] mb-3">{t("hashing.calc.derivation")}</p>
          <div className="flex flex-col gap-3">
            {steps.map((math, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] fade-in overflow-x-auto"
              >
                <div className="text-xs text-[var(--color-muted)] mb-1">
                  {[t("hashing.calc.step.exact"), t("hashing.calc.step.log"), t("hashing.calc.step.exp"), t("hashing.calc.step.result")][i]}
                </div>
                <MathBlock math={math} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {prob !== null && (
        <div className="mb-6 flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <div>
            <p className="text-xs text-[var(--color-muted)] mb-1">{t("hashing.calc.result")}</p>
            <p className={`text-3xl font-bold font-mono ${resultColor}`}>
              {(prob * 100).toFixed(4)}%
            </p>
          </div>
          <div className="w-px h-12 bg-[var(--color-border)]" />
          <div className="flex-1">
            <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(prob * 100, 100)}%`,
                  background: prob < 0.01 ? "var(--color-accent-3)" : prob < 0.5 ? "var(--color-warn)" : "var(--color-danger)",
                }}
              />
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              {prob < 0.01 ? t("hashing.calc.risk.safe") : prob < 0.5 ? t("hashing.calc.risk.moderate") : t("hashing.calc.risk.high")}
            </p>
          </div>
        </div>
      )}

      {/* 50% threshold */}
      {thresh !== null && pValid && (
        <div className="p-4 rounded-xl border border-[var(--color-accent-2)]/30 bg-[var(--color-accent-2)]/5">
          <p className="text-sm font-medium text-[var(--color-accent-2)] mb-1">{t("hashing.calc.threshold")}</p>
          <p className="text-sm text-[var(--color-muted)]">
            {t("hashing.calc.threshold.desc", { p: formatBig(p), k: formatBig(thresh) })}
          </p>
          <div className="mt-2 overflow-x-auto">
            <MathBlock math={`k_{50\\%} \\approx \\sqrt{2P \\ln 2} = \\sqrt{2 \\times ${formatBig(p)} \\times 0.693} \\approx ${formatBig(thresh)}`} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
