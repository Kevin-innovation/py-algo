import type { Algorithm } from '../algorithms';

export const STRING_ALGORITHMS: Algorithm[] = [
  {
    id: 'palindrome-check',
    name: '팰린드롬 판별',
    category: 'strings',
    description: '문자열이 앞뒤로 동일한지 확인하는 기본 문자열 알고리즘입니다.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    howItWorks: ['양끝 포인터를 두고 문자를 비교합니다.', '다르면 즉시 False를 반환합니다.', '포인터가 교차하면 True입니다.'],
    code: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
  },
  {
    id: 'kmp',
    name: 'KMP 문자열 검색',
    category: 'strings',
    description: '접두/접미 정보를 이용해 불필요한 비교를 줄이는 패턴 탐색 알고리즘입니다.',
    timeComplexity: 'O(n + m)',
    spaceComplexity: 'O(m)',
    howItWorks: ['패턴의 LPS(Longest Prefix Suffix) 배열을 만듭니다.', '텍스트와 패턴을 비교하며 불일치 시 LPS로 점프합니다.', '패턴 길이에 도달하면 매칭 성공입니다.'],
    code: `def kmp_search(text, pattern):
    if not pattern:
        return 0

    lps = [0] * len(pattern)
    j = 0
    for i in range(1, len(pattern)):
        while j > 0 and pattern[i] != pattern[j]:
            j = lps[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
            lps[i] = j

    j = 0
    for i, ch in enumerate(text):
        while j > 0 and ch != pattern[j]:
            j = lps[j - 1]
        if ch == pattern[j]:
            j += 1
            if j == len(pattern):
                return i - j + 1
    return -1`,
  },
  {
    id: 'anagram-check',
    name: '애너그램 판별',
    category: 'strings',
    description: '두 문자열의 문자 구성(빈도)이 같은지 확인합니다.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)~O(k)',
    howItWorks: ['문자 빈도를 센 딕셔너리를 만듭니다.', '두 문자열의 빈도 맵을 비교합니다.', '동일하면 애너그램입니다.'],
    code: `from collections import Counter

def is_anagram(a, b):
    return Counter(a) == Counter(b)`,
  },
  {
    id: 'longest-common-prefix',
    name: '최장 공통 접두사',
    category: 'strings',
    description: '여러 문자열이 공유하는 가장 긴 접두사를 찾습니다.',
    timeComplexity: 'O(n * m)',
    spaceComplexity: 'O(1)',
    howItWorks: ['첫 문자열을 기준 접두사로 둡니다.', '다른 문자열과 비교하며 접두사를 줄입니다.', '빈 문자열이 되면 종료합니다.'],
    code: `def longest_common_prefix(words):
    if not words:
        return ''
    prefix = words[0]
    for word in words[1:]:
        while not word.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ''
    return prefix`,
  },
  {
    id: 'rabin-karp',
    name: 'Rabin-Karp',
    category: 'strings',
    description: '해시를 사용해 문자열 패턴을 빠르게 비교하는 알고리즘입니다.',
    timeComplexity: '평균 O(n + m), 최악 O(nm)',
    spaceComplexity: 'O(1)',
    howItWorks: ['패턴과 초기 윈도우 해시를 계산합니다.', '슬라이딩하며 롤링 해시를 갱신합니다.', '해시가 같으면 실제 문자열을 비교합니다.'],
    code: `def rabin_karp(text, pattern, base=256, mod=101):
    n, m = len(text), len(pattern)
    if m == 0:
        return 0
    if m > n:
        return -1

    h = pow(base, m - 1, mod)
    p_hash = t_hash = 0
    for i in range(m):
        p_hash = (base * p_hash + ord(pattern[i])) % mod
        t_hash = (base * t_hash + ord(text[i])) % mod

    for i in range(n - m + 1):
        if p_hash == t_hash and text[i:i + m] == pattern:
            return i
        if i < n - m:
            t_hash = (base * (t_hash - ord(text[i]) * h) + ord(text[i + m])) % mod
            t_hash = (t_hash + mod) % mod
    return -1`,
  },
];
