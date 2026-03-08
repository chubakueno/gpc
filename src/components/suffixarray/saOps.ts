import type { SAFrame } from "@/types/suffixarray";

/** Compute the normalized initial ranks by first character. */
function initRank(s: string): number[] {
  const chars = [...new Set(Array.from(s))].sort();
  const charRank: Record<string, number> = {};
  chars.forEach((c, i) => (charRank[c] = i));
  return Array.from(s, ch => charRank[ch]);
}

/** Kasai's O(N) LCP array. lcp[0] = 0 by convention. */
export function computeLCP(s: string, sa: number[]): number[] {
  const n = s.length;
  const rank = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) rank[sa[i]] = i;

  const lcp = new Array<number>(n).fill(0);
  let h = 0;
  for (let i = 0; i < n; i++) {
    if (rank[i] > 0) {
      const j = sa[rank[i] - 1];
      while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;
      lcp[rank[i]] = h;
      if (h > 0) h--;
    }
  }
  return lcp;
}

/** Prefix-doubling suffix array with O(N log² N). Returns frames for animation. */
export function computeSAFrames(s: string): SAFrame[] {
  const n = s.length;
  const sa = Array.from({ length: n }, (_, i) => i);
  let rank = initRank(s);

  const frames: SAFrame[] = [];

  frames.push({
    action: "init",
    k: 0,
    order: [...sa],
    rank: [...rank],
    message: `"${s}" has ${n} suffixes. Shown in original index order — not yet sorted.`,
  });

  let k = 1;
  while (true) {
    const rk = rank; // capture for closure
    sa.sort((a, b) => {
      if (rk[a] !== rk[b]) return rk[a] - rk[b];
      const ra = a + k < n ? rk[a + k] : -1;
      const rb = b + k < n ? rk[b + k] : -1;
      return ra - rb || a - b; // stable tie-break by index
    });

    // Normalize ranks for this step
    const newRank = new Array<number>(n).fill(0);
    for (let i = 1; i < n; i++) {
      const [pa, pb] = [sa[i - 1], sa[i]];
      const sameFirst  = rk[pa]   === rk[pb];
      const sameSecond = (pa + k < n ? rk[pa + k] : -1) === (pb + k < n ? rk[pb + k] : -1);
      newRank[pb] = newRank[pa] + (sameFirst && sameSecond ? 0 : 1);
    }
    rank = newRank;

    const maxRank = rank[sa[n - 1]];
    const allUnique = maxRank === n - 1;

    frames.push({
      action: allUnique ? "done" : "sort_step",
      k,
      order: [...sa],
      rank: [...rank],
      message: allUnique
        ? `k=${k}: All ${n} ranks unique — SA is complete! SA = [${sa.join(", ")}]`
        : `k=${k}: Sorted by first ${k} characters. ${maxRank + 1} distinct groups — refine with k=${k * 2}.`,
    });

    if (allUnique || k >= n) break;
    k *= 2;
  }

  return frames;
}
