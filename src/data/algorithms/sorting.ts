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
  },
];
