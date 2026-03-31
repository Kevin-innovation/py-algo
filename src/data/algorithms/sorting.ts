import type { Algorithm } from '../algorithms';

export const SORTING_ALGORITHMS: Algorithm[] = [
  {
    id: 'bubble-sort',
    name: '버블 정렬',
    category: 'sorting',
    description: '인접한 원소를 비교해 큰 값을 뒤로 보내는 기초 정렬 알고리즘입니다.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    howItWorks: [
      '앞에서부터 두 원소를 비교하고 순서가 틀리면 교환합니다.',
      '한 바퀴를 돌면 가장 큰 값이 맨 뒤에 고정됩니다.',
      '고정된 뒤쪽 구간을 제외하고 같은 과정을 반복합니다.',
    ],
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    analogy:
      '버블 정렬은 줄지어 선 학생들이 바로 옆 친구와 키를 비교해 자리 바꾸기를 반복하는 모습과 닮았습니다. 한 바퀴가 끝날 때마다 가장 키 큰 학생이 맨 뒤로 자연스럽게 이동해 자리 잡고, 남은 앞쪽 줄에서 같은 과정을 반복하면 결국 전체 줄이 순서대로 정돈됩니다.',
    prosCons: {
      pros: [
        '원리가 직관적이라 정렬 입문자가 이해하기 쉽습니다.',
        '추가 메모리 없이 제자리 정렬이 가능합니다.',
        '거의 정렬된 데이터에서는 조기 종료 최적화가 잘 동작합니다.',
      ],
      cons: [
        '평균/최악 성능이 O(n²)라 데이터가 많아지면 매우 느립니다.',
        '비교와 교환 횟수가 많아 실제 실행 시간이 길어질 수 있습니다.',
        '대규모 실무 데이터 처리에는 거의 사용되지 않습니다.',
      ],
    },
    examples: [
      '시험 점수가 거의 정렬된 반에서 뒤바뀐 두세 명만 빠르게 바로잡기',
      '센서 값 소량 로그를 임시로 오름차순 정리해 눈으로 점검하기',
      '정렬 개념 수업에서 비교·교환 과정을 시각적으로 시연하기',
    ],
    practiceProblems: [
      '교환이 한 번도 없으면 즉시 종료하도록 버블 정렬을 구현해 보세요.',
      '각 패스마다 배열 상태를 출력해 정렬 진행 과정을 추적해 보세요.',
      '비교 횟수와 교환 횟수를 분리해 카운트하는 버전을 만들어 보세요.',
    ],
    caveats: [
      '내부 루프 범위를 n - i - 1로 줄이지 않으면 불필요한 비교가 늘어납니다.',
      '조기 종료 플래그를 매 패스마다 초기화하지 않으면 오동작할 수 있습니다.',
      '정렬 안정성은 유지되지만 성능까지 보장되는 것은 아닙니다.',
    ],
  },
  {
    id: 'selection-sort',
    name: '선택 정렬',
    category: 'sorting',
    description: '매 단계에서 최솟값을 찾아 앞으로 보내는 단순 정렬 방식입니다.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    howItWorks: [
      '정렬되지 않은 구간에서 최솟값의 인덱스를 찾습니다.',
      '현재 위치 원소와 최솟값을 교환합니다.',
      '다음 위치로 이동해 같은 작업을 반복합니다.',
    ],
    code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    analogy:
      '선택 정렬은 카드 더미에서 가장 작은 숫자 카드를 골라 왼쪽부터 차례대로 깔아 두는 행동과 같습니다. 매 라운드마다 남은 카드 전체를 훑어 최솟값 한 장을 고르고, 앞자리와 교체해 정렬 구역을 조금씩 넓혀 가며 끝까지 반복합니다.',
    prosCons: {
      pros: [
        '구현이 단순해 알고리즘 학습용으로 적합합니다.',
        '교환 횟수가 최대 n-1회로 제한되어 쓰기 비용 예측이 쉽습니다.',
        '추가 메모리 없이 제자리 정렬이 가능합니다.',
      ],
      cons: [
        '항상 O(n²) 비교가 필요해 입력 상태와 무관하게 느립니다.',
        '불필요한 비교가 많아 캐시 효율이 좋지 않을 수 있습니다.',
        '기본 구현은 안정 정렬이 아니어서 같은 값의 순서가 바뀔 수 있습니다.',
      ],
    },
    examples: [
      '작은 인원 명단에서 최소 점수를 순서대로 앞에 배치해 등수 정리하기',
      '플래시 메모리처럼 교환 횟수를 줄이고 싶은 환경에서 단순 정렬 수행하기',
      '화이트보드 코딩 테스트에서 정렬 원리 설명용 예제로 사용하기',
    ],
    practiceProblems: [
      '오름차순 선택 정렬을 내림차순으로 바꿔 구현해 보세요.',
      '교환 횟수와 비교 횟수를 출력하는 선택 정렬 버전을 작성해 보세요.',
      '튜플 배열을 첫 번째 값 기준으로 선택 정렬해 동작을 확인해 보세요.',
    ],
    caveats: [
      '최솟값 인덱스를 찾기 전에 min_idx 초기화를 빼먹으면 결과가 틀립니다.',
      '매번 즉시 교환하는 방식으로 구현하면 교환 횟수가 불필요하게 늘 수 있습니다.',
      '안정성이 필요하면 단순 swap 대신 삽입 방식 변형을 고려해야 합니다.',
    ],
  },
  {
    id: 'insertion-sort',
    name: '삽입 정렬',
    category: 'sorting',
    description: '앞부분을 정렬된 상태로 유지하며 새 원소를 적절한 위치에 삽입합니다.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    howItWorks: [
      '두 번째 원소부터 시작해 현재 값을 key로 둡니다.',
      'key보다 큰 값을 한 칸씩 뒤로 밀어냅니다.',
      '빈 자리에 key를 삽입합니다.',
    ],
    code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    analogy:
      '삽입 정렬은 손에 든 트럼프 카드를 한 장씩 정리해 손패를 만드는 과정과 비슷합니다. 새 카드가 들어올 때마다 이미 정렬된 손패에서 더 큰 카드들을 오른쪽으로 밀고, 빈 자리에 카드를 끼워 넣으면 손패 전체가 계속 정돈된 상태를 유지합니다.',
    prosCons: {
      pros: [
        '거의 정렬된 데이터에서 매우 빠르게 동작할 수 있습니다.',
        '안정 정렬이며 제자리 정렬이라 추가 메모리가 거의 필요 없습니다.',
        '작은 데이터셋에서는 구현 단순성과 성능이 모두 괜찮습니다.',
      ],
      cons: [
        '무작위 큰 데이터에서는 O(n²)로 비효율적입니다.',
        '원소 이동(shift)이 많아 쓰기 연산 비용이 커질 수 있습니다.',
        '재귀 분할 기반 고성능 정렬에 비해 확장성이 낮습니다.',
      ],
    },
    examples: [
      '실시간으로 들어오는 소규모 거래 내역을 정렬 상태로 유지하기',
      '하이브리드 정렬에서 작은 구간을 마무리 정렬할 때 사용하기',
      '학생 이름 목록이 거의 정렬된 상황에서 최종 순서 보정하기',
    ],
    practiceProblems: [
      'key를 삽입할 위치를 이진 탐색으로 찾는 변형을 구현해 보세요.',
      '배열 대신 연결 리스트 버전 삽입 정렬을 작성해 비교해 보세요.',
      '정렬 과정마다 이동된 횟수를 기록해 입력 특성과 연관 지어 보세요.',
    ],
    caveats: [
      'while 조건의 경계(j >= 0)를 잘못 두면 첫 원소 비교가 누락됩니다.',
      'key를 임시 저장하지 않으면 값이 덮어써져 데이터가 손상될 수 있습니다.',
      '성능 기대치는 입력 분포에 크게 좌우된다는 점을 놓치기 쉽습니다.',
    ],
  },
  {
    id: 'quick-sort',
    name: '퀵 정렬',
    category: 'sorting',
    description: '피벗을 기준으로 분할한 뒤 재귀적으로 정렬하는 빠른 정렬 방법입니다.',
    timeComplexity: '평균 O(n log n), 최악 O(n²)',
    spaceComplexity: 'O(log n)',
    howItWorks: [
      '피벗 하나를 선택합니다.',
      '피벗보다 작은 값/큰 값으로 구간을 분할합니다.',
      '분할된 양쪽 구간을 재귀적으로 정렬합니다.',
    ],
    code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
    analogy:
      '퀵 정렬은 택배 상자를 기준 박스 하나(피벗)로 나눠 작은 상자는 왼쪽 구역, 큰 상자는 오른쪽 구역으로 빠르게 분류하는 물류센터 작업과 같습니다. 구역이 나뉘면 각 구역에서도 같은 규칙을 반복해 전체 흐름을 빠르게 정리하는 분할 정복 전략입니다.',
    prosCons: {
      pros: [
        '평균적으로 O(n log n) 성능을 보여 실무에서 매우 자주 사용됩니다.',
        '메모리 지역성이 좋아 실제 실행 속도가 빠른 편입니다.',
        '제자리 분할 구현 시 추가 메모리를 크게 줄일 수 있습니다.',
      ],
      cons: [
        '피벗 선택이 나쁘면 최악 O(n²)로 급격히 느려질 수 있습니다.',
        '재귀 깊이가 깊어지면 스택 오버플로우 위험이 있습니다.',
        '기본 형태는 안정 정렬이 아닙니다.',
      ],
    },
    examples: [
      '대량 로그를 시간 기준으로 빠르게 정렬해 분석 파이프라인에 투입하기',
      '전자상거래 상품 가격 리스트를 응답 전에 즉시 정렬하기',
      '게임 점수표를 자주 재정렬해야 하는 랭킹 시스템에 적용하기',
    ],
    practiceProblems: [
      '첫 원소/중간 원소/랜덤 피벗 전략의 성능을 비교해 보세요.',
      '재귀 대신 스택을 사용한 반복형 퀵 정렬을 구현해 보세요.',
      '중복 원소가 많을 때 3-way partition 버전을 작성해 보세요.',
    ],
    caveats: [
      '정렬된 입력에서 단순 피벗(첫 원소) 사용은 최악 성능을 유발할 수 있습니다.',
      '분할 인덱스 업데이트를 잘못하면 무한 루프가 발생하기 쉽습니다.',
      '재귀 한도를 고려해 큰 입력에서는 꼬리 재귀 제거나 반복형 변형이 필요합니다.',
    ],
  },
  {
    id: 'merge-sort',
    name: '병합 정렬',
    category: 'sorting',
    description: '배열을 절반씩 나누고 정렬된 두 배열을 병합하는 분할 정복 알고리즘입니다.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    howItWorks: [
      '배열을 길이 1이 될 때까지 반으로 분할합니다.',
      '각 부분 배열을 정렬합니다.',
      '두 정렬 배열을 앞에서부터 비교해 병합합니다.',
    ],
    code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    merged.extend(left[i:])
    merged.extend(right[j:])
    return merged`,
    analogy:
      '병합 정렬은 두 팀이 각각 이름표를 가나다순으로 정리한 뒤, 진행자가 앞사람끼리만 비교해 한 줄로 합치는 행사 운영과 비슷합니다. 큰 줄을 반으로 계속 나눠 정리 부담을 줄이고, 마지막에 질서 있게 합치면서 전체 순서를 완성합니다.',
    prosCons: {
      pros: [
        '항상 O(n log n)을 보장해 성능이 안정적입니다.',
        '안정 정렬이라 같은 키의 상대 순서를 보존합니다.',
        '외부 정렬(디스크 기반 대용량 데이터)과 잘 맞습니다.',
      ],
      cons: [
        '추가 배열이 필요해 O(n) 메모리를 사용합니다.',
        '작은 데이터에서는 재귀/병합 오버헤드가 체감될 수 있습니다.',
        '제자리 정렬이 아니어서 메모리 제약 환경에 불리합니다.',
      ],
    },
    examples: [
      '여러 서버에서 수집한 정렬된 로그 파일을 하나로 합치기',
      '학생 명부를 반별로 정렬한 뒤 학년 전체 명부로 병합하기',
      '안정성이 중요한 거래 기록을 시간순으로 재정렬하기',
    ],
    practiceProblems: [
      '재귀 병합 정렬을 반복(bottom-up) 방식으로 바꿔 구현해 보세요.',
      '병합 단계에서 비교 횟수를 측정해 입력 크기와 함께 분석해 보세요.',
      '연결 리스트 대상 병합 정렬을 구현해 배열 버전과 차이를 확인해 보세요.',
    ],
    caveats: [
      '병합 시 남은 꼬리 배열을 붙이지 않으면 일부 데이터가 유실됩니다.',
      'left/right 분할 인덱스 계산 오류는 정렬 누락이나 중복을 만듭니다.',
      '메모리 복사 비용을 무시하면 실제 성능 추정이 과도하게 낙관적일 수 있습니다.',
    ],
  },
  {
    id: 'heap-sort',
    name: '힙 정렬',
    category: 'sorting',
    description: '최대 힙을 구성한 뒤 루트와 끝 원소를 교환하며 정렬합니다.',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
    howItWorks: [
      '배열을 최대 힙 구조로 만듭니다.',
      '루트(최댓값)와 마지막 원소를 교환합니다.',
      '힙 크기를 줄이며 힙 속성을 복구합니다.',
    ],
    code: `def heap_sort(arr):
    def heapify(a, n, i):
        largest = i
        l, r = 2 * i + 1, 2 * i + 2
        if l < n and a[l] > a[largest]:
            largest = l
        if r < n and a[r] > a[largest]:
            largest = r
        if largest != i:
            a[i], a[largest] = a[largest], a[i]
            heapify(a, n, largest)

    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr`,
    analogy:
      '힙 정렬은 우선순위 상자 더미에서 항상 가장 큰 상자가 맨 위에 오도록 쌓아 두고, 맨 위 상자를 하나씩 꺼내 뒤쪽 진열대로 옮기는 작업과 같습니다. 꺼낼 때마다 남은 더미를 다시 정돈해 다음 최대값을 빠르게 찾는 방식으로 정렬이 진행됩니다.',
    prosCons: {
      pros: [
        '최악의 경우에도 O(n log n) 성능을 보장합니다.',
        '추가 메모리 없이 제자리 정렬이 가능합니다.',
        '최댓값/최솟값을 반복 추출하는 문제와 개념적으로 연결됩니다.',
      ],
      cons: [
        '안정 정렬이 아니어서 같은 값의 순서가 바뀔 수 있습니다.',
        '캐시 친화성이 낮아 체감 성능이 퀵 정렬보다 느릴 때가 많습니다.',
        'heapify 구현이 직관적이지 않아 실수하기 쉽습니다.',
      ],
    },
    examples: [
      '대회 점수에서 상위 점수를 반복 추출하며 정렬된 결과 만들기',
      '메모리 제한 환경에서 O(1) 추가 공간 정렬이 필요할 때 사용하기',
      '우선순위 큐 개념을 학습한 뒤 정렬 알고리즘으로 확장해 보기',
    ],
    practiceProblems: [
      '최대 힙 기반 힙 정렬을 최소 힙 기반 내림차순 정렬로 바꿔 보세요.',
      '반복형 heapify와 재귀형 heapify의 성능을 비교해 보세요.',
      'k번째 큰 수를 힙 아이디어로 찾는 문제를 구현해 보세요.',
    ],
    caveats: [
      '자식 인덱스 계산(2*i+1, 2*i+2)을 틀리면 힙 속성이 깨집니다.',
      '힙 크기를 줄여가며 heapify해야 하는데 전체 길이를 계속 쓰면 오동작합니다.',
      '초기 힙 구성 루프 시작점을 n//2-1로 두지 않으면 비효율이 커집니다.',
    ],
  },
];
