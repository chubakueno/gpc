import { useLang } from "@/i18n/LanguageContext";
import type { OptimizationMode } from "@/types/ufds";

interface UFDSControlsProps {
  mode: OptimizationMode;
  onSetMode: (m: OptimizationMode) => void;
  onAddNode: () => void;
  onReset: () => void;
  log: string[];
  nodeCount: number;
}

const MODES: { id: OptimizationMode; key: string }[] = [
  { id: "none", key: "ufds.controls.mode.none" },
  { id: "compression", key: "ufds.controls.mode.compression" },
  { id: "rank", key: "ufds.controls.mode.rank" },
  { id: "both", key: "ufds.controls.mode.both" },
];

export function UFDSControls({
  mode, onSetMode, onAddNode, onReset, log, nodeCount
}: UFDSControlsProps) {
  const { t } = useLang();

  return (
    <div className="flex flex-col gap-4">
      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onAddNode}
          disabled={nodeCount >= 20}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          + {t("ufds.controls.addNode")}
        </button>
        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
        >
          {t("ufds.controls.reset")}
        </button>
      </div>

      {/* Optimization mode */}
      <div>
        <p className="text-xs text-[var(--color-muted)] mb-2">{t("ufds.controls.mode")}</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map(({ id, key }) => (
            <button
              key={id}
              onClick={() => onSetMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                mode === id
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]"
              }`}
            >
              {t(key as Parameters<typeof t>[0])}
            </button>
          ))}
        </div>
      </div>

      {/* Operation log */}
      <div>
        <p className="text-xs text-[var(--color-muted)] mb-2">{t("ufds.controls.log.title")}</p>
        <div className="h-36 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
          {log.length === 0 ? (
            <p className="text-xs text-[var(--color-muted)] italic">{t("ufds.controls.log.empty")}</p>
          ) : (
            log.map((entry, i) => {
              const isUnion = entry.startsWith("union");
              const isFind = entry.startsWith("find");
              const isCompress = entry.startsWith("Path");
              const color = isUnion
                ? "text-[var(--color-accent)]"
                : isFind
                ? "text-[var(--color-accent-2)]"
                : isCompress
                ? "text-[var(--color-warn)]"
                : "text-[var(--color-muted)]";
              return (
                <div key={i} className={`text-xs font-mono mb-1 ${color} ${i === 0 ? "slide-in" : ""}`}>
                  {entry}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
          Root node
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-warn)]" />
          Path (finding)
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--color-accent-3)]" />
          Drag target
        </div>
      </div>
    </div>
  );
}
