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
