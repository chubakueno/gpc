import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { TabGroup } from "@/components/shared/TabGroup";
import { SectionCard } from "@/components/layout/SectionCard";

const ARRAY_CODE = `\
#include <bits/stdc++.h>
using namespace std;

// Array-based Trie — O(L) insert/search, O(N * ALPHA) space
// Best for lowercase letters; change ALPHA for other alphabets.

const int MAXN  = 200005; // max total characters across all words
const int ALPHA = 26;

int trie[MAXN][ALPHA]; // trie[node][c] = child node id (0 = null)
bool isEnd[MAXN];
int cnt = 0;           // node counter (0 is root)

void insert(const string& s) {
    int cur = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (!trie[cur][c])
            trie[cur][c] = ++cnt;
        cur = trie[cur][c];
    }
    isEnd[cur] = true;
}

// Returns true iff the exact word s was inserted.
bool search(const string& s) {
    int cur = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (!trie[cur][c]) return false;
        cur = trie[cur][c];
    }
    return isEnd[cur];
}

// Returns true iff any inserted word starts with prefix.
bool startsWith(const string& prefix) {
    int cur = 0;
    for (char ch : prefix) {
        int c = ch - 'a';
        if (!trie[cur][c]) return false;
        cur = trie[cur][c];
    }
    return true;
}

int main() {
    insert("apple");
    insert("app");
    insert("apt");

    cout << search("apple")     << "\\n"; // 1
    cout << search("app")       << "\\n"; // 1
    cout << search("ap")        << "\\n"; // 0  (prefix only)
    cout << startsWith("ap")    << "\\n"; // 1
    cout << startsWith("xyz")   << "\\n"; // 0
}`;

const MAP_CODE = `\
#include <bits/stdc++.h>
using namespace std;

// Map-based Trie — works for any character set (Unicode, DNA, …).
// Slightly slower than array-based due to hash map overhead.

struct TrieNode {
    unordered_map<char, TrieNode*> ch;
    bool isEnd = false;

    ~TrieNode() {
        for (auto& [c, node] : ch)
            delete node;
    }
};

struct Trie {
    TrieNode* root;
    Trie() : root(new TrieNode()) {}
    ~Trie() { delete root; }

    void insert(const string& s) {
        TrieNode* cur = root;
        for (char c : s) {
            if (!cur->ch.count(c))
                cur->ch[c] = new TrieNode();
            cur = cur->ch[c];
        }
        cur->isEnd = true;
    }

    bool search(const string& s) {
        TrieNode* cur = root;
        for (char c : s) {
            if (!cur->ch.count(c)) return false;
            cur = cur->ch[c];
        }
        return cur->isEnd;
    }

    bool startsWith(const string& prefix) {
        TrieNode* cur = root;
        for (char c : prefix) {
            if (!cur->ch.count(c)) return false;
            cur = cur->ch[c];
        }
        return true;
    }

    // Collect all words that share the given prefix (autocomplete).
    vector<string> complete(const string& prefix) {
        TrieNode* cur = root;
        for (char c : prefix) {
            if (!cur->ch.count(c)) return {};
            cur = cur->ch[c];
        }
        vector<string> res;
        dfs(cur, prefix, res);
        return res;
    }

private:
    void dfs(TrieNode* node, const string& cur, vector<string>& res) {
        if (node->isEnd) res.push_back(cur);
        for (auto& [c, child] : node->ch)
            dfs(child, cur + c, res);
    }
};

int main() {
    Trie t;
    for (auto& w : {"sort", "stack", "string", "struct", "set",
                    "tree", "trie", "true"})
        t.insert(w);

    auto completions = t.complete("st");
    for (auto& w : completions)
        cout << w << "\\n";
    // Output (order may vary): stack  string  struct  ...
}`;

export function TrieCode() {
  const { t } = useLang();
  const [tab, setTab] = useState("array");

  const tabs = [
    { id: "array", label: t("trie.code.tab.array") },
    { id: "map",   label: t("trie.code.tab.map") },
  ];

  return (
    <div className="space-y-4">
      <SectionCard>
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">{t("trie.code.title")}</h2>
        <p className="text-sm text-[var(--color-muted)]">{t("trie.code.desc")}</p>
      </SectionCard>

      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} />

      {tab === "array" && (
        <SectionCard>
          <p className="text-sm text-[var(--color-muted)] mb-3">{t("trie.code.array.desc")}</p>
          <CodeBlock code={ARRAY_CODE} language="cpp" />
        </SectionCard>
      )}

      {tab === "map" && (
        <SectionCard>
          <p className="text-sm text-[var(--color-muted)] mb-3">{t("trie.code.map.desc")}</p>
          <CodeBlock code={MAP_CODE} language="cpp" />
        </SectionCard>
      )}
    </div>
  );
}
