<div align="center">
  <h1>Py-Algo</h1>
  <p><strong>브라우저에서 직접 실행하고 눈으로 확인하는 파이썬 알고리즘 시각화 도구</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Pyodide](https://img.shields.io/badge/Pyodide-0.25-blue?style=for-the-badge&logo=python)](https://pyodide.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  <br />
  <p><strong><a href="https://py-algo.vercel.app/" target="_blank">Live Demo (https://py-algo.vercel.app/)</a></strong>에서 별도의 설치 없이 바로 사용해보세요.</p>
</div>

<br />

## Introduction

Py-Algo는 서버 통신이나 로컬 파이썬 환경 구축 없이, 브라우저만으로 파이썬 알고리즘 코드를 작성하고 실행 과정을 실시간으로 추적할 수 있는 클라이언트 사이드 시각화 플랫폼입니다. WebAssembly(WASM) 기반의 Pyodide 엔진을 통해 보안성을 확보함과 동시에 강력한 디버깅 환경을 제공합니다.

복잡한 자료구조나 재귀 함수의 동작 원리를 Call Stack과 Heap Memory 모델을 통해 직관적으로 분석할 수 있으며, 최신 디버거 기능을 통해 코드 레벨의 깊이 있는 학습이 가능합니다.

<br />

## Key Features

- **정밀한 실행 흐름 추적 (Step-by-step Trace)**
  `sys.settrace`를 활용하여 각 실행 라인별 지역 변수 상태와 객체 생성 과정을 스냅샷으로 기록합니다. 타임라인 슬라이더와 이벤트 마커를 통해 코드의 흐름을 자유롭게 탐색할 수 있습니다.
- **고급 디버깅 컨트롤**
  - **이벤트 마커**: 출력(stdout), 입력(stdin), 함수 호출/반환, 예외 발생 지점을 타임라인에 색상별로 표시합니다.
  - **브레이크포인트**: 특정 라인에 중단점을 설정하고 해당 지점까지 한 번에 실행(Continue)할 수 있습니다.
  - **상태 변경 하이라이팅**: 각 단계에서 값이 변경된 변수나 힙 객체를 강조하여 변화를 즉각적으로 인지하게 합니다.
- **교육용 설명 모드 (Educational Mode)**
  'Explain' 기능을 활성화하면 현재 실행 중인 라인의 의미와 상태 변화를 자연어로 설명해줍니다. 알고리즘의 동작 원리를 학습하는 데 최적화되어 있습니다.
- **함수 실행 이력 (Function History)**
  함수의 호출과 반환, 예외 발생 이력을 별도의 패널에서 계층적으로 관리하여 복잡한 재귀 호출 구조도 쉽게 파악할 수 있습니다.
- **동적 메모리 참조 시각화 (Dynamic Pointers)**
  Call Stack의 변수들과 Heap 영역의 복합 자료구조(List, Dict, Set 등) 간의 참조 관계를 실시간 화살표(React Xarrows)로 연결하여 파이썬의 메모리 관리 모델을 시각화합니다.
- **브라우저 네이티브 동기식 터미널**
  `SharedArrayBuffer`와 `Atomics` API를 활용하여 브라우저 환경의 제약을 극복하고 파이썬의 동기식 `input()` 함수를 완벽하게 지원합니다.
- **스마트 패키지 자동 로드**
  `import` 구문을 분석하여 `numpy`, `pandas` 등 필요한 외부 라이브러리를 런타임에 자동으로 가져오고 캐싱합니다.

<br />

## Architecture & Tech Stack

- **Next.js 16 (App Router)**: 최신 React 서버 컴포넌트 아키텍처 기반의 견고한 프레임워크.
- **Pyodide (WASM)**: 브라우저 내 격리된 환경에서 실행되는 고성능 파이썬 런타임.
- **Zustand 5**: 타임라인 데이터와 에디터 상태를 관리하는 경량 상태 관리 라이브러리.
- **Tailwind CSS 4**: 최신 CSS 표준을 활용한 빠르고 일관된 스타일링.
- **Monaco Editor**: VSCode 기반의 강력한 코드 편집 경험 제공.
- **Framer Motion 12**: 메모리 객체 변화 및 UI 전환을 위한 부드러운 애니메이션.
- **React Xarrows**: 객체 간 참조 관계를 시각화하는 동적 화살표 렌더링.

<br />

## Getting Started

로컬 환경에서 프로젝트를 실행하려면 다음 단계를 따르세요.

```bash
# 1. 저장소 클론
git clone https://github.com/Kevin-innovation/py-algo.git
cd py-algo

# 2. 의존성 패키지 설치
npm install

# 3. 개발 환경 실행
npm run dev
```

> **Security Note:** 터미널 입력(`input()`) 처리를 위한 `SharedArrayBuffer`는 보안 정책상 Cross-Origin Isolation이 설정된 환경에서만 작동합니다. 로컬(`localhost`) 또는 적절한 COOP/COEP 헤더가 설정된 배포 환경이 필요합니다.

<br />

## Deployment

본 프로젝트는 Vercel 환경에 최적화되어 있으며, Vercel Analytics를 통해 실시간 성능 및 사용 지표를 모니터링합니다.
