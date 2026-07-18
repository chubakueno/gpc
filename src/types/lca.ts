export interface LCALayoutPos {
  x: number;
  y: number;
}

export type LCAStepPhase = "start" | "equalize" | "search" | "done";

export interface LCAStep {
  phase: LCAStepPhase;
  p1: number;
  p2: number;
  k: number | null;
  jumped: boolean;
  mover: "p1" | "p2" | "both" | null;
  lca: number | null;
}
