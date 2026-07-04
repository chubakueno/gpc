export interface DijkstraNodePos {
  id: number;
  x: number;
  y: number;
}

export interface DirectedWeightedEdge {
  from: number;
  to: number;
  weight: number;
  key: string; // `${from}-${to}`
}

export interface DijkstraPQEntry {
  node: number;
  dist: number;
}

export interface DijkstraRelaxedEdge {
  edgeKey: string;
  from: number;
  to: number;
  improved: boolean;
  newDist: number;
}

export interface DijkstraStep {
  dist: number[];
  settled: boolean[];
  parentEdgeKey: (string | null)[];
  pq: DijkstraPQEntry[];
  currentNode: number | null;
  poppedStale: DijkstraPQEntry[];
  relaxed: DijkstraRelaxedEdge[];
  done: boolean;
}
