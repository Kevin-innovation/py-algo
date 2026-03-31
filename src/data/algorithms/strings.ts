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
    analogy:
      '팰린드롬 판별은 친구와 하는 단어 거울 게임과 비슷합니다. 한 명은 단어 카드의 맨 앞 글자를 읽고, 다른 한 명은 맨 뒤 글자를 읽어 서로 맞는지 확인합니다. 한 쌍이라도 다르면 게임은 즉시 끝나고, 끝까지 모두 맞으면 완벽한 대칭 단어를 찾은 것입니다.',
    prosCons: {
      pros: ['구현이 매우 단순해 초보자도 빠르게 이해할 수 있습니다.', '추가 메모리 없이 두 포인터만으로 동작합니다.', '대칭 구조를 점검하는 다양한 문제의 기본 패턴이 됩니다.'],
      cons: ['공백, 대소문자, 특수문자 처리 기준을 미리 정하지 않으면 오답이 날 수 있습니다.', '유니코드 정규화가 필요한 텍스트에서는 단순 비교가 깨질 수 있습니다.', '문자열 전체를 매번 검사하면 반복 호출 시 누적 비용이 커질 수 있습니다.'],
    },
    examples: ['닉네임이 앞뒤 대칭인지 검사해 이벤트 참여 조건을 확인합니다.', '문장부호를 제거한 뒤 문장이 회문인지 판별하는 언어 학습 퀴즈를 만듭니다.', 'DNA 서열 일부가 대칭 패턴을 가지는지 간단히 탐지합니다.'],
    practiceProblems: ['대소문자와 공백을 무시한 문장 팰린드롬 판별기를 구현해 보세요.', '한 글자만 삭제해서 팰린드롬이 가능한지 확인하는 문제를 풀어 보세요.', '가장 긴 팰린드롬 부분문자열의 길이를 찾는 확장 문제에 도전해 보세요.'],
    caveats: ['비교 전에 입력 정제 규칙(공백/기호/대소문자)을 명확히 정의해야 합니다.', '빈 문자열을 True로 볼지 False로 볼지 요구사항을 먼저 합의해야 합니다.', '인덱스 갱신 순서를 잘못 쓰면 마지막 문자 비교를 놓칠 수 있습니다.'],
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
    analogy:
      'KMP는 긴 책에서 특정 문장을 찾을 때, 방금 읽은 부분의 반복 규칙을 메모해 두는 방식과 닮았습니다. 틀린 글자를 만나면 처음부터 다시 읽지 않고 메모를 보고 점프해 이어 읽습니다. 그래서 같은 페이지를 불필요하게 다시 넘기지 않아 검색 속도가 안정적으로 빠릅니다.',
    prosCons: {
      pros: ['최악의 경우에도 O(n + m) 성능을 보장합니다.', '텍스트를 되돌아가지 않고 한 번만 훑어도 됩니다.', '반복 패턴이 많은 데이터에서 특히 효율적입니다.'],
      cons: ['LPS 배열 개념이 처음엔 직관적이지 않아 학습 난도가 있습니다.', '짧은 문자열에서는 단순 탐색 대비 구현 이점이 작을 수 있습니다.', '인덱스와 경계 처리 실수가 나면 디버깅이 까다롭습니다.'],
    },
    examples: ['로그 파일에서 특정 에러 시그니처를 빠르게 검색합니다.', '텍스트 에디터의 찾기 기능에서 긴 문장 검색 성능을 개선합니다.', '생물정보학에서 유전자 서열 패턴 매칭의 기본 도구로 사용합니다.'],
    practiceProblems: ['주어진 패턴의 LPS 배열을 손으로 작성해 규칙을 설명해 보세요.', '텍스트 내 모든 패턴 시작 인덱스를 반환하도록 KMP를 확장해 보세요.', '대소문자 무시 옵션을 추가한 KMP 검색기를 구현해 보세요.'],
    caveats: ['패턴이 빈 문자열일 때 반환 정책을 먼저 정해야 합니다.', '불일치 시 j = lps[j - 1] 갱신을 빼먹으면 성능과 정답이 함께 깨집니다.', '첫 매칭만 반환할지, 모든 매칭을 반환할지 요구사항을 분리해야 합니다.'],
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
    analogy:
      '애너그램 판별은 암호 해독 동아리에서 글자 타일을 맞추는 활동과 같습니다. 두 사람이 받은 타일 꾸러미를 책상에 펼쳐 알파벳 종류와 개수를 하나씩 세어 봅니다. 순서가 아무리 달라도 같은 타일 구성이면 같은 재료로 만든 문장, 즉 애너그램이라고 판단합니다.',
    prosCons: {
      pros: ['정렬 없이 빈도 비교만으로 빠르게 판별할 수 있습니다.', '문자 순서와 무관한 동일성 검증에 적합합니다.', 'Counter/해시맵을 활용하면 코드가 매우 간결합니다.'],
      cons: ['대소문자, 공백, 구두점 처리 기준이 없으면 결과가 흔들립니다.', '문자 집합이 커지면 해시맵 메모리 사용량이 증가합니다.', '유니코드 결합 문자 문제를 무시하면 같은 글자가 다르게 인식될 수 있습니다.'],
    },
    examples: ['단어 게임 앱에서 두 단어가 같은 글자 조합인지 즉시 채점합니다.', '검색어 오타 교정에서 글자 재배열 후보를 찾는 전처리로 사용합니다.', '암호문 퍼즐에서 동일 문자 집합 여부를 점검해 힌트를 제공합니다.'],
    practiceProblems: ['공백과 문장부호를 제외한 문장 단위 애너그램 판별기를 구현해 보세요.', '영문 소문자만 주어질 때 배열 기반 빈도 카운트 버전을 작성해 보세요.', '여러 단어를 애너그램 그룹으로 묶는 문제를 풀어 보세요.'],
    caveats: ['입력 길이가 다르면 즉시 False 처리하는 빠른 가지치기를 먼저 넣어야 합니다.', '정규화 없이 비교하면 한글/악센트 문자에서 예상 밖 결과가 나올 수 있습니다.', '정렬 방식과 빈도 방식의 시간·공간 트레이드오프를 문제 크기에 맞춰 선택해야 합니다.'],
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
    analogy:
      '최장 공통 접두사는 택배 주소 자동완성의 공통 시작 부분을 찾는 일과 비슷합니다. 여러 주소를 나란히 놓고 앞에서부터 같은 구간만 남기며 비교합니다. 어느 순간 한 글자라도 달라지면 그 직전까지가 모두가 공유하는 안전한 자동완성 후보가 됩니다.',
    prosCons: {
      pros: ['구현이 직관적이라 디버깅이 쉽습니다.', '추가 자료구조 없이 문자열 비교만으로 해결 가능합니다.', '자동완성, 그룹화 전처리 등 실무 활용도가 높습니다.'],
      cons: ['문자열 개수와 길이가 모두 크면 비교 횟수가 빠르게 늘어납니다.', '한 문자열이라도 매우 짧으면 결과가 급격히 짧아집니다.', '정렬 기반 최적화 등 대안이 필요한 데이터셋이 있습니다.'],
    },
    examples: ['검색창 추천어 목록에서 공통 시작 글자를 추출해 자동완성 힌트를 만듭니다.', 'API 엔드포인트 목록의 공통 경로(prefix)를 찾아 라우팅 규칙을 단순화합니다.', '파일 경로 집합에서 공통 디렉터리 접두사를 계산합니다.'],
    practiceProblems: ['문자열 배열이 비어 있을 때까지 포함해 안정적으로 처리하는 함수를 작성해 보세요.', '정렬 후 첫/마지막 문자열만 비교하는 최적화 버전을 구현해 보세요.', '대소문자 무시 옵션을 지원하는 공통 접두사 찾기를 만들어 보세요.'],
    caveats: ['빈 배열 입력에서 예외가 나지 않도록 초기 조건을 먼저 처리해야 합니다.', '문자 단위 비교 시 유니코드 결합 문자를 고려하지 않으면 경계가 어긋날 수 있습니다.', '접두사가 빈 문자열이 되는 즉시 종료하지 않으면 불필요한 반복이 발생합니다.'],
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
    analogy:
      'Rabin-Karp는 긴 문서에서 암호 코드 조각을 찾을 때, 매번 원문을 다 읽지 않고 바코드처럼 요약값부터 확인하는 방식입니다. 창문을 한 칸씩 옮길 때 이전 계산을 재활용해 새 요약값을 빠르게 만들고, 요약값이 일치한 구간만 원문 대조를 수행해 전체 탐색을 가볍게 만듭니다.',
    prosCons: {
      pros: ['롤링 해시 덕분에 슬라이딩 윈도우 갱신이 빠릅니다.', '여러 패턴 탐색 문제로 확장하기 좋습니다.', '평균적으로 긴 텍스트 검색에서 효율적인 성능을 냅니다.'],
      cons: ['해시 충돌이 발생하면 추가 문자열 비교가 필요합니다.', '모듈러/기수 선택이 부적절하면 충돌 확률이 커질 수 있습니다.', '최악의 경우 성능이 단순 비교 수준까지 떨어질 수 있습니다.'],
    },
    examples: ['문서 표절 검사에서 긴 텍스트의 유사 구간 후보를 빠르게 찾습니다.', '보안 로그에서 악성 시그니처 패턴을 해시 기반으로 탐지합니다.', 'DNA 서열에서 특정 모티프 후보 위치를 대량으로 스캔합니다.'],
    practiceProblems: ['문자열 내 패턴의 모든 등장 위치를 반환하도록 코드를 확장해 보세요.', '서로 다른 mod 값을 써서 충돌 빈도를 비교 실험해 보세요.', '2차원 격자(이미지)에서 작은 패턴을 찾는 방향으로 개념을 확장해 보세요.'],
    caveats: ['해시가 같아도 문자열이 다를 수 있으므로 최종 원문 비교를 생략하면 안 됩니다.', '음수 모듈러 보정 처리를 빼먹으면 언어별로 해시 값이 틀어질 수 있습니다.', '패턴 길이가 텍스트보다 긴 경우를 먼저 처리하지 않으면 인덱스 오류가 납니다.'],
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
