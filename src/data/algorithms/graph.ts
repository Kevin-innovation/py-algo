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
    analogy:
      '동네 주민센터 게시판에 "우리 집과 친한 집 목록"을 붙여둔 상황과 비슷합니다. 누군가 A 집 정보를 보고 싶으면 전체 지도를 펼칠 필요 없이 A 집 옆 목록만 확인하면 됩니다. 연결이 드문 마을일수록 종이와 시간을 아끼며, 골목길 탐색도 빠르게 시작할 수 있습니다.',
    prosCons: {
      pros: ['희소 그래프에서 메모리를 크게 절약합니다.', '특정 정점의 이웃 순회가 직관적이고 빠릅니다.', '간선 추가/삭제가 비교적 유연합니다.'],
      cons: ['두 정점의 직접 연결 여부 확인은 리스트 탐색이 필요합니다.', '정점 수가 매우 크면 해시/리스트 관리 오버헤드가 생깁니다.', '인덱스 기반 연산보다 구현 형태가 다양해 초보자에게 헷갈릴 수 있습니다.'],
    },
    examples: ['SNS에서 사용자별 친구 목록 저장', '지하철역별 환승 가능한 역 목록 관리', '게임 맵에서 방별 연결 통로 표현'],
    practiceProblems: ['간선 목록으로 무방향 인접 리스트 만들기', '특정 정점에서 도달 가능한 정점 수 세기', '인접 리스트 기반 BFS/DFS 순회 결과 비교하기'],
    caveats: ['양방향 그래프는 간선을 양쪽 리스트에 모두 넣어야 합니다.', '중복 간선이 들어가면 탐색 결과가 왜곡될 수 있어 정제가 필요합니다.', '존재하지 않는 정점 키 접근 시 기본값 처리를 놓치기 쉽습니다.'],
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
    analogy:
      '학교 반 자리표를 떠올리면 쉽습니다. 세로축 학생 A, 가로축 학생 B가 있을 때 둘이 짝꿍이면 칸에 표시를 해두는 방식입니다. 누구와 누구가 연결됐는지 묻는 순간, 표의 한 칸만 보면 바로 답할 수 있어 "즉답"이 필요한 상황에 강합니다.',
    prosCons: {
      pros: ['두 정점 연결 여부를 O(1)에 확인할 수 있습니다.', '구조가 단순해 구현과 디버깅이 쉽습니다.', '밀집 그래프에서 접근 패턴이 일정해 다루기 편합니다.'],
      cons: ['정점 수가 커지면 메모리 사용량이 급격히 증가합니다.', '간선이 적은 희소 그래프에서는 공간 낭비가 큽니다.', '이웃 순회 시 불필요한 0 값 칸까지 확인하게 됩니다.'],
    },
    examples: ['도시 간 직항 항공편 존재 여부 즉시 조회', '게임에서 유닛 간 공격 가능 관계 테이블', '작은 규모 회로의 연결 상태 매트릭스 표현'],
    practiceProblems: ['간선 목록을 인접 행렬로 변환하기', '행렬로 무방향 그래프의 차수 계산하기', '인접 리스트와 행렬의 메모리 사용량 비교 실험'],
    caveats: ['정점 번호 범위를 벗어나면 인덱스 오류가 발생합니다.', '무방향 그래프는 matrix[u][v], matrix[v][u]를 함께 갱신해야 합니다.', '가중치 그래프에서 0을 의미값으로 쓸 때 "간선 없음"과 구분이 필요합니다.'],
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
    analogy:
      '택배 기사님이 물류센터에서 여러 동네로 가장 빠르게 배달 경로를 계산하는 장면과 같습니다. 항상 "지금까지 가장 빨리 도착 가능한 동네"부터 확정해 나가면, 이미 더 빠른 길이 없는 지역을 차례대로 정리할 수 있습니다. 지도 앱의 최단 경로 탐색 핵심 원리와 닮아 있습니다.',
    prosCons: {
      pros: ['음수 간선이 없을 때 단일 시작점 최단 경로에 매우 효율적입니다.', '우선순위 큐를 사용하면 큰 그래프에서도 성능이 안정적입니다.', '경로 복원 로직을 추가해 실제 이동 경로까지 구할 수 있습니다.'],
      cons: ['음수 가중치가 있으면 올바른 답을 보장하지 못합니다.', '모든 쌍 최단 경로를 구하려면 시작점을 반복해야 합니다.', '우선순위 큐와 완화 개념이 처음엔 추상적으로 느껴질 수 있습니다.'],
    },
    examples: ['지도 앱의 최단 이동 시간 계산', '네트워크 라우팅에서 최소 지연 경로 선택', '게임 NPC의 최소 비용 이동 경로 탐색'],
    practiceProblems: ['시작점에서 각 정점까지 최단 거리 구하기', '최단 거리뿐 아니라 실제 경로 복원하기', '동일 그래프에서 BFS와 다익스트라 결과 차이 비교하기'],
    caveats: ['가중치가 음수인 간선이 하나라도 있으면 다른 알고리즘을 써야 합니다.', '큐에서 꺼낸 값이 최신 거리인지 검사하지 않으면 비효율이 커집니다.', '도달 불가능 정점은 무한대 값 처리 규칙을 명확히 해야 합니다.'],
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
    analogy:
      '대학교 수강 신청에서 선수과목을 지키며 시간표를 짜는 상황과 같습니다. 아직 선수과목이 남아 있는 과목은 잠시 대기시키고, 바로 들을 수 있는 과목부터 하나씩 채워 넣습니다. 들은 과목이 늘어날수록 다음에 열리는 과목이 생기며, 결국 규칙을 지키는 학습 순서가 완성됩니다.',
    prosCons: {
      pros: ['선후 관계가 있는 작업의 실행 순서를 명확히 구할 수 있습니다.', '구현이 비교적 단순하고 시간 복잡도도 선형에 가깝습니다.', '빌드 시스템, 커리큘럼 설계 등 실무 활용도가 높습니다.'],
      cons: ['사이클이 존재하면 정상적인 전체 순서를 만들 수 없습니다.', '유효한 답이 여러 개라 결과가 실행 방식에 따라 달라질 수 있습니다.', '그래프가 DAG인지 먼저 확인하지 않으면 해석이 어렵습니다.'],
    },
    examples: ['프로젝트 작업 의존성 기반 일정 배치', '대학 선수과목 기반 수강 순서 추천', '소프트웨어 모듈 빌드 순서 결정'],
    practiceProblems: ['진입 차수 기반 위상 정렬 구현하기', '사이클이 있는 입력에서 실패를 감지하기', '여러 가능한 위상 정렬 중 하나 출력하기'],
    caveats: ['처리한 정점 수가 전체보다 적으면 사이클을 의심해야 합니다.', '간선 방향 해석을 반대로 하면 순서가 완전히 뒤집힙니다.', '여러 시작점(진입 차수 0)을 처리하는 정책에 따라 출력 순서가 달라집니다.'],
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
    analogy:
      '여러 동아리 학생 명단을 관리하는 학생회 상황을 상상해보세요. 처음엔 각자 따로지만, 동아리 통합이 일어날 때마다 대표 명부를 하나로 합칩니다. "이 두 학생이 같은 동아리인가요?"라는 질문이 들어오면 대표 이름만 확인해 즉시 답할 수 있어 대규모 조직 관리에 매우 유리합니다.',
    prosCons: {
      pros: ['집합 병합과 소속 확인을 매우 빠르게 수행합니다.', '사이클 판별, 연결 요소 관리 문제에 강력합니다.', '구현 코드가 짧고 재사용성이 높습니다.'],
      cons: ['실제 경로 길이나 구조 정보는 직접 제공하지 않습니다.', 'union 기준(랭크/크기)을 생략하면 성능이 저하될 수 있습니다.', '그래프 전체 순회 문제에는 단독으로 충분하지 않을 수 있습니다.'],
    },
    examples: ['SNS 커뮤니티 병합 후 같은 그룹 여부 확인', '도로 공사 중 두 지역 전력망 연결성 판단', '크루스칼 알고리즘에서 사이클 발생 여부 검사'],
    practiceProblems: ['경로 압축이 있는 find/union 구현하기', '간선 추가 순서대로 사이클 처음 발생 시점 찾기', '질의 기반 연결 여부(같은 집합인지) 빠르게 처리하기'],
    caveats: ['parent 초기화를 잘못하면 모든 결과가 연쇄적으로 틀어집니다.', 'find를 거치지 않고 parent만 비교하면 오답이 나올 수 있습니다.', 'union-by-rank/size를 안 쓰면 편향 트리가 생겨 느려질 수 있습니다.'],
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
    analogy:
      '여러 섬을 다리로 잇는 국가 프로젝트를 떠올리면 이해가 쉽습니다. 가장 저렴한 다리 제안부터 검토하되, 이미 연결된 섬끼리 또 잇는 낭비 공사는 건너뜁니다. 이렇게 하면 "모든 섬을 연결하면서 총예산을 최소화"하는 현실적인 의사결정 흐름을 그대로 따라갈 수 있습니다.',
    prosCons: {
      pros: ['전체 연결 비용을 최소화하는 해를 효율적으로 구합니다.', '정렬 + 유니온 파인드 조합으로 구현이 명확합니다.', '희소 그래프에서도 실용적인 성능을 보입니다.'],
      cons: ['그래프가 연결되어 있지 않으면 MST가 아닌 포레스트가 됩니다.', '간선 정렬 비용이 커서 데이터가 매우 크면 부담이 됩니다.', '동일 가중치가 많으면 결과 트리가 여러 형태로 나올 수 있습니다.'],
    },
    examples: ['도시 간 광케이블 최소 설치 비용 설계', '물류 거점 간 도로 연결 비용 최적화', '게임 월드 지역 간 포털 최소 비용 구축'],
    practiceProblems: ['가중치 간선 목록으로 MST 총비용 계산하기', '선택된 간선 목록까지 함께 출력하기', '그래프가 비연결일 때 최소 신장 포레스트 구하기'],
    caveats: ['간선 입력 형식(w, u, v) 해석을 틀리면 정렬 기준이 깨집니다.', '정점 수-1개 간선 선택 조건을 누락하면 불필요한 연산이 늘어납니다.', '연결 그래프 여부를 확인하지 않으면 결과 의미를 잘못 해석할 수 있습니다.'],
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
