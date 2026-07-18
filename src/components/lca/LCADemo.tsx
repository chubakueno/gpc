import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { useAnimationStep } from "@/hooks/useAnimationStep";
import { StepControls } from "@/components/shared/StepControls";
import { SectionCard } from "@/components/layout/SectionCard";
import { LCATree, TREE_PARENT, DEPTH, UP, LOG, NODE_COUNT } from "./LCATree";
import type { LCAStep } from "@/types/lca";

const DEFAULT_PAIR: [number, number] = [7, 12];

function computeLCASteps(a: number, b: number): LCAStep[] {
  let p1 = a;
  let p2 = b;
  const steps: LCAStep[] = [
    { phase: "start", p1, p2, k: null, jumped: false, mover: null, lca: null },
  ];

  for (let k = LOG - 1; k >= 0; k--) {
    if (DEPTH[p1] - (1 << k) >= DEPTH[p2]) {
      p1 = UP[k][p1];
      steps.push({ phase: "equalize", p1, p2, k, jumped: true, mover: "p1", lca: null });
    } else if (DEPTH[p2] - (1 << k) >= DEPTH[p1]) {
      p2 = UP[k][p2];
      steps.push({ phase: "equalize", p1, p2, k, jumped: true, mover: "p2", lca: null });
    } else {
      steps.push({ phase: "equalize", p1, p2, k, jumped: false, mover: null, lca: null });
    }
  }

  if (p1 === p2) {
    steps.push({ phase: "done", p1, p2, k: null, jumped: false, mover: null, lca: p1 });
    return steps;
  }

  for (let k = LOG - 1; k >= 0; k--) {
    if (UP[k][p1] !== UP[k][p2]) {
      p1 = UP[k][p1];
      p2 = UP[k][p2];
      steps.push({ phase: "search", p1, p2, k, jumped: true, mover: "both", lca: null });
    } else {
      steps.push({ phase: "search", p1, p2, k, jumped: false, mover: null, lca: null });
    }
  }

  const lca = TREE_PARENT[p1];
  steps.push({ phase: "done", p1, p2, k: null, jumped: false, mover: null, lca });
  return steps;
}

export function LCADemo() {
  const { t } = useLang();
  const [pair, setPair] = useState<[number, number] | null>(DEFAULT_PAIR);
  const [pending, setPending] = useState<number | null>(null);

  const steps = useMemo(() => (pair ? computeLCASteps(pair[0], pair[1]) : []), [pair]);
  const { frame, stepIdx, totalSteps, isPlaying, isAtEnd, next, prev, reset, play, pause } =
    useAnimationStep<LCAStep>(steps, { intervalMs: 1200 });

  useEffect(() => { reset(); }, [pair]); // eslint-disable-line react-hooks/exhaustive-deps

  function handlePick(id: number) {
    if (pending === null) {
      setPending(id);
    } else if (id !== pending) {
      setPair([pending, id]);
      setPending(null);
    } else {
      setPending(null);
    }
  }

  function handleChangePair() {
    setPair(null);
    setPending(null);
  }

  function handleRandomize() {
    const x = Math.floor(Math.random() * NODE_COUNT);
    let y = Math.floor(Math.random() * NODE_COUNT);
    while (y === x) y = Math.floor(Math.random() * NODE_COUNT);
    setPair([x, y]);
    setPending(null);
  }

  const picking = pair === null;
  const p1 = picking ? pending : frame?.p1 ?? null;
  const p2 = picking ? null : frame?.p2 ?? null;
  const lca = !picking && frame ? frame.lca : null;

  let statusMsg = "";
  if (!picking && frame) {
    const size = frame.k !== null ? 1 << frame.k : 0;
    if (frame.phase === "start") {
      statusMsg = t("lca.demo.step.start", { a: pair![0], b: pair![1] });
    } else if (frame.phase === "equalize") {
      statusMsg = frame.jumped
        ? t("lca.demo.step.equalize.jump", {
            mover: frame.mover === "p1" ? "A" : "B",
            k: frame.k!,
            size,
            node: frame.mover === "p1" ? frame.p1 : frame.p2,
          })
        : t("lca.demo.step.equalize.skip", { k: frame.k!, size });
    } else if (frame.phase === "search") {
      statusMsg = frame.jumped
        ? t("lca.demo.step.search.jump", { k: frame.k!, size, p1: frame.p1, p2: frame.p2 })
        : t("lca.demo.step.search.skip", { k: frame.k!, size });
    } else {
      statusMsg = t("lca.demo.step.done", { lca: frame.lca ?? -1 });
    }
  }

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("lca.demo.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t("lca.demo.desc")}</p>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleRandomize}
          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
        >
          {t("lca.demo.randomize")}
        </button>
        {!picking && (
          <button
            onClick={handleChangePair}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
          >
            {t("lca.demo.changepair")}
          </button>
        )}
      </div>

      {picking ? (
        <p className="text-sm font-medium text-[var(--color-accent-2)] mb-4">
          {pending === null ? t("lca.demo.pick.first") : t("lca.demo.pick.second")}
        </p>
      ) : (
        <StepControls
          isPlaying={isPlaying}
          isAtEnd={isAtEnd}
          stepIdx={stepIdx}
          totalSteps={totalSteps}
          onPlay={play}
          onPause={pause}
          onNext={next}
          onPrev={prev}
          onReset={reset}
          className="mb-6"
        />
      )}

      <div className="flex flex-col lg:flex-row gap-6 mb-6 items-start">
        <div className="flex-1 min-w-0 flex justify-center">
          <LCATree p1={p1} p2={p2} lca={lca} onNodeClick={picking ? handlePick : undefined} />
        </div>

        {!picking && pair && (
          <div className="lg:w-56 flex-shrink-0 space-y-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[var(--color-accent-2)]/10 border border-[var(--color-accent-2)]/30">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-2)]" />
              A = {pair[0]} (depth {DEPTH[pair[0]]})
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[var(--color-accent-3)]/10 border border-[var(--color-accent-3)]/30">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent-3)]" />
              B = {pair[1]} (depth {DEPTH[pair[1]]})
            </div>
            {frame?.k !== null && frame && (
              <div className="px-2.5 py-1.5 rounded-lg text-xs font-mono border border-[var(--color-border)] text-[var(--color-muted)]">
                2^{frame.k} = {1 << frame.k!}
              </div>
            )}
          </div>
        )}
      </div>

      {!picking && (
        <>
          <div
            className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              frame?.phase === "done"
                ? "bg-[var(--color-warn)]/10 border-[var(--color-warn)]/30 text-[var(--color-text)]"
                : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            {statusMsg}
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-[var(--color-muted)]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent-2)]" />
              {t("lca.legend.pointerA")}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--color-accent-3)]" />
              {t("lca.legend.pointerB")}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--color-warn)]" />
              {t("lca.legend.result")}
            </div>
          </div>
        </>
      )}
    </SectionCard>
  );
}
