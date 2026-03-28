<div align="center">
  <h1>🐍 Py-Algo</h1>
  <p><strong>브라우저에서 직접 실행하고 눈으로 확인하는 파이썬 알고리즘 시각화 도구</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Pyodide](https://img.shields.io/badge/Pyodide-0.25-blue?style=for-the-badge&logo=python)](https://pyodide.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

<br />

## ✨ Introduction

**Py-Algo**는 서버 설정이나 로컬 파이썬 환경 구축 없이, 브라우저만으로 파이썬 알고리즘 코드를 작성하고 실행 과정을 실시간으로 추적할 수 있는 모던 시각화 플랫폼입니다. WebAssembly(WASM) 기반의 [Pyodide](https://pyodide.org/) 엔진을 100% 클라이언트 사이드에서 구동하여 극강의 성능과 보안을 자랑합니다.

복잡한 자료구조나 재귀 함수의 런타임 동작 원리를 **Call Stack**과 **Heap Memory** 포인터 애니메이션을 통해 직관적으로 이해할 수 있어, 알고리즘 트레이닝 및 디버깅에 최적화된 개발 경험(DX)을 제공합니다.

<br />

## 🚀 Key Features

- 🕵️‍♂️ **실시간 실행 흐름 추적 (Step-by-step Trace)**
  작성한 파이썬 코드를 실행하면 내부 AST 변환 및 추적을 거쳐, 각 실행 라인별 변수의 할당과 객체 생성 과정을 타임라인으로 탐색할 수 있습니다.
- 🎯 **다이나믹 메모리 포인터 (Dynamic Pointers)**
  콜스택(Call Stack)의 지역 변수(Locals)가 힙(Heap) 영역의 객체를 어떻게 참조하고 있는지 인터랙티브 화살표를 통해 시각적으로 연결해줍니다.
- 💻 **브라우저 네이티브 터미널 (Interactive Terminal)**
  파이썬의 `input()` 함수를 완벽하게 지원합니다. 별도 서버 통신 없이 Web Worker와 `SharedArrayBuffer` 기반 동기식 통신을 통해 CLI 입력 환경을 매끄럽게 재현했습니다.
- 📦 **스마트 패키지 오토로딩 (Smart Dependency Injection)**
  `numpy`, `pandas` 등 서드파티 라이브러리 임포트 시, AST 레벨에서 이를 감지해 필요한 종속성을 런타임에 자동으로 가져오고 실행합니다.

<br />

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Core Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Python Engine** | Pyodide (WASM) |
| **Styling / Animation** | Tailwind CSS, Framer Motion, React Xarrows |
| **State Management** | Zustand |
| **Code Editor** | Monaco Editor |

<br />

## 💻 Getting Started

클론 후 아래 명령어를 통해 의존성을 설치하고 개발 서버를 구동할 수 있습니다.

```bash
# 1. 저장소 클론
git clone https://github.com/Kevin-innovation/py-algo.git
cd py-algo

# 2. 의존성 설치
npm install

# 3. 개발 환경 실행
npm run dev
```

> **Note:** 터미널 입력(`input()`) 기능을 완벽히 지원하기 위해 `SharedArrayBuffer`를 사용합니다. 로컬 환경(`localhost`) 혹은 Cross-Origin Isolation 헤더가 적용된 안전한(Secure) 컨텍스트에서 실행하는 것을 권장합니다.

<br />

## ⚡ Deployment

이 프로젝트는 Vercel 환경 배포에 완벽하게 최적화되어 있습니다. Vercel 연결 후 별도의 추가 설정 없이 바로 프로덕션 빌드 및 배포가 가능합니다.

*(Zero-configuration deployment via Vercel)*
