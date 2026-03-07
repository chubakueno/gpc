export type ZAction =
  | "start"          // z[0] = n, initialization
  | "init"           // starting to compute z[i], inside or outside Z-box
  | "cache"          // i inside Z-box, use cached z[i-l]
  | "extend_match"   // s[z[i]] == s[i+z[i]], extending
  | "extend_mismatch"// s[z[i]] != s[i+z[i]], stopping
  | "set"            // z[i] final value set
  | "done";

export interface ZFrame {
  i: number;
  z: number[];       // -1 = not yet computed
  l: number;
  r: number;
  action: ZAction;
  prefixPos?: number; // s[prefixPos] in comparison (= current z[i])
  strPos?: number;    // s[strPos] in comparison   (= i + z[i])
  message: string;
}
