export const translations = {
  // Navigation
  "nav.home": "Home",
  "nav.hashing": "Hashing",
  "nav.ufds": "Union-Find",
  "nav.lang": "ES",

  // Home page
  "home.title": "Algorithm Fundamentals",
  "home.subtitle": "Interactive visualizations, mathematical proofs, and C++ implementations of core competitive programming algorithms.",
  "home.card.hashing.title": "String Hashing",
  "home.card.hashing.desc": "Rabin-Karp hashing: normal and rolling. Includes birthday paradox demo and collision probability calculator.",
  "home.card.ufds.title": "Union-Find (UFDS)",
  "home.card.ufds.desc": "Disjoint set union with path compression and union by rank/size. Interactive graph visualization.",
  "home.explore": "Explore →",

  // Hashing page
  "hashing.title": "String Hashing",
  "hashing.subtitle": "Rabin-Karp polynomial hashing — normal and rolling window.",
  "hashing.tab.normal": "Normal Hash",
  "hashing.tab.rolling": "Rolling Hash",
  "hashing.tab.birthday": "Birthday Paradox",
  "hashing.tab.calculator": "Collision Calculator",
  "hashing.tab.code": "C++ Code",

  // Normal hash demo
  "hashing.normal.title": "Character-by-Character Hash",
  "hashing.normal.desc": "Each character contributes: hash = (hash × base + char) mod P. Watch the accumulation step by step.",
  "hashing.normal.input.label": "Input string",
  "hashing.normal.input.placeholder": "Type a string...",
  "hashing.normal.base.label": "Base",
  "hashing.normal.mod.label": "Modulus P",
  "hashing.normal.step.adding": "Adding character",
  "hashing.normal.step.formula": "Formula",
  "hashing.normal.step.running": "Running hash",
  "hashing.normal.char.label": "Char",
  "hashing.normal.ascii.label": "ASCII",
  "hashing.normal.contrib.label": "Contribution",
  "hashing.normal.hash.label": "Hash",
  "hashing.normal.final": "Final hash",

  // Rolling hash demo
  "hashing.rolling.title": "Rolling Hash — Sliding Window",
  "hashing.rolling.desc": "Efficiently compute the hash of every substring of length k in O(n) total. Remove the outgoing character, add the incoming one.",
  "hashing.rolling.input.label": "Input string",
  "hashing.rolling.window.label": "Window size k",
  "hashing.rolling.base.label": "Base",
  "hashing.rolling.mod.label": "Modulus P",
  "hashing.rolling.window": "Window",
  "hashing.rolling.removing": "Removing",
  "hashing.rolling.adding": "Adding",
  "hashing.rolling.hash": "Hash",
  "hashing.rolling.all": "All window hashes",

  // Birthday paradox
  "hashing.birthday.title": "Birthday Paradox",
  "hashing.birthday.desc": "How many random values do you need to draw from {0, …, P−1} before getting a repeat? Fewer than you'd think.",
  "hashing.birthday.tab.curve": "Probability Curve",
  "hashing.birthday.tab.sim": "Simulation",
  "hashing.birthday.mod.label": "Modulus P",
  "hashing.birthday.k.label": "k items",
  "hashing.birthday.prob": "P(collision) ≈",
  "hashing.birthday.formula": "Approximation formula",
  "hashing.birthday.sim.start": "Run Simulation",
  "hashing.birthday.sim.reset": "Reset",
  "hashing.birthday.sim.collision": "First collision after",
  "hashing.birthday.sim.items": "items",
  "hashing.birthday.sim.running": "Running…",
  "hashing.birthday.axis.x": "Number of hashes k",
  "hashing.birthday.axis.y": "P(collision)",
  "hashing.birthday.cursor": "k = {k}, P ≈ {p}%",

  // Collision calculator
  "hashing.calc.title": "Collision Probability Calculator",
  "hashing.calc.desc": "Given a prime modulus P and X hash values, what is the probability of at least one collision?",
  "hashing.calc.p.label": "Prime modulus P",
  "hashing.calc.x.label": "Number of hashes X",
  "hashing.calc.p.placeholder": "e.g. 1000000007",
  "hashing.calc.x.placeholder": "e.g. 100000",
  "hashing.calc.not.prime": "⚠ P does not appear to be prime. The approximation assumes P is prime.",
  "hashing.calc.trivial": "X ≥ P: collision is certain by pigeonhole.",
  "hashing.calc.derivation": "Derivation",
  "hashing.calc.result": "Result",
  "hashing.calc.threshold": "50% collision threshold",
  "hashing.calc.threshold.desc": "With P = {p}, you need roughly {k} hashes for a 50% chance of collision.",

  // Hashing code
  "hashing.code.title": "C++ Implementation",
  "hashing.code.tab.normal": "Normal Hash",
  "hashing.code.tab.rolling": "Rolling Hash",
  "hashing.code.tab.double": "Double Hashing",

  // UFDS page
  "ufds.title": "Union-Find Disjoint Sets",
  "ufds.subtitle": "Path compression and union by rank/size — from O(n log n) to near-constant time.",
  "ufds.tab.interactive": "Interactive",
  "ufds.tab.proof": "Rank Proof O(n log n)",
  "ufds.tab.ackermann": "α(n) Sketch",
  "ufds.tab.code": "C++ Code",

  // UFDS interactive
  "ufds.interactive.title": "Interactive Union-Find",
  "ufds.interactive.desc": "Drag one node onto another to union them. Click a node to call find() and watch path compression.",
  "ufds.controls.addNode": "Add Node",
  "ufds.controls.reset": "Reset",
  "ufds.controls.mode": "Optimization",
  "ufds.controls.mode.none": "None",
  "ufds.controls.mode.compression": "Path Compression",
  "ufds.controls.mode.rank": "Union by Rank",
  "ufds.controls.mode.both": "Both",
  "ufds.controls.log.title": "Operation Log",
  "ufds.controls.log.empty": "No operations yet.",
  "ufds.controls.drag.hint": "Drag a node onto another to union. Click a node to find its root.",
  "ufds.op.union": "union({a}, {b}) → root: {r}",
  "ufds.op.find": "find({x}) → root: {r}",
  "ufds.op.compress": "Path compressed: {path} → {root}",
  "ufds.op.already": "{a} and {b} already in same set",

  // UFDS rank proof
  "ufds.proof.title": "Why Union by Rank is O(n log n)",
  "ufds.proof.subtitle": "A formal argument that the total work across n find operations is O(n log n).",

  // UFDS Ackermann
  "ufds.ack.title": "Why Path Compression + Rank ≈ O(n α(n))",
  "ufds.ack.subtitle": "An informal sketch of the Tarjan-Hopcroft analysis and the inverse Ackermann function.",

  // UFDS code
  "ufds.code.title": "C++ Implementation",
  "ufds.code.tab.basic": "Basic",
  "ufds.code.tab.rank": "Union by Rank",
  "ufds.code.tab.full": "Full (Both)",

  // Shared
  "controls.play": "Play",
  "controls.pause": "Pause",
  "controls.step": "Step →",
  "controls.prev": "← Prev",
  "controls.reset": "Reset",
  "controls.step.of": "Step {n} of {total}",
} as const;

export type TranslationKey = keyof typeof translations;
