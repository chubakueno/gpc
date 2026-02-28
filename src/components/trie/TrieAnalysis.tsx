import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";

export function TrieAnalysis() {
  const { t } = useLang();

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("trie.analysis.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("trie.analysis.subtitle")}</p>
      </SectionCard>

      {/* Key result */}
      <SectionCard className="border-[var(--color-accent)]/40">
        <p className="text-xs font-semibold text-[var(--color-accent)] mb-1 uppercase tracking-wide">{t("trie.analysis.key_result")}</p>
        <p className="text-sm text-[var(--color-text)]">{t("trie.analysis.key_result.body")}</p>
      </SectionCard>

      {/* Insert */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("trie.analysis.insert.title")}</h3>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("trie.analysis.insert.body")}</p>
        <MathBlock math={"\\text{insert}(w): O(|w|)"} />
        <p className="text-sm text-[var(--color-muted)] mt-3">
          {t("trie.analysis.insert.proof")}
        </p>
        <div className="mt-3">
          <MathBlock math={"\\text{For each character } c_i \\in w \\text{: follow or create one edge} \\Rightarrow |w| \\text{ steps total}"} />
        </div>
      </SectionCard>

      {/* Search */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("trie.analysis.search.title")}</h3>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("trie.analysis.search.body")}</p>
        <MathBlock math={"\\text{search}(w): O(|w|)"} />
        <p className="text-sm text-[var(--color-muted)] mt-3">{t("trie.analysis.search.note")}</p>
      </SectionCard>

      {/* Space */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("trie.analysis.space.title")}</h3>
        <p className="text-sm text-[var(--color-muted)] mb-3">{t("trie.analysis.space.body")}</p>
        <MathBlock math={"\\text{Space} = O(N \\times |\\Sigma|)"} />
        <p className="text-sm text-[var(--color-muted)] mt-3">{t("trie.analysis.space.note")}</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-[var(--color-surface-2)] p-3 border border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">{t("trie.analysis.space.array_impl")}</p>
            <MathBlock math={"N \\times 26 \\text{ integers}"} />
            <p className="text-xs text-[var(--color-muted)] mt-1">{t("trie.analysis.space.array_note")}</p>
          </div>
          <div className="rounded-lg bg-[var(--color-surface-2)] p-3 border border-[var(--color-border)]">
            <p className="text-xs font-semibold text-[var(--color-muted)] mb-1">{t("trie.analysis.space.map_impl")}</p>
            <MathBlock math={"O(N) \\text{ map entries total}"} />
            <p className="text-xs text-[var(--color-muted)] mt-1">{t("trie.analysis.space.map_note")}</p>
          </div>
        </div>
      </SectionCard>

      {/* Comparison table */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-3">{t("trie.analysis.table.title")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {[
                  t("trie.analysis.table.structure"),
                  t("trie.analysis.table.insert"),
                  t("trie.analysis.table.search"),
                  t("trie.analysis.table.prefix"),
                  t("trie.analysis.table.space"),
                ].map(h => (
                  <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  ds: "Trie",
                  ins: "O(L)",
                  srch: "O(L)",
                  prefix: "✓ O(L)",
                  space: "O(N·Σ)",
                  highlight: true,
                },
                {
                  ds: "HashMap",
                  ins: "O(L)",
                  srch: "O(L)",
                  prefix: "✗ O(N·L)",
                  space: "O(N·L)",
                  highlight: false,
                },
                {
                  ds: "Sorted Array + Binary Search",
                  ins: "O(N·L)",
                  srch: "O(L·log N)",
                  prefix: "✓ O(L·log N)",
                  space: "O(N·L)",
                  highlight: false,
                },
                {
                  ds: "BST (std::set<string>)",
                  ins: "O(L·log N)",
                  srch: "O(L·log N)",
                  prefix: "✓ O(L·log N)",
                  space: "O(N·L)",
                  highlight: false,
                },
              ].map(row => (
                <tr
                  key={row.ds}
                  className="border-b border-[var(--color-border)]/50"
                  style={row.highlight ? { background: "var(--color-accent)/8" } : undefined}
                >
                  <td className="py-2 pr-4 font-mono text-xs font-semibold"
                    style={{ color: row.highlight ? "var(--color-accent)" : "var(--color-text)" }}>
                    {row.ds}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--color-text)]">{row.ins}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--color-text)]">{row.srch}</td>
                  <td className="py-2 pr-4 font-mono text-xs"
                    style={{ color: row.prefix.startsWith("✓") ? "var(--color-accent-3)" : "var(--color-danger)" }}>
                    {row.prefix}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-[var(--color-muted)]">{row.space}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-[var(--color-muted)] mt-2">{t("trie.analysis.table.note")}</p>
        </div>
      </SectionCard>

      {/* Applications */}
      <SectionCard>
        <h3 className="font-semibold text-[var(--color-text)] mb-2">{t("trie.analysis.apps.title")}</h3>
        <ul className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <li key={i} className="flex gap-2 text-sm text-[var(--color-muted)]">
              <span className="text-[var(--color-accent)] font-mono font-bold mt-0.5">→</span>
              <span>{t(`trie.analysis.apps.item${i}` as any)}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
