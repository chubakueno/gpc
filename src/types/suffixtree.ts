export type STAction = "init" | "insert_start" | "walk" | "split" | "add_leaf" | "insert_done" | "done";

export interface STNodeData {
  id: number;
  children: Record<string, number>;  // first char of edge → child id
  edgeStart: number;   // start index of edge label in string (-1 for root)
  edgeEnd: number;     // end index (exclusive); leaves use str.length
  parentId: number | null;
  isLeaf: boolean;
  suffixIndex: number | null;  // for leaves: which suffix starts here
}

export interface STFrame {
  action: STAction;
  nodes: STNodeData[];
  str: string;
  activeId: number | null;
  highlightIds: number[];
  currentSuffix: number | null;
  newIds: number[];
  message: string;
}
