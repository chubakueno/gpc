import { useState, useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { TrieSVG } from "./TrieSVG";
import { createTrie, insertWord, layoutTrie, getMatchHighlight, getAutocompletions } from "./trieOps";
import type { TrieData } from "@/types/trie";

const AUTO_WORDS = [
  "sort", "stack", "string", "struct", "set", "step",
  "tree", "trie", "true", "try", "type",
  "hash", "heap",
  "int", "if",
  "map", "max", "min",
  "node", "null",
  "pair", "path",
  "queue",
  "return",
];

function buildAutoTrie(): TrieData {
  let t = createTrie();
  for (const w of AUTO_WORDS) t = insertWord(t, w);
  return t;
}

export function TrieApps() {
  const { t } = useLang();
  const trie = useMemo(buildAutoTrie, []);
  const layout = useMemo(() => layoutTrie(trie), [trie]);
  const [prefix, setPrefix] = useState("");

  const { highlightSet, subtreeSet, completions } = useMemo(() => {
    if (!prefix) return { highlightSet: new Set<number>(), subtreeSet: new Set<number>(), completions: [] as string[] };
    const matchSet = getMatchHighlight(trie, prefix);
    const comps = getAutocompletions(trie, prefix);

    // Split matchSet into prefix path (highlightSet) and subtree (subtreeSet)
    // prefix path: the nodes corresponding exactly to the typed prefix
    const path: number[] = [];
    let curId = trie.rootId;
    path.push(curId);
    let valid = true;
    for (const ch of prefix) {
      const node = trie.nodes.get(curId)!;
      if (!(ch in node.children)) { valid = false; break; }
      curId = node.children[ch];
      path.push(curId);
    }

    const prefixSet = new Set(path);
    const sub = valid
      ? new Set([...matchSet].filter(id => !prefixSet.has(id)))
      : new Set<number>();

    return { highlightSet: prefixSet, subtreeSet: sub, completions: comps };
  }, [trie, prefix]);

  const hasNoMatch = prefix.length > 0 && completions.length === 0;

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("trie.auto.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("trie.auto.desc")}</p>
      </SectionCard>

      {/* Input */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <label className="block text-xs text-[var(--color-muted)] mb-2">{t("trie.auto.label")}</label>
        <input
          value={prefix}
          onChange={e => setPrefix(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))}
          placeholder={t("trie.auto.placeholder")}
          className="w-full max-w-xs px-3 py-2 rounded-lg text-sm font-mono bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-muted)] outline-none focus:border-[var(--color-accent-2)]"
        />
        {/* Completions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {completions.length > 0
            ? completions.map(w => (
              <span key={w} className="text-sm font-mono px-3 py-1 rounded-full border"
                style={{ borderColor: "var(--color-accent-3)", color: "var(--color-accent-3)", background: "var(--color-surface-2)" }}>
                <span style={{ color: "var(--color-accent-2)", fontWeight: "bold" }}>{w.slice(0, prefix.length)}</span>
                <span>{w.slice(prefix.length)}</span>
              </span>
            ))
            : prefix
              ? <span className="text-sm text-[var(--color-danger)]">{t("trie.auto.no_match")}</span>
              : <span className="text-sm text-[var(--color-muted)]">{t("trie.auto.type_hint")}</span>
          }
        </div>
      </div>

      {/* Trie SVG */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 overflow-x-auto">
        <TrieSVG
          trie={trie}
          layout={layout}
          highlightIds={[...highlightSet]}
          activeId={hasNoMatch ? [...highlightSet].pop() ?? null : null}
          phase={hasNoMatch ? "not_found" : "visiting"}
          subtreeSet={subtreeSet}
        />
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-xs font-semibold text-[var(--color-muted)] mb-2 uppercase tracking-wide">{t("trie.demo.legend.title")}</p>
        <div className="flex flex-wrap gap-4">
          {[
            { color: "var(--color-accent-2)", label: t("trie.auto.legend.prefix") },
            { color: "var(--color-accent-3)", label: t("trie.auto.legend.subtree") },
            { color: "var(--color-border)",   label: t("trie.auto.legend.other") },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-xs text-[var(--color-muted)]">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-2">{t("trie.auto.words_loaded", { n: String(AUTO_WORDS.length) })}</p>
      </div>
    </div>
  );
}
