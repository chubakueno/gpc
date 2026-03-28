import type { ACNodeData, ACFrame } from "@/types/ahocorasick";

// ─── Layout constants ──────────────────────────────────────────────────────────
const LEAF_W = 68;
const LEVEL_H = 90;
export const NODE_R = 20;
const PAD_L = 90;
const PAD_T = 50;

// ─── Deep clone node array ─────────────────────────────────────────────────────
function cloneNodes(nodes: ACNodeData[]): ACNodeData[] {
  return nodes.map((n) => ({
    ...n,
    children: { ...n.children },
    patterns: [...n.patterns],
  }));
}

// ─── Get path string from root to node ────────────────────────────────────────
export function getPath(nodes: ACNodeData[], id: number): string {
  if (id === 0) return "ε";
  const path: string[] = [];
  let cur: ACNodeData | undefined = nodes.find((n) => n.id === id);
  while (cur && cur.id !== 0) {
    path.unshift(cur.char);
    cur = cur.parentId !== null ? nodes.find((n) => n.id === cur!.parentId) : undefined;
  }
  return path.join("") || "ε";
}

// ─── Layout ───────────────────────────────────────────────────────────────────
function leafCount(nodes: ACNodeData[], id: number): number {
  const node = nodes.find((n) => n.id === id);
  if (!node) return 1;
  const childIds = Object.values(node.children);
  if (childIds.length === 0) return 1;
  return childIds.reduce((sum, cid) => sum + leafCount(nodes, cid), 0);
}

export function layoutAC(
  nodes: ACNodeData[]
): { positions: Map<number, { x: number; y: number }>; width: number; height: number } {
  const positions = new Map<number, { x: number; y: number }>();
  if (nodes.length === 0) return { positions, width: 200, height: 150 };

  // Assign x by leaf-count algorithm, y by depth
  function assignX(id: number, left: number): void {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const childIds = Object.values(node.children);
    if (childIds.length === 0) {
      positions.set(id, { x: left + LEAF_W / 2, y: node.depth * LEVEL_H });
      return;
    }
    let offset = left;
    for (const cid of childIds) {
      const lc = leafCount(nodes, cid);
      assignX(cid, offset);
      offset += lc * LEAF_W;
    }
    // Center parent over its children
    const firstChildPos = positions.get(childIds[0])!;
    const lastChildPos = positions.get(childIds[childIds.length - 1])!;
    if (firstChildPos && lastChildPos) {
      positions.set(id, {
        x: (firstChildPos.x + lastChildPos.x) / 2,
        y: node.depth * LEVEL_H,
      });
    } else {
      positions.set(id, { x: left + LEAF_W / 2, y: node.depth * LEVEL_H });
    }
  }

  assignX(0, 0);

  // Apply padding
  let maxX = 0;
  let maxY = 0;
  positions.forEach((pos, id) => {
    const px = pos.x + PAD_L;
    const py = pos.y + PAD_T;
    positions.set(id, { x: px, y: py });
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
  });

  return {
    positions,
    width: maxX + PAD_L + 90,
    height: maxY + NODE_R + 70,
  };
}

