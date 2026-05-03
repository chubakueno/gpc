import type { STNodeData, STFrame } from "@/types/suffixtree";

function clone(nodes: STNodeData[]): STNodeData[] {
  return nodes.map(n => ({ ...n, children: { ...n.children } }));
}

export function computeSTFrames(input: string): STFrame[] {
  const str = input + "$";  // append sentinel
  const n = str.length;
  const frames: STFrame[] = [];

  const nodes: STNodeData[] = [{
    id: 0, children: {}, edgeStart: -1, edgeEnd: -1,
    parentId: null, isLeaf: false, suffixIndex: null
  }];

  frames.push({
    action: "init", nodes: clone(nodes), str,
    activeId: null, highlightIds: [], currentSuffix: null, newIds: [],
    message: `Building suffix tree for "${str}". Inserting ${n} suffixes (with sentinel '$').`
  });

  for (let i = 0; i < n; i++) {
    const suffix = str.slice(i);
    frames.push({
      action: "insert_start", nodes: clone(nodes), str,
      activeId: 0, highlightIds: [0], currentSuffix: i, newIds: [],
      message: `Insert suffix ${i}: "${suffix}". Start at root.`
    });

    let cur = 0;
    let pos = i;

    while (pos < n) {
      const c = str[pos];

      if (!nodes[cur].children[c]) {
        // Add leaf directly
        const leafId = nodes.length;
        nodes.push({
          id: leafId, children: {},
          edgeStart: pos, edgeEnd: n,
          parentId: cur, isLeaf: true, suffixIndex: i
        });
        nodes[cur].children[c] = leafId;
        frames.push({
          action: "add_leaf", nodes: clone(nodes), str,
          activeId: leafId, highlightIds: [cur, leafId], currentSuffix: i, newIds: [leafId],
          message: `No '${c}' edge at current node → add leaf with edge "${str.slice(pos, Math.min(pos + 8, n))}${pos + 8 < n ? '…' : ''}". Suffix ${i} inserted.`
        });
        break;
      }

      const childId = nodes[cur].children[c];
      const eStart = nodes[childId].edgeStart;
      const eEnd = nodes[childId].edgeEnd;

      frames.push({
        action: "walk", nodes: clone(nodes), str,
        activeId: childId, highlightIds: [cur, childId], currentSuffix: i, newIds: [],
        message: `Follow '${c}' edge "${str.slice(eStart, Math.min(eStart + 8, eEnd))}${eStart + 8 < eEnd ? '…' : ''}" — walk to find mismatch.`
      });

      // Walk along edge
      let ep = eStart;
      while (ep < eEnd && pos < n && str[ep] === str[pos]) { ep++; pos++; }

      if (ep === eEnd) {
        cur = childId;  // consumed entire edge
      } else {
        // Split
        const splitId = nodes.length;
        nodes.push({
          id: splitId, children: {},
          edgeStart: eStart, edgeEnd: ep,
          parentId: cur, isLeaf: false, suffixIndex: null
        });
        nodes[childId].edgeStart = ep;
        nodes[childId].parentId = splitId;
        nodes[splitId].children[str[ep]] = childId;

        const newLeafId = nodes.length;
        nodes.push({
          id: newLeafId, children: {},
          edgeStart: pos, edgeEnd: n,
          parentId: splitId, isLeaf: true, suffixIndex: i
        });
        nodes[splitId].children[str[pos]] = newLeafId;
        nodes[cur].children[c] = splitId;

        frames.push({
          action: "split", nodes: clone(nodes), str,
          activeId: splitId, highlightIds: [cur, splitId, childId, newLeafId],
          currentSuffix: i, newIds: [splitId, newLeafId],
          message: `Mismatch '${str[ep]}' vs '${str[pos]}' after "${str.slice(eStart, ep)}". Split edge → new internal node, add leaf "${str.slice(pos, Math.min(pos + 6, n))}…".`
        });
        break;
      }
    }

    frames.push({
      action: "insert_done", nodes: clone(nodes), str,
      activeId: null, highlightIds: [], currentSuffix: i, newIds: [],
      message: `Suffix ${i} "${suffix}" inserted. Tree now has ${nodes.length} nodes.`
    });
  }

  frames.push({
    action: "done", nodes: clone(nodes), str,
    activeId: null, highlightIds: [], currentSuffix: null, newIds: [],
    message: `Suffix tree complete: ${n} leaves, ${nodes.length - n - 1} internal nodes, ${nodes.length} total. All ${n * (n + 1) / 2} substrings accessible in O(M).`
  });

  return frames;
}

// Layout
export interface STPoint { x: number; y: number }
const LEAF_W = 64;
const LEVEL_H = 92;
const PAD_L = 24;
const PAD_T = 40;

export function layoutST(nodes: STNodeData[]): { positions: Map<number, STPoint>; width: number; height: number } {
  const positions = new Map<number, STPoint>();

  function leafCount(id: number): number {
    const kids = Object.values(nodes[id].children);
    if (kids.length === 0) return 1;
    return kids.reduce((s, k) => s + leafCount(k), 0);
  }

  const levels = new Map<number, number>();
  const bfs: number[] = [0];
  levels.set(0, 0);
  while (bfs.length > 0) {
    const u = bfs.shift()!;
    for (const child of Object.values(nodes[u].children)) {
      levels.set(child, (levels.get(u) ?? 0) + 1);
      bfs.push(child);
    }
  }

  function layout(id: number, xOff: number): number {
    const kids = Object.values(nodes[id].children);
    const lv = levels.get(id) ?? 0;
    if (kids.length === 0) {
      positions.set(id, { x: xOff + LEAF_W / 2, y: lv * LEVEL_H + 16 });
      return LEAF_W;
    }
    const widths = kids.map(k => leafCount(k) * LEAF_W);
    let cx = xOff;
    for (let i = 0; i < kids.length; i++) { layout(kids[i], cx); cx += widths[i]; }
    const first = positions.get(kids[0])!;
    const last = positions.get(kids[kids.length - 1])!;
    positions.set(id, { x: (first.x + last.x) / 2, y: lv * LEVEL_H + 16 });
    return widths.reduce((a, b) => a + b, 0);
  }

  layout(0, 0);
  let maxX = 0, maxY = 0;
  positions.forEach(p => { maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); });
  positions.forEach((p, id) => positions.set(id, { x: p.x + PAD_L, y: p.y + PAD_T }));

  return { positions, width: maxX + PAD_L * 2, height: maxY + PAD_T + 16 + 30 };
}
