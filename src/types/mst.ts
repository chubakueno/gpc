export interface MSTNodePos {
  id: number;
  x: number;
  y: number;
}

export interface WeightedEdge {
  u: number;
  v: number;
  weight: number;
  key: string; // `${Math.min(u,v)}-${Math.max(u,v)}`
}

export interface KruskalStep {
  sortedEdges: WeightedEdge[];
  considerIdx: number;       // -1 = initial (just sorted), otherwise index into sortedEdges
  mstEdgeKeys: string[];
  rejectedEdgeKeys: string[];
  decision: "accept" | "reject" | "none";
  mstWeight: number;
  done: boolean;
}

export interface PrimPQEntry {
  from: number;
  to: number;
  weight: number;
  edgeKey: string;
}

export interface PrimStep {
  inMST: boolean[];
  mstEdgeKeys: string[];
  currentEdgeKey: string | null;
  currentNode: number | null;
  pqEntries: PrimPQEntry[];
  mstWeight: number;
  done: boolean;
}
