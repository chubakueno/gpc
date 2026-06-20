import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { TabGroup } from "@/components/shared/TabGroup";

const FIBONACCI_CODE = `// ── Top-down: memoization ──────────────────────────────────
// Time O(n), Space O(n)
unordered_map<int, long long> memo;
long long fib(int n) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];
    return memo[n] = fib(n - 1) + fib(n - 2);
}

// ── Bottom-up: tabulation ───────────────────────────────────
// Time O(n), Space O(n)
long long fib_dp(int n) {
    if (n <= 1) return n;
    vector<long long> dp(n + 1);
    dp[0] = 0;  dp[1] = 1;
    for (int i = 2; i <= n; i++)
        dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

// ── Space-optimized: rolling pair ──────────────────────────
// Time O(n), Space O(1)
long long fib_opt(int n) {
    if (n <= 1) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    return b;
}`;

const COIN_CHANGE_CODE = `// ── Top-down: memoization ──────────────────────────────────
// memo[i] = min coins for amount i  (-1 = not yet computed)
int coinHelper(vector<int>& coins, int amount, vector<int>& memo) {
    if (amount == 0) return 0;
    if (memo[amount] != -1) return memo[amount];
    int best = INT_MAX;
    for (int c : coins)
        if (c <= amount) {
            int sub = coinHelper(coins, amount - c, memo);
            if (sub != INT_MAX) best = min(best, sub + 1);
        }
    return memo[amount] = best;
}
int coinChange_memo(vector<int>& coins, int amount) {
    vector<int> memo(amount + 1, -1);
    int res = coinHelper(coins, amount, memo);
    return res == INT_MAX ? -1 : res;
}

// ── Bottom-up: tabulation ──────────────────────────────────
// Time O(amount * coins.size()), Space O(amount)
int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        for (int c : coins)
            if (c <= i && dp[i - c] != INT_MAX)
                dp[i] = min(dp[i], dp[i - c] + 1);
    return dp[amount] == INT_MAX ? -1 : dp[amount];
}

// ── Reconstruct which coins were used ──────────────────────
vector<int> coinReconstruct(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, INT_MAX), from(amount + 1, -1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        for (int c : coins)
            if (c <= i && dp[i - c] != INT_MAX && dp[i - c] + 1 < dp[i]) {
                dp[i]   = dp[i - c] + 1;
                from[i] = i - c;
            }
    vector<int> result;
    for (int x = amount; x > 0; x = from[x])
        result.push_back(x - from[x]);
    return result;
}

// coins = {1, 3, 4},  amount = 9  →  3 coins  (4 + 4 + 1)`;

const KNAPSACK_CODE = `// ── Top-down: memoization ──────────────────────────────────
// dp[i][c] = max value using items 0..i-1 with remaining capacity c
int ksHelper(vector<int>& w, vector<int>& v, int i, int c,
             vector<vector<int>>& dp) {
    if (i == 0 || c == 0) return 0;
    if (dp[i][c] != -1)   return dp[i][c];
    int skip = ksHelper(w, v, i - 1, c, dp);
    int take = 0;
    if (w[i-1] <= c)
        take = ksHelper(w, v, i - 1, c - w[i-1], dp) + v[i-1];
    return dp[i][c] = max(skip, take);
}
int knapsack_memo(vector<int>& w, vector<int>& v, int W) {
    int n = w.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, -1));
    return ksHelper(w, v, n, W, dp);
}

// ── Bottom-up: tabulation — O(n*W) time, O(n*W) space ──────
int knapsack(vector<int>& w, vector<int>& v, int W) {
    int n = w.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i - 1][c];           // skip item i
            if (w[i-1] <= c)
                dp[i][c] = max(dp[i][c],
                    dp[i-1][c - w[i-1]] + v[i-1]);  // take item i
        }
    return dp[n][W];
}

// ── Space-optimized: O(W) space ─────────────────────────────
// Iterate capacity BACKWARDS to avoid reusing same item.
int knapsack1D(vector<int>& w, vector<int>& v, int W) {
    vector<int> dp(W + 1, 0);
    for (int i = 0; i < (int)w.size(); i++)
        for (int c = W; c >= w[i]; c--)   // must go backwards!
            dp[c] = max(dp[c], dp[c - w[i]] + v[i]);
    return dp[W];
}

// ── Reconstruct selected items ──────────────────────────────
vector<int> knapsackItems(vector<int>& w, vector<int>& v, int W) {
    int n = w.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int c = 0; c <= W; c++) {
            dp[i][c] = dp[i-1][c];
            if (w[i-1] <= c)
                dp[i][c] = max(dp[i][c], dp[i-1][c-w[i-1]] + v[i-1]);
        }
    vector<int> chosen;
    int c = W;
    for (int i = n; i >= 1; i--)
        if (dp[i][c] != dp[i-1][c]) { chosen.push_back(i-1); c -= w[i-1]; }
    return chosen;
}`;

