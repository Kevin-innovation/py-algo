# Active Baseline (Current Expected Behavior)

## A. 실행/시각화

- 에디터/시각화 2-패널 구조
- 우측 패널 내부:
  - ControlBar
  - Visualizer
  - Output Timeline(Terminal)
- 분할선 드래그 가능:
  - 좌/우
  - 호출스택/힙
  - 시각화/출력 타임라인
- 호출스택이 길어져도 출력 타임라인은 스크롤로 접근 가능

## B. AI 분석

- 인증: `AI_ANALYZE_PASSWORD` 기반
- 분석 진행 중 UI:
  - 애니메이션 점 + 단계 문구
  - 0~100 진행률 게이지
- 분석 결과 UI:
  - 라이트/다크 모두 헤딩/강조/인용/코드 색상 계층화

## C. 인증/환경

필수(배포 기준):

- `GEMINI_API_KEY`
- `AI_ANALYZE_PASSWORD`

설정 누락 시:

- `/api/analyze/auth`에서 누락 키 이름을 포함한 안내 반환
- 모달에서 사용자에게 누락 항목 표시

## D. tracer 안정성

- 대형 상태 추적으로 인한 메모리 폭증 방지:
  - 컬렉션/힙/IO 상한
  - 전체 trace byte budget
  - 직렬화 MemoryError fallback
