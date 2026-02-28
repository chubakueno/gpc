export interface UFDSNode {
  id: number;
  label: string;
  parent: number;
  rank: number;
  size: number;
  x: number;
  y: number;
}

export interface UFDSEdge {
  from: number;
  to: number;
  isNew?: boolean;
  isCompressing?: boolean;
}

export type OptimizationMode =
  | "none"
  | "compression"
  | "rank"
  | "both";

export type AnimationPhase =
  | "idle"
  | "finding"
  | "compressing"
  | "done";

export interface UFDSState {
  nodes: UFDSNode[];
  optimizationMode: OptimizationMode;
  highlightedPath: number[];
  animationPhase: AnimationPhase;
  operationLog: string[];
  newEdges: Array<{ from: number; to: number }>;
  removedEdges: Array<{ from: number; to: number }>;
}

export type UFDSAction =
  | { type: "ADD_NODE" }
  | { type: "RESET" }
  | { type: "SET_MODE"; mode: OptimizationMode }
  | { type: "UNION"; a: number; b: number }
  | { type: "FIND"; x: number }
  | { type: "TICK" }
  | { type: "LOG"; message: string };

export interface DragState {
  active: boolean;
  sourceId: number | null;
  currentX: number;
  currentY: number;
  targetId: number | null;
}
