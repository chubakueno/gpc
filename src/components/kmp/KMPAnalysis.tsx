import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

export function KMPAnalysis() {
  const { t } = useLang();

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("kmp.analysis.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("kmp.analysis.subtitle")}</p>
      </SectionCard>

      {/* Key result */}
      <SectionCard className="border-[var(--color-accent)]/40">
        <p className="text-xs font-semibold text-[var(--color-accent)] mb-1 uppercase tracking-wide">{t("kmp.analysis.key_result")}</p>
        <MathBlock math={"T(N, M) = O(N + M)"} />
        <p className="text-sm text-[var(--color-muted)] mt-2">{t("kmp.analysis.key_result.body")}</p>
      </SectionCard>

      {/* Naive comparison */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("kmp.analysis.naive.title")}</h3>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("kmp.analysis.naive.body")}</p>
        <MathBlock math={"\\text{Naive: } O(N \\cdot M) \\text{ in the worst case}"} />
        <p className="text-xs text-[var(--color-muted)] mt-2">{t("kmp.analysis.naive.example")}</p>
        <div className="mt-2 font-mono text-xs bg-[var(--color-surface-2)] rounded-lg p-3 border border-[var(--color-border)]">
          <div className="text-[var(--color-muted)]">{"T = \"aaaa…a\" (N chars)"}</div>
          <div className="text-[var(--color-muted)]">{"P = \"aaaa…b\" (M chars)"}</div>
          <div className="text-[var(--color-danger)] mt-1">{"→ N−M+1 attempts × M−1 comparisons = O(N·M)"}</div>
        </div>
      </SectionCard>

      {/* Failure function proof */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("kmp.analysis.fail.title")}</h3>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("kmp.analysis.fail.body")}</p>
        <MathBlock math={"\\text{computeFail}(P): O(M)"} />
        <p className="text-sm text-[var(--color-muted)] mt-3">{t("kmp.analysis.fail.proof")}</p>
        <div className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
          {[
            t("kmp.analysis.fail.step1"),
            t("kmp.analysis.fail.step2"),
            t("kmp.analysis.fail.step3"),
          ].map((s, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--color-accent)] font-mono font-bold mt-0.5">{i + 1}.</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* KMP search proof */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("kmp.analysis.search.title")}</h3>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("kmp.analysis.search.body")}</p>
        <MathBlock math={"\\text{kmpSearch}(T, P): O(N)"} />
        <p className="text-sm text-[var(--color-muted)] mt-3">{t("kmp.analysis.search.proof_header")}</p>
        <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          {[
            t("kmp.analysis.search.step1"),
            t("kmp.analysis.search.step2"),
            t("kmp.analysis.search.step3"),
          ].map((s, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--color-accent-2)] font-mono font-bold mt-0.5">{i + 1}.</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <MathBlock math={"i \\text{ increases} \\leq N \\text{ times, } j \\text{ decreases} \\leq j\\text{'s total increases} \\leq N \\Rightarrow O(N) \\text{ total steps}"} />
        </div>
      </SectionCard>

      {/* Combined */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-3">{t("kmp.analysis.combined.title")}</h3>
        <MathBlock math={"T(N,M) = O(M) + O(N) = O(N + M)"} />
        <p className="text-sm text-[var(--color-muted)] mt-3">{t("kmp.analysis.combined.body")}</p>

        {/* Comparison table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[
                  t("kmp.analysis.table.algorithm"),
                  t("kmp.analysis.table.preprocessing"),
                  t("kmp.analysis.table.search"),
                  t("kmp.analysis.table.space"),
                ].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { alg: "Naive",          pre: "O(1)",    srch: "O(N·M)", spc: "O(1)",   hi: false },
                { alg: "KMP",            pre: "O(M)",    srch: "O(N)",   spc: "O(M)",   hi: true  },
                { alg: "Rabin-Karp",     pre: "O(M)",    srch: "O(N) avg", spc: "O(1)", hi: false },
                { alg: "Boyer-Moore",    pre: "O(M+Σ)",  srch: "O(N/M) best", spc: "O(M+Σ)", hi: false },
                { alg: "Aho-Corasick",   pre: "O(M·Σ)", srch: "O(N+k)", spc: "O(M·Σ)", hi: false },
              ].map(row => (
                <tr key={row.alg} className="border-b border-[var(--color-border)]/40">
                  <td className="py-2 pr-4 font-mono text-xs font-semibold"
                    style={{ color: row.hi ? "var(--color-accent)" : "var(--color-text)" }}>{row.alg}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--color-text)]">{row.pre}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--color-text)]">{row.srch}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--color-muted)]">{row.spc}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-[var(--color-muted)] mt-2">{t("kmp.analysis.table.note")}</p>
        </div>
      </SectionCard>

      {/* Applications */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("kmp.analysis.apps.title")}</h3>
        <ul className="space-y-2">
          {[
            t("kmp.analysis.apps.item1"),
            t("kmp.analysis.apps.item2"),
            t("kmp.analysis.apps.item3"),
            t("kmp.analysis.apps.item4"),
          ].map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
              <span className="text-[var(--color-accent)] font-mono font-bold mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
