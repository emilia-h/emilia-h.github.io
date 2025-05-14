/**
 * Edge-Biconnected Components
 * Corresponds to: emi-h.com/articles/algorithms/bcc
 * Source URL: emi-h.com/code/bcc.cpp
 * 
 * Copyright (c) 2025 emilia-h
 */
// https://judge.yosupo.jp/submission/270747
#include <iostream>
#include <set>
#include <utility>
#include <vector>

struct Node {
    std::vector<int> adj;
    bool visited = false;
    int dfsEntryTime = -1;
    int low = -1;
    int componentId = -1;
};

void dfs(
    std::vector<Node>& graph,
    int i, int parent,
    int& time, std::set<std::pair<int, int>>& bridges
) {
    graph[i].dfsEntryTime = time++;

    int low = graph[i].dfsEntryTime;
    bool multiEdgeParent = false;
    for (int j : graph[i].adj) {
        if (i == j) { // self-loop (only for non-simple graphs)
            continue;
        }
        if (j == parent && !multiEdgeParent) { // tree edge back to parent
            multiEdgeParent = true;
            continue;
        }

        if (graph[j].visited) { // back or forward edge
            low = std::min(low, graph[j].dfsEntryTime);
        } else { // tree edge
            graph[j].visited = true;
            dfs(graph, j, i, time, bridges);
            low = std::min(low, graph[j].low);
        }

        if (graph[j].low > graph[i].dfsEntryTime) {
            bridges.insert({i, j});
            bridges.insert({j, i});
        }
    }
    graph[i].low = low;
}

/// Find the set of bridge edges
std::set<std::pair<int, int>> getBridges(std::vector<Node>& graph) {
    std::vector<int> visited(graph.size());

    std::set<std::pair<int, int>> bridges;
    int labeling = 0;
    for (int i = 0; i < graph.size(); i++) {
        if (graph[i].visited) continue;
        graph[i].visited = true;
        dfs(graph, i, -1, labeling, bridges);
    }
    return bridges;
}

/// Use bridges to find edge-biconnected components
void getEdgeBiconnectedComponents(
    std::vector<Node>& graph,
    int i,
    const std::set<std::pair<int, int>>& bridges,
    int componentId
) {
    if (graph[i].visited) return;
    graph[i].visited = true;
    graph[i].componentId = componentId;
    for (int j : graph[i].adj) {
        // don't traverse bridges (act like they are removed from the graph)
        if (bridges.count({i, j})) continue;
        getEdgeBiconnectedComponents(graph, j, bridges, componentId);
    }
}

// I/O in the format of https://judge.yosupo.jp/problem/two_edge_connected_components
int main() {
    int n, m;
    std::cin >> n >> m;

    std::vector<Node> graph(n);
    for (int i = 0; i < m; i++) {
        int v, w;
        std::cin >> v >> w;
        graph[v].adj.push_back(w);
        graph[w].adj.push_back(v);
    }

    auto bridges = getBridges(graph);

    for (auto& node : graph) node.visited = false;
    int componentCount = 0;
    for (int i = 0; i < n; i++) {
        if (graph[i].visited) continue;
        getEdgeBiconnectedComponents(graph, i, bridges, componentCount);
        componentCount++;
    }

    // output in the accepted format
    std::vector<std::vector<int>> components(componentCount);
    for (int i = 0; i < n; i++) {
        components[graph[i].componentId].push_back(i);
    }

    std::cout << componentCount << "\n";
    for (int i = 0; i < componentCount; i++) {
        std::cout << components[i].size();
        for (int node : components[i]) {
            std::cout << " " << node;
        }
        std::cout << "\n";
    }

    return 0;
}
