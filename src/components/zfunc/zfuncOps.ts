import type { ZFrame } from "@/types/zfunc";

export function computeZArray(s: string): number[] {
  const n = s.length;
  const z = new Array<number>(n).fill(0);
  z[0] = n;
  let l = 0, r = 0;
  for (let i = 1; i < n; i++) {
    if (i <= r) z[i] = Math.min(z[i - l], r - i + 1);
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;
    if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
  }
  return z;
}

export function computeZFrames(s: string): ZFrame[] {
  const n = s.length;
  const frames: ZFrame[] = [];
  const z = new Array<number>(n).fill(-1);
  z[0] = n;
  let l = 0, r = 0;

  frames.push({ i: 0, z: [...z], l, r, action: "start",
    message: `z[0] = n = ${n} by definition — the whole string matches itself as a prefix.` });

  for (let i = 1; i < n; i++) {
    const insideBox = i <= r;

    frames.push({ i, z: [...z], l, r, action: "init",
      message: insideBox
        ? `i=${i} is inside Z-box [${l},${r}]. We know s[${i}..${r}] = s[${i-l}..${r-l}], so z[${i}] ≥ min(z[${i-l}], ${r-i+1}).`
        : `i=${i} is outside Z-box. Start matching from scratch.` });

    if (insideBox) {
      const cached = z[i - l];
      const rem    = r - i + 1;
      z[i] = Math.min(cached, rem);
      const needsExtend = cached >= rem;
      frames.push({
        i, z: [...z], l, r, action: "cache",
        prefixPos: needsExtend ? z[i]       : undefined,
        strPos:    needsExtend ? i + z[i]   : undefined,
        message: needsExtend
          ? `z[${i-l}]=${cached} ≥ rem=${rem} → z[${i}]=${z[i]} for now, must still verify beyond r=${r}.`
          : `z[${i-l}]=${cached} < rem=${rem} → z[${i}]=${cached} exactly. No extension needed.`,
      });
    } else {
      z[i] = 0;
    }

    // Extension loop
    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) {
      frames.push({
        i, z: [...z], l, r, action: "extend_match",
        prefixPos: z[i], strPos: i + z[i],
        message: `s[${z[i]}]='${s[z[i]]}' == s[${i+z[i]}]='${s[i+z[i]]}' ✓  →  z[${i}] extends to ${z[i]+1}`,
      });
      z[i]++;
    }

    if (i + z[i] < n) {
      frames.push({
        i, z: [...z], l, r, action: "extend_mismatch",
        prefixPos: z[i], strPos: i + z[i],
        message: `s[${z[i]}]='${s[z[i]]}' ≠ s[${i+z[i]}]='${s[i+z[i]]}' — mismatch, stop.`,
      });
    }

    // Update Z-box
    if (i + z[i] - 1 > r && z[i] > 0) { l = i; r = i + z[i] - 1; }

    frames.push({ i, z: [...z], l, r, action: "set",
      message: `z[${i}] = ${z[i]}` + (z[i] > 0 ? ` → Z-box updated to [${l}, ${r}]` : ".") });
  }

  frames.push({ i: n - 1, z: [...z], l, r, action: "done",
    message: `Done! Z-array: [${z.join(", ")}]` });

  return frames;
}
