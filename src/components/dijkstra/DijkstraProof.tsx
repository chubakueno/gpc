import { useLang } from "@/i18n/LanguageContext";
import { MathBlock } from "@/components/shared/MathBlock";
import { SectionCard } from "@/components/layout/SectionCard";

const COMPLEXITY_ROWS: [string, string, string][] = [
  ["Array (no heap)",       "O(V^2)",           "Dense graphs"],
  ["Binary heap",           "O((V+E) \\log V)", "Sparse graphs — typical"],
  ["Fibonacci heap",        "O(E + V \\log V)", "Theoretical optimum"],
];

function NegativeWeightExample() {
  const { t } = useLang();
  const nodes = [
    { id: "A", x: 40,  y: 90 },
    { id: "B", x: 200, y: 30 },
    { id: "C", x: 200, y: 150 },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center">
      <svg viewBox="0 0 240 180" width="240" height="180" style={{ flexShrink: 0 }} aria-label="Negative weight counterexample graph">
        <defs>
          <marker id="ceArrowNormal" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-muted)" />
          </marker>
          <marker id="ceArrowNeg" markerWidth={7} markerHeight={7} refX={5} refY={3.5} orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-danger)" />
          </marker>
        </defs>
        {/* A -> B, weight 5 */}
        <line x1={58} y1={82} x2={182} y2={38} stroke="var(--color-muted)" strokeWidth={1.4} markerEnd="url(#ceArrowNormal)" />
        <text x={110} y={48} fontSize={11} fontFamily="var(--font-mono, monospace)" fill="var(--color-muted)">5</text>
        {/* A -> C, weight 2 */}
        <line x1={58} y1={98} x2={182} y2={144} stroke="var(--color-muted)" strokeWidth={1.4} markerEnd="url(#ceArrowNormal)" />
        <text x={110} y={135} fontSize={11} fontFamily="var(--font-mono, monospace)" fill="var(--color-muted)">2</text>
        {/* B -> C, weight -10 */}
        <line x1={200} y1={50} x2={200} y2={130} stroke="var(--color-danger)" strokeWidth={1.8} markerEnd="url(#ceArrowNeg)" />
        <text x={208} y={92} fontSize={11} fontFamily="var(--font-mono, monospace)" fill="var(--color-danger)" fontWeight="bold">−10</text>

        {nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={16} fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth={2} />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="bold" fontFamily="var(--font-mono, monospace)" fill="var(--color-text)">
              {n.id}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex-1 space-y-2 text-sm">
        <p className="text-[var(--color-muted)]">{t("dijkstra.proof.negative.trace")}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <div className="px-3 py-2 rounded-lg bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30">
            <div className="text-xs text-[var(--color-muted)]">{t("dijkstra.proof.negative.dijkstra")}</div>
            <div className="font-mono font-bold text-[var(--color-danger)]">dist[C] = 2</div>
          </div>
          <div className="px-3 py-2 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
            <div className="text-xs text-[var(--color-muted)]">{t("dijkstra.proof.negative.true")}</div>
            <div className="font-mono font-bold text-[var(--color-accent)]">dist[C] = −5 (A→B→C)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DijkstraProof() {
  const { t } = useLang();

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("dijkstra.proof.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("dijkstra.proof.subtitle")}</p>

      <div className="mb-8 p-4 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30">
        <p className="text-sm font-medium text-[var(--color-text)] mb-3">
          {t("dijkstra.proof.summary")}
        </p>
        <p className="text-sm text-[var(--color-muted)]">{t("dijkstra.proof.summary.body")}</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Invariant */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
            {t("dijkstra.proof.invariant.title")}
          </p>
          <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
            {t("dijkstra.proof.invariant.body")}
          </p>
          <div className="p-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] overflow-x-auto mb-3">
            <MathBlock math="u = \arg\min_{v \notin S} \text{dist}[v] \;\Rightarrow\; \text{dist}[u] = \delta(\text{source}, u)" />
          </div>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed italic border-l-2 border-[var(--color-accent)]/40 pl-3">
            {t("dijkstra.proof.invariant.proof")}
          </p>
        </div>

        {/* Negative weights */}
        <div className="p-4 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
          <p className="text-sm font-semibold text-[var(--color-text)] mb-2">
            {t("dijkstra.proof.negative.title")}
          </p>
          <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
            {t("dijkstra.proof.negative.body")}
          </p>
          <NegativeWeightExample />
        </div>

        {/* Complexity table */}
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-3">
            {t("dijkstra.proof.table.title")}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[var(--color-muted)] border-b border-[var(--color-border)]">
                  <th className="pb-2 pr-6">{t("dijkstra.proof.table.algorithm")}</th>
                  <th className="pb-2 pr-6">{t("dijkstra.proof.table.time")}</th>
                  <th className="pb-2">{t("dijkstra.proof.table.notes")}</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_ROWS.map(([algo, time, notes]) => (
                  <tr key={algo} className="border-b border-[var(--color-border)]/50">
                    <td className="py-2 pr-6 text-[var(--color-text)]">{algo}</td>
                    <td className="py-2 pr-6 font-mono text-xs text-[var(--color-accent)]">
                      <MathBlock math={time} inline />
                    </td>
                    <td className="py-2 text-xs text-[var(--color-muted)]">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
