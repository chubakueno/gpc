import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const CODE_SA = `#include <bits/stdc++.h>
using namespace std;

// O(N log^2 N) Suffix Array via prefix doubling.
// For competitive programming, this is usually fast enough.
// Use SA-IS or DC3 for guaranteed O(N).
vector<int> suffix_array(const string& s) {
    int n = s.size();
    vector<int> sa(n), rank_(n), tmp(n);

    iota(sa.begin(), sa.end(), 0);
    for (int i = 0; i < n; i++) rank_[i] = s[i];

    for (int k = 1; k < n; k <<= 1) {
        // Compare by (rank_[i], rank_[i+k])
        auto key = [&](int i) -> pair<int,int> {
            return {rank_[i], i + k < n ? rank_[i + k] : -1};
        };
        sort(sa.begin(), sa.end(), [&](int a, int b){ return key(a) < key(b); });

        // Re-rank: same key → same rank
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++)
            tmp[sa[i]] = tmp[sa[i-1]] + (key(sa[i]) != key(sa[i-1]));
        rank_ = tmp;

        if (rank_[sa[n-1]] == n-1) break; // all ranks unique → done
    }
    return sa;
}

// O(N) LCP array via Kasai's algorithm.
// lcp[i] = LCP(SA[i-1], SA[i])  (lcp[0] = 0 by convention)
vector<int> kasai_lcp(const string& s, const vector<int>& sa) {
    int n = sa.size();
    vector<int> rank_(n), lcp(n, 0);
    for (int i = 0; i < n; i++) rank_[sa[i]] = i;

    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank_[i] > 0) {
            int j = sa[rank_[i] - 1]; // suffix right before s[i..] in sorted order
            while (i + h < n && j + h < n && s[i+h] == s[j+h]) h++;
            lcp[rank_[i]] = h;
            if (h > 0) h--; // key insight: LCP can drop by at most 1 each step
        }
    }
    return lcp;
}

int main() {
    string s = "banana";
    auto sa  = suffix_array(s);  // [5, 3, 1, 0, 4, 2]
    auto lcp = kasai_lcp(s, sa); // [0, 1, 3, 0, 0, 2]

    cout << "SA:  ";
    for (int i : sa)  cout << i << " "; cout << "\\n";

    cout << "LCP: ";
    for (int v : lcp) cout << v << " "; cout << "\\n";

    // Suffixes in sorted order:
    for (int i = 0; i < (int)sa.size(); i++)
        cout << sa[i] << "  " << s.substr(sa[i]) << "\\n";

    return 0;
}`;

const CODE_APPS = `#include <bits/stdc++.h>
using namespace std;

vector<int> suffix_array(const string& s) {
    int n = s.size();
    vector<int> sa(n), rank_(n), tmp(n);
    iota(sa.begin(), sa.end(), 0);
    for (int i = 0; i < n; i++) rank_[i] = s[i];
    for (int k = 1; k < n; k <<= 1) {
        auto key = [&](int i) -> pair<int,int> {
            return {rank_[i], i + k < n ? rank_[i + k] : -1};
        };
        sort(sa.begin(), sa.end(), [&](int a, int b){ return key(a) < key(b); });
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++)
            tmp[sa[i]] = tmp[sa[i-1]] + (key(sa[i]) != key(sa[i-1]));
        rank_ = tmp;
        if (rank_[sa[n-1]] == n-1) break;
    }
    return sa;
}

vector<int> kasai_lcp(const string& s, const vector<int>& sa) {
    int n = sa.size();
    vector<int> rank_(n), lcp(n, 0);
    for (int i = 0; i < n; i++) rank_[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank_[i] > 0) {
            int j = sa[rank_[i] - 1];
            while (i + h < n && j + h < n && s[i+h] == s[j+h]) h++;
            lcp[rank_[i]] = h;
            if (h > 0) h--;
        }
    }
    return lcp;
}

// ── 1. Pattern search: O(M log N) ───────────────────────────────────────────
// Binary search on SA: all matches are a contiguous range [lo, hi).
pair<int,int> search_range(const string& s, const vector<int>& sa, const string& P) {
    int n = sa.size(), m = P.size();
    int lo = (int)(lower_bound(sa.begin(), sa.end(), 0, [&](int a, int) {
        return s.compare(a, m, P) < 0;
    }) - sa.begin());
    int hi = (int)(upper_bound(sa.begin(), sa.end(), 0, [&](int, int a) {
        return s.compare(a, m, P) > 0;
    }) - sa.begin());
    return {lo, hi};
}

// ── 2. Count distinct substrings ────────────────────────────────────────────
// Total substrings = N*(N+1)/2. Subtract duplicates counted by LCP array.
long long distinct_substrings(const string& s) {
    auto sa  = suffix_array(s);
    auto lcp = kasai_lcp(s, sa);
    int n = s.size();
    long long total = (long long)n * (n + 1) / 2;
    for (int v : lcp) total -= v;
    return total;
}

// ── 3. Longest repeated substring ───────────────────────────────────────────
// The maximum value in the LCP array.
string longest_repeated(const string& s) {
    auto sa  = suffix_array(s);
    auto lcp = kasai_lcp(s, sa);
    int best = *max_element(lcp.begin(), lcp.end());
    int idx  = max_element(lcp.begin(), lcp.end()) - lcp.begin();
    return best > 0 ? s.substr(sa[idx], best) : "";
}

int main() {
    string s = "banana";
    auto sa = suffix_array(s);

    // Pattern search
    auto [lo, hi] = search_range(s, sa, "ana");
    cout << "Occurrences of \\"ana\\": ";
    for (int i = lo; i < hi; i++) cout << sa[i] << " ";
    cout << "\\n";  // 1 3

    // Distinct substrings
    cout << "Distinct substrings: " << distinct_substrings(s) << "\\n";  // 14

    // Longest repeated substring
    cout << "Longest repeated: \\"" << longest_repeated(s) << "\\"\\n";  // "ana"

    return 0;
}`;

