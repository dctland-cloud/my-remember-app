# 나머지 화면 코드 패치 — 스캔 / 상세 / 내 명함 / 설정

홈 화면 패치를 이미 적용했다고 가정합니다. 아래 파일을 `patch/` 에서 실제 경로로 복사하세요.

## 파일 매핑

```
patch/scan-page.tsx             →  src/app/scan/page.tsx                    (덮어쓰기)
patch/card-detail-page.tsx      →  src/app/card/[id]/page.tsx               (덮어쓰기)
patch/mycard-page.tsx           →  src/app/mycard/page.tsx                  (덮어쓰기)
patch/public-page.tsx           →  src/app/p/[slug]/page.tsx                (덮어쓰기)
patch/settings-page.tsx         →  src/app/settings/page.tsx                (덮어쓰기)
patch/TagEditor.tsx             →  src/components/TagEditor.tsx             (신규)
patch/QuickAction.tsx           →  src/components/QuickAction.tsx           (신규)
```

## Claude Code 전달용 한 줄

> "patch/ 폴더의 파일들을 표시된 경로로 복사하고, import 경로·타입을 실제 프로젝트 구조에 맞게 조정해 줘. 특히 `CardData.tags: string[]`가 저장/수정 시 함께 저장되도록 saveCard / updateCard 호출부를 확인해 줘."

## 데이터 저장 주의사항

- `CardData.tags?: string[]` 는 optional — 기존 문서 호환
- 새로 저장할 때 `tags` 배열을 함께 넘기도록 `scan/page.tsx`의 `saveCard()` 호출에서 반영
- 편집할 때도 `updateCard()`에 `tags` 포함
- `getCardTags(card)` 헬퍼로 레거시 `metAt` 자동 변환되어 표시됨
