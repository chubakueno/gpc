import { useMemo } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { MathBlock } from "@/components/shared/MathBlock";
import { TREE_PARENT, DEPTH, NODE_COUNT } from "./LCATree";

const EXAMPLE_PAIR: [number, number] = [7, 12];

function buildEulerTour() {
  const children: number[][] = Array.from({ length: NODE_COUNT }, () => []);
  for (let v = 1; v < NODE_COUNT; v++) children[TREE_PARENT[v]].push(v);

  const tour: number[] = [];
  const first: number[] = new Array(NODE_COUNT).fill(-1);

  function dfs(v: number) {
    first[v] = tour.length;
    tour.push(v);
    for (const c of children[v]) {
      dfs(c);
      tour.push(v);
    }
  }
  dfs(0);

  return { tour, first };
}

const COMPLEXITY_ROWS: [string, string, string][] = [
  ["Naive walk-up", "O(n)", "O(1)"],
  ["Binary lifting", "O(n \\log n)", "O(\\log n)"],
  ["Euler tour + sparse table", "O(n \\log n)", "O(1)"],
];

export function EulerTourRMQ() {
  const { t } = useLang();
  const { tour, first } = useMemo(buildEulerTour, []);

  const [a, b] = EXAMPLE_PAIR;
  const lo = Math.min(first[a], first[b]);
  const hi = Math.max(first[a], first[b]);
  let minIdx = lo;
  for (let i = lo; i <= hi; i++) if (DEPTH[tour[i]] < DEPTH[tour[minIdx]]) minIdx = i;
  const lcaNode = tour[minIdx];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("lca.rmq.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("lca.rmq.desc")}</p>

      <div className="flex flex-col gap-4 mb-6">
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("lca.rmq.tour.title")}</p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">{t("lca.rmq.tour.body")}</p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">{t("lca.rmq.reduce.title")}</p>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-3">{t("lca.rmq.reduce.body")}</p>
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto">
            <MathBlock math="\text{lca}(u, v) = \text{tour}\Big[\; \arg\min_{\,i \,\in\, [\text{first}[u],\, \text{first}[v]]} \text{depth}(\text{tour}[i]) \;\Big]" />
          </div>
        </div>
      </div>

      {/* Euler tour strip with worked example */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-6">
        <p className="text-xs font-medium text-[var(--color-muted)] mb-3">
          {t("lca.rmq.example", { a, b, lca: lcaNode })}
        </p>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max pb-2">
            {tour.map((node, i) => {
              const inRange = i >= lo && i <= hi;
              const isMin = i === minIdx;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                      isMin
                        ? "border-[var(--color-warn)] bg-[var(--color-warn)]/25 text-[var(--color-warn)] scale-110"
                        : inRange
                        ? "border-[var(--color-accent-2)]/50 bg-[var(--color-accent-2)]/10 text-[var(--color-text)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-muted)]"
                    }`}
                  >
                    {node}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--color-muted)]">{DEPTH[node]}</div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-2">{t("lca.rmq.example.legend")}</p>
      </div>

      {/* Complexity comparison */}
      <div>
        <p className="text-sm font-medium text-[var(--color-text)] mb-3">{t("lca.rmq.table.title")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                <th className="pb-2 pr-6">{t("lca.rmq.table.approach")}</th>
                <th className="pb-2 pr-6">{t("lca.rmq.table.preprocess")}</th>
                <th className="pb-2">{t("lca.rmq.table.query")}</th>
              </tr>
            </thead>
            <tbody>
              {COMPLEXITY_ROWS.map(([approach, pre, query]) => (
                <tr key={approach} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-6 text-[var(--color-text)]">{approach}</td>
                  <td className="py-2 pr-6 font-mono text-xs text-[var(--color-accent)]">
                    <MathBlock math={pre} inline />
                  </td>
                  <td className="py-2 font-mono text-xs text-[var(--color-accent)]">
                    <MathBlock math={query} inline />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
