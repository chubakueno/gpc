import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const CODE_NORMAL = `#include <bits/stdc++.h>
using namespace std;

// Single polynomial hash of a string
// hash(s) = s[0]*B^(n-1) + s[1]*B^(n-2) + ... + s[n-1]*B^0  (mod P)
// Equivalent iterative: hash = hash*B + s[i]

const long long MOD = 1e9 + 7;
const long long BASE = 131;

long long hash_str(const string& s) {
    long long h = 0;
    for (char c : s) {
        h = (h * BASE + c) % MOD;
    }
    return h;
}

// Precompute prefix hashes and powers for O(1) substring queries
struct HashTable {
    vector<long long> h, pw;
    long long mod, base;

    HashTable(const string& s, long long B = BASE, long long M = MOD)
        : h(s.size() + 1, 0), pw(s.size() + 1, 1), mod(M), base(B)
    {
        for (int i = 0; i < (int)s.size(); i++) {
            h[i + 1] = (h[i] * base + s[i]) % mod;
            pw[i + 1] = pw[i] * base % mod;
        }
    }

    // Hash of s[l..r] (0-indexed, inclusive)
    long long query(int l, int r) const {
        return (h[r + 1] - h[l] * pw[r - l + 1] % mod + mod) % mod;
    }
};

int main() {
    string s = "abracadabra";
    HashTable H(s);

    // Are s[0..3] and s[7..10] the same substring?
    cout << H.query(0, 3) << "\\n";   // "abra"
    cout << H.query(7, 10) << "\\n";  // "abra"
    cout << (H.query(0, 3) == H.query(7, 10) ? "Match!" : "No match") << "\\n";

    return 0;
}`;

const CODE_ROLLING = `#include <bits/stdc++.h>
using namespace std;

const long long MOD = 1e9 + 7;
const long long BASE = 131;

long long power(long long base, long long exp, long long mod) {
    long long result = 1;
    base %= mod;
    while (exp > 0) {
        if (exp & 1) result = result * base % mod;
        base = base * base % mod;
        exp >>= 1;
    }
    return result;
}

// Compute hash of every substring of length k in O(n) total
vector<long long> rolling_hash(const string& s, int k) {
    int n = s.size();
    if (n < k) return {};

    vector<long long> result;
    long long h = 0;
    long long base_k = power(BASE, k - 1, MOD);  // B^(k-1)

    // Initial window [0, k-1]
    for (int i = 0; i < k; i++)
        h = (h * BASE + s[i]) % MOD;
    result.push_back(h);

    for (int i = 1; i + k - 1 < n; i++) {
        // Remove s[i-1], add s[i+k-1]
        h = (h - (long long)s[i - 1] * base_k % MOD + MOD) % MOD;
        h = (h * BASE + s[i + k - 1]) % MOD;
        result.push_back(h);
    }

    return result;
}

// Find all occurrences of pattern p in text t using rolling hash
vector<int> rabin_karp(const string& t, const string& p) {
    int n = t.size(), m = p.size();
    long long ph = 0;
    for (char c : p) ph = (ph * BASE + c) % MOD;

    vector<long long> th = rolling_hash(t, m);
    vector<int> matches;
    for (int i = 0; i < (int)th.size(); i++)
        if (th[i] == ph)
            if (t.substr(i, m) == p)  // confirm match (avoid hash collision)
                matches.push_back(i);
    return matches;
}

int main() {
    string text = "abracadabra";
    string pat  = "abra";

    auto positions = rabin_karp(text, pat);
    for (int pos : positions)
        cout << "Found at index " << pos << "\\n";
    // Output: Found at index 0
    //         Found at index 7

    return 0;
}`;

const CODE_DOUBLE = `#include <bits/stdc++.h>
using namespace std;

// Double hashing: use two independent hash functions
// to make collision probability negligible (~1/P1 * 1/P2)

struct DoubleHash {
    static const long long MOD1 = 1e9 + 7;
    static const long long MOD2 = 1e9 + 9;
    static const long long B1   = 131;
    static const long long B2   = 137;

    vector<long long> h1, h2, pw1, pw2;
    int n;

    DoubleHash(const string& s) : n(s.size()),
        h1(s.size()+1,0), h2(s.size()+1,0),
        pw1(s.size()+1,1), pw2(s.size()+1,1)
    {
        for (int i = 0; i < n; i++) {
            h1[i+1] = (h1[i] * B1 + s[i]) % MOD1;
            h2[i+1] = (h2[i] * B2 + s[i]) % MOD2;
            pw1[i+1] = pw1[i] * B1 % MOD1;
            pw2[i+1] = pw2[i] * B2 % MOD2;
        }
    }

    // Returns a pair (hash1, hash2) for s[l..r]
    pair<long long, long long> query(int l, int r) const {
        long long q1 = (h1[r+1] - h1[l] * pw1[r-l+1] % MOD1 + MOD1) % MOD1;
        long long q2 = (h2[r+1] - h2[l] * pw2[r-l+1] % MOD2 + MOD2) % MOD2;
        return {q1, q2};
    }

    bool equal(int l1, int r1, int l2, int r2) const {
        return query(l1, r1) == query(l2, r2);
    }
};

int main() {
    string s = "abacaba";
    DoubleHash dh(s);

    // P(false collision with double hash) ≈ 1/(10^9+7) * 1/(10^9+9) ≈ 10^-18
    cout << dh.equal(0, 2, 4, 6) << "\\n";  // 1: "aba" == "aba"
    cout << dh.equal(0, 1, 1, 2) << "\\n";  // 0: "ab" != "ba"

    return 0;
}`;

export function HashingCode() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("normal");

  const tabs = [
    { id: "normal", label: t("hashing.code.tab.normal") },
    { id: "rolling", label: t("hashing.code.tab.rolling") },
    { id: "double", label: t("hashing.code.tab.double") },
  ];

  const code = activeTab === "normal" ? CODE_NORMAL : activeTab === "rolling" ? CODE_ROLLING : CODE_DOUBLE;

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
        {t("hashing.code.title")}
      </h2>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
      <CodeBlock code={code} language="cpp" />
    </SectionCard>
  );
}
