import type { TrieData, TrieNodeData, TrieLayout, AnimFrame } from "@/types/trie";

// ─── Core operations ─────────────────────────────────────────────────────────

export function createTrie(): TrieData {
  const root: TrieNodeData = {
    id: 0, char: "", isEnd: false, parentId: null, children: {}, depth: 0,
  };
  return { nodes: new Map([[0, root]]), rootId: 0, nextId: 1, words: [] };
}

export function insertWord(trie: TrieData, word: string): TrieData {
  const nodes = new Map(trie.nodes);
  let nextId = trie.nextId;
  let curId = trie.rootId;

  for (const ch of word) {
    const node = nodes.get(curId)!;
    if (ch in node.children) {
      curId = node.children[ch];
    } else {
      const newId = nextId++;
      nodes.set(curId, { ...node, children: { ...node.children, [ch]: newId } });
      nodes.set(newId, { id: newId, char: ch, isEnd: false, parentId: curId, children: {}, depth: node.depth + 1 });
      curId = newId;
    }
  }

  const finalNode = nodes.get(curId)!;
  nodes.set(curId, { ...finalNode, isEnd: true });
  const words = trie.words.includes(word) ? trie.words : [...trie.words, word];
  return { nodes, rootId: trie.rootId, nextId, words };
}

export function searchTrie(trie: TrieData, word: string) {
  const path: number[] = [trie.rootId];
  let curId = trie.rootId;
  for (const ch of word) {
    const node = trie.nodes.get(curId)!;
    if (!(ch in node.children)) return { found: false, prefixOnly: false, path };
    curId = node.children[ch];
    path.push(curId);
  }
  const endNode = trie.nodes.get(curId)!;
  return { found: endNode.isEnd, prefixOnly: !endNode.isEnd, path };
}

// ─── Layout ──────────────────────────────────────────────────────────────────

const LEVEL_H = 68;
const LEAF_W  = 52;
const PAD_X   = 32;
const PAD_Y   = 36;

function countLeaves(id: number, nodes: Map<number, TrieNodeData>): number {
  const node = nodes.get(id)!;
  const kids = Object.values(node.children);
  return kids.length === 0 ? 1 : kids.reduce((s, k) => s + countLeaves(k, nodes), 0);
}

export function layoutTrie(trie: TrieData): TrieLayout {
  const x = new Map<number, number>();
  const y = new Map<number, number>();

  const totalLeaves = Math.max(countLeaves(trie.rootId, trie.nodes), 2);
  const contentW = totalLeaves * LEAF_W;

  function assign(id: number, xL: number, xR: number) {
    const node = trie.nodes.get(id)!;
    x.set(id, (xL + xR) / 2);
    y.set(id, PAD_Y + node.depth * LEVEL_H);

    const kids = Object.values(node.children)
      .sort((a, b) => trie.nodes.get(a)!.char.localeCompare(trie.nodes.get(b)!.char));
    if (kids.length === 0) return;

    const total = kids.reduce((s, k) => s + countLeaves(k, trie.nodes), 0);
    let cur = xL;
    for (const k of kids) {
      const w = (xR - xL) * countLeaves(k, trie.nodes) / total;
      assign(k, cur, cur + w);
      cur += w;
    }
  }

  assign(trie.rootId, PAD_X, PAD_X + contentW);

  let maxDepth = 0;
  for (const n of trie.nodes.values()) maxDepth = Math.max(maxDepth, n.depth);

  return {
    x, y,
    width: contentW + 2 * PAD_X,
    height: PAD_Y + maxDepth * LEVEL_H + 40,
  };
}

// ─── Autocomplete helpers ─────────────────────────────────────────────────────

export function getPrefixPath(trie: TrieData, prefix: string): number[] {
  const path: number[] = [trie.rootId];
  let curId = trie.rootId;
  for (const ch of prefix) {
    const node = trie.nodes.get(curId)!;
    if (!(ch in node.children)) return path;
    curId = node.children[ch];
    path.push(curId);
  }
  return path;
}

function collectSubtree(id: number, nodes: Map<number, TrieNodeData>): number[] {
  const result: number[] = [id];
  for (const cId of Object.values(nodes.get(id)!.children))
    result.push(...collectSubtree(cId, nodes));
  return result;
}

export function getMatchHighlight(trie: TrieData, prefix: string): Set<number> {
  const path = getPrefixPath(trie, prefix);
  if (path.length - 1 < prefix.length) return new Set(path);
  return new Set([...path, ...collectSubtree(path[path.length - 1], trie.nodes)]);
}

