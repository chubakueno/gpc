import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { SectionCard } from "@/components/layout/SectionCard";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { TabGroup } from "@/components/shared/TabGroup";

const NIM_CODE = `// Nim: XOR (Nim-sum) strategy
// Returns true if current player wins (N-position)
bool nimWinner(vector<int>& piles) {
    int xorSum = 0;
    for (int p : piles) xorSum ^= p;
    return xorSum != 0; // N-position iff XOR ≠ 0
}

// Find optimal move: returns {pile_index, stones_to_take}
pair<int,int> nimOptimalMove(vector<int> piles) {
    int xorSum = 0;
    for (int p : piles) xorSum ^= p;

    if (xorSum == 0) {
        // P-position (losing): any move is forced — take 1 from first pile
        for (int i = 0; i < (int)piles.size(); i++)
            if (piles[i] > 0) return {i, 1};
    }

    // Find pile i such that (piles[i] ^ xorSum) < piles[i]
    // Reducing pile i to (piles[i] ^ xorSum) makes new XOR = 0
    for (int i = 0; i < (int)piles.size(); i++) {
        int target = piles[i] ^ xorSum;
        if (target < piles[i])
            return {i, piles[i] - target};
    }
    return {0, 1}; // unreachable
}

// Determine P/N position for arbitrary Nim
// P-position: XOR = 0  →  current player loses
// N-position: XOR ≠ 0  →  current player wins
//
// Why XOR works:
//   - Terminal (all-zero) position has XOR = 0 → P-position ✓
//   - Any move from XOR=0 must change one pile → new XOR ≠ 0 ✓
//   - From XOR≠0, always exists a move to XOR=0 (see nimOptimalMove) ✓

// ── Misère Nim ────────────────────────────────────────────────────────────────
// Same rules, but the player who takes the LAST stone LOSES.
//
// Theorem: (n₁, …, nₖ) is a P-position (current player loses) iff:
//   (a) All piles ≤ 1  AND  the count of non-empty piles is ODD, OR
//   (b) Some pile ≥ 2  AND  XOR of all piles = 0.
//
// Strategy: identical to normal Nim EXCEPT when all remaining piles are ≤ 1.
//   - Normal Nim endgame: leave an EVEN number of 1-piles (XOR = 0).
//   - Misère Nim endgame: leave an ODD  number of 1-piles (opponent takes last).

bool misereIsWinning(const vector<int>& piles) {
    bool allSmall = all_of(piles.begin(), piles.end(), [](int x){ return x <= 1; });
    int xorSum = 0;
    for (int p : piles) xorSum ^= p;
    // allSmall: P-position iff XOR ≠ 0 (i.e., odd 1-piles)  →  N-position iff XOR = 0
    return allSmall ? (xorSum == 0) : (xorSum != 0);
}

// Find optimal Misère move: {pile_index, stones_to_take}
pair<int,int> misereOptimalMove(const vector<int>& piles) {
    bool allSmall = all_of(piles.begin(), piles.end(), [](int x){ return x <= 1; });

    if (allSmall) {
        // N-position (even 1-piles): take one → leaves odd for opponent (P).
        for (int i = 0; i < (int)piles.size(); i++)
            if (piles[i]) return {i, 1};
    }

    // Try every move; pick one that leaves a Misère P-position for the opponent.
    for (int i = 0; i < (int)piles.size(); i++) {
        for (int t = 1; t <= piles[i]; t++) {
            vector<int> next = piles;
            next[i] -= t;
            bool nextSmall = all_of(next.begin(), next.end(), [](int x){ return x <= 1; });
            int nextXor = 0;
            for (int x : next) nextXor ^= x;
            bool nextIsP = nextSmall ? (nextXor != 0) : (nextXor == 0);
            if (nextIsP) return {i, t};
        }
    }

    // P-position: forced — just take 1 from the first non-empty pile.
    for (int i = 0; i < (int)piles.size(); i++)
        if (piles[i]) return {i, 1};
    return {0, 1};
}`;