const CODE_NLOGN = `#include <bits/stdc++.h>
using namespace std;

// O(N log N) Suffix Array via prefix doubling + radix sort.
// Each of the O(log N) doubling steps now runs in O(N):
//   Step A — sort by second key: one O(N) pass exploiting the previous SA.
//   Step B — sort by first key: counting sort (stable), O(N).
//   Step C — re-rank in O(N).
// Combined: O(log N) steps × O(N) per step = O(N log N).
vector<int> suffix_array(const string& s) {
    int n = s.size();
    vector<int> sa(n), rank_(n), tmp(n), sa2(n), cnt;

    // ── Initial sort by first character ─────────────────────────────────────
    iota(sa.begin(), sa.end(), 0);
    sort(sa.begin(), sa.end(), [&](int a, int b){ return s[a] < s[b]; });
    rank_[sa[0]] = 0;
    for (int i = 1; i < n; i++)
        rank_[sa[i]] = rank_[sa[i-1]] + (s[sa[i]] != s[sa[i-1]]);

    // ── Doubling ─────────────────────────────────────────────────────────────
    for (int k = 1; rank_[sa[n-1]] < n-1; k <<= 1) {
        int classes = rank_[sa[n-1]] + 1;

        // Step A: build sa2 sorted by second key (rank[i+k]) in O(N).
        //
        // Key insight: suffix i has second key = rank[i+k].
        //   • If i+k >= n  → second key = "empty" (smallest) → goes first.
        //   • If i+k <  n  → second key = rank[i+k].
        //     Since the current sa[] is sorted by rank, iterating sa in order
        //     and taking sa[j]-k (when valid) gives indices sorted by rank[i+k].
        int j = 0;
        for (int i = n - k; i < n; i++) sa2[j++] = i;         // empty second key
        for (int i = 0; i < n; i++) if (sa[i] >= k) sa2[j++] = sa[i] - k;

        // Step B: stable counting sort over sa2 by first key (rank[i]).
        cnt.assign(classes, 0);
        for (int i = 0; i < n; i++) cnt[rank_[sa2[i]]]++;
        for (int i = 1; i < classes; i++) cnt[i] += cnt[i-1];
        for (int i = n-1; i >= 0; i--) sa[--cnt[rank_[sa2[i]]]] = sa2[i];

        // Step C: re-rank with the new sorted order.
        tmp[sa[0]] = 0;
        for (int i = 1; i < n; i++) {
            int pa = sa[i-1], pb = sa[i];
            bool same = rank_[pa] == rank_[pb] &&
                        (pa+k < n ? rank_[pa+k] : -1) == (pb+k < n ? rank_[pb+k] : -1);
            tmp[pb] = tmp[pa] + (same ? 0 : 1);
        }
        rank_ = tmp;
    }
    return sa;
}

// Kasai's O(N) LCP — identical to the O(N log^2 N) version.
vector<int> kasai_lcp(const string& s, const vector<int>& sa) {
    int n = sa.size();
    vector<int> rank_(n), lcp(n, 0);
    for (int i = 0; i < n; i++) rank_[sa[i]] = i;
    int h = 0;
    for (int i = 0; i < n; i++) {
        if (rank_[i] > 0) {
            int j = sa[rank_[i] - 1];
            while (i + h < n && j + h < n && s[i+h] == s[j+h]) h++;
            lcp[rank_[i]] = h;
            if (h > 0) h--;
        }
    }
    return lcp;
}

int main() {
    string s = "banana";
    auto sa  = suffix_array(s);  // [5, 3, 1, 0, 4, 2]
    auto lcp = kasai_lcp(s, sa); // [0, 1, 3, 0, 0, 2]

    for (int i = 0; i < (int)sa.size(); i++)
        cout << sa[i] << "  lcp=" << lcp[i] << "  " << s.substr(sa[i]) << "\\n";

    return 0;
}`;

export function SACode() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("sa");

  const tabs = [
    { id: "sa",    label: t("sa.code.tab.sa") },
    { id: "nlogn", label: t("sa.code.tab.nlogn") },
    { id: "apps",  label: t("sa.code.tab.apps") },
  ];

  const code =
    activeTab === "sa"    ? CODE_SA    :
    activeTab === "nlogn" ? CODE_NLOGN :
                            CODE_APPS;

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("sa.code.title")}</h2>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
      <CodeBlock code={code} language="cpp" />
    </SectionCard>
  );
}
