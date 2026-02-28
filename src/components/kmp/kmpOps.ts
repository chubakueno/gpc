import type { KMPFrame, KMPAction, FailFrame } from "@/types/kmp";

// ─── Failure function ─────────────────────────────────────────────────────────

export function computeFail(pattern: string): number[] {
  const m = pattern.length;
  if (m === 0) return [];
  const fail = new Array<number>(m).fill(0);
  let j = 0;
  for (let i = 1; i < m; i++) {
    while (j > 0 && pattern[i] !== pattern[j]) j = fail[j - 1];
    if (pattern[i] === pattern[j]) j++;
    fail[i] = j;
  }
  return fail;
}

export function computeFailFrames(pattern: string): FailFrame[] {
  const m = pattern.length;
  if (m === 0) return [];

  const fail = new Array<number>(m).fill(0);
  const frames: FailFrame[] = [];

  // Base case
  frames.push({ i: 0, j: 0, fail: [...fail], action: "set",
    message: `fail[0] = 0 — a single character has no proper prefix` });

  let j = 0;
  for (let i = 1; i < m; i++) {
    frames.push({ i, j, fail: [...fail], action: "compare",
      message: `i=${i}: compare P[${i}]='${pattern[i]}' with P[${j}]='${pattern[j]}' (j=${j})` });

    while (j > 0 && pattern[i] !== pattern[j]) {
      frames.push({ i, j, fail: [...fail], action: "mismatch",
        message: `P[${i}]='${pattern[i]}' ≠ P[${j}]='${pattern[j]}' — jump: j = fail[${j - 1}] = ${fail[j - 1]}` });
      j = fail[j - 1];
      frames.push({ i, j, fail: [...fail], action: "fallback",
        message: `j = ${j}, now compare P[${i}]='${pattern[i]}' with P[${j}]='${pattern[j]}'` });
    }

    if (pattern[i] === pattern[j]) {
      frames.push({ i, j, fail: [...fail], action: "match",
        message: `P[${i}]='${pattern[i]}' == P[${j}]='${pattern[j]}' — length grows to ${j + 1}` });
      j++;
    } else {
      // j == 0 and no match
      frames.push({ i, j, fail: [...fail], action: "mismatch",
        message: `P[${i}]='${pattern[i]}' ≠ P[0]='${pattern[0]}' — no proper border` });
    }

    fail[i] = j;
    frames.push({ i, j, fail: [...fail], action: "set",
      message: `fail[${i}] = ${j}` });
  }

  frames.push({ i: m - 1, j, fail: [...fail], action: "done",
    message: `Done! fail = [${fail.join(", ")}]` });

  return frames;
}

// ─── KMP search ───────────────────────────────────────────────────────────────

export function computeKMPFrames(
  text: string,
  pattern: string,
): { frames: KMPFrame[]; fail: number[] } {
  const n = text.length;
  const m = pattern.length;
  const fail = computeFail(pattern);
  const frames: KMPFrame[] = [];
  const matches: number[] = [];

  if (m === 0 || n === 0) {
    return {
      frames: [{ i: 0, j: 0, action: "done", matches: [], message: "Empty text or pattern." }],
      fail,
    };
  }

  const push = (i: number, j: number, action: KMPAction, msg: string) =>
    frames.push({ i, j, action, matches: [...matches], message: msg });

  push(0, 0, "init", `Searching "${pattern}" in "${text}"`);

  let i = 0;
  let j = 0;

  while (i < n) {
    if (text[i] === pattern[j]) {
      if (j === m - 1) {
        // Full match
        const start = i - m + 1;
        matches.push(start);
        push(i, j, "found",
          `Match found at position ${start}! T[${start}..${i}] = "${text.slice(start, i + 1)}"`);
        j = fail[m - 1];
        i++;
      } else {
        push(i, j, "match",
          `T[${i}]='${text[i]}' == P[${j}]='${pattern[j]}' — ${j + 1}/${m} matched`);
        i++;
        j++;
      }
    } else if (j > 0) {
      const newJ = fail[j - 1];
      push(i, j, "mismatch",
        `T[${i}]='${text[i]}' ≠ P[${j}]='${pattern[j]}' — jump: j = fail[${j - 1}] = ${newJ}`);
      j = newJ;
      push(i, j, "fallback",
        `Reuse ${j} matched chars — now compare T[${i}] with P[${j}]`);
    } else {
      push(i, 0, "no_match",
        `T[${i}]='${text[i]}' ≠ P[0]='${pattern[0]}' — advance`);
      i++;
    }
  }

  push(
    n - 1, j, "done",
    matches.length > 0
      ? `Done! ${matches.length} occurrence(s) at position(s): ${matches.join(", ")}`
      : "Done! No occurrences found.",
  );

  return { frames, fail };
}
