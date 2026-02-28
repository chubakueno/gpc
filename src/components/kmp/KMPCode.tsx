import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { TabGroup } from "@/components/shared/TabGroup";
import { SectionCard } from "@/components/layout/SectionCard";

const BASIC_CODE = `\
#include <bits/stdc++.h>
using namespace std;

// Build the failure function (partial match table).
// fail[i] = length of the longest proper prefix of P[0..i]
//           that is also a suffix of P[0..i].
vector<int> buildFail(const string& P) {
    int m = P.size();
    vector<int> fail(m, 0);
    int j = 0;
    for (int i = 1; i < m; i++) {
        while (j > 0 && P[i] != P[j]) j = fail[j - 1];
        if (P[i] == P[j]) j++;
        fail[i] = j;
    }
    return fail;
}

// Search for all occurrences of pattern P in text T.
// Returns a list of starting positions (0-indexed).
vector<int> kmpSearch(const string& T, const string& P) {
    int n = T.size(), m = P.size();
    if (m == 0) return {};

    vector<int> fail = buildFail(P);
    vector<int> matches;
    int j = 0; // number of chars matched so far

    for (int i = 0; i < n; i++) {
        while (j > 0 && T[i] != P[j]) j = fail[j - 1];
        if (T[i] == P[j]) j++;
        if (j == m) {
            matches.push_back(i - m + 1); // match starts here
            j = fail[m - 1];              // look for overlapping matches
        }
    }
    return matches;
}

int main() {
    string T = "aababacababaca";
    string P = "ababaca";

    auto pos = kmpSearch(T, P);
    cout << "Matches at: ";
    for (int p : pos) cout << p << " ";
    cout << "\\n";
    // Output: Matches at: 1 7
}`;

const APPLICATIONS_CODE = `\
#include <bits/stdc++.h>
using namespace std;

vector<int> buildFail(const string& P) {
    int m = P.size();
    vector<int> fail(m, 0);
    for (int i = 1, j = 0; i < m; i++) {
        while (j > 0 && P[i] != P[j]) j = fail[j - 1];
        if (P[i] == P[j]) j++;
        fail[i] = j;
    }
    return fail;
}

// ── Application 1: Count non-overlapping occurrences ─────────────────────────
int countNonOverlapping(const string& T, const string& P) {
    auto fail = buildFail(P);
    int count = 0, j = 0, m = P.size();
    for (char c : T) {
        while (j > 0 && c != P[j]) j = fail[j - 1];
        if (c == P[j]) j++;
        if (j == m) { count++; j = 0; } // reset instead of fail[m-1]
    }
    return count;
}

// ── Application 2: Shortest period of a string ───────────────────────────────
// The period of S is the smallest p such that S[i] == S[i % p] for all i.
// Using KMP: period = m - fail[m-1]   (if m % (m-fail[m-1]) == 0, else period = m)
int period(const string& S) {
    auto fail = buildFail(S);
    int m = S.size();
    int p = m - fail[m - 1];
    return (m % p == 0) ? p : m;
}

// ── Application 3: Concatenation search (good for multiple patterns) ─────────
// Search for P in T by building the "combined" string P + '#' + T,
// then checking where fail[i] == m in the combined string.
vector<int> kmpConcat(const string& T, const string& P) {
    string S = P + '#' + T;     // '#' is a separator not in the alphabet
    auto fail = buildFail(S);
    int m = P.size();
    vector<int> matches;
    for (int i = m + 1; i < (int)S.size(); i++)
        if (fail[i] == m)
            matches.push_back(i - 2 * m); // convert back to T-index
    return matches;
}

int main() {
    cout << countNonOverlapping("abababab", "ab") << "\\n"; // 4

    cout << period("abababab") << "\\n";  // 2  (period "ab")
    cout << period("aabaab")   << "\\n";  // 3  (period "aab")
    cout << period("abcde")    << "\\n";  // 5  (no shorter period)

    auto m = kmpConcat("aababacababaca", "ababaca");
    for (int p : m) cout << p << " ";    // 1 7
    cout << "\\n";
}`;

export function KMPCode() {
  const { t } = useLang();
  const [tab, setTab] = useState("basic");

  const tabs = [
    { id: "basic", label: t("kmp.code.tab.basic") },
    { id: "apps",  label: t("kmp.code.tab.apps") },
  ];

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("kmp.code.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("kmp.code.desc")}</p>
      </SectionCard>

      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} />

      {tab === "basic" && (
        <SectionCard>
          <p className="text-sm text-[var(--color-muted)] mb-3">{t("kmp.code.basic.desc")}</p>
          <CodeBlock code={BASIC_CODE} language="cpp" />
        </SectionCard>
      )}
      {tab === "apps" && (
        <SectionCard>
          <p className="text-sm text-[var(--color-muted)] mb-3">{t("kmp.code.apps.desc")}</p>
          <CodeBlock code={APPLICATIONS_CODE} language="cpp" />
        </SectionCard>
      )}
    </div>
  );
}
