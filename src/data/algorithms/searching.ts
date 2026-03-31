import type { Algorithm } from '../algorithms';

export const SEARCHING_ALGORITHMS: Algorithm[] = [
  {
    id: 'linear-search',
    name: '선형 탐색',
    category: 'searching',
    description: '처음부터 끝까지 순서대로 값을 확인하는 가장 단순한 탐색입니다.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    howItWorks: ['배열을 앞에서부터 한 칸씩 확인합니다.', '찾는 값과 같으면 인덱스를 반환합니다.', '끝까지 없으면 실패를 반환합니다.'],
    code: `def linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1`,
  },
  {
    id: 'binary-search',
    name: '이진 탐색',
    category: 'searching',
    description: '정렬된 배열에서 탐색 범위를 절반씩 줄여 찾습니다.',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    howItWorks: ['중간 원소를 확인합니다.', '작으면 오른쪽, 크면 왼쪽으로 범위를 좁힙니다.', '범위가 비면 실패입니다.'],
    code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
  },
  {
    id: 'dfs',
    name: '깊이 우선 탐색 (DFS)',
    category: 'searching',
    description: '한 경로를 끝까지 방문한 뒤 되돌아오는 그래프 탐색입니다.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    howItWorks: ['현재 정점을 방문 처리합니다.', '방문하지 않은 인접 정점으로 재귀/스택 이동합니다.', '더 이상 갈 곳이 없으면 백트래킹합니다.'],
    code: `def dfs(graph, start):
    visited = set()
    order = []

    def visit(node):
        visited.add(node)
        order.append(node)
        for nxt in graph.get(node, []):
            if nxt not in visited:
                visit(nxt)

    visit(start)
    return order`,
  },
  {
    id: 'bfs',
    name: '너비 우선 탐색 (BFS)',
    category: 'searching',
    description: '시작 정점에서 가까운 레벨부터 순서대로 방문하는 탐색입니다.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    howItWorks: ['큐에 시작 정점을 넣습니다.', '큐에서 하나 꺼내 인접 정점을 확장합니다.', '방문하지 않은 정점을 큐에 추가합니다.'],
    code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    q = deque([start])
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph.get(node, []):
            if nxt not in visited:
                visited.add(nxt)
                q.append(nxt)
    return order`,
  },
  {
    id: 'bst-search',
    name: '이진 탐색 트리 탐색',
    category: 'searching',
    description: 'BST의 정렬 특성을 활용해 왼쪽/오른쪽으로 내려가며 탐색합니다.',
    timeComplexity: '평균 O(log n), 최악 O(n)',
    spaceComplexity: 'O(1)',
    howItWorks: ['현재 노드와 타깃을 비교합니다.', '타깃이 작으면 왼쪽, 크면 오른쪽으로 이동합니다.', '노드가 없으면 탐색 실패입니다.'],
    code: `class Node:
    def __init__(self, key, left=None, right=None):
        self.key = key
        self.left = left
        self.right = right

def bst_search(root, target):
    cur = root
    while cur:
        if cur.key == target:
            return cur
        cur = cur.left if target < cur.key else cur.right
    return None`,
  },
];
