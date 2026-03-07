import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const CODE_BASIC = `#include <bits/stdc++.h>
using namespace std;

// Z-function: z[i] = length of the longest substring starting at s[i]
// that is also a prefix of s. z[0] = n by convention.
// Time: O(N), Space: O(N)
vector<int> z_function(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    z[0] = n;

    // [l, r) is the Z-box: the rightmost interval where s[l..r] = s[0..r-l]
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r)
            // s[i..r-1] = s[i-l..r-l-1], so we can start from min(z[i-l], r-i)
            z[i] = min(z[i - l], r - i);

        // Try to extend
        while (i + z[i] < n && s[z[i]] == s[i + z[i]])
            z[i]++;

        // Expand Z-box if we went further right
        if (i + z[i] > r) {
            l = i;
            r = i + z[i];
        }
    }
    return z;
}

int main() {
    string s = "aabaabaab";
    auto z = z_function(s);

    // z = [9, 1, 0, 6, 1, 0, 3, 1, 0]
    for (int i = 0; i < (int)s.size(); i++)
        cout << "z[" << i << "] = " << z[i] << "\\n";

    return 0;
}`;

const CODE_APPS = `#include <bits/stdc++.h>
using namespace std;

vector<int> z_function(const string& s) {
    int n = s.size();
    vector<int> z(n, 0);
    z[0] = n;
    int l = 0, r = 0;
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = min(z[i - l], r - i);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}

// ── 1. Pattern matching: find all occurrences of P in T ─────────────────────
// Concatenate P + '#' + T. Any position i in the T-part where z[i] == |P|
// corresponds to a match at T[i - |P| - 1].
vector<int> find_all(const string& P, const string& T) {
    string s = P + '#' + T;
    auto z = z_function(s);
    int m = P.size();
    vector<int> matches;
    for (int i = m + 1; i < (int)s.size(); i++)
        if (z[i] == m) matches.push_back(i - m - 1);
    return matches;
}

// ── 2. Shortest period of a string ──────────────────────────────────────────
// The shortest period p satisfies: s[0..n-p-1] == s[p..n-1],
// i.e. z[p] + p == n (the suffix at p matches the prefix and reaches the end).
int shortest_period(const string& s) {
    int n = s.size();
    auto z = z_function(s);
    for (int p = 1; p < n; p++)
        if (z[p] + p == n) return p;
    return n; // no period shorter than n
}

// ── 3. Longest border (prefix = suffix, proper) ─────────────────────────────
// A border of length k exists iff z[n-k] == k.
int longest_border(const string& s) {
    int n = s.size();
    auto z = z_function(s);
    for (int k = n - 1; k >= 1; k--)
        if (z[n - k] == k) return k;
    return 0;
}

int main() {
    // Pattern matching
    string P = "ab", T = "ababab";
    auto occ = find_all(P, T);
    cout << "Occurrences of \\"" << P << "\\" in \\"" << T << "\\": ";
    for (int p : occ) cout << p << " ";
    cout << "\\n";  // 0 2 4

    // Period
    cout << "Period of \\"aabaabaab\\": " << shortest_period("aabaabaab") << "\\n";  // 3

    // Border
    cout << "Border of \\"abacaba\\": " << longest_border("abacaba") << "\\n";  // 3 ("aba")

    return 0;
}`;

export function ZFuncCode() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("basic");

  const tabs = [
    { id: "basic", label: t("zfunc.code.tab.basic") },
    { id: "apps",  label: t("zfunc.code.tab.apps") },
  ];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("zfunc.code.title")}</h2>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
      <CodeBlock code={activeTab === "basic" ? CODE_BASIC : CODE_APPS} language="cpp" />
    </SectionCard>
  );
}
