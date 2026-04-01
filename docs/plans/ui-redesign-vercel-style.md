# DLAB PyAlgo UI Redesign - Vercel Dashboard Style

> **Quick Summary**: Vercel 대시보드 스타일로 전체 UI 개편. 레이아웃, 타이포그래피, 컴포넌트 스타일을 Vercel 스타일로 통일하여 더 깔끔하고 전문적인 대시보드 느낌 구현.

**Deliverables**:
- [x] CSS 디자인 토큰 시스템 (색상, 간격, 폰트)
- [x] 레이아웃 재구성 (사이드바, 헤더, 메인)
- [x] 컴포넌트 스타일 업데이트 (버튼, 카드, 배지)
- [x] 타이포그래피 개선
- [x] 다크/라이트 테마 유지

**Estimated Effort**: Medium (~2-3 hours)
**Parallel Execution**: YES
**Worktree**: None

---

## Context

### Original Request
Vercel 대시보드처럼 레이아웃, 글자 크기, 버튼 사이즈 등을 전면 개선. JSON 스펙 참고.

**Key Decisions**:
- **범위**: 전체 페이지 (에디터, 학습)
- **반영 요소**: 레이아웃 & 간격 최우선
- **색상**: 기존 Tailwind 색상 유지 (JSON 스펙은 참고용)
- **테마**: 다크/라이트 시스템 유지

### Design Tokens (from JSON)

**Colors**:
```css
--background-light: #ffffff
--background-dark: #0a0a0a
--sidebar-light: #f9f9f9
--sidebar-dark: #111111
--text-primary-light: #000000
--text-primary-dark: #ffffff
--text-secondary-light: #666666
--text-secondary-dark: #888888
--border-light: #e5e5e5
--border-dark: #333333
--accent-blue: #0070f3
--status-ready: #00c853
--status-building: #f5a623
```

**Spacing**:
- Sidebar: 160px (Vercel) → 240px (우리는 알고리즘 목록 때문에 더 넓게)
- Header: 64px
- Card padding: 20px
- Button padding: 8px 16px
- Gap: 16px

**Typography**:
- Page title: 28px, font-weight 600
- Section title: 20px, font-weight 600
- Card title: 16px, font-weight 600
- Body: 15px
- Small: 13px
- Button: 13px, font-weight 500

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | 디자인 토큰 추가 (CSS 변수) |
| `src/app/layout.tsx` | (있다면) 레이아웃 구조 업데이트 |
| `src/app/page.tsx` | 에디터 페이지 레이아웃 개편 |
| `src/app/learn/LearnPageClient.tsx` | 학습 페이지 레이아웃 개편 |
| `src/components/learn/AlgorithmSidebar.tsx` | 사이드바 스타일 개편 |
| `src/components/learn/AlgorithmDetail.tsx` | 상세 패널 스타일 개편 |
| `src/components/ThemeToggle.tsx` | 테마 토글 버튼 스타일 |
| `src/components/EditorPanel.tsx` | 에디터 패널 스타일 |

---

## Tasks

### Wave 1: Design System Foundation

- [x] **Task 1**: Create design tokens in `globals.css`
  - Add CSS custom properties for colors, spacing, typography
  - Support both light and dark themes
  - Run: Build check

- [x] **Task 2**: Update Tailwind config with custom values
  - Map CSS variables to Tailwind utilities
  - Ensure dark mode support
  - Run: Build check

### Wave 2: Layout Components

- [x] **Task 3**: Redesign sidebar component
  - Width: 240px
  - Clean navigation items
  - Proper spacing and typography
  - Active state styling

- [x] **Task 4**: Redesign header component
  - Height: 64px
  - Clean layout
  - Proper button styling

- [x] **Task 5**: Update main layout structure
  - Consistent padding
  - Proper grid system
  - Responsive considerations

### Wave 3: Page Updates

- [x] **Task 6**: Update learn page layout
  - Apply new design tokens
  - Consistent spacing
  - Clean card designs

- [x] **Task 7**: Update editor page layout
  - Apply new design tokens
  - Panel sizing
  - Consistent styling

### Wave 4: Component Polish

- [x] **Task 8**: Update button styles
  - Primary, secondary, ghost variants
  - Proper sizing and padding
  - Hover states

- [x] **Task 9**: Update card styles
  - Consistent padding
  - Border radius
  - Shadow (if any)

- [x] **Task 10**: Update typography
  - Heading sizes
  - Body text
  - Proper line heights

### Wave 5: Verification

- [x] **Task 11**: Run all tests
  - Ensure no visual regressions
  - Run: `npm run test`

- [x] **Task 12**: Visual verification
  - Check both themes
  - Verify all pages
  - Screenshot comparison

- [x] **Task 13**: Build and commit
  - Run: `npm run build`
  - Commit with message
  - Push to remote

---

## Commit Strategy

```
Commit 1: style: add Vercel-style design tokens
Commit 2: style: redesign sidebar and header components
Commit 3: style: update learn page layout
Commit 4: style: update editor page layout
Commit 5: style: polish buttons and cards
Commit 6: docs: update README with new design
```

---

## Guardrails

- **IN SCOPE**:
  - CSS/styling changes only
  - Layout structure changes
  - Component style updates
  - Design token additions

- **OUT OF SCOPE**:
  - New features or pages
  - Backend logic changes
  - Algorithm data changes
  - New dependencies

---

## Success Criteria

- [x] Design tokens defined and used consistently
- [x] Sidebar width 240px with clean navigation
- [x] Header height 64px with proper layout
- [x] Consistent typography (28px titles, 15px body)
- [x] Clean button styles (13px, proper padding)
- [x] Card styles consistent across pages
- [x] Dark/light themes both work correctly
- [x] All tests pass
- [x] Build succeeds
