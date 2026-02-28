import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const KRUSKAL_CODE = `#include <bits/stdc++.h>
using namespace std;

// ── Union-Find (DSU) ─────────────────────────────────────────
struct DSU {
    vector<int> parent, rank;
    DSU(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }
    bool unite(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;          // same component → cycle
        if (rank[x] < rank[y]) swap(x, y);
        parent[y] = x;
        if (rank[x] == rank[y]) rank[x]++;
        return true;
    }
};

// ── Kruskal's MST ────────────────────────────────────────────
struct Edge {
    int u, v, w;
    bool operator<(const Edge& o) const { return w < o.w; }
};

// Returns MST total weight; fills mst_edges with the MST edges
int kruskal(int n, vector<Edge>& edges, vector<Edge>& mst_edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(n);
    int total = 0;
    for (auto& e : edges) {
        if (dsu.unite(e.u, e.v)) {
            mst_edges.push_back(e);
            total += e.w;
            if ((int)mst_edges.size() == n - 1) break; // MST complete
        }
    }
    return total;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;          // n vertices, m edges (0-indexed)
    vector<Edge> edges(m);
    for (auto& e : edges) cin >> e.u >> e.v >> e.w;

    vector<Edge> mst;
    int total = kruskal(n, edges, mst);

    cout << "MST weight: " << total << "\\n";
    for (auto& e : mst)
        cout << e.u << " - " << e.v << "  (w=" << e.w << ")\\n";
}`;

const PRIM_CODE = `#include <bits/stdc++.h>
using namespace std;

using pii = pair<int, int>;   // {weight, vertex}

// ── Prim's MST (binary heap / priority_queue) ─────────────────
// adj[u] = { {v, w}, ... }
// Returns MST total weight; fills mst_edges as {parent, child} pairs
int prim(int n, vector<vector<pii>>& adj,
         vector<pair<int,int>>& mst_edges, int start = 0) {
    vector<bool>  in_mst(n, false);
    vector<int>   key(n, INT_MAX);   // min edge weight to reach node
    vector<int>   par(n, -1);        // MST parent

    // Min-heap: {key, vertex}
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    key[start] = 0;
    pq.push({0, start});

    int total = 0;

    while (!pq.empty()) {
        auto [w, u] = pq.top(); pq.pop();
        if (in_mst[u]) continue;   // already processed (stale entry)
        in_mst[u] = true;
        total += w;
        if (par[u] != -1) mst_edges.push_back({par[u], u});

        for (auto [v, wv] : adj[u]) {
            if (!in_mst[v] && wv < key[v]) {
                key[v] = wv;
                par[v] = u;
                pq.push({wv, v});
            }
        }
    }
    return total;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    vector<vector<pii>> adj(n);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    vector<pair<int,int>> mst;
    int total = prim(n, adj, mst);

    cout << "MST weight: " << total << "\\n";
    for (auto [u, v] : mst)
        cout << u << " - " << v << "\\n";
}`;

export function MSTCode() {
  const { t } = useLang();
  const [tab, setTab] = useState("kruskal");

  const tabs = [
    { id: "kruskal", label: t("mst.code.tab.kruskal") },
    { id: "prim",    label: t("mst.code.tab.prim") },
  ];

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">
        {t("mst.code.title")}
      </h2>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-6" />
      {tab === "kruskal" && <CodeBlock code={KRUSKAL_CODE} language="cpp" />}
      {tab === "prim"    && <CodeBlock code={PRIM_CODE}    language="cpp" />}
    </SectionCard>
  );
}
