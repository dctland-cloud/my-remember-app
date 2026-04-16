# 나만의 리멤버 앱 — 설계 문서

## 개요

명함을 촬영하면 AI가 자동으로 정보를 추출하여 저장하고, 상대방에게 인사 이메일을 보내는 개인용 스마트폰 웹앱.

## 목적

- 명함을 디지털로 관리하여 분실/망각 방지
- 명함 교환 후 즉시 인사 이메일 발송으로 비즈니스 관계 강화
- 디지털 명함 페이지로 전문적인 인상 전달

## 기술 스택

| 역할 | 기술 | 선택 이유 |
|------|------|-----------|
| 프론트엔드 | Next.js (React) | 모바일 퍼스트 PWA, SSR 지원 |
| 호스팅 | Firebase Hosting | Firebase 생태계 통합, 빠른 배포 |
| 인증 | Firebase Auth (Google 로그인) | 간단한 소셜 로그인 |
| 데이터베이스 | Firebase Firestore | 빠른 검색, 실시간 동기화 |
| AI OCR | Gemini 2.5 Flash (Cloud Function 경유) | 명함 인식 정확도 높음, 저비용 |
| 이메일 발송 | EmailJS | 무료, Gmail에서 직접 발송, 도메인 불필요 |
| 백업 | Google Sheets (수동 내보내기) | 비개발자 친화적, 눈으로 확인 가능 |

## 화면 구성 (5개)

### 1. 홈/명함 목록 화면
- 저장된 명함 카드 리스트 (이름, 회사, 직책 표시)
- 상단 검색바 (이름, 회사, 직책으로 검색)
- 만난 장소별 필터 탭
- 하단 플로팅 버튼: 명함 촬영
- 정렬: 최신순 기본

### 2. 명함 촬영/등록 화면
- 카메라 촬영 또는 갤러리에서 사진 선택
- 사진 촬영 후 → 자동 압축 → Gemini AI 분석
- AI 분석 결과를 폼에 자동 채움 (사용자가 확인/수정 가능)
- 축소 썸네일(~50KB)을 데이터와 함께 저장
- 입력 필드: 이름, 회사, 직책, 이메일, 전화, 주소, 메모, 만난 장소
- 중복 체크: 이메일 > 전화번호 > 이름+회사 순으로 검사
- 중복 발견 시 알림 후 사용자에게 선택권 부여
- 저장 후 "인사 이메일 보내기" 옵션 표시

### 3. 명함 상세 화면
- 명함 정보 전체 표시
- 축소 저장된 명함 썸네일 이미지 표시
- 원터치 전화 걸기 버튼 (tel: 링크)
- 원터치 이메일 보내기 버튼 (mailto: 링크)
- 메모 편집
- 만난 장소 편집
- 인사 이메일 발송 상태 표시
- 명함 정보 수정/삭제

### 4. 내 디지털 명함 페이지 (공개)
- 인증 불필요 — 누구나 링크로 접속 가능
- 내 이름, 회사, 직책, 이메일, 전화번호 표시
- 별도 publicProfile 컬렉션에서 최소 정보만 노출
- 경로: /card/[slug]
- 깔끔하고 전문적인 디자인

### 5. 설정 화면
- 내 정보 편집 (이름, 회사, 직책, 이메일, 전화)
- Google Sheets 내보내기 버튼
- 디지털 명함 미리보기/편집

## 데이터 모델

### Firestore 컬렉션: `cards`
```json
{
  "userId": "firebase-auth-uid",
  "name": "홍길동",
  "company": "삼성전자",
  "title": "팀장",
  "email": "hong@samsung.com",
  "phone": "010-1234-5678",
  "address": "서울시 강남구...",
  "memo": "AI 프로젝트 협업 논의",
  "metAt": "CES 2026",
  "thumbnailBase64": "data:image/jpeg;base64,...",
  "greetingEmailSent": true,
  "createdAt": "2026-04-16T10:30:00Z",
  "updatedAt": "2026-04-16T10:30:00Z"
}
```

### Firestore 컬렉션: `publicProfile`
```json
{
  "userId": "firebase-auth-uid",
  "slug": "gildonghong",
  "name": "홍길동",
  "company": "삼성전자",
  "title": "팀장",
  "email": "hong@samsung.com",
  "phone": "010-1234-5678"
}
```

## 핵심 흐름

### 명함 저장 흐름
1. 사용자가 카메라로 명함 촬영 (또는 갤러리에서 선택)
2. 브라우저에서 이미지 압축 (browser-image-compression 라이브러리)
3. 압축된 이미지를 Cloud Function으로 전송
4. Cloud Function이 Gemini 2.5 Flash API 호출 → 구조화된 JSON 반환
5. 결과를 화면 폼에 자동 채움
6. 사용자가 확인/수정 후 저장 버튼
7. 중복 체크 실행 (이메일 → 전화 → 이름+회사)
8. 중복 없으면 Firestore에 저장 + 썸네일(~50KB) 함께 저장
9. "인사 이메일 보낼까요?" 다이얼로그 표시

