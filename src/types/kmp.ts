export type KMPAction =
  | "init"
  | "match"
  | "mismatch"
  | "fallback"
  | "no_match"
  | "found"
  | "done";

export interface KMPFrame {
  i: number;          // text index (the char being compared / just compared)
  j: number;          // pattern index (the char being compared / just compared)
  action: KMPAction;
  matches: number[];  // start positions of all completed matches (cumulative)
  message: string;
}

export type FailAction = "set" | "compare" | "match" | "mismatch" | "fallback" | "done";

export interface FailFrame {
  i: number;          // pattern position currently being computed
  j: number;          // current prefix-suffix candidate length
  fail: number[];     // fail array (all positions filled so far)
  action: FailAction;
  message: string;
}
