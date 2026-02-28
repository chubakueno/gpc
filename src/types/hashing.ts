export interface NormalHashStep {
  index: number;
  char: string;
  ascii: number;
  contribution: number;
  runningHash: number;
  formula: string;
}

export interface RollingHashStep {
  windowStart: number;
  windowEnd: number;
  window: string;
  hash: number;
  removing: string | null;
  adding: string | null;
  formula: string;
}

export interface NormalHashConfig {
  input: string;
  base: number;
  mod: number;
}

export interface RollingHashConfig {
  input: string;
  windowSize: number;
  base: number;
  mod: number;
}

export interface BinSimState {
  bins: Map<number, number>;
  items: number;
  firstCollision: number | null;
  sequence: number[];
}
