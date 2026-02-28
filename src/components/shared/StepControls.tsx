import { useLang } from "@/i18n/LanguageContext";

interface StepControlsProps {
  isPlaying: boolean;
  isAtEnd: boolean;
  stepIdx: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  className?: string;
}

export function StepControls({
  isPlaying,
  isAtEnd,
  stepIdx,
  totalSteps,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  className = "",
}: StepControlsProps) {
  const { t } = useLang();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        onClick={onPrev}
        disabled={stepIdx === 0}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-surface-2)] text-[var(--color-text)] disabled:opacity-30 hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {t("controls.prev")}
      </button>

      {isPlaying ? (
        <button
          onClick={onPause}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
        >
          {t("controls.pause")}
        </button>
      ) : (
        <button
          onClick={onPlay}
          disabled={isAtEnd}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
        >
          {t("controls.play")}
        </button>
      )}

      <button
        onClick={onNext}
        disabled={isAtEnd}
        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-surface-2)] text-[var(--color-text)] disabled:opacity-30 hover:bg-[var(--color-surface-3)] transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {t("controls.step")}
      </button>

      <button
        onClick={onReset}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-muted)] transition-colors cursor-pointer"
      >
        {t("controls.reset")}
      </button>

      <span className="text-xs text-[var(--color-muted)] ml-1">
        {t("controls.step.of", { n: stepIdx + 1, total: totalSteps })}
      </span>
    </div>
  );
}
