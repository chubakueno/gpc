import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const CODE_AC = `#include <bits/stdc++.h>
using namespace std;

// ALPHA is a compile-time constant: one contiguous allocation for all nodes.
// toIdx maps a character to [0, ALPHA) — swap freely for any alphabet.
template<int ALPHA>
struct AhoCorasick {
    function<int(char)> toIdx;
    vector<array<int, ALPHA>> go;
    vector<int> fail, dict, output;
    // output[v] = pattern index ending at v (-1 if none)

    AhoCorasick(function<int(char)> toIdx) : toIdx(toIdx) {
        go.emplace_back(); go.back().fill(-1);
        fail.push_back(0);
        dict.push_back(-1);
        output.push_back(-1);
    }

    int insert(const string& s, int patId) {
        int cur = 0;
        for (char c : s) {
            int ch = toIdx(c);
            if (go[cur][ch] == -1) {
                go[cur][ch] = go.size();
                go.emplace_back(); go.back().fill(-1);
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
        for (int c = 0; c < ALPHA; c++) {
            if (go[0][c] == -1) {
                go[0][c] = 0; // missing char at root loops back to root
            } else {
                fail[go[0][c]] = 0;
                q.push(go[0][c]);
            }
        }
        while (!q.empty()) {
            int u = q.front(); q.pop();
            dict[u] = (output[fail[u]] != -1) ? fail[u] : dict[fail[u]];
            for (int c = 0; c < ALPHA; c++) {
                if (go[u][c] == -1) {
                    go[u][c] = go[fail[u]][c]; // compressed goto
                } else {
                    fail[go[u][c]] = go[fail[u]][c];
                    q.push(go[u][c]);
                }
            }
        }
    }

    void search(const string& text, const vector<string>& pats,
                function<void(int,int)> cb) {
        int cur = 0;
        for (int i = 0; i < (int)text.size(); i++) {
            cur = go[cur][toIdx(text[i])];
            for (int v = cur; v > 0; v = dict[v])
                if (output[v] >= 0)
                    cb(i - (int)pats[output[v]].size() + 1, output[v]);
        }
    }

};

int main() {
    AhoCorasick<26> ac([](char c) { return c - 'a'; });

    vector<string> patterns = {"he", "she", "his", "hers"};
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

const CODE_ALPHABETS = `#include <bits/stdc++.h>
using namespace std;
// (AhoCorasick<ALPHA> struct as above)

// ALPHA must be known at compile time — that's what gives us the contiguous
// vector<array<int,ALPHA>> layout. toIdx is the only runtime part.

// ── 1. Lowercase English ────────────────────────────────────────────────────
AhoCorasick<26> makeLower() {
    return AhoCorasick<26>([](char c) { return c - 'a'; });
}

// ── 2. Case-insensitive ASCII letters ──────────────────────────────────────
AhoCorasick<26> makeCaseInsensitive() {
    return AhoCorasick<26>([](char c) { return tolower(c) - 'a'; });
}

// ── 3. DNA alphabet {A, C, G, T} ───────────────────────────────────────────
AhoCorasick<4> makeDNA() {
    return AhoCorasick<4>([](char c) -> int {
        switch (c) {
            case 'A': return 0; case 'C': return 1;
            case 'G': return 2; case 'T': return 3;
            default:  return 0;
        }
    });
}

// ── 4. Custom symbol set (ALPHA = number of distinct symbols, compile-time) ──
// Build a 256-entry lookup table so toIdx stays O(1).
// idx.fill(0) means any character NOT in symbols falls back to slot 0.
// Put your "catch-all" symbol (e.g. space) first to exploit this.
template<int ALPHA>
AhoCorasick<ALPHA> makeCustom(const string& symbols) {
    // symbols.size() must equal ALPHA
    array<int, 256> idx; idx.fill(0);
    for (int i = 0; i < (int)symbols.size(); i++)
        idx[(unsigned char)symbols[i]] = i;
    return AhoCorasick<ALPHA>([idx](char c) { return idx[(unsigned char)c]; });
}

// ── 5. Printable ASCII (32-126) ─────────────────────────────────────────────
AhoCorasick<95> makeASCII() {
    return AhoCorasick<95>([](char c) { return (unsigned char)c - 32; });
}

// ── 6. Full byte alphabet (0-255) ──────────────────────────────────────────
AhoCorasick<256> makeByte() {
    return AhoCorasick<256>([](char c) { return (unsigned char)c; });
}

int main() {
    // DNA example
    auto ac_dna = makeDNA();
    vector<string> motifs = {"GATA", "ATA", "TATA"};
    for (int i = 0; i < (int)motifs.size(); i++) ac_dna.insert(motifs[i], i);
    ac_dna.build();
    string genome = "CGATATATAG";
    ac_dna.search(genome, motifs, [&](int pos, int pid) {
        cout << "Motif \\"" << motifs[pid] << "\\" at pos " << pos << "\\n";
    });

    // Custom alphabet: lowercase vowels + '#' sentinel (6 symbols)
    auto ac_custom = makeCustom<6>("aeiou#");
    vector<string> pats = {"aei", "eio", "iou"};
    for (int i = 0; i < (int)pats.size(); i++) ac_custom.insert(pats[i], i);
    ac_custom.build();
    string text = "aeiou#iou";
    ac_custom.search(text, pats, [&](int pos, int pid) {
        cout << "Found \\"" << pats[pid] << "\\" at pos " << pos << "\\n";
    });
    return 0;
}`;

const CODE_APPS = `#include <bits/stdc++.h>
using namespace std;

// (AhoCorasick struct as above)

auto lower26 = [](char c) { return c - 'a'; };

// 1. Count occurrences of each pattern in text
vector<int> countOccurrences(const string& text, const vector<string>& pats) {
    AhoCorasick<26> ac(lower26);
    for (int i = 0; i < (int)pats.size(); i++) ac.insert(pats[i], i);
    ac.build();
    vector<int> cnt(pats.size(), 0);
    ac.search(text, pats, [&](int, int pid) { cnt[pid]++; });
    return cnt;
}

// 2. Check if any pattern appears in text (early exit)
bool containsAny(const string& text, const vector<string>& pats) {
    AhoCorasick<26> ac(lower26);
    for (int i = 0; i < (int)pats.size(); i++) ac.insert(pats[i], i);
    ac.build();
    bool found = false;
    ac.search(text, pats, [&](int, int) { found = true; });
    return found;
}

// 3. Find first occurrence position of any pattern
int firstOccurrence(const string& text, const vector<string>& pats) {
    AhoCorasick<26> ac(lower26);
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
    { id: "ac",        label: t("ac.code.tab.ac") },
    { id: "alphabets", label: t("ac.code.tab.alphabets") },
    { id: "apps",      label: t("ac.code.tab.apps") },
  ];

  const code = activeTab === "ac" ? CODE_AC
             : activeTab === "alphabets" ? CODE_ALPHABETS
             : CODE_APPS;

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">{t("ac.code.title")}</h2>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
      <CodeBlock code={code} language="cpp" />
    </SectionCard>
  );
}
