import type { Algorithm } from '../algorithms';

export const GRAPH_ALGORITHMS: Algorithm[] = [
  {
    id: 'adjacency-list',
    name: '인접 리스트',
    category: 'graph',
    description: '그래프를 각 정점의 이웃 목록으로 표현하는 메모리 효율적인 방식입니다.',
    timeComplexity: '탐색 시 O(V + E)',
    spaceComplexity: 'O(V + E)',
    howItWorks: ['정점마다 연결된 이웃 정점 리스트를 저장합니다.', '간선 추가 시 양방향/방향 여부에 따라 리스트를 갱신합니다.', '순회 시 해당 정점 리스트만 확인하면 됩니다.'],
    code: `def build_undirected_graph(edges):
    graph = {}
    for u, v in edges:
        graph.setdefault(u, []).append(v)
        graph.setdefault(v, []).append(u)
    return graph`,
  },
  {
    id: 'adjacency-matrix',
    name: '인접 행렬',
    category: 'graph',
    description: '정점 간 연결 여부를 2차원 배열로 저장해 O(1) 연결 확인이 가능합니다.',
    timeComplexity: '연결 확인 O(1)',
    spaceComplexity: 'O(V²)',
    howItWorks: ['V x V 크기의 행렬을 준비합니다.', '간선 (u, v)가 있으면 matrix[u][v]를 1로 표시합니다.', '연결 여부는 matrix 값 확인으로 즉시 판단합니다.'],
    code: `def build_matrix(n, edges):
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1
    return matrix`,
  },
  {
    id: 'dijkstra',
    name: '다익스트라',
    category: 'graph',
    description: '음수 간선이 없는 그래프에서 시작점으로부터 최단 거리를 구합니다.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    howItWorks: ['시작 정점 거리를 0으로 초기화합니다.', '우선순위 큐에서 가장 짧은 후보를 꺼냅니다.', '완화(relaxation)로 인접 정점 거리를 갱신합니다.'],
    code: `import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    dist[start] = 0
    pq = [(0, start)]

    while pq:
        cur_dist, node = heapq.heappop(pq)
        if cur_dist > dist[node]:
            continue
        for nxt, weight in graph[node]:
            nd = cur_dist + weight
            if nd < dist[nxt]:
                dist[nxt] = nd
                heapq.heappush(pq, (nd, nxt))
    return dist`,
  },
  {
    id: 'topological-sort',
    name: '위상 정렬',
    category: 'graph',
    description: 'DAG에서 선행 관계를 만족하는 정점 순서를 계산합니다.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    howItWorks: ['각 정점의 진입 차수를 계산합니다.', '진입 차수 0인 정점을 큐에 넣습니다.', '정점을 꺼내며 간선을 제거하고 새 0차수를 큐에 추가합니다.'],
    code: `from collections import deque

def topo_sort(n, edges):
    graph = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        graph[u].append(v)
        indeg[v] += 1

    q = deque([i for i in range(n) if indeg[i] == 0])
    order = []
    while q:
        cur = q.popleft()
        order.append(cur)
        for nxt in graph[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return order`,
  },
  {
    id: 'union-find',
    name: '유니온 파인드',
    category: 'graph',
    description: '서로소 집합 자료구조로 연결 여부/사이클 판별을 빠르게 처리합니다.',
    timeComplexity: '거의 O(1) (아커만 역함수)',
    spaceComplexity: 'O(V)',
    howItWorks: ['각 정점의 대표(parent)를 관리합니다.', 'find는 경로 압축으로 대표를 빠르게 찾습니다.', 'union은 서로 다른 집합을 합칩니다.'],
    code: `def find(parent, x):
    if parent[x] != x:
        parent[x] = find(parent, parent[x])
    return parent[x]

def union(parent, a, b):
    ra, rb = find(parent, a), find(parent, b)
    if ra != rb:
        parent[rb] = ra`,
  },
  {
    id: 'minimum-spanning-tree-kruskal',
    name: '최소 신장 트리 (Kruskal)',
    category: 'graph',
    description: '간선을 가중치 오름차순으로 선택해 사이클 없이 모든 정점을 연결합니다.',
    timeComplexity: 'O(E log E)',
    spaceComplexity: 'O(V)',
    howItWorks: ['간선을 가중치 순으로 정렬합니다.', '각 간선을 보며 사이클이 생기지 않으면 선택합니다.', '정점 수-1개의 간선을 선택하면 종료합니다.'],
    code: `def kruskal(n, edges):
    parent = list(range(n))

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        parent[rb] = ra
        return True

    total = 0
    for w, u, v in sorted(edges):
        if union(u, v):
            total += w
    return total`,
  },
];
