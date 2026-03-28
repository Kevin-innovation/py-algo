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

Py-Algo는 서버 통신이나 로컬 파이썬 환경 구축 없이, 브라우저만으로 파이썬 알고리즘 코드를 작성하고 실행 과정을 실시간으로 추적할 수 있는 클라이언트 사이드 시각화 플랫폼입니다. WebAssembly(WASM) 기반의 Pyodide 엔진을 통해 보안성을 확보함과 동시에 빠른 실행 속도를 제공합니다.

복잡한 자료구조나 재귀 함수의 런타임 동작 원리를 Call Stack과 Heap Memory 포인터 모델을 통해 직관적으로 분석할 수 있어, 알고리즘 트레이닝 및 코드 레벨 디버깅에 최적화된 환경을 제공합니다.

<br />

## Key Features

- **실시간 실행 흐름 추적 (Step-by-step Trace)**
  작성된 파이썬 코드를 실행할 때 `sys.settrace` 훅(Hook)을 사용하여 각 실행 라인별 지역 변수 할당과 객체 생성 과정을 스냅샷으로 기록합니다. 생성된 타임라인을 통해 코드의 흐름을 역추적하거나 세밀하게 탐색할 수 있습니다.
- **동적 메모리 참조 시각화 (Dynamic Pointers)**
  파이썬의 참조(Reference) 개념을 시각화합니다. Call Stack에 생성된 원시(Primitive) 변수들과 Heap 영역에 동적 할당된 복합 자료구조(List, Dict, Set 등) 간의 메모리 참조 관계를 실시간 화살표 렌더링(React Xarrows)으로 연결해 보여줍니다.
- **브라우저 네이티브 동기식 터미널 (Interactive Terminal)**
  가장 구현이 까다로운 파이썬의 동기식 `input()` 함수를 완벽히 지원합니다. Web Worker 내에서 실행되는 Pyodide의 블로킹 제약을 해결하기 위해 `SharedArrayBuffer`와 `Atomics.wait` API를 활용하여, 메인 스레드(UI)의 멈춤 없이 안정적인 양방향 I/O 통신을 구현했습니다.
- **스마트 패키지 의존성 주입 (Smart Dependency Auto-loading)**
  `numpy`, `pandas` 등 외부 라이브러리 임포트 구문을 AST 레벨에서 선제적으로 분석합니다. 코드가 실행되기 전에 필요한 종속성을 런타임에 동적으로 가져오고(Inject) 캐싱하므로 추가적인 패키지 관리 설정이 필요 없습니다.

<br />

## Architecture & Tech Stack

본 프로젝트는 최신 웹 표준 기술과 최적화된 스택을 활용하여 구축되었습니다.

- **Next.js 16 (App Router & Turbopack)**: 효율적인 SSR 라우팅 체계 및 Turbopack을 통한 빠른 개발 환경 경험을 위해 도입되었습니다.
- **Pyodide (WASM)**: 백엔드 서버의 자원을 소모하지 않고 사용자의 브라우저 내에서 안전하게 격리된(Sandboxed) 파이썬 실행 환경을 제공합니다.
- **Zustand**: 타임라인 스냅샷, 코드 에디터 상태, 터미널 입출력 기록 등 전역 상태를 빠르고 가볍게 중앙 집중식으로 관리합니다.
- **Monaco Editor**: VSCode와 동일한 코어 에디터를 채택하여 파이썬 신택스 하이라이팅, 자동 완성 및 들여쓰기 보정 등 강력한 코딩 경험을 지원합니다.
- **Framer Motion & Tailwind CSS**: 메모리 객체가 생성되거나 소멸할 때의 자연스러운 애니메이션 전환과 반응형 UI를 구성합니다.

<br />

## Getting Started

소스를 직접 클론하여 로컬 환경에서 개발을 진행하려면 다음 단계를 따르세요.

```bash
# 1. 저장소 클론
git clone https://github.com/Kevin-innovation/py-algo.git
cd py-algo

# 2. 의존성 패키지 설치
npm install

# 3. 개발 환경 실행
npm run dev
```

> **Security Note:** 터미널 입력(`input()`)을 처리하는 `SharedArrayBuffer` 및 `Atomics` API는 최신 브라우저의 보안 정책상 Cross-Origin Isolation이 설정된 안전한 컨텍스트(Secure Context) 또는 `localhost`에서만 정상 작동합니다. Vercel 배포 시 `next.config.ts`의 COOP/COEP 헤더 설정을 통해 이 조건을 만족하도록 구성되어 있습니다.

<br />

## Deployment

이 프로젝트는 Vercel 환경 배포에 완벽하게 최적화되어 있습니다. Vercel 연결 후 별도의 추가 설정 없이 바로 프로덕션 빌드 및 배포가 가능합니다.

