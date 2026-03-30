# DLAB PyAlgo - visualization by Kevin

**DLAB PyAlgo**는 브라우저 내부에서 파이썬 코드를 실행하고, 알고리즘의 동작 과정을 시각적으로 완벽하게 추적할 수 있도록 돕는 대화형 학습 및 디버깅 플랫폼입니다. 파이썬 서버나 백엔드 의존성 없이 동작하며, 강력한 Gemini AI를 연동하여 학생과 전문가 모두에게 유용한 코드 분석 인사이트를 제공합니다.

---

## 🚀 어떻게 사용하나요? (How to Use)

DLAB PyAlgo는 직관적인 UI를 통해 복잡한 알고리즘을 쉽게 분석할 수 있도록 돕습니다.

1. **코드 작성 및 실행**: 좌측 코드 에디터 공간에 분석하고 싶은 파이썬 알고리즘 코드를 작성합니다. Monaco Editor가 내장되어 있어 자동 완성 및 코드 하이라이팅을 지원합니다.
2. **중단점(Breakpoint) 설정**: 특정 라인에서 실행 상태를 확인하고 싶다면, 코드 에디터의 좌측 라인 번호 옆을 클릭하여 빨간색 점(중단점)을 찍습니다.
3. **타임라인 네비게이션**: `코드 실행` 버튼을 누르면 우측에 타임라인 컨트롤 바가 활성화됩니다.
   * `처음`, `이전`, `다음`, `마지막` 버튼을 통해 코드 실행 흐름을 1 Step씩 과거/미래로 이동할 수 있습니다.
   * `계속 ▶` 버튼을 누르면 다음 중단점이 설정된 라인까지 코드가 한 번에 진행됩니다.
4. **상태 변화 추적**:
   * **호출 스택 (Call Stack)**: 현재 실행 중인 함수와 지역 변수들이 우측 패널에 표시됩니다. 값이 변경된 변수는 하이라이트됩니다.
   * **힙 객체 (Heap Objects)**: 리스트(`list`), 딕셔너리(`dict`), 튜플(`tuple`) 등 메모리에 할당된 객체 내부 구조의 변화를 참조(Reference) 단위로 관찰할 수 있습니다.
   * **출력 타임라인 (Terminal)**: `print()` 나 `input()` 함수가 언제 호출되었는지, 표준 입출력 흐름을 실시간으로 보여줍니다.
5. **AI 분석 (Gemini 2.5 Flash)**: 에디터 상단의 `AI 분석` 버튼을 클릭하면, 현재 작성된 알고리즘의 최적 풀이법, 학생 수준에 맞춘 접근법, 그리고 스토리텔링형 해설을 마크다운 형태로 깔끔하게 렌더링하여 제공받을 수 있습니다.

---

## 🛠 어떻게 개발되었나요? (Development Journey & Architecture)

이 프로젝트는 "서버 비용이 발생하지 않으면서도, 안전하고 완벽하게 파이썬 코드를 한 줄씩 추적(Trace)할 수 있는 브라우저 샌드박스 환경"을 구축하는 것을 목표로 설계되었습니다.

### 1. 브라우저 기반의 파이썬 구동 환경 (Pyodide)
기존의 백엔드 기반 코드 실행 환경은 무한 루프, 악의적 코드 실행, 동시성 트래픽 문제 등 인프라 비용과 보안 이슈가 따릅니다.
이를 해결하기 위해 **WebAssembly 기반의 파이썬 인터프리터인 Pyodide**를 도입했습니다. 
* 모든 코드는 사용자의 브라우저(Web Worker) 내에서 완전히 격리된 채 실행됩니다.
* 동기/비동기 블로킹 문제를 해결하기 위해 `SharedArrayBuffer`와 `Atomics`를 활용하여 파이썬의 `input()` 동작을 메인 스레드의 멈춤 없이 완벽하게 구현했습니다.

### 2. sys.settrace를 활용한 타임라인 스냅샷 (Time-travel Debugging)
"파이썬 코드가 한 줄씩 실행될 때마다 전체 상태를 어떻게 저장할 것인가?"
이 문제를 해결하기 위해 파이썬 내장 라이브러리인 `sys.settrace`를 커스텀 래퍼(Wrapper)로 구현하여 `tracer.py`를 제작했습니다.
* 매 실행 단계(Step)마다 **콜 스택, 지역 변수, 힙 메모리에 할당된 자료구조(`dict`, `list`, `deque`, `pandas.DataFrame` 등), 그리고 I/O 내역**을 직렬화(Serialize)하여 JSON 형태로 스냅샷(Snapshot)을 생성합니다.
* 무한 루프나 콜 스택 초과(Maximum call stack size exceeded) 에러를 방지하기 위해, 오버라이드한 `sys.stdout.write` 내부의 무한 재귀 호출 방지 래퍼와 하드 리밋(Max Steps 10,000) 안전장치를 겹겹이 설계했습니다.

### 3. 직관적이고 세밀한 UI/UX 및 한글화 시각화 구현
코드의 흐름을 시각적으로 전달하기 위해 상태 관리(Zustand)와 UI 컴포넌트를 긴밀하게 결합했습니다.
* 현재 실행 중인 라인은 형광색으로, 중단점이 겹치는 라인은 붉은색으로 Monaco Editor 내부의 데코레이터(Decorations)를 통해 실시간으로 하이라이팅됩니다.
* 학생과 교육 환경을 위해, 모든 패널과 에러 메시지(`RangeError`, `Trace limit exceeded` 등) 및 툴팁을 자연스러운 한국어로 현지화(Localization)했습니다.

### 4. Gemini AI와 Tailwind Typography를 활용한 심층 분석 패널
단순한 코드 실행기에서 나아가, 구글의 **Gemini 2.5 Flash** 모델을 API 라우트 서버리스 함수로 연동했습니다.
* 교육용 프롬프트 엔지니어링을 거쳐 **1) 학생 기준 접근법, 2) 실전 알고리즘 풀이법, 3) 스토리텔링형 풀이**의 세 가지 구조화된 답변을 반환합니다.
* Vercel의 Serverless Function Timeout을 여유 있게 할당(60초)하여 긴 코드에 대한 분석의 안정성을 높였으며, 반환된 마크다운 결과물은 `@tailwindcss/typography` 플러그인을 활용해 벨로그/노션과 같은 전문 블로그 수준의 깔끔하고 가독성 높은 스타일로 렌더링되도록 시각화를 극대화했습니다.

---

## 💻 기술 스택 (Tech Stack)

* **프레임워크:** Next.js 16.2 (React 19, TypeScript)
* **스타일링:** Tailwind CSS v4, Framer Motion
* **상태 관리:** Zustand
* **에디터:** Monaco Editor (`@monaco-editor/react`)
* **파이썬 런타임:** Pyodide (WebAssembly, Web Worker)
* **AI 분석:** Google Generative AI (Gemini 2.5 Flash API)
* **마크다운 렌더링:** `react-markdown`, `remark-gfm`, `@tailwindcss/typography`
