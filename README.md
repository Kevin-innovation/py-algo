# DLAB PyAlgo

브라우저에서 Python 알고리즘을 실행하고, 실행 흐름을 시각화하며, 학습 모드와 AI 분석까지 제공하는 Next.js 기반 프로젝트입니다.

## 주요 기능

- **코드 실행 + 시각화**
  - Monaco Editor 기반 Python 코드 작성
  - 실행 타임라인(step) 이동, 중단점(breakpoint) 지원
  - Call Stack / Heap / Terminal 패널 제공

- **테마 시스템 (Light / Dark)**
  - 헤더의 테마 토글로 즉시 전환
  - Monaco 테마(`vs` / `vs-dark`) 동기화
  - `localStorage` 기반 테마 유지

- **학습 모드 (`/learn`)**
  - 카테고리: 정렬 / 탐색 / 그래프 / 동적 계획법 / 문자열 / 자료구조
  - 알고리즘 상세: 설명, 시간·공간 복잡도, 동작 원리, 예시 코드
  - **풍부한 학습 콘텐츠 (NEW)**
    - 개념 이해하기: 실생활 비유로 시작하는 스토리텔링
    - 장단점: 각 알고리즘의 장점과 단점 비교
    - 실전 활용 예시: 실제 사용 사례
    - 연습 문제: 학습자가 풀어볼 수 있는 문제
    - 주의사항: 흔한 실수와 함정
  - `?algo=` 쿼리 파라미터 기반 직접 진입 지원
  - “에디터에서 실행”으로 메인 편집기로 코드 전달

- **AI 분석 (Gemini)**
  - `/api/analyze` 서버 라우트로 코드 분석
  - 긴 코드 입력 대응(핵심 구간 발췌), 재시도(backoff), 빈 응답 fallback 처리
  - 분석 접근은 서버 인증 쿠키 기반으로 보호

## 기술 스택

- **Framework**: Next.js 16.2.1, React 19, TypeScript
- **State**: Zustand
- **Editor**: `@monaco-editor/react`
- **Styling**: Tailwind CSS v4
- **AI**: `@google/generative-ai` (Gemini)
- **Testing**: Vitest, Testing Library

## 시작하기

```bash
bun install
bun run dev
```

개발 서버: `http://localhost:3000`

## 환경 변수

`.env.local`에 아래 값을 설정하세요.

```bash
GEMINI_API_KEY=...
AI_ANALYZE_PASSWORD=...
AI_ANALYZE_SESSION_SECRET=...
```

- `GEMINI_API_KEY`: Gemini API 호출 키
- `AI_ANALYZE_PASSWORD`: AI 분석 인증용 비밀번호
- `AI_ANALYZE_SESSION_SECRET`: 인증 쿠키 서명용 시크릿

## 스크립트

```bash
bun run dev
bun run test
bun run build
bun run lint
```

## 라우트

- `/` : 코드 편집/실행/시각화 메인 화면
- `/learn` : 알고리즘 학습 화면
- `/api/analyze` : AI 분석 API (인증 쿠키 필요)
- `/api/analyze/auth` : AI 분석 인증 API (비밀번호 검증 후 httpOnly 쿠키 발급)

## 테스트/검증 상태

최근 기준:

- `bun run test` 통과
- `bun run build` 통과
