import { useState } from "react";
import { useLang } from "@/i18n/LanguageContext";
import { CodeBlock } from "@/components/shared/CodeBlock";
import { SectionCard } from "@/components/layout/SectionCard";
import { TabGroup } from "@/components/shared/TabGroup";

const NAIVE_CODE = `#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> adj;
vector<int> parent_, depth_;

void dfs(int v, int p, int d) {
    parent_[v] = p;
    depth_[v] = d;
    for (int c : adj[v])
        if (c != p) dfs(c, v, d + 1);
}

// ── Naive LCA — O(depth) per query, no preprocessing beyond one DFS ──
int lcaNaive(int u, int v) {
    while (depth_[u] > depth_[v]) u = parent_[u];
    while (depth_[v] > depth_[u]) v = parent_[v];
    while (u != v) { u = parent_[u]; v = parent_[v]; }
    return u;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, root, q;
    cin >> n >> root;
    adj.assign(n, {});
    for (int i = 0; i < n - 1; i++) {
        int x, y;
        cin >> x >> y;
        adj[x].push_back(y);
        adj[y].push_back(x);
    }

    parent_.assign(n, -1);
    depth_.assign(n, 0);
    dfs(root, -1, 0);

    cin >> q;
    while (q--) {
        int u, v;
        cin >> u >> v;
        cout << "lca(" << u << ", " << v << ") = " << lcaNaive(u, v) << "\\n";
    }
}`;

const BINARY_LIFTING_CODE = `#include <bits/stdc++.h>
using namespace std;

int LOG;
vector<vector<int>> up;      // up[k][v] = 2^k-th ancestor of v (-1 if none)
vector<int> depth_;
vector<vector<int>> adj;

void dfs(int v, int p) {
    up[0][v] = p;
    for (int k = 1; k < LOG; k++)
        up[k][v] = (up[k-1][v] == -1) ? -1 : up[k-1][up[k-1][v]];
    for (int c : adj[v]) {
        if (c == p) continue;
        depth_[c] = depth_[v] + 1;
        dfs(c, v);
    }
}

int kthAncestor(int v, int k) {
    for (int i = 0; i < LOG && v != -1; i++)
        if ((k >> i) & 1) v = up[i][v];
    return v;
}

// ── Binary lifting LCA — O(log n) per query, O(n log n) preprocessing ──
int lca(int u, int v) {
    if (depth_[u] < depth_[v]) swap(u, v);
    u = kthAncestor(u, depth_[u] - depth_[v]);   // equalize depth
    if (u == v) return u;

    for (int k = LOG - 1; k >= 0; k--)            // jump both, largest step first
        if (up[k][u] != up[k][v]) { u = up[k][u]; v = up[k][v]; }

    return up[0][u];
}

int distance(int u, int v) {
    return depth_[u] + depth_[v] - 2 * depth_[lca(u, v)];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, root, q;
    cin >> n >> root;
    adj.assign(n, {});
    for (int i = 0; i < n - 1; i++) {
        int x, y;
        cin >> x >> y;
        adj[x].push_back(y);
        adj[y].push_back(x);
    }

    LOG = max(1, (int)ceil(log2(max(n, 2))));
    up.assign(LOG, vector<int>(n, -1));
    depth_.assign(n, 0);
    dfs(root, -1);

    cin >> q;
    while (q--) {
        int u, v;
        cin >> u >> v;
        cout << "lca(" << u << ", " << v << ") = " << lca(u, v) << "\\n";
    }
}`;

const EULER_SPARSE_CODE = `#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> adj;
vector<int> depth_, first_, tourNode;
vector<vector<int>> sparse;   // sparse[j][i] = index into tourNode of the min-depth entry in [i, i+2^j)
vector<int> logTable;

void dfs(int v, int p, int d) {
    depth_[v] = d;
    first_[v] = (int)tourNode.size();
    tourNode.push_back(v);
    for (int c : adj[v]) {
        if (c == p) continue;
        dfs(c, v, d + 1);
        tourNode.push_back(v);   // re-visit v after returning from each child
    }
}

void buildSparseTable() {
    int m = tourNode.size();
    logTable.assign(m + 1, 0);
    for (int i = 2; i <= m; i++) logTable[i] = logTable[i / 2] + 1;

    int K = logTable[m] + 1;
    sparse.assign(K, vector<int>(m));
    for (int i = 0; i < m; i++) sparse[0][i] = i;   // store indices, compare by depth

    for (int j = 1; j < K; j++)
        for (int i = 0; i + (1 << j) <= m; i++) {
            int left  = sparse[j-1][i];
            int right = sparse[j-1][i + (1 << (j-1))];
            sparse[j][i] = (depth_[tourNode[left]] < depth_[tourNode[right]]) ? left : right;
        }
}

// ── Euler tour + sparse table RMQ — O(1) per query, O(n log n) preprocessing ──
int lca(int u, int v) {
    int l = first_[u], r = first_[v];
    if (l > r) swap(l, r);
    int j = logTable[r - l + 1];
    int left  = sparse[j][l];
    int right = sparse[j][r - (1 << j) + 1];
    return tourNode[(depth_[tourNode[left]] < depth_[tourNode[right]]) ? left : right];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, root, q;
    cin >> n >> root;
    adj.assign(n, {});
    for (int i = 0; i < n - 1; i++) {
        int x, y;
        cin >> x >> y;
        adj[x].push_back(y);
        adj[y].push_back(x);
    }

    depth_.assign(n, 0);
    first_.assign(n, -1);
    dfs(root, -1, 0);
    buildSparseTable();

    cin >> q;
    while (q--) {
        int u, v;
        cin >> u >> v;
        cout << "lca(" << u << ", " << v << ") = " << lca(u, v) << "\\n";
    }
}`;

export function LCACode() {
  const { t } = useLang();
  const [tab, setTab] = useState("naive");

  const tabs = [
    { id: "naive",  label: t("lca.code.tab.naive") },
    { id: "bl",     label: t("lca.code.tab.bl") },
    { id: "sparse", label: t("lca.code.tab.sparse") },
  ];

  const descMap: Record<string, string> = {
    naive: t("lca.code.naive.desc"),
    bl: t("lca.code.bl.desc"),
    sparse: t("lca.code.sparse.desc"),
  };

  const codeMap: Record<string, string> = {
    naive: NAIVE_CODE,
    bl: BINARY_LIFTING_CODE,
    sparse: EULER_SPARSE_CODE,
  };

  return (
    <SectionCard>
      <h2 className="text-xl font-semibold text-[var(--color-text)] mb-1">
        {t("lca.code.title")}
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-4">{descMap[tab]}</p>
      <TabGroup tabs={tabs} activeTab={tab} onChange={setTab} className="mb-6" />
      <CodeBlock code={codeMap[tab]} language="cpp" />
    </SectionCard>
  );
}