### 이메일 발송 흐름
1. 사용자가 "이메일 보내기" 선택
2. EmailJS로 인사 이메일 발송 (내 Gmail에서 직접 발송)
3. 이메일 내용: 인사말 + 내 연락처 + 디지털 명함 링크
4. 발송 성공 시 greetingEmailSent = true로 업데이트

### Google Sheets 내보내기 흐름
1. 설정 화면에서 "Sheets로 내보내기" 버튼 클릭
2. Cloud Function이 Firestore의 전체 cards 컬렉션 조회
3. Google Sheets API로 스프레드시트에 일괄 작성 (덮어쓰기)
4. 완료 알림

## 이메일 템플릿

```
제목: 만나서 반갑습니다 - [내 이름] ([내 회사])

[상대방 이름]님, 안녕하세요.
만나 뵙게 되어 반갑습니다.

제 연락처를 보내드립니다:
- 이름: [내 이름]
- 회사: [내 회사] / [직책]
- 이메일: [내 이메일]
- 전화: [내 전화]

▶ 디지털 명함 보기: [링크]

좋은 하루 되세요.
[내 이름] 드림
```

## 보안

- **API 키 보호**: Gemini API 키, Google Sheets API 키는 Cloud Function 환경변수에만 저장. 클라이언트에 절대 노출 안 함.
- **Firestore 보안 규칙**: 본인(userId 일치) 데이터만 읽기/쓰기 가능
- **공개 프로필**: publicProfile 컬렉션은 읽기만 허용, 쓰기는 본인만
- **EmailJS**: 서비스 ID/템플릿 ID만 클라이언트에 노출 (이메일 발송 전용, 남용 방지 설정 가능)

### Firestore 보안 규칙
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cards/{cardId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /publicProfile/{profileId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 중복 감지 로직

1. **1차: 이메일 일치** — 가장 신뢰도 높음 (정확 매칭)
2. **2차: 전화번호 일치** — 번호 정규화 후 비교 (하이픈/공백 제거)
3. **3차: 이름 + 회사 일치** — 둘 다 일치할 때만 중복으로 판단
4. 중복 발견 시 기존 명함 정보를 보여주고, "업데이트" 또는 "새로 저장" 선택

## 배포 구조

```
리멤버앱만들기/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 홈/명함 목록
│   │   ├── scan/page.tsx       # 명함 촬영
│   │   ├── card/[id]/page.tsx  # 명함 상세
│   │   ├── card/[slug]/public/ # 디지털 명함 (공개)
│   │   ├── settings/page.tsx   # 설정
│   │   └── api/                # API Routes
│   ├── components/             # 재사용 컴포넌트
│   ├── lib/
│   │   ├── firebase.ts         # Firebase 초기화
│   │   ├── gemini.ts           # Gemini API 호출 (서버)
│   │   └── emailjs.ts          # EmailJS 설정
│   └── types/                  # TypeScript 타입
├── functions/                  # Cloud Functions
│   ├── ocr.ts                  # Gemini OCR 프록시
│   └── export-sheets.ts       # Sheets 내보내기
├── firebase.json               # Firebase 설정
├── firestore.rules             # 보안 규칙
└── package.json
```

## 다른 사람에게 전달 시

이 앱을 다른 사람이 사용하려면:
1. GitHub에서 코드 복제
2. 자기 Firebase 프로젝트 생성
3. 자기 Gemini API 키 발급
4. EmailJS 계정 생성 + Gmail 연동
5. 환경변수 설정 후 Firebase에 배포
6. README에 상세 가이드 포함

## 예상 비용

| 항목 | 비용 |
|------|------|
| Firebase (호스팅, Auth, Firestore) | 무료 (개인 사용 범위) |
| Gemini 2.5 Flash (1,000장/년) | ~$1.50/년 |
| EmailJS | 무료 (200통/월) |
| Google Sheets API | 무료 |
| **합계** | **실질적으로 $0/년** |

## 검증 방법

1. **명함 촬영 테스트**: 다양한 명함(한글/영문/디자인 명함)으로 AI 인식 정확도 확인
2. **이메일 발송 테스트**: EmailJS로 테스트 이메일 발송 확인
3. **중복 체크 테스트**: 같은 명함 두 번 스캔하여 중복 알림 확인
4. **모바일 반응형 테스트**: 실제 스마트폰 브라우저에서 전체 플로우 테스트
5. **Sheets 내보내기 테스트**: 내보내기 후 Sheets에서 데이터 확인
6. **디지털 명함 테스트**: 비로그인 상태에서 공개 링크 접속 확인
7. **보안 테스트**: 비로그인/다른 사용자로 타인 데이터 접근 시도 → 차단 확인
