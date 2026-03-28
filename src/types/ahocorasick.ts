export type ACAction =
  | "init"
  | "add_node"
  | "bfs_start"
  | "process_node"
  | "set_fail"
  | "fail_done"
  | "set_dict"
  | "done";

export interface ACNodeData {
  id: number;
  char: string;           // edge label from parent ("" for root)
  children: Record<string, number>;
  failId: number;         // root.failId = 0 (self-loop)
  dictId: number | null;
  depth: number;
  parentId: number | null;
  isEnd: boolean;
  patterns: string[];     // patterns ending at this node
}

export interface ACFrame {
  action: ACAction;
  nodes: ACNodeData[];
  activeId: number | null;
  newFailFrom?: number;
  newFailTo?: number;
  newDictFrom?: number;
  newDictTo?: number;
  visibleFailIds: number[];   // nodes that already have rendered fail links
  visibleDictIds: number[];   // nodes that already have rendered dict links
  message: string;
}
