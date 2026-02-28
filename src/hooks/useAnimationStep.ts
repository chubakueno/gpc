import { useCallback, useEffect, useRef, useState } from "react";

interface UseAnimationStepOptions {
  intervalMs?: number;
  loop?: boolean;
}

interface UseAnimationStepReturn<T> {
  frame: T;
  stepIdx: number;
  totalSteps: number;
  isPlaying: boolean;
  isAtEnd: boolean;
  next: () => void;
  prev: () => void;
  reset: () => void;
  play: () => void;
  pause: () => void;
  goTo: (idx: number) => void;
}

export function useAnimationStep<T>(
  steps: T[],
  options: UseAnimationStepOptions = {}
): UseAnimationStepReturn<T> {
  const { intervalMs = 800, loop = false } = options;
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = steps.length;
  const clampedIdx = Math.min(Math.max(stepIdx, 0), Math.max(totalSteps - 1, 0));
  const frame = steps[clampedIdx] ?? steps[0];
  const isAtEnd = clampedIdx >= totalSteps - 1;

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const next = useCallback(() => {
    setStepIdx((i) => {
      if (i >= totalSteps - 1) {
        if (loop) return 0;
        return i;
      }
      return i + 1;
    });
  }, [totalSteps, loop]);

  const prev = useCallback(() => {
    setStepIdx((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    clear();
    setIsPlaying(false);
    setStepIdx(0);
  }, [clear]);

  const play = useCallback(() => {
    if (isAtEnd && !loop) {
      setStepIdx(0);
    }
    setIsPlaying(true);
  }, [isAtEnd, loop]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const goTo = useCallback((idx: number) => {
    setStepIdx(Math.min(Math.max(idx, 0), totalSteps - 1));
  }, [totalSteps]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIdx((i) => {
          if (i >= totalSteps - 1) {
            if (loop) return 0;
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, intervalMs);
    } else {
      clear();
    }
    return clear;
  }, [isPlaying, intervalMs, totalSteps, loop, clear]);

  // Reset step index when steps array changes (e.g., user changes input)
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [steps.length]);

  return {
    frame,
    stepIdx: clampedIdx,
    totalSteps,
    isPlaying,
    isAtEnd,
    next,
    prev,
    reset,
    play,
    pause,
    goTo,
  };
}
