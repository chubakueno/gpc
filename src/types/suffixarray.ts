export type SAAction = "init" | "sort_step" | "done";

export interface SAFrame {
  action: SAAction;
  k: number;        // current prefix length used for sorting (0 = unsorted init)
  order: number[];  // order[pos] = suffix start index (the SA approximation)
  rank: number[];   // rank[i] = current normalized rank of suffix starting at i
  message: string;
}
