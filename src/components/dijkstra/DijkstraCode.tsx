import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const HEAP_CODE = `#include <bits/stdc++.h>
using namespace std;

using pii = pair<long long, int>;   // {dist, vertex}

// ── Dijkstra with a binary heap — O((V+E) log V) ────────────
// adj[u] = { {v, w}, ... }
vector<long long> dijkstra(int n, vector<vector<pair<int,int>>>& adj, int source) {
    vector<long long> dist(n, LLONG_MAX);
    vector<int> parent(n, -1);
    priority_queue<pii, vector<pii>, greater<pii>> pq;

    dist[source] = 0;
    pq.push({0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;   // stale entry — a better one was already processed

        for (auto [v, w] : adj[u]) {
            long long nd = dist[u] + w;
            if (nd < dist[v]) {
                dist[v] = nd;
                parent[v] = u;
                pq.push({nd, v});
            }
        }
    }
    return dist;
}

// Reconstruct the shortest path source -> target
vector<int> reconstructPath(vector<int>& parent, int target) {
    vector<int> path;
    for (int v = target; v != -1; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    return path;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, source;
    cin >> n >> m >> source;
    vector<vector<pair<int,int>>> adj(n);
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});   // directed; also push the reverse for undirected graphs
    }

    auto dist = dijkstra(n, adj, source);
    for (int v = 0; v < n; v++)
        cout << "dist[" << v << "] = " << (dist[v] == LLONG_MAX ? -1 : dist[v]) << "\\n";
}`;

const ARRAY_CODE = `#include <bits/stdc++.h>
using namespace std;

// ── Dense-graph Dijkstra — O(V^2), no heap needed ────────────
// adjMat[u][v] = weight of edge u->v, or INT_MAX if none.
vector<long long> dijkstraDense(int n, vector<vector<int>>& adjMat, int source) {
    vector<long long> dist(n, LLONG_MAX);
    vector<bool> visited(n, false);
    dist[source] = 0;

    for (int iter = 0; iter < n; iter++) {
        int u = -1;
        for (int v = 0; v < n; v++)
            if (!visited[v] && (u == -1 || dist[v] < dist[u])) u = v;

        if (u == -1 || dist[u] == LLONG_MAX) break;   // remaining nodes unreachable
        visited[u] = true;

        for (int v = 0; v < n; v++)
            if (adjMat[u][v] != INT_MAX && dist[u] + adjMat[u][v] < dist[v])
                dist[v] = dist[u] + adjMat[u][v];
    }
    return dist;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, source;
    cin >> n >> m >> source;
    vector<vector<int>> adjMat(n, vector<int>(n, INT_MAX));
    for (int i = 0; i < m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        adjMat[u][v] = w;
    }

    auto dist = dijkstraDense(n, adjMat, source);
    for (int v = 0; v < n; v++)
        cout << "dist[" << v << "] = " << (dist[v] == LLONG_MAX ? -1 : dist[v]) << "\\n";
}`;

const BELLMAN_FORD_CODE = `#include <bits/stdc++.h>
using namespace std;

struct Edge { int u, v, w; };

// ── Bellman-Ford — O(V * E) ──────────────────────────────────
// Handles negative weights (Dijkstra can't). Detects a negative
// cycle reachable from source — in that case shortest paths are undefined.
pair<vector<long long>, bool> bellmanFord(int n, vector<Edge>& edges, int source) {
    vector<long long> dist(n, LLONG_MAX);
    dist[source] = 0;

    for (int iter = 0; iter < n - 1; iter++) {
        bool changed = false;
        for (auto& e : edges) {
            if (dist[e.u] == LLONG_MAX) continue;
            if (dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
                changed = true;
            }
        }
        if (!changed) break;   // early exit — no more relaxations possible
    }

    // One more pass: if anything still relaxes, a negative cycle is reachable
    bool hasNegativeCycle = false;
    for (auto& e : edges) {
        if (dist[e.u] != LLONG_MAX && dist[e.u] + e.w < dist[e.v]) {
            hasNegativeCycle = true;
            break;
        }
    }
    return {dist, hasNegativeCycle};
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m, source;
    cin >> n >> m >> source;
    vector<Edge> edges(m);
    for (auto& e : edges) cin >> e.u >> e.v >> e.w;

    auto [dist, hasNegCycle] = bellmanFord(n, edges, source);
    if (hasNegCycle) {
        cout << "Negative cycle reachable from source!\\n";
        return 0;
    }
    for (int v = 0; v < n; v++)
        cout << "dist[" << v << "] = " << (dist[v] == LLONG_MAX ? -1 : dist[v]) << "\\n";
}`;

export function DijkstraCode() {
  const { t } = useLang();
  const [tab, setTab] = useState("heap");

  const tabs = [
    { id: "heap",        label: t("dijkstra.code.tab.heap") },
    { id: "array",       label: t("dijkstra.code.tab.array") },
    { id: "bellmanford", label: t("dijkstra.code.tab.bellmanford") },
  ];

  const descMap: Record<string, string> = {
    heap: t("dijkstra.code.heap.desc"),
    array: t("dijkstra.code.array.desc"),
    bellmanford: t("dijkstra.code.bellmanford.desc"),
  };

  const codeMap: Record<string, string> = {
    heap: HEAP_CODE,
    array: ARRAY_CODE,
    bellmanford: BELLMAN_FORD_CODE,
  };

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("dijkstra.code.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-4">{descMap[tab]}</p>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-6" />
      <CodeBlock code={codeMap[tab]} language="cpp" />
    </SectionCard>
  );
}
