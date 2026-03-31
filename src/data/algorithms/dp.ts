import type { Algorithm } from '../algorithms';

export const DP_ALGORITHMS: Algorithm[] = [
  {
    id: 'fibonacci-dp',
    name: '피보나치 (DP)',
    category: 'dp',
    description: '이전 결과를 저장해 중복 계산을 줄이는 동적 계획법의 기본 예시입니다.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    howItWorks: ['작은 문제의 해를 배열에 저장합니다.', 'f(n)=f(n-1)+f(n-2)를 순서대로 채웁니다.', '마지막 값이 정답입니다.'],
    code: `def fibonacci(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]`,
  },
  {
    id: 'knapsack-01',
    name: '0/1 배낭 문제',
    category: 'dp',
    description: '제한된 무게 내에서 최대 가치를 선택하는 대표 DP 문제입니다.',
    timeComplexity: 'O(nW)',
    spaceComplexity: 'O(nW)',
    howItWorks: ['dp[i][w]를 i개 물건, 무게 w에서 최대 가치로 정의합니다.', '물건을 넣는 경우/넣지 않는 경우 중 최대를 택합니다.', 'dp[n][W]가 최종 답입니다.'],
    code: `def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            dp[i][w] = dp[i - 1][w]
            if weights[i - 1] <= w:
                dp[i][w] = max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1])
    return dp[n][W]`,
  },
  {
    id: 'lcs',
    name: '최장 공통 부분 수열 (LCS)',
    category: 'dp',
    description: '두 문자열에서 순서를 유지한 채 가장 긴 공통 부분 수열 길이를 구합니다.',
    timeComplexity: 'O(nm)',
    spaceComplexity: 'O(nm)',
    howItWorks: ['문자열 인덱스 기준 2차원 DP를 구성합니다.', '문자가 같으면 대각선+1, 다르면 위/왼쪽 최대를 사용합니다.', '마지막 칸이 LCS 길이입니다.'],
    code: `def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]`,
  },
  {
    id: 'lis',
    name: '최장 증가 부분 수열 (LIS)',
    category: 'dp',
    description: '수열에서 순서를 유지하며 만들 수 있는 가장 긴 증가 부분 수열 길이입니다.',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n)',
    howItWorks: ['dp[i]를 i에서 끝나는 LIS 길이로 둡니다.', '앞의 원소를 보며 증가 가능하면 갱신합니다.', 'dp 배열 최대값이 정답입니다.'],
    code: `def lis(nums):
    if not nums:
        return 0
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
  },
  {
    id: 'coin-change',
    name: '동전 교환',
    category: 'dp',
    description: '주어진 금액을 만들기 위한 최소 동전 개수를 찾습니다.',
    timeComplexity: 'O(n * amount)',
    spaceComplexity: 'O(amount)',
    howItWorks: ['dp[x]를 금액 x를 만드는 최소 동전 수로 둡니다.', '각 동전에 대해 가능한 금액을 갱신합니다.', 'dp[amount]가 무한대면 만들 수 없습니다.'],
    code: `def coin_change(coins, amount):
    INF = amount + 1
    dp = [INF] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x - coin] + 1)
    return -1 if dp[amount] == INF else dp[amount]`,
  },
];
