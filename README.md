# DLAB PyAlgo - visualization by Kevin

**DLAB PyAlgo**는 브라우저 기반의 대화형 파이썬(Python) 알고리즘 시각화 도구입니다. 
서버 없이 브라우저 내부에서 파이썬 코드를 실행하며, 사용자가 코드의 실행 흐름을 한 줄씩 따라가고, 변수와 힙 객체의 변화를 실시간으로 추적할 수 있도록 돕습니다. 또한 최신 AI를 연동하여 학생과 실무자 모두를 위한 코드 분석 기능까지 제공합니다.

## ✨ 주요 기능 및 특징 (Key Features)

### 1. 100% 클라이언트 사이드 파이썬 실행 (Pyodide)
* 백엔드 서버 없이 브라우저 내의 WebAssembly(Pyodide) 환경에서 파이썬 코드를 직접 컴파일 및 실행합니다.
* 안전하고 격리된 샌드박스 환경을 제공하여 무한 루프나 시스템 오류의 위험이 없습니다.
* 사용자의 표준 입력(stdin) 및 출력(stdout)을 완벽하게 동기화하여 대화형 프로그램(`input()`, `print()` 등)을 브라우저상에서 구동할 수 있습니다.

### 2. 타임라인 기반 실행 시각화 (Time-travel Debugging)
* 코드의 실행 흐름을 스냅샷(Snapshot) 형태로 모두 기록하여, **앞으로 가기/뒤로 가기/처음으로/마지막으로** 등 자유로운 시간 이동(Time-travel) 디버깅이 가능합니다.
* 사용자가 직접 코드 에디터 좌측의 여백을 클릭하여 **중단점(Breakpoint)**을 설정할 수 있으며, 다음 중단점까지 한 번에 코드를 진행시킬 수 있습니다.

### 3. 실시간 메모리 및 호출 스택 시각화
* **Call Stack (호출 스택):** 현재 실행 중인 함수와 전역/지역 변수의 값을 트리 형태로 시각적으로 보여줍니다. 
* **Heap Objects (힙 객체):** 리스트(`list`), 딕셔너리(`dict`), 튜플(`tuple`), 데큐(`deque`), 세트(`set`) 등의 복잡한 자료구조는 물론 `numpy` 배열과 `pandas` 데이터프레임의 상태 변화까지 참조 아이디 단위로 실시간 추적합니다.
* 값이 변경된 변수나 객체는 눈에 띄게 하이라이트(Highlight) 처리되어 변수의 라이프사이클을 직관적으로 파악할 수 있습니다.

### 4. 강력한 AI 코드 분석 기능 (Powered by Google Gemini 2.5 Flash)
* 학생과 학습자의 관점에 맞춰 코드에 대한 입체적이고 심층적인 AI 분석 결과를 제공합니다.
* **학생 기준 접근법:** 문제를 처음 접했을 때의 사고 과정과 접근 방식
* **실전 풀이법:** 코드의 핵심 알고리즘, 시간 및 공간 복잡도 분석, 효율적인 문제 해결 팁
* **스토리텔링형 풀이:** 복잡한 알고리즘을 비유나 일상적인 이야기로 풀어내어 직관적인 이해를 돕는 풀이
* Tailwind Typography 플러그인을 활용한 깔끔하고 읽기 쉬운 블로그/노션 스타일의 마크다운(Markdown) 렌더링을 지원합니다.

### 5. 완벽한 한글화 (Korean Localization)
* 대한민국 학생 및 교육 환경에 맞춰 모든 UI 요소(버튼, 오류 메시지, 설명 텍스트 등)를 자연스러운 한국어로 번역 및 제공합니다.

## 🛠 기술 스택 (Tech Stack)

* **Framework:** Next.js 16.2.1 (React 19, TypeScript)
* **Styling:** Tailwind CSS v4, Framer Motion
* **State Management:** Zustand
* **Editor:** Monaco Editor (`@monaco-editor/react`)
* **Python Runtime:** Pyodide (WebAssembly)
* **AI API:** Google Generative AI (Gemini 2.5 Flash)
* **Markdown:** `react-markdown`, `remark-gfm`, `@tailwindcss/typography`

## 🚀 시작하기 (Getting Started)

1. 저장소를 클론합니다:
   ```bash
   git clone https://github.com/Kevin-innovation/py-algo.git
   cd py-algo
   ```

2. 패키지를 설치합니다:
   ```bash
   npm install
   ```

3. 환경 변수를 설정합니다. 프로젝트 루트에 `.env.local` 파일을 생성하고 Google Gemini API 키를 추가하세요:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. 개발 서버를 실행합니다:
   ```bash
   npm run dev
   ```

5. 브라우저에서 `http://localhost:3000`으로 접속하여 DLAB PyAlgo를 시작하세요!
