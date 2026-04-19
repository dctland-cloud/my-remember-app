# 홈 화면 리디자인 적용 패치

딥 네이비 악센트 + 기억 키워드 필터 + 카드 리디자인.

## 적용 순서 (로컬 프로젝트 루트에서)

각 파일을 아래 경로에 **복사해 덮어쓰거나 새로 만드세요**.

```
patch/globals.css               →  src/app/globals.css         (덮어쓰기)
patch/types-card.ts             →  src/types/card.ts           (덮어쓰기)
patch/page.tsx                  →  src/app/page.tsx            (덮어쓰기)
patch/CardListItem.tsx          →  src/components/CardListItem.tsx  (덮어쓰기)
patch/TagFilter.tsx             →  src/components/TagFilter.tsx     (신규)
patch/EmptyState.tsx            →  src/components/EmptyState.tsx    (신규)
patch/BottomNav.tsx             →  src/app/components/BottomNav.tsx (덮어쓰기)
```

## 데이터 마이그레이션 메모

`CardData`에 `tags: string[]` 필드가 추가됩니다.

- **기존 명함**: `metAt` 값이 있으면 앱이 자동으로 `tags`에 포함해서 표시 (`card.tags ?? (card.metAt ? [card.metAt] : [])`).
- **Firestore 기존 문서**: 바로 마이그레이션하지 않아도 동작. 새 명함을 저장하거나 편집할 때 `tags` 배열이 함께 저장되도록 `scan/page.tsx`, `card/[id]/page.tsx`에서 저장 시 `tags` 포함하게 수정하면 됨 (다음 단계에서 작업).

## 적용 후 확인

```bash
npm run dev
```

`http://localhost:3000` — 배경이 따뜻한 오프화이트로, 상단 큰 타이틀 "만난 사람들", 필터 pill이 네이비로 보이면 성공.