export function getAutocompletions(trie: TrieData, prefix: string): string[] {
  const path = getPrefixPath(trie, prefix);
  if (path.length - 1 < prefix.length) return [];

  const results: string[] = [];
  function dfs(id: number, cur: string) {
    const node = trie.nodes.get(id)!;
    if (node.isEnd) results.push(cur);
    const kids = Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b));
    for (const [ch, cId] of kids) dfs(cId, cur + ch);
  }
  dfs(path[path.length - 1], prefix);
  return results;
}

// ─── Animation frame generators ───────────────────────────────────────────────

export function computeInsertFrames(
  committedTrie: TrieData,
  word: string,
): { frames: AnimFrame[]; finalTrie: TrieData } {
  const finalTrie = insertWord(committedTrie, word);

  // Find which nodes are new (in finalTrie but not in committedTrie)
  const allNewIds = new Set<number>();
  for (const id of finalTrie.nodes.keys())
    if (!committedTrie.nodes.has(id)) allNewIds.add(id);

  const frames: AnimFrame[] = [];
  let curId = finalTrie.rootId;
  const path: number[] = [curId];
  const createdSoFar: number[] = [];
  // Hidden starts as all new ids, we remove them as we "create" them
  let hidden = new Set(allNewIds);

  frames.push({
    hiddenIds: new Set(hidden),
    highlightIds: [],
    activeId: curId,
    newIds: [],
    phase: "visiting",
    message: `Inserting "${word}" — at root`,
  });

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const childId = finalTrie.nodes.get(curId)!.children[ch];

    if (ch in (committedTrie.nodes.get(curId)?.children ?? {})) {
      // Existing edge — follow it
      curId = childId;
      path.push(curId);
      frames.push({
        hiddenIds: new Set(hidden),
        highlightIds: [...path.slice(0, -1)],
        activeId: curId,
        newIds: [...createdSoFar],
        phase: "visiting",
        message: `'${ch}' exists — following`,
      });
    } else {
      // New node — reveal it
      hidden = new Set(hidden);
      hidden.delete(childId);
      curId = childId;
      path.push(curId);
      createdSoFar.push(curId);
      frames.push({
        hiddenIds: new Set(hidden),
        highlightIds: [...path.slice(0, -1)],
        activeId: curId,
        newIds: [...createdSoFar],
        phase: "new",
        message: `'${ch}' not found — creating new node`,
      });
    }
  }

  // Final frame — mark isEnd
  frames.push({
    hiddenIds: new Set<number>(),
    highlightIds: path.slice(0, -1),
    activeId: curId,
    newIds: [...createdSoFar],
    phase: "found",
    message: `"${word}" inserted ✓`,
  });

  return { frames, finalTrie };
}

export function computeSearchFrames(trie: TrieData, word: string): AnimFrame[] {
  const frames: AnimFrame[] = [];
  let curId = trie.rootId;
  const path: number[] = [curId];
  const noHide = new Set<number>();

  frames.push({
    hiddenIds: noHide,
    highlightIds: [],
    activeId: curId,
    newIds: [],
    phase: "visiting",
    message: `Searching for "${word}"`,
  });

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const node = trie.nodes.get(curId)!;
    if (!(ch in node.children)) {
      frames.push({
        hiddenIds: noHide,
        highlightIds: [...path],
        activeId: curId,
        newIds: [],
        phase: "not_found",
        message: `'${ch}' not found — "${word}" is not in the trie`,
      });
      return frames;
    }
    curId = node.children[ch];
    path.push(curId);
    frames.push({
      hiddenIds: noHide,
      highlightIds: path.slice(0, -1),
      activeId: curId,
      newIds: [],
      phase: "visiting",
      message: `'${ch}' → found`,
    });
  }

  const endNode = trie.nodes.get(curId)!;
  if (endNode.isEnd) {
    frames.push({
      hiddenIds: noHide,
      highlightIds: path.slice(0, -1),
      activeId: curId,
      newIds: [],
      phase: "found",
      message: `"${word}" found ✓`,
    });
  } else {
    frames.push({
      hiddenIds: noHide,
      highlightIds: path.slice(0, -1),
      activeId: curId,
      newIds: [],
      phase: "not_found",
      message: `Prefix "${word}" exists but is not a complete word`,
    });
  }

  return frames;
}
