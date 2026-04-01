# PyAlgo Task Hub

이 디렉터리는 **추가 작업 시작 시 가장 먼저 보는 기준점**입니다.

## 1) 현재 저장소 상태 빠른 점검

```bash
git status
git rev-list --left-right --count HEAD...origin/main
git log --oneline -20
```

- `0 0` 이면 로컬/원격 동기화 완료
- 작업 시작 전/후 반드시 확인

## 2) 플랜 소스

- 외부 워크플랜(세션 운영용):
  - `/Users/mk/opencode/.sisyphus/plans/ui-redesign-vercel-style.md`
  - `/Users/mk/opencode/.sisyphus/plans/pyalgo-content-enrich.md`
- 저장소 내 보관 플랜:
  - `docs/plans/ui-redesign-vercel-style.md`

## 3) 이 폴더 문서 사용 순서

1. `01_COMPLETED_WORKLOG.md` 확인 (무엇이 반영됐는지)
2. `02_ACTIVE_BASELINE.md` 확인 (현재 기능/제약/환경)
3. `03_NEXT_TASK_TEMPLATE.md` 복사해서 신규 작업안 작성

## 4) 주의사항

- `.env.local` 값은 커밋 금지(이미 gitignore)
- 배포 환경변수는 Vercel에서 별도 관리
- UI 변경 후 최소 `npm run build`는 항상 통과 확인