// ─── Main frame computation ───────────────────────────────────────────────────
export function computeACFrames(patterns: string[]): ACFrame[] {
  if (patterns.length === 0) return [];

  const frames: ACFrame[] = [];

  // ── Phase 1: Build Trie ──────────────────────────────────────────────────
  const root: ACNodeData = {
    id: 0,
    char: "",
    children: {},
    failId: 0,
    dictId: null,
    depth: 0,
    parentId: null,
    isEnd: false,
    patterns: [],
  };

  let nodes: ACNodeData[] = [root];
  let nextId = 1;

  // Init frame
  frames.push({
    action: "init",
    nodes: cloneNodes(nodes),
    activeId: null,
    visibleFailIds: [],
    visibleDictIds: [],
    message: "Empty trie with root node.",
  });

  for (const pattern of patterns) {
    let cur = 0;
    let path = "";
    for (let ci = 0; ci < pattern.length; ci++) {
      const ch = pattern[ci];
      path += ch;
      const curNode = nodes.find((n) => n.id === cur)!;
      if (curNode.children[ch] === undefined) {
        // Create new node
        const newNode: ACNodeData = {
          id: nextId,
          char: ch,
          children: {},
          failId: 0,
          dictId: null,
          depth: curNode.depth + 1,
          parentId: cur,
          isEnd: false,
          patterns: [],
        };
        curNode.children[ch] = nextId;
        nodes.push(newNode);
        cur = nextId;
        nextId++;
        frames.push({
          action: "add_node",
          nodes: cloneNodes(nodes),
          activeId: cur,
          visibleFailIds: [],
          visibleDictIds: [],
          message: `Insert "${pattern}": add node '${ch}' (path: ${path})`,
        });
      } else {
        cur = curNode.children[ch];
      }
    }
    // Mark terminal
    const termNode = nodes.find((n) => n.id === cur)!;
    if (!termNode.patterns.includes(pattern)) {
      termNode.patterns.push(pattern);
    }
    termNode.isEnd = true;
    frames.push({
      action: "add_node",
      nodes: cloneNodes(nodes),
      activeId: cur,
      visibleFailIds: [],
      visibleDictIds: [],
      message: `Pattern "${pattern}" complete — node marked as terminal.`,
    });
  }

  // ── Phase 2: Failure Links (BFS) ────────────────────────────────────────
  frames.push({
    action: "bfs_start",
    nodes: cloneNodes(nodes),
    activeId: null,
    visibleFailIds: [],
    visibleDictIds: [],
    message: "Trie built. Begin BFS to assign failure links.",
  });

  const visibleFailIds: number[] = [];
  const queue: number[] = [];

  // Root's direct children: fail = root
  const rootNode = nodes[0];
  for (const ch of Object.keys(rootNode.children)) {
    const childId = rootNode.children[ch];
    const childNode = nodes.find((n) => n.id === childId)!;
    childNode.failId = 0;
    queue.push(childId);
    visibleFailIds.push(childId);
    frames.push({
      action: "set_fail",
      nodes: cloneNodes(nodes),
      activeId: childId,
      newFailFrom: childId,
      newFailTo: 0,
      visibleFailIds: [...visibleFailIds],
      visibleDictIds: [],
      message: `Depth-1 node '${ch}' (path: ${ch}): fail → root (all depth-1 nodes fail to root).`,
    });
  }

  // BFS for the rest
  while (queue.length > 0) {
    const u = queue.shift()!;
    const uNode = nodes.find((n) => n.id === u)!;

    for (const ch of Object.keys(uNode.children)) {
      const v = uNode.children[ch];
      const vNode = nodes.find((n) => n.id === v)!;

      // Walk up fail chain from uNode.failId to find a ch-child
      let fallback = uNode.failId;
      while (fallback !== 0) {
        const fallbackNode = nodes.find((n) => n.id === fallback)!;
        if (fallbackNode.children[ch] !== undefined && fallbackNode.children[ch] !== v) {
          break;
        }
        fallback = fallbackNode.failId;
      }
      // Check root for ch-child
      const rootForCh = nodes[0];
      let failTarget = 0;
      if (fallback === 0) {
        if (rootForCh.children[ch] !== undefined && rootForCh.children[ch] !== v) {
          failTarget = rootForCh.children[ch];
        } else {
          failTarget = 0;
        }
      } else {
        const fallbackNode = nodes.find((n) => n.id === fallback)!;
        failTarget = fallbackNode.children[ch] !== v ? fallbackNode.children[ch] : 0;
      }

      vNode.failId = failTarget;
      queue.push(v);
      visibleFailIds.push(v);

      const vPath = getPath(nodes, v);
      const failPath = getPath(nodes, failTarget);
      frames.push({
        action: "set_fail",
        nodes: cloneNodes(nodes),
        activeId: v,
        newFailFrom: v,
        newFailTo: failTarget,
        visibleFailIds: [...visibleFailIds],
        visibleDictIds: [],
        message: `Node '${ch}' (path: "${vPath}"): fail → "${failPath}" — longest proper suffix of "${vPath}" in the trie.`,
      });
    }
  }

  // ── Phase 3: Dictionary Links (BFS) ─────────────────────────────────────
  frames.push({
    action: "fail_done",
    nodes: cloneNodes(nodes),
    activeId: null,
    visibleFailIds: [...visibleFailIds],
    visibleDictIds: [],
    message: "All failure links done. Computing dictionary links...",
  });

  const visibleDictIds: number[] = [];
  const queue2: number[] = [];

  // BFS from root's children
  for (const ch of Object.keys(rootNode.children)) {
    queue2.push(rootNode.children[ch]);
  }

  while (queue2.length > 0) {
    const u = queue2.shift()!;
    const uNode = nodes.find((n) => n.id === u)!;
    const failNode = nodes.find((n) => n.id === uNode.failId);

    // dictId = failId if failId is terminal, else failId's dictId
    let dictId: number | null = null;
    if (failNode && uNode.failId !== 0) {
      if (failNode.isEnd) {
        dictId = uNode.failId;
      } else {
        dictId = failNode.dictId ?? null;
      }
    }
    uNode.dictId = dictId;

    if (dictId !== null) {
      visibleDictIds.push(u);
      const uPath = getPath(nodes, u);
      const dictPath = getPath(nodes, dictId);
      frames.push({
        action: "set_dict",
        nodes: cloneNodes(nodes),
        activeId: u,
        newDictFrom: u,
        newDictTo: dictId,
        visibleFailIds: [...visibleFailIds],
        visibleDictIds: [...visibleDictIds],
        message: `Node "${uPath}": dict → "${dictPath}" (nearest terminal via fail chain).`,
      });
    }

    // Enqueue children
    for (const ch of Object.keys(uNode.children)) {
      queue2.push(uNode.children[ch]);
    }
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  frames.push({
    action: "done",
    nodes: cloneNodes(nodes),
    activeId: null,
    visibleFailIds: [...visibleFailIds],
    visibleDictIds: [...visibleDictIds],
    message: "Aho-Corasick automaton complete. O(∑|Pi|) construction, O(N + M) search time.",
  });

  return frames;
}
