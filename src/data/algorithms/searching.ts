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
    analogy:
      '처음 방문한 도서관에서 사서 도움 없이 책장을 왼쪽부터 한 칸씩 훑어 원하는 책을 찾는 상황과 닮았습니다. 앞쪽에 있으면 금방 끝나지만, 운이 없으면 맨 끝 서가까지 가야 하죠. 빠르진 않아도 “놓치지 않고 확인한다”는 점에서 가장 직관적인 탐색입니다.',
    prosCons: {
      pros: ['정렬이 필요 없어 어떤 데이터에도 바로 적용할 수 있습니다.', '구현이 매우 단순해 초보자가 이해하고 디버깅하기 쉽습니다.', '추가 메모리가 거의 필요 없어 메모리 제약 환경에 유리합니다.'],
      cons: ['데이터가 많아질수록 탐색 시간이 선형으로 증가합니다.', '반복 조회가 많은 서비스에서는 비효율적일 수 있습니다.', '이미 정렬된 데이터에서도 성능 이점을 얻지 못합니다.'],
    },
    examples: ['편의점 재고 목록에서 특정 상품 바코드를 처음부터 순서대로 찾기', '출석부를 위에서 아래로 내려가며 특정 학생 이름 확인하기'],
    practiceProblems: ['정수 배열에서 첫 번째 target의 인덱스를 반환하고 없으면 -1 반환하기', '문자열 배열에서 대소문자 구분 없이 키워드를 찾아 위치 반환하기'],
    caveats: ['중복 값이 있을 때 “첫 번째/마지막” 어떤 위치를 반환할지 요구사항을 먼저 정해야 합니다.', '탐색 실패 시 -1, null 등 반환 규약을 코드 전체에서 일관되게 유지해야 합니다.'],
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
    analogy:
      '전화번호부에서 “김민수”를 찾을 때 처음부터 넘기지 않고 중간 페이지를 펴서 앞뒤를 가늠하는 방식과 같습니다. 목표보다 이름이 빠르면 뒤쪽 절반, 느리면 앞쪽 절반만 다시 보는 식이죠. 매번 후보를 절반으로 줄여서, 페이지가 많아도 빠르게 정답에 가까워집니다.',
    prosCons: {
      pros: ['탐색 범위를 절반씩 줄여 대규모 데이터에서 매우 빠릅니다.', '반복문 기반 구현은 추가 메모리 없이 동작합니다.', '정렬 데이터에서 조회 요청이 많을 때 효율이 크게 향상됩니다.'],
      cons: ['데이터가 정렬되어 있지 않으면 사용할 수 없습니다.', '삽입/삭제가 잦은 경우 정렬 유지 비용이 커질 수 있습니다.', '경계 조건 실수(left, right, mid)로 버그가 자주 발생합니다.'],
    },
    examples: ['사전 앱에서 단어를 빠르게 찾기 위해 정렬된 단어 목록 검색하기', '정렬된 로그 ID 목록에서 특정 ID 존재 여부 확인하기'],
    practiceProblems: ['정렬 배열에서 target의 인덱스 찾기', '정렬 배열에서 target이 들어갈 삽입 위치(lower bound) 구하기', '중복 원소가 있는 정렬 배열에서 target의 첫 위치 찾기'],
    caveats: ['입력 배열이 정렬되어 있다는 전제를 검증하지 않으면 오답이 나옵니다.', '중간값 계산과 구간 갱신에서 무한 루프가 생기지 않도록 종료 조건을 명확히 해야 합니다.'],
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
    analogy:
      '처음 가본 미로에서 갈림길이 나오면 한 길을 끝까지 따라가 보고, 막다른 길이면 다시 돌아와 다른 길을 시도하는 탐험가와 같습니다. 당장은 우회해 보이더라도 깊게 파고들며 구조를 파악하죠. 이 과정이 반복되면 미로 전체의 숨은 통로와 연결 관계를 체계적으로 이해할 수 있습니다.',
    prosCons: {
      pros: ['경로를 깊게 추적해야 하는 문제(백트래킹, 사이클 검사)에 적합합니다.', '재귀 또는 스택으로 구현이 비교적 간결합니다.', '그래프의 연결 구조를 빠르게 훑어 전체 탐색이 가능합니다.'],
      cons: ['재귀 깊이가 깊으면 스택 오버플로우 위험이 있습니다.', '최단 거리 보장은 하지 않습니다.', '방문 처리 누락 시 무한 순환에 빠질 수 있습니다.'],
    },
    examples: ['파일 시스템 폴더를 하위 폴더 끝까지 내려가며 탐색하기', 'SNS 친구 관계 그래프에서 특정 사용자와 연결된 집단 찾기'],
    practiceProblems: ['그래프에서 연결 요소 개수 구하기', '유향 그래프에서 사이클 존재 여부 판별하기', '미로에서 도착점까지 갈 수 있는지 DFS로 판단하기'],
    caveats: ['인접 정점을 방문하기 전에 즉시 방문 표시를 하지 않으면 중복 탐색이 크게 늘어납니다.', '재귀 DFS를 사용할 때 입력 크기가 크면 반복문+명시적 스택 방식으로 전환을 고려해야 합니다.'],
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
    analogy:
      '물에 돌을 던졌을 때 파문이 안쪽에서 바깥으로 동심원처럼 퍼져 나가는 모습과 비슷합니다. 시작점 주변부터 한 겹씩 넓혀 가며 확인하니, “가장 가까운 곳”을 먼저 발견하게 되죠. 그래서 길찾기나 최소 이동 횟수 문제에서 BFS는 현장감 있게 강력한 해답이 됩니다.',
    prosCons: {
      pros: ['무가중치 그래프에서 최단 거리(최소 간선 수)를 보장합니다.', '레벨 단위 탐색이 가능해 단계별 문제 분석에 유리합니다.', '큐 기반으로 동작해 탐색 순서가 예측 가능하고 안정적입니다.'],
      cons: ['너비가 큰 그래프에서는 큐 메모리 사용량이 커질 수 있습니다.', '깊은 경로 하나만 필요한 경우 DFS보다 비효율적일 수 있습니다.', '가중치가 있는 그래프 최단 경로에는 그대로 적용할 수 없습니다.'],
    },
    examples: ['지하철 노선도에서 환승 횟수가 가장 적은 경로 찾기', '게임 맵에서 플레이어로부터 가장 가까운 아이템 탐색하기', '네트워크 전파가 몇 단계 만에 도달하는지 계산하기'],
    practiceProblems: ['격자 지도에서 시작점에서 목표점까지 최소 이동 칸 수 구하기', '단어 변환 문제에서 최소 변환 횟수 계산하기'],
    caveats: ['큐에 넣을 때 방문 표시를 해야 같은 정점이 여러 번 들어가는 것을 방지할 수 있습니다.', '가중치가 있는 간선에 BFS를 적용하면 최단 거리 보장이 깨질 수 있습니다.'],
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
    analogy:
      '대형 쇼핑몰 안내도에서 “층별로 매장이 정렬된 규칙”을 알고 찾는 과정과 비슷합니다. 원하는 매장이 현재 기준보다 작으면 왼쪽 구역, 크면 오른쪽 구역으로 이동하죠. 규칙이 잘 유지된 쇼핑몰이라면 몇 번의 선택만으로 빠르게 도착하지만, 안내 구조가 한쪽으로 치우치면 오래 걸릴 수 있습니다.',
    prosCons: {
      pros: ['정렬 규칙을 활용해 평균적으로 빠른 탐색이 가능합니다.', '탐색과 삽입, 삭제를 같은 구조 안에서 일관되게 처리할 수 있습니다.', '중위 순회 시 정렬된 결과를 자연스럽게 얻을 수 있습니다.'],
      cons: ['트리가 한쪽으로 치우치면 선형 탐색 수준으로 느려집니다.', '균형 유지를 하지 않으면 성능이 데이터 입력 순서에 크게 좌우됩니다.', '연속 메모리 구조가 아니라 캐시 효율이 낮을 수 있습니다.'],
    },
    examples: ['사전식으로 정리된 단어 집합에서 빠르게 단어 존재 여부 확인하기', '게임 점수 기록을 트리로 관리하며 특정 점수 검색하기'],
    practiceProblems: ['BST에서 특정 키를 탐색하고 노드를 반환하기', 'BST에 키를 삽입한 뒤 탐색 결과 검증하기', '한쪽으로 치우친 BST 입력 예시를 만들고 탐색 복잡도 비교하기'],
    caveats: ['중복 키를 허용할지 정책을 정하지 않으면 삽입/탐색 규칙이 모호해집니다.', '정렬 특성(왼쪽 < 루트 < 오른쪽)이 깨지면 탐색 결과 전체를 신뢰할 수 없습니다.', '평균 복잡도만 믿지 말고 최악 케이스를 고려해 균형 트리 도입 시점을 판단해야 합니다.'],
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