const LCS_CODE = `// ── Top-down: memoization ──────────────────────────────────
int lcsHelper(const string& a, const string& b, int i, int j,
              vector<vector<int>>& dp) {
    if (i == 0 || j == 0) return 0;
    if (dp[i][j] != -1)   return dp[i][j];
    if (a[i-1] == b[j-1])
        return dp[i][j] = lcsHelper(a, b, i-1, j-1, dp) + 1;
    return dp[i][j] = max(lcsHelper(a, b, i-1, j, dp),
                          lcsHelper(a, b, i, j-1, dp));
}
int lcs_memo(const string& a, const string& b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, -1));
    return lcsHelper(a, b, m, n, dp);
}

// ── Bottom-up: tabulation — O(mn) time, O(mn) space ────────
int lcs(const string& a, const string& b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
            else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    return dp[m][n];
}

// ── Reconstruct the LCS string ──────────────────────────────
string lcsString(const string& a, const string& b) {
    int m = a.size(), n = b.size();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++) {
            if (a[i-1] == b[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
            else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        }
    string result;
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (a[i-1] == b[j-1]) { result += a[i-1]; i--; j--; }
        else if (dp[i-1][j] >= dp[i][j-1]) i--;
        else j--;
    }
    reverse(result.begin(), result.end());
    return result;
}

// ── Space-optimized: 2-row rolling — O(n) space ────────────
int lcsOptimal(const string& a, const string& b) {
    int m = a.size(), n = b.size();
    vector<int> prev(n + 1, 0), curr(n + 1, 0);
    for (int i = 1; i <= m; i++) {
        fill(curr.begin(), curr.end(), 0);
        for (int j = 1; j <= n; j++) {
            if (a[i-1] == b[j-1]) curr[j] = prev[j-1] + 1;
            else curr[j] = max(prev[j], curr[j-1]);
        }
        swap(prev, curr);
    }
    return prev[n];
}`;

const LIS_CODE = `// ── Top-down: memoization — O(n^2) time and space ──────────
// State: (i, j) where i = current index, j = index of last chosen (-1 = none)
// dp2[i][j+1] = LIS length from index i onward given last chosen = a[j]
vector<vector<int>> dp2;
int lisHelper(vector<int>& a, int i, int j) {
    if (i == (int)a.size()) return 0;
    if (dp2[i][j + 1] != -1) return dp2[i][j + 1];
    int skip = lisHelper(a, i + 1, j);
    int take = 0;
    if (j == -1 || a[j] < a[i])
        take = 1 + lisHelper(a, i + 1, i);
    return dp2[i][j + 1] = max(skip, take);
}
int lis_memo(vector<int>& a) {
    int n = a.size();
    dp2.assign(n, vector<int>(n + 1, -1));
    return lisHelper(a, 0, -1);
}

// ── Bottom-up O(n^2): classic nested loops ──────────────────
// dp[i] = length of LIS ending at index i
int lis_n2(vector<int>& a) {
    int n = a.size();
    vector<int> dp(n, 1);
    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (a[j] < a[i]) dp[i] = max(dp[i], dp[j] + 1);
    return *max_element(dp.begin(), dp.end());
}

// ── Reconstruct the actual LIS — O(n^2) ────────────────────
vector<int> lis_reconstruct(vector<int>& a) {
    int n = a.size();
    vector<int> dp(n, 1), prev(n, -1);
    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (a[j] < a[i] && dp[j] + 1 > dp[i]) {
                dp[i] = dp[j] + 1;  prev[i] = j;
            }
    int idx = max_element(dp.begin(), dp.end()) - dp.begin();
    vector<int> result;
    for (int i = idx; i != -1; i = prev[i]) result.push_back(a[i]);
    reverse(result.begin(), result.end());
    return result;
}

// ── Bottom-up O(n log n): patience sorting ──────────────────
// tails[k] = smallest tail of any IS of length k+1 seen so far.
int lis_nlogn(vector<int>& a) {
    vector<int> tails;
    for (int x : a) {
        // lower_bound for strict increase; upper_bound for non-strict
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x);
        else *it = x;
    }
    return (int)tails.size();
}
// Note: tails[] is NOT the actual LIS — only its length is correct.
// For the sequence itself, use lis_reconstruct() above.`;

export function DPCode() {
  const { t } = useLang();
  const [tab, setTab] = useState("fibonacci");

  const tabs = [
    { id: "fibonacci", label: t("dp.code.tab.fibonacci") },
    { id: "coins",     label: t("dp.code.tab.coins") },
    { id: "knapsack",  label: t("dp.code.tab.knapsack") },
    { id: "lcs",       label: t("dp.code.tab.lcs") },
    { id: "lis",       label: t("dp.code.tab.lis") },
  ];

  const descMap: Record<string, string> = {
    fibonacci: t("dp.code.fibonacci.desc"),
    coins:     t("dp.code.coins.desc"),
    knapsack:  t("dp.code.knapsack.desc"),
    lcs:       t("dp.code.lcs.desc"),
    lis:       t("dp.code.lis.desc"),
  };

  const codeMap: Record<string, string> = {
    fibonacci: FIBONACCI_CODE,
    coins:     COIN_CHANGE_CODE,
    knapsack:  KNAPSACK_CODE,
    lcs:       LCS_CODE,
    lis:       LIS_CODE,
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">{t("dp.code.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{descMap[tab]}</p>
      </div>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} />
      <CodeBlock code={codeMap[tab]} />
    </div>
  );
}
