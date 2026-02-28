export interface TrieNodeData {
  id: number;
  char: string;              // character labeling the edge from parent to this node ('' for root)
  isEnd: boolean;            // does a word end at this node?
  parentId: number | null;
  children: Record<string, number>; // char → child node id
  depth: number;
}

export interface TrieData {
  nodes: Map<number, TrieNodeData>;
  rootId: number;
  nextId: number;
  words: string[];
}

export interface TrieLayout {
  x: Map<number, number>;
  y: Map<number, number>;
  width: number;
  height: number;
}

export type AnimPhase = "visiting" | "new" | "found" | "not_found" | "idle";

export interface AnimFrame {
  hiddenIds: Set<number>;    // nodes not yet "created" (for insert animation)
  highlightIds: number[];    // path nodes highlighted in accent-2 (sky)
  activeId: number | null;   // current node (amber while traversing, phase-colored at end)
  newIds: number[];          // newly created nodes so far (violet)
  phase: AnimPhase;
  message: string;
}
