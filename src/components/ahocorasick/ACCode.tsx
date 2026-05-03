import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const CODE_AC = `#include <bits/stdc++.h>
using namespace std;
#define ALPHA 26

struct AhoCorasick {
    vector<array<int,ALPHA>> go;
    vector<int> fail, dict, output;
    // output[v] = pattern index ending at v (-1 if none)

    AhoCorasick() {
        go.push_back({});
        fill(go[0].begin(), go[0].end(), -1);
        fail.push_back(0);
        dict.push_back(-1);
        output.push_back(-1);
    }

    // Insert pattern, return terminal node id
    int insert(const string& s, int patId) {
        int cur = 0;
        for (char c : s) {
            int ch = c - 'a';
            if (go[cur][ch] == -1) {
                go[cur][ch] = go.size();
                go.push_back({});
                fill(go.back().begin(), go.back().end(), -1);
                fail.push_back(0);
                dict.push_back(-1);
                output.push_back(-1);
            }
            cur = go[cur][ch];
        }
        output[cur] = patId;
        return cur;
    }

    // Build failure and dictionary links (call after all insertions)
    void build() {
        queue<int> q;
        // Root's children: fail -> root
        for (int c = 0; c < ALPHA; c++) {
            if (go[0][c] == -1) {
                go[0][c] = 0; // make root a "goto" for missing chars
            } else {
                fail[go[0][c]] = 0;
                q.push(go[0][c]);
            }
        }
        while (!q.empty()) {
            int u = q.front(); q.pop();
            // dict link: nearest terminal via fail chain
            dict[u] = (output[fail[u]] != -1) ? fail[u] : dict[fail[u]];
            for (int c = 0; c < ALPHA; c++) {
                if (go[u][c] == -1) {
                    // "compressed" goto: follow fail to find a c-transition
                    go[u][c] = go[fail[u]][c];
                } else {
                    fail[go[u][c]] = go[fail[u]][c];
                    q.push(go[u][c]);
                }
            }
        }
    }

    // Search text, call cb(pos, patId) for each match ending at pos
    void search(const string& text, const vector<string>& pats,
                function<void(int,int)> cb) {
        int cur = 0;
        for (int i = 0; i < (int)text.size(); i++) {
            cur = go[cur][text[i] - 'a'];
            // Report matches: cur itself + dict link chain
            if (output[cur]>=0) cb(i - (int)pats[output[cur]].size() + 1, output[cur]);
            for (int v = dict[cur]; v > 0; v = dict[v]) {
                cb(i - (int)pats[output[v]].size() + 1, output[v]);
            }
        }
    }
};

int main() {
    vector<string> patterns = {"he", "she", "his", "hers"};
    AhoCorasick ac;
    for (int i = 0; i < (int)patterns.size(); i++)
        ac.insert(patterns[i], i);
    ac.build();

    string text = "ushers";
    ac.search(text, patterns, [&](int pos, int pid) {
        cout << "Found \\"" << patterns[pid] << "\\" at position " << pos << "\\n";
    });
    // Output:
    // Found "she" at position 1
    // Found "he" at position 2
    // Found "hers" at position 2
    return 0;
}`;

const CODE_APPS = `#include <bits/stdc++.h>
using namespace std;

// (AhoCorasick struct as above)

// 1. Count occurrences of each pattern in text
vector<int> countOccurrences(const string& text, const vector<string>& pats) {
    AhoCorasick ac;
    for (int i = 0; i < (int)pats.size(); i++) ac.insert(pats[i], i);
    ac.build();
    vector<int> cnt(pats.size(), 0);
    ac.search(text, pats, [&](int, int pid) { cnt[pid]++; });
    return cnt;
}

// 2. Check if any pattern appears in text (early exit)
bool containsAny(const string& text, const vector<string>& pats) {
    AhoCorasick ac;
    for (int i = 0; i < (int)pats.size(); i++) ac.insert(pats[i], i);
    ac.build();
    bool found = false;
    ac.search(text, pats, [&](int, int) { found = true; });
    return found;
}

// 3. Find first occurrence position of any pattern
int firstOccurrence(const string& text, const vector<string>& pats) {
    AhoCorasick ac;
    for (int i = 0; i < (int)pats.size(); i++) ac.insert(pats[i], i);
    ac.build();
    int first = INT_MAX;
    ac.search(text, pats, [&](int pos, int) {
        first = min(first, pos);
    });
    return first == INT_MAX ? -1 : first;
}

int main() {
    vector<string> pats = {"he", "she", "his", "hers"};
    string text = "ushers";

    // Count occurrences
    auto cnt = countOccurrences(text, pats);
    for (int i = 0; i < (int)pats.size(); i++)
        cout << "\\"" << pats[i] << "\\" appears " << cnt[i] << " time(s)\\n";

    // Contains any
    cout << "Contains any: " << (containsAny(text, pats) ? "yes" : "no") << "\\n";

    // First occurrence
    cout << "First at position: " << firstOccurrence(text, pats) << "\\n";

    return 0;
}`;

export function ACCode() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("ac");

  const tabs = [
    { id: "ac",   label: t("ac.code.tab.ac") },
    { id: "apps", label: t("ac.code.tab.apps") },
  ];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("ac.code.title")}</h2>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
      <CodeBlock code={activeTab === "ac" ? CODE_AC : CODE_APPS} language="cpp" />
    </SectionCard>
  );
}
