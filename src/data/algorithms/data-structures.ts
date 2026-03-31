import type { Algorithm } from '../algorithms';

export const DATA_STRUCTURE_ALGORITHMS: Algorithm[] = [
  {
    id: 'stack',
    name: '스택',
    category: 'data-structures',
    description: 'LIFO(Last-In First-Out) 방식으로 동작하는 선형 자료구조입니다.',
    timeComplexity: 'push/pop O(1)',
    spaceComplexity: 'O(n)',
    howItWorks: ['맨 위(top)에만 삽입(push)과 삭제(pop)를 수행합니다.', '가장 나중에 들어온 값이 가장 먼저 나옵니다.', '함수 호출 스택, 괄호 검사 등에 활용됩니다.'],
    analogy:
      '뷔페 식당에서 접시를 한쪽에 차곡차곡 쌓아 두는 장면을 떠올려 보세요. 새 접시는 항상 맨 위에 올라가고, 손님도 맨 위 접시부터 가져갑니다. 중간 접시를 꺼내려 하면 위 접시를 먼저 치워야 하죠. 스택은 바로 이런 “마지막에 올린 것부터 먼저 꺼내는” 질서를 코드로 만든 구조입니다.',
    prosCons: {
      pros: ['push/pop이 O(1)로 매우 빠릅니다.', '실행 흐름(되돌리기, 함수 호출) 모델링이 직관적입니다.', '구현이 단순해 버그를 줄이기 쉽습니다.'],
      cons: ['중간 데이터 접근이 사실상 불가능합니다.', 'LIFO가 맞지 않는 문제에는 부적합합니다.', '깊이가 커지면 메모리 사용량이 빠르게 늘어납니다.'],
    },
    examples: ['브라우저 뒤로 가기 기록 관리', '텍스트 에디터 실행 취소(Undo) 기능', '수식 괄호 유효성 검사'],
    practiceProblems: ['괄호 문자열이 올바른지 판별하기', '최소 스택(Min Stack) 구현하기', '후위 표기식 계산기 만들기'],
    caveats: ['빈 스택에서 pop/peek 호출 시 예외 처리를 빼먹기 쉽습니다.', '재귀 호출이 깊어질 때 호출 스택 오버플로를 고려해야 합니다.', '리스트 끝이 아닌 앞쪽에서 조작하면 O(1) 장점이 사라질 수 있습니다.'],
    code: `class Stack:
    def __init__(self):
        self.data = []

    def push(self, x):
        self.data.append(x)

    def pop(self):
        return self.data.pop() if self.data else None`,
  },
  {
    id: 'queue',
    name: '큐',
    category: 'data-structures',
    description: 'FIFO(First-In First-Out) 방식으로 동작하는 자료구조입니다.',
    timeComplexity: 'enqueue/dequeue O(1)',
    spaceComplexity: 'O(n)',
    howItWorks: ['뒤에서 삽입(enqueue), 앞에서 삭제(dequeue)합니다.', '먼저 들어온 데이터가 먼저 처리됩니다.', 'BFS, 작업 스케줄링에 자주 사용됩니다.'],
    analogy:
      '놀이공원 인기 놀이기구 앞 대기 줄을 생각해 보세요. 먼저 온 사람이 먼저 타고, 새로 온 사람은 맨 뒤에 섭니다. 새치기를 허용하지 않는 한 흐름은 늘 앞에서 빠지고 뒤에 붙는 방향으로만 움직입니다. 큐는 이런 “공정한 순서 처리”를 시스템에서 그대로 재현하는 자료구조입니다.',
    prosCons: {
      pros: ['처리 순서가 명확해 공정성을 보장하기 좋습니다.', 'enqueue/dequeue가 O(1)로 안정적입니다.', '스트림·버퍼·BFS 같은 흐름형 문제에 잘 맞습니다.'],
      cons: ['중간 원소 접근이나 수정이 비효율적입니다.', '우선순위가 필요한 상황에는 단독으로 부족합니다.', '배열 기반 구현 시 앞쪽 삭제를 잘못하면 성능이 급감할 수 있습니다.'],
    },
    examples: ['프린터 작업 대기열', '웹 서버 요청 처리 버퍼', '너비 우선 탐색(BFS) 방문 순서 관리'],
    practiceProblems: ['원형 큐(Circular Queue) 구현하기', '최근 N초 요청 수를 큐로 계산하기', '카드 버리기 시뮬레이션 문제 풀기'],
    caveats: ['파이썬 list의 pop(0)을 사용하면 O(n)이 되어 병목이 생깁니다.', '빈 큐에서 dequeue할 때 반환 규칙을 명확히 정해야 합니다.', '무한 입력 스트림에서는 큐 크기 제한 정책이 없으면 메모리가 고갈될 수 있습니다.'],
    code: `from collections import deque

class Queue:
    def __init__(self):
        self.data = deque()

    def enqueue(self, x):
        self.data.append(x)

    def dequeue(self):
        return self.data.popleft() if self.data else None`,
  },
  {
    id: 'heap',
    name: '힙',
    category: 'data-structures',
    description: '최솟값/최댓값을 빠르게 꺼내기 위한 완전 이진 트리 기반 구조입니다.',
    timeComplexity: 'push/pop O(log n), peek O(1)',
    spaceComplexity: 'O(n)',
    howItWorks: ['배열로 완전 이진 트리를 표현합니다.', '삽입 시 위로 올리며(heapify-up) 속성을 유지합니다.', '삭제 시 아래로 내리며(heapify-down) 속성을 복구합니다.'],
    analogy:
      '응급실 접수대를 떠올려 보세요. 먼저 온 사람보다 “더 위급한” 환자가 먼저 진료실로 들어갑니다. 접수 순서도 중요하지만, 핵심은 가장 우선순위가 높은 사람이 빠르게 선택되는 것입니다. 힙은 이처럼 전체 정렬은 아니어도 최상단의 최솟값(또는 최댓값)을 즉시 꺼내게 설계된 우선순위 전용 구조입니다.',
    prosCons: {
      pros: ['peek가 O(1)이라 최우선 값 확인이 매우 빠릅니다.', '삽입/삭제가 O(log n)으로 대규모 데이터에도 안정적입니다.', '우선순위 큐 구현의 표준 구조입니다.'],
      cons: ['전체 정렬 상태가 아니어서 임의 탐색이 비효율적입니다.', '구현 시 인덱스 계산 실수가 자주 발생합니다.', '동일 우선순위의 안정적 순서를 보장하려면 추가 장치가 필요합니다.'],
    },
    examples: ['작업 스케줄러의 우선순위 태스크 처리', '다익스트라 알고리즘의 최소 거리 노드 선택', '실시간 상위 K개 값 유지'],
    practiceProblems: ['최소 힙 직접 구현하기', '배열에서 k번째 큰 수 찾기', '스트림 중앙값 유지 구조 설계하기'],
    caveats: ['파이썬 heapq는 최소 힙이 기본이라 최대 힙은 음수 변환이 필요합니다.', 'heapify와 heappush를 혼용할 때 불변식이 깨지지 않게 주의해야 합니다.', '우선순위 키가 변경되는 경우 재삽입 전략을 명확히 해야 합니다.'],
    code: `import heapq

heap = []
heapq.heappush(heap, 5)
heapq.heappush(heap, 2)
heapq.heappush(heap, 8)
smallest = heapq.heappop(heap)`,
  },
  {
    id: 'linked-list',
    name: '연결 리스트',
    category: 'data-structures',
    description: '노드가 포인터로 연결된 동적 선형 자료구조입니다.',
    timeComplexity: '삽입/삭제 O(1) (위치 알 때)',
    spaceComplexity: 'O(n)',
    howItWorks: ['각 노드는 값과 다음 노드 참조를 가집니다.', '중간 삽입/삭제 시 포인터만 수정하면 됩니다.', '인덱스 접근은 순차 탐색이 필요합니다.'],
    analogy:
      '보물찾기 종이에 “다음 단서는 운동장 벤치 아래”처럼 다음 위치만 적혀 있다고 상상해 보세요. 지금 단서를 따라가야만 다음 단서를 알 수 있고, 중간에 새 단서를 끼워 넣는 일은 연결만 바꾸면 끝납니다. 연결 리스트는 이런 “다음 주소로 이어지는 사슬형 탐색”을 데이터에 적용한 방식입니다.',
    prosCons: {
      pros: ['노드 위치만 알면 삽입/삭제가 O(1)로 빠릅니다.', '연속 메모리가 없어도 동적으로 크기를 늘리기 쉽습니다.', '큐/스택/그래프 인접 리스트 기반으로 활용하기 좋습니다.'],
      cons: ['인덱스 접근이 O(n)이라 임의 접근에 약합니다.', '포인터(참조) 관리 실수 시 버그 추적이 어렵습니다.', '노드마다 참조 필드가 필요해 메모리 오버헤드가 있습니다.'],
    },
    examples: ['음악 재생 목록에서 현재 곡 다음 곡 연결', '브라우저 방문 기록 양방향 이동(이중 연결 리스트)', '메모리 할당기의 자유 블록 체인 관리'],
    practiceProblems: ['단일 연결 리스트 뒤집기', '사이클 존재 여부 판별(Floyd 알고리즘)', 'k번째 노드 삭제 및 중간 삽입 구현'],
    caveats: ['head/tail 경계 케이스를 놓치면 Null 참조 오류가 발생합니다.', '삭제 시 이전 노드 연결 갱신을 빼먹기 쉽습니다.', '단순 배열보다 캐시 효율이 낮아 실제 성능이 기대보다 떨어질 수 있습니다.'],
    code: `class Node:
    def __init__(self, value, nxt=None):
        self.value = value
        self.next = nxt

head = Node(1)
head.next = Node(2)
head.next.next = Node(3)`,
  },
  {
    id: 'hash-table',
    name: '해시 테이블',
    category: 'data-structures',
    description: '키를 해시 함수로 인덱싱해 빠른 조회를 제공하는 자료구조입니다.',
    timeComplexity: '평균 O(1), 최악 O(n)',
    spaceComplexity: 'O(n)',
    howItWorks: ['키를 해시 함수로 버킷 위치에 매핑합니다.', '충돌은 체이닝/오픈 어드레싱으로 처리합니다.', '평균적으로 빠른 삽입/조회/삭제가 가능합니다.'],
    analogy:
      '도서관 사물함에 이름표를 붙여 물건을 보관한다고 생각해 보세요. 이름표(키)를 규칙대로 번호(해시값)로 바꾸면 바로 해당 칸을 찾을 수 있습니다. 가끔 같은 칸 번호가 겹치면 한 칸 안에서 순서를 정해 함께 보관해야 하죠. 해시 테이블은 이런 “이름표 기반 즉시 찾기”를 구현한 구조입니다.',
    prosCons: {
      pros: ['평균적으로 조회/삽입/삭제가 O(1)로 매우 빠릅니다.', '키-값 매핑 문제를 간결하게 표현할 수 있습니다.', '중복 검색/카운팅/캐시 구현에 강력합니다.'],
      cons: ['충돌이 심하면 성능이 O(n)까지 악화될 수 있습니다.', '해시 함수와 버킷 크기 설계에 품질이 크게 좌우됩니다.', '정렬 순서가 필요할 때는 추가 자료구조가 필요합니다.'],
    },
    examples: ['로그인 세션 토큰 조회', '단어 빈도수 집계', 'API 응답 캐시 저장소'],
    practiceProblems: ['아나그램 그룹핑 구현하기', '중복 없는 가장 긴 부분 문자열 길이 구하기', 'LRU 캐시(해시 + 연결 리스트) 설계하기'],
    caveats: ['가변 객체를 키로 쓰면 해시 일관성이 깨질 수 있습니다.', '로드 팩터가 높아지면 리사이즈 비용과 충돌이 급증합니다.', '언어별 해시 보안 정책(랜덤 시드) 차이를 이해해야 디버깅이 쉽습니다.'],
    code: `table = {}
table['name'] = 'DLAB'
table['level'] = 1
print(table.get('name'))`,
  },
  {
    id: 'binary-search-tree',
    name: '이진 탐색 트리',
    category: 'data-structures',
    description: '왼쪽 < 루트 < 오른쪽 규칙을 가진 트리로 탐색/삽입을 수행합니다.',
    timeComplexity: '평균 O(log n), 최악 O(n)',
    spaceComplexity: 'O(n)',
    howItWorks: ['비교 결과에 따라 왼쪽/오른쪽으로 내려갑니다.', '빈 위치를 찾으면 노드를 삽입합니다.', '균형이 깨지면 성능이 저하될 수 있습니다.'],
    analogy:
      '종이 사전을 찾을 때를 떠올려 보세요. 원하는 단어가 현재 페이지보다 앞이면 왼쪽(앞쪽)으로, 뒤면 오른쪽(뒤쪽)으로 범위를 절반씩 줄여 갑니다. 이진 탐색 트리도 매 노드에서 같은 결정을 반복해 빠르게 목표를 좁혀 갑니다. 다만 책장이 한쪽으로 쏠리면 다시 거의 처음부터 훑는 느낌이 됩니다.',
    prosCons: {
      pros: ['평균적으로 탐색/삽입/삭제가 O(log n)입니다.', '중위 순회 시 정렬된 결과를 자연스럽게 얻습니다.', '범위 질의(min~max) 처리에 유리합니다.'],
      cons: ['편향 트리가 되면 성능이 O(n)으로 나빠집니다.', '균형 유지 로직 없이 장기 운영하면 품질이 떨어집니다.', '해시 테이블 대비 상수 시간이 커 단순 조회만 보면 느릴 수 있습니다.'],
    },
    examples: ['리더보드 점수 범위 검색', '자동완성 후보의 사전식 순회', 'DB 인덱스의 트리 기반 탐색 개념 학습'],
    practiceProblems: ['BST 삽입/탐색/삭제 구현하기', '주어진 순회 결과로 BST 복원하기', '특정 구간 [L, R] 값만 출력하기'],
    caveats: ['중복 키 정책(왼쪽/오른쪽/카운트 저장)을 먼저 정하지 않으면 구현이 흔들립니다.', '삭제 연산에서 후계자/전임자 교체 로직 실수가 빈번합니다.', '입력 데이터가 정렬되어 있으면 편향 트리가 되므로 균형 트리 대안을 고려해야 합니다.'],
    code: `class BSTNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None

def insert(root, key):
    if root is None:
        return BSTNode(key)
    if key < root.key:
        root.left = insert(root.left, key)
    else:
        root.right = insert(root.right, key)
    return root`,
  },
];