const GRUNDY_CODE = `// Grundy numbers for subtraction games
// S = set of allowed move sizes (e.g., {1, 2, 3})
// From a pile of n, you may remove any s ∈ S (if n >= s)

int mex(const set<int>& s) {
    int m = 0;
    while (s.count(m)) m++;
    return m;
}

// Computes grundy[0..maxN] for the given subtraction set S
vector<int> computeGrundy(const vector<int>& S, int maxN) {
    vector<int> g(maxN + 1, 0);
    for (int n = 1; n <= maxN; n++) {
        set<int> reachable;
        for (int s : S)
            if (n - s >= 0) reachable.insert(g[n - s]);
        g[n] = mex(reachable);
    }
    return g;
}

// Faster alternative: bitset mex — O(MAXG/64) instead of O(|S| · log G)
// _Find_first() is a GCC/libstdc++ extension (lowest set bit in O(N/64)).
const int MAXG = 512; // tune to max possible Grundy value + 1

vector<int> computeGrundyFast(const vector<int>& S, int maxN) {
    vector<int> g(maxN + 1, 0);
    for (int n = 1; n <= maxN; n++) {
        bitset<MAXG> present;
        for (int s : S)
            if (n - s >= 0) present.set(g[n - s]);
        g[n] = (int)(~present)._Find_first();
    }
    return g;
}

// Combined game: XOR of individual Grundy values
// Returns true if current player wins
bool compoundWinner(const vector<int>& grundyValues) {
    int xorSum = 0;
    for (int g : grundyValues) xorSum ^= g;
    return xorSum != 0;
}

// Example: two independent subtraction games played simultaneously
// Game A: pile of 7, moves {1, 2, 3}
// Game B: pile of 5, moves {1, 2}
void example() {
    auto gA = computeGrundy({1, 2, 3}, 10);
    auto gB = computeGrundy({1, 2},    10);

    // Sprague-Grundy: XOR of individual Grundy numbers
    bool wins = compoundWinner({gA[7], gB[5]});
    // wins == true  →  current player wins the combined game
}

// Note: for S = {1, 2, ..., k}, the Grundy value is simply n % (k+1)
// This is the "mod game" — period k+1 starting at n=0.`;

const SOLVER_CODE = `// Generic Sprague-Grundy solver for arbitrary impartial games
// State must be representable as a single integer (or encode it as one)

#include <bits/stdc++.h>
using namespace std;

unordered_map<int, int> memo;

int mex(const set<int>& s) {
    int m = 0;
    while (s.count(m)) m++;
    return m;
}

// Define moves for your specific game — override this
vector<int> getMoves(int state);

int grundy(int state) {
    auto it = memo.find(state);
    if (it != memo.end()) return it->second;

    set<int> reachable;
    for (int next : getMoves(state))
        reachable.insert(grundy(next));

    return memo[state] = mex(reachable);
}

// Usage: grundy(initialState) != 0  →  first player wins

// ─────────────────────────────────────────────
// Example: Turning Turtles
// Row of coins (H/T). Move: flip coin i from H→T;
// optionally also flip any coin j < i (any face).
// State = bitmask of which coins are H.
// ─────────────────────────────────────────────
// It can be shown: Grundy(mask) = XOR of positions of H coins.
// Below is the brute-force version for verification on small inputs.

int N; // number of coins

vector<int> getMoves(int mask) {
    vector<int> moves;
    for (int i = 0; i < N; i++) {
        if (!((mask >> i) & 1)) continue; // coin i must be H
        int base = mask ^ (1 << i);       // flip i: H → T
        moves.push_back(base);            // flip only i
        for (int j = 0; j < i; j++)      // optionally flip j < i
            moves.push_back(base ^ (1 << j));
    }
    return moves;
}

// Compound game: XOR of Grundy values of each component
bool solve(vector<int> initialStates) {
    memo.clear();
    int xorSum = 0;
    for (int s : initialStates) xorSum ^= grundy(s);
    return xorSum != 0; // true → first player wins
}`;

