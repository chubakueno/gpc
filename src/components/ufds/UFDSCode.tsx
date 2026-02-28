import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const CODE_BASIC = `#include <bits/stdc++.h>
using namespace std;

// Naive UFDS — no optimizations
// find: O(n) worst case, union: O(n)
struct UFDS {
    vector<int> parent;

    UFDS(int n) : parent(n) {
        iota(parent.begin(), parent.end(), 0);  // parent[i] = i
    }

    int find(int x) {
        if (parent[x] == x) return x;
        return find(parent[x]);  // walk up to root
    }

    bool same_set(int x, int y) {
        return find(x) == find(y);
    }

    void unite(int x, int y) {
        parent[find(x)] = find(y);  // link x's root to y's root
    }
};

int main() {
    UFDS dsu(6);
    dsu.unite(0, 1);
    dsu.unite(1, 2);
    dsu.unite(3, 4);

    cout << dsu.same_set(0, 2) << "\\n";  // 1 (same component)
    cout << dsu.same_set(0, 3) << "\\n";  // 0 (different)

    dsu.unite(2, 3);
    cout << dsu.same_set(0, 4) << "\\n";  // 1 (now same)

    return 0;
}`;

const CODE_RANK = `#include <bits/stdc++.h>
using namespace std;

// UFDS with union by rank
// Guarantees tree height ≤ log₂ n
// find: O(log n), union: O(log n)
struct UFDS {
    vector<int> parent, rank_;

    UFDS(int n) : parent(n), rank_(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }

    int find(int x) {
        if (parent[x] == x) return x;
        return find(parent[x]);
    }

    bool same_set(int x, int y) {
        return find(x) == find(y);
    }

    void unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return;

        // Attach shorter tree under taller tree
        if (rank_[rx] < rank_[ry]) swap(rx, ry);
        parent[ry] = rx;

        // Only increase rank when merging equal-rank trees
        if (rank_[rx] == rank_[ry]) rank_[rx]++;
    }
};

int main() {
    // Build a balanced tree over 8 nodes
    UFDS dsu(8);
    // After these 7 unions, the tree has height exactly 3 = log₂(8)
    for (int i = 0; i + 1 < 8; i += 2) dsu.unite(i, i + 1);
    for (int i = 0; i + 2 < 8; i += 4) dsu.unite(i, i + 2);
    dsu.unite(0, 4);

    cout << dsu.same_set(0, 7) << "\\n";  // 1

    return 0;
}`;

const CODE_FULL = `#include <bits/stdc++.h>
using namespace std;

// Full UFDS: path compression + union by rank
// Amortized O(α(n)) ≈ O(1) per operation
struct UFDS {
    vector<int> parent, rank_, sz;
    int components;

    UFDS(int n) : parent(n), rank_(n, 0), sz(n, 1), components(n) {
        iota(parent.begin(), parent.end(), 0);
    }

    // Path compression: make every node on the path point directly to root
    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);  // ← the compression happens here
        return parent[x];
    }

    bool same_set(int x, int y) {
        return find(x) == find(y);
    }

    // Returns false if x and y were already in the same set
    bool unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;

        // Union by rank: attach smaller rank tree under larger rank tree
        if (rank_[rx] < rank_[ry]) swap(rx, ry);
        parent[ry] = rx;
        sz[rx] += sz[ry];
        if (rank_[rx] == rank_[ry]) rank_[rx]++;
        components--;
        return true;
    }

    int size(int x) { return sz[find(x)]; }
    int count() const { return components; }
};

// ── Example: Kruskal's MST ──────────────────────────────────────────────────
int main() {
    int n = 5;
    UFDS dsu(n);

    // Weighted edges (u, v, w)
    vector<tuple<int,int,int>> edges = {
        {0,1,1}, {1,2,2}, {0,2,4}, {1,3,3}, {2,4,5}, {3,4,6}
    };
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){
        return get<2>(a) < get<2>(b);
    });

    int mst_cost = 0;
    for (auto [u, v, w] : edges) {
        if (dsu.unite(u, v)) {
            mst_cost += w;
            cout << "Edge " << u << "-" << v << " (w=" << w << ") added\\n";
        }
    }
    cout << "MST cost: " << mst_cost << "\\n";
    cout << "Connected: " << (dsu.count() == 1 ? "yes" : "no") << "\\n";

    return 0;
}`;

export function UFDSCode() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState("full");

  const tabs = [
    { id: "basic", label: t("ufds.code.tab.basic") },
    { id: "rank", label: t("ufds.code.tab.rank") },
    { id: "full", label: t("ufds.code.tab.full") },
  ];

  const code = activeTab === "basic" ? CODE_BASIC : activeTab === "rank" ? CODE_RANK : CODE_FULL;

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
        {t("ufds.code.title")}
      </h2>
      <TabGroup tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-4" />
      <CodeBlock code={code} language="cpp" />
    </SectionCard>
  );
}
