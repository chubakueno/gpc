import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

const GRID_SIZE = 7; // 0..6 for each pile

function PNGrid() {
  const { t } = useLang();
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-[var(--color-text)]">{t("nim.theory.grid.title")}</h3>
      <p className="text-sm text-[var(--color-muted)]">{t("nim.theory.grid.desc")}</p>
      <div className="overflow-x-auto">
        <table className="border-collapse text-xs font-mono mx-auto">
          <thead>
            <tr>
              <td className="w-8 h-8" />
              {Array.from({ length: GRID_SIZE }, (_, a) => (
                <th key={a} className="w-9 h-8 text-center text-[var(--color-muted)] font-medium">
                  {a}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: GRID_SIZE }, (_, b) => (
              <tr key={b}>
                <th className="w-8 text-center text-[var(--color-muted)] font-medium pr-1">{b}</th>
                {Array.from({ length: GRID_SIZE }, (_, a) => {
                  const isP = (a ^ b) === 0;
                  return (
                    <td
                      key={a}
                      title={`(${a}, ${b}) — ${isP ? "P" : "N"}-position, XOR = ${a ^ b}`}
                      className={`w-9 h-9 text-center font-bold border border-[var(--color-border)] select-none
                        ${isP
                          ? "bg-[var(--color-accent-2)]/20 text-[var(--color-accent-2)]"
                          : "bg-[var(--color-warn)]/10 text-[var(--color-warn)]"
                        }`}
                    >
                      {isP ? "P" : "N"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center gap-6 mt-3 justify-center text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--color-accent-2)]/40 inline-block" />
            P-position (a = b, XOR = 0)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[var(--color-warn)]/20 inline-block" />
            N-position (a ≠ b, XOR ≠ 0)
          </span>
        </div>
      </div>
    </div>
  );
}

export default function NimTheory() {
  const { t } = useLang();

  return (
    <div className="space-y-6">
      {/* Key result */}
      <SectionCard className="border-[var(--color-accent-3)]/40">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent-3)] mb-2">
          {t("nim.theory.key")}
        </p>
        <p className="text-sm text-[var(--color-text)] leading-relaxed">{t("nim.theory.key.body")}</p>
      </SectionCard>

      {/* Definitions */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("nim.theory.def.title")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[var(--color-accent-2)]/40 bg-[var(--color-accent-2)]/5 p-4">
            <p className="text-sm font-semibold text-[var(--color-accent-2)] mb-1">
              {t("nim.theory.ppos.label")}
            </p>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t("nim.theory.ppos.def")}</p>
          </div>
          <div className="rounded-xl border border-[var(--color-warn)]/40 bg-[var(--color-warn)]/5 p-4">
            <p className="text-sm font-semibold text-[var(--color-warn)] mb-1">
              {t("nim.theory.npos.label")}
            </p>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t("nim.theory.npos.def")}</p>
          </div>
        </div>
      </SectionCard>

      {/* Recursive characterization */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">{t("nim.theory.rules.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] mb-4">{t("nim.theory.rules.intro")}</p>
        <ol className="space-y-3">
          {(["nim.theory.rules.1", "nim.theory.rules.2", "nim.theory.rules.3"] as const).map((key, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-surface-2)] text-[var(--color-accent)] flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-[var(--color-text)] leading-relaxed pt-0.5">{t(key)}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 rounded-xl bg-[var(--color-surface-2)] p-4 text-sm text-[var(--color-muted)] leading-relaxed">
          <span className="font-semibold text-[var(--color-text)]">Intuition: </span>
          A P-position is a "trap" — any move you make hands the opponent an N-position (winning position). An N-position is an escape — you can always find a move to a P-position, leaving your opponent trapped.
        </div>
      </SectionCard>

      {/* XOR theorem */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("nim.theory.nim.title")}</h2>

        <div className="rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-4 mb-6">
          <p className="text-sm text-[var(--color-text)] leading-relaxed">{t("nim.theory.nim.theorem")}</p>
        </div>

        <h3 className="text-base font-semibold text-[var(--color-text)] mb-4">{t("nim.theory.nim.proof.title")}</h3>
        <div className="space-y-4">
          {(
            [
              ["nim.theory.nim.proof.1.label", "nim.theory.nim.proof.1", "var(--color-muted)"],
              ["nim.theory.nim.proof.2.label", "nim.theory.nim.proof.2", "var(--color-accent-2)"],
              ["nim.theory.nim.proof.3.label", "nim.theory.nim.proof.3", "var(--color-warn)"],
            ] as const
          ).map(([labelKey, bodyKey, color], i) => (
            <div key={i} className="flex gap-4">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: color }}
              >
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)] mb-1">{t(labelKey)}</p>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t(bodyKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-[var(--color-surface-2)] p-4">
          <p className="text-xs text-[var(--color-muted)] mb-2 font-semibold uppercase tracking-wide">Key formula</p>
          <MathBlock math="\text{P-position} \iff n_1 \oplus n_2 \oplus \cdots \oplus n_k = 0" />
          <p className="text-xs text-[var(--color-muted)] mt-2">
            Optimal play: always move to a position where XOR = 0. If you're in one, any opponent move breaks it.
          </p>
        </div>
      </SectionCard>

      {/* 2-pile grid */}
      <SectionCard>
        <PNGrid />
      </SectionCard>
    </div>
  );
}