const PATTERNS_CODE = `// ══ 1. Powers of 2 ════════════════════════════════════════════════════════════
// S = {1, 2, 4, 8, 16, …}  →  G(n) = n mod 3
//
// Theorem: For the subtraction game with S = all powers of 2, G(n) = n % 3.
//
// Key: 2^k mod 3 alternates 1, 2, 1, 2, … covering both non-zero residues mod 3.
// No power of 2 is divisible by 3 (since gcd(2,3) = 1).
//
// Proof by strong induction (n ≥ 2):
//   {1, 2} ⊆ S, so from n we can always reach n-1 and n-2.
//   Induction gives G(n-1) = (n-1)%3 and G(n-2) = (n-2)%3.
//   Together they are {0,1,2} \\ {n%3}.
//   Since 3 ∤ 2^k for any k, every reachable position has residue ≠ n%3,
//   so n%3 is never in the reachable G-set.  →  mex = n%3.  □

int grundyPow2(int n) { return n % 3; }
// P-positions (Losers): multiples of 3 — {0, 3, 6, 9, …}
// Winning move: reduce to the nearest multiple of 3.

// ══ 2. Fibonacci Nim ══════════════════════════════════════════════════════════
// Single pile. First player takes 1 ≤ k ≤ n−1 (NOT all stones).
// Each subsequent player takes 1 ≤ t ≤ 2 * (previous move). Last to take wins.
//
// Theorem: position n is a P-position (Loser) iff n is a Fibonacci number.
//
// Proof sketch — uses Zeckendorf's theorem:
//   Every positive integer has a unique representation as a sum of
//   non-consecutive Fibonacci numbers (no two adjacent in the sequence).
//     n = F_{k1} + F_{k2} + … + F_{km},  k1 > k2 > … > km,  k_i - k_{i+1} ≥ 2
//
//   Non-Fibonacci n (m ≥ 2 terms): Take F_{km}, the smallest term.
//   Since k_{m-1} ≥ k_m + 2, we have F_{km} ≤ F_{km-1} / 2, so this is a legal
//   first move (≤ n-1). The remainder F_{k1} + … + F_{k_{m-1}} is a shorter
//   Zeckendorf sum; by induction the opponent is now in a losing position.
//
//   Fibonacci F_k: any move of size t leaves F_k − t, and the 2t bound
//   prevents the opponent from ever "jumping over" to the next Fibonacci,
//   allowing the defender to always restore a Fibonacci position inductively.

bool isFibonacci(long long n) {
    // n is Fibonacci iff 5n²+4 or 5n²-4 is a perfect square (Binet's criterion)
    // Caution: 5n² overflows for n > ~6×10^8 on 64-bit — use table for large n
    auto isSquare = [](long long x) -> bool {
        if (x < 0) return false;
        long long r = (long long)sqrt((double)x);
        while (r > 0 && r * r > x) r--;
        while ((r + 1) * (r + 1) <= x) r++;
        return r * r == x;
    };
    return isSquare(5 * n * n + 4) || isSquare(5 * n * n - 4);
}

// For large n: precompute Fibonacci table and binary-search
bool isFibonacciLarge(long long n) {
    long long a = 1, b = 2;
    while (b < n) { long long c = a + b; a = b; b = c; }
    return a == n || b == n;
}

bool fibNimWinner(long long n) { return !isFibonacci(n); }

// ══ 3. Wythoff's Nim ══════════════════════════════════════════════════════════
// Two piles (a, b). Moves:
//   (A) Remove any positive amount from exactly one pile.
//   (B) Remove equal positive amounts from both piles simultaneously.
// Terminal: both piles empty.
//
// Theorem (Wythoff 1907): (a, b) is a P-position iff, for some integer n ≥ 0,
//   a = ⌊n·φ⌋   and   b = ⌊n·φ²⌋,   where φ = (1+√5)/2 ≈ 1.618.
//
// Equivalently (assuming a ≤ b): P-position iff  a = ⌊(b−a)·φ⌋.
//
// Why φ? By Beatty's theorem, since 1/φ + 1/φ² = 1, the sequences ⌊nφ⌋ and ⌊nφ²⌋
// partition ℕ. This is exactly what P-positions require: every integer appears
// in exactly one coordinate across all P-position pairs.
// The golden ratio emerges from the recurrence P_{n+1} = P_n + n (for the difference),
// whose solution is φ.
//
// First pairs: (0,0),(1,2),(3,5),(4,7),(6,10),(8,13),(9,15),(11,18),(12,20),…

const double PHI = (1.0 + sqrt(5.0)) / 2.0;

bool isWythoffP(long long a, long long b) {
    if (a > b) swap(a, b);
    long long n = b - a;
    return (long long)(PHI * n) == a;
    // Warning: floating-point may fail for very large a,b (> ~10^13).
    // Exact check: verify a*(a+1) ≤ n*n*(5)/4 < (a+1)*(a+2) via integer arithmetic.
}

// Generate first 'count' Wythoff P-positions (a_n, b_n)
vector<pair<long long,long long>> wythoffPairs(int count) {
    vector<pair<long long,long long>> result;
    for (int n = 0; n < count; n++)
        result.push_back({(long long)(PHI * n), (long long)(PHI * PHI * n)});
    return result;
}

// ══ 4. Moore's Nim ════════════════════════════════════════════════════════════
// k piles. Each turn: remove positive amounts from AT MOST j piles (1 ≤ j ≤ k).
// Standard Nim is Moore's Nim with j = 1.
//
// Theorem (Moore 1910): (n₁, …, nₖ) is a P-position iff for every bit b,
//     Σᵢ [(nᵢ >> b) & 1]  ≡  0  (mod j+1)
// i.e., every column sum in the binary representation is divisible by j+1.
//
// Proof:
//   Terminal: all piles zero → all sums = 0 ≡ 0 (mod j+1).  ✓
//
//   P → N: any move touches ≤ j piles. Changing ≤ j piles can shift each
//   column sum by at most j. A sum that was 0 (mod j+1) needs a shift of
//   exactly j+1 (or its multiple) to return to 0 — impossible with ≤ j piles.
//   So at least one column sum becomes ≢ 0.  → N-position.  ✓
//
//   N → P: construct a move greedily bit by bit (MSB to LSB): find ≤ j piles
//   whose modification brings every column sum to 0 (mod j+1).
//   This is always possible from an N-position.  → P-position.  ✓

bool moorePPosition(const vector<int>& piles, int j) {
    for (int bit = 29; bit >= 0; bit--) {
        int colSum = 0;
        for (int p : piles) colSum += (p >> bit) & 1;
        if (colSum % (j + 1) != 0) return false;
    }
    return true;
}

// Special cases:
//   j = 1 → standard Nim:        column sums ≡ 0 (mod 2) = XOR = 0
//   j = 2 → take from ≤ 2 piles: column sums ≡ 0 (mod 3)
//   j = k → take from any piles:  P-position iff all piles equal

// ══ 5. Staircase Nim ══════════════════════════════════════════════════════════
// Stones on steps 0, 1, 2, … Step 0 = ground (dead pile, no moves from here).
// Move: pick step i ≥ 1, move any positive number of stones from step i to i−1.
// Terminal: all stones on step 0.
//
// Theorem: (s₀, s₁, s₂, …) is a P-position iff  s₁ ⊕ s₃ ⊕ s₅ ⊕ … = 0.
// Only the ODD-indexed steps participate. Even-indexed stones are "ghosts."
//
// Proof (bijection to regular Nim on odd steps):
//   Move from odd step 2k+1: take t stones from step 2k+1, move to step 2k.
//     This removes t from the "odd-step Nim pile" 2k+1. → legal Nim move.  ✓
//
//   Move from even step 2k (k ≥ 1): take t stones from step 2k, move to 2k−1.
//     This adds t to odd-step pile 2k−1. The opponent can immediately mirror:
//     move those same t stones from step 2k−1 to step 2k−2 (even), restoring
//     the odd-step XOR to what it was before. The even-step move is thus
//     always neutralizable — even piles cannot affect the outcome.  ✓
//
//   Winning strategy: ignore even steps; play regular Nim on the odd steps.

bool staircaseWinner(const vector<int>& steps) {
    int xorOdd = 0;
    for (int i = 1; i < (int)steps.size(); i += 2)
        xorOdd ^= steps[i];
    return xorOdd != 0; // N-position (Winner) iff XOR of odd steps ≠ 0
}

// Optimal move: find odd step i where steps[i] ^ xorOdd < steps[i].
// Move (steps[i] - (steps[i] ^ xorOdd)) stones from step i to step i-1.`;

const TABS = ["nim", "grundy", "solver", "patterns"] as const;
type Tab = typeof TABS[number];

export default function NimCode() {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>("nim");

  const tabs = [
    { id: "nim",      label: t("nim.code.tab.nim") },
    { id: "grundy",   label: t("nim.code.tab.grundy") },
    { id: "solver",   label: t("nim.code.tab.solver") },
    { id: "patterns", label: t("nim.code.tab.patterns") },
  ];

  const CODE: Record<Tab, string> = {
    nim:      NIM_CODE,
    grundy:   GRUNDY_CODE,
    solver:   SOLVER_CODE,
    patterns: PATTERNS_CODE,
  };
  const DESC: Record<Tab, string> = {
    nim:      t("nim.code.nim.desc"),
    grundy:   t("nim.code.grundy.desc"),
    solver:   t("nim.code.solver.desc"),
    patterns: t("nim.code.patterns.desc"),
  };

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("nim.code.title")}</h2>
      <p className="text-sm text-[var(--color-muted)] mb-4">{DESC[tab]}</p>
      <TabGroup tabs={tabs} activeTab={tab} onChange={(id) => setTab(id as Tab)} className="mb-4" />
      <CodeBlock code={CODE[tab]} />
    </SectionCard>
  );
}
