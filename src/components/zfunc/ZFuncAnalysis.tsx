import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

export function ZFuncAnalysis() {
  const { t } = useLang();

  return (
    <div className="space-y-6">

      {/* Definition */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("zfunc.analysis.def.title")}</h2>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {t("zfunc.analysis.def.p1")}
        </p>
        <MathBlock math={String.raw`z[i] = \max\{k \mid s[0..k{-}1] = s[i..i{+}k{-}1]\}`} />
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mt-4">
          {t("zfunc.analysis.def.p2")}
        </p>
        {/* Example table */}
        <div className="mt-4 overflow-x-auto">
          <table className="text-sm font-mono border-collapse">
            <tbody>
              <tr>
                <td className="pr-4 text-[var(--color-muted)]">s</td>
                {"aabaabaab".split("").map((c, i) => (
                  <td key={i} className="w-7 text-center text-[var(--color-text)]">{c}</td>
                ))}
              </tr>
              <tr>
                <td className="pr-4 text-[var(--color-muted)]">i</td>
                {[0,1,2,3,4,5,6,7,8].map(i => (
                  <td key={i} className="w-7 text-center text-[var(--color-muted)] text-xs">{i}</td>
                ))}
              </tr>
              <tr>
                <td className="pr-4 text-[var(--color-muted)]">z</td>
                {[9,1,0,6,1,0,3,1,0].map((v, i) => (
                  <td key={i} className={`w-7 text-center font-bold ${v > 0 ? "text-[var(--color-accent-3)]" : "text-[var(--color-border)]"}`}>{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Z-box and O(N) proof */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("zfunc.analysis.proof.title")}</h2>

        <h3 className="text-sm font-semibold text-[var(--color-accent-2)] uppercase tracking-wide mb-2">{t("zfunc.analysis.proof.zbox")}</h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {t("zfunc.analysis.proof.zbox.desc")}
        </p>
        <MathBlock math={String.raw`s[l..r] = s[0..r{-}l] \implies s[i..r] = s[i{-}l..r{-}l]`} />

        <h3 className="text-sm font-semibold text-[var(--color-accent-2)] uppercase tracking-wide mt-6 mb-2">{t("zfunc.analysis.proof.amortized")}</h3>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4">
          {t("zfunc.analysis.proof.amortized.desc")}
        </p>

        <div className="space-y-3">
          {[
            { label: "1", text: t("zfunc.analysis.proof.step1") },
            { label: "2", text: t("zfunc.analysis.proof.step2") },
            { label: "3", text: t("zfunc.analysis.proof.step3") },
            { label: "4", text: t("zfunc.analysis.proof.step4") },
          ].map(({ label, text }) => (
            <div key={label} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{label}</span>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl border border-[var(--color-accent-3)]/30 bg-[var(--color-accent-3)]/5">
          <p className="text-sm font-semibold text-[var(--color-accent-3)] mb-2">{t("zfunc.analysis.proof.conclusion")}</p>
          <MathBlock math={String.raw`T_{\text{total}} = O(N) + O(N) = O(N)`} />
        </div>
      </SectionCard>

      {/* Comparison table */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("zfunc.analysis.compare.title")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[t("zfunc.analysis.compare.algorithm"), t("zfunc.analysis.compare.build"), t("zfunc.analysis.compare.search"), t("zfunc.analysis.compare.notes")].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-[var(--color-muted)] font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Z-Function",  build: "O(N)",   search: "O(N+M)", note: t("zfunc.analysis.compare.note.zfunc") },
                { name: "KMP",         build: "O(M)",   search: "O(N+M)", note: t("zfunc.analysis.compare.note.kmp") },
                { name: "Naive",       build: "—",      search: "O(NM)",  note: t("zfunc.analysis.compare.note.naive") },
                { name: "Boyer-Moore", build: "O(M+Σ)", search: "O(N/M)", note: t("zfunc.analysis.compare.note.bm") },
              ].map(row => (
                <tr key={row.name} className="border-b border-[var(--color-border)]/40">
                  <td className="py-2 pr-4 font-mono font-semibold text-[var(--color-text)]">{row.name}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--color-accent-3)]">{row.build}</td>
                  <td className="py-2 pr-4 font-mono text-[var(--color-accent-3)]">{row.search}</td>
                  <td className="py-2 pr-4 text-[var(--color-muted)]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Applications */}
      <SectionCard>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("zfunc.analysis.apps.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { color: "var(--color-accent)",   title: t("zfunc.analysis.apps.patmatch.title"),  desc: t("zfunc.analysis.apps.patmatch.desc"),  code: 'Z(P + "#" + T)' },
            { color: "var(--color-accent-2)",  title: t("zfunc.analysis.apps.period.title"),    desc: t("zfunc.analysis.apps.period.desc"),    code: "z[i] + i == N" },
            { color: "var(--color-accent-3)",  title: t("zfunc.analysis.apps.border.title"),    desc: t("zfunc.analysis.apps.border.desc"),    code: "z[i] == N - i" },
            { color: "var(--color-warn)",      title: t("zfunc.analysis.apps.distinct.title"),  desc: t("zfunc.analysis.apps.distinct.desc"),  code: "suffix automaton alt" },
          ].map(({ color, title, desc, code }) => (
            <div key={title} className="p-4 rounded-xl border bg-[var(--color-surface-2)]"
              style={{ borderColor: color + "40" }}>
              <p className="font-semibold text-sm mb-1" style={{ color }}>{title}</p>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-2">{desc}</p>
              <code className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--color-bg)]" style={{ color }}>{code}</code>
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
}
