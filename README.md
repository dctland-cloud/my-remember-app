# 나만의 리멤버 — AI 명함 스캐너

명함을 촬영하면 AI가 자동으로 정보를 추출하여 저장하고,
상대방에게 인사 이메일을 보내는 개인용 웹앱입니다.

## 주요 기능

- **명함 촬영 & AI 인식** — 카메라로 촬영하면 Gemini 2.5 Flash가 이름, 회사, 직책, 연락처를 자동 추출
- **명함 관리** — 저장, 검색, "만난 장소" 필터로 빠르게 찾기
- **인사 이메일 발송** — 저장 직후 또는 상세 페이지에서 EmailJS로 인사 이메일 전송
- **디지털 명함** — 나만의 공개 URL로 디지털 명함 페이지 생성 & 공유
- **CSV 내보내기** — 저장된 명함을 CSV 파일로 다운로드 (Excel, Google Sheets 호환)
- **Google 로그인** — 별도 회원가입 없이 Google 계정으로 간편 시작
- **PWA 지원** — 모바일 홈화면에 추가하여 앱처럼 사용 가능

## 페이지 구성

| 경로 | 설명 |
|------|------|
| `/` | 홈 — 명함 목록, 검색, 필터 |
| `/scan` | 명함 촬영 → AI OCR → 확인/저장 |
| `/card/[id]` | 명함 상세 — 편집, 삭제, 전화/이메일 원터치 |
| `/mycard` | 내 디지털 명함 미리보기 & 공유 |
| `/p/[slug]` | 공개 디지털 명함 (인증 불필요) |
| `/settings` | 프로필 편집, CSV 내보내기, 로그아웃 |

## 시작하기

### 필요한 것

1. **Node.js 18+** — [nodejs.org](https://nodejs.org)에서 다운로드
2. **Firebase 프로젝트** — [Firebase 콘솔](https://console.firebase.google.com)에서 생성
3. **Google Gemini API 키** — [Google AI Studio](https://aistudio.google.com/apikey)에서 발급
4. **EmailJS 계정** (선택) — [emailjs.com](https://www.emailjs.com)에서 무료 가입

### 설치 방법

```bash
# 1. 코드 다운로드
git clone <이 저장소 URL>
cd 리멤버앱만들기

# 2. 패키지 설치
npm install

# 3. 환경변수 파일 생성
cp .env.local.example .env.local
# .env.local 파일을 열어 실제 키 값을 입력하세요 (아래 설명 참고)

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

### 환경변수 설정 (.env.local)

`.env.local.example` 파일을 복사해서 `.env.local`로 이름을 바꾸고, 각 값을 채워주세요.

| 변수명 | 설명 | 어디서 얻나? |
|--------|------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API 키 | Firebase 콘솔 → 프로젝트 설정 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase 인증 도메인 | 위와 같음 |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | 위와 같음 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase 스토리지 버킷 | 위와 같음 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase 메시징 발신자 ID | 위와 같음 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase 앱 ID | 위와 같음 |
| `GEMINI_API_KEY` | Gemini AI API 키 | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS 서비스 ID | emailjs.com → Email Services |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS 템플릿 ID | emailjs.com → Email Templates |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS 퍼블릭 키 | emailjs.com → Account |

### Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com)에서 새 프로젝트를 만듭니다.

2. **Authentication 활성화**
   - Authentication → Sign-in method → Google 사용 설정

3. **Firestore Database 생성**
   - Firestore Database → 데이터베이스 만들기 → 프로덕션 모드로 시작
   - 보안 규칙은 `firestore.rules` 파일이 자동 적용됩니다.

4. **웹 앱 등록**
   - 프로젝트 설정 → 일반 → 내 앱 → 웹 앱 추가
   - Firebase SDK 설정 값을 `.env.local`에 복사

### EmailJS 설정 (선택 — 인사 이메일 기능)

1. [emailjs.com](https://www.emailjs.com) 에서 무료 가입 (월 200건 무료)

2. **Email Service 추가**
   - Email Services → Add New Service → Gmail 선택 → 연결

3. **Email Template 생성**
   - Email Templates → Create New Template
   - 제목: `{{subject}}`
   - 본문에 사용할 변수: `{{to_name}}`, `{{from_name}}`, `{{from_company}}`, `{{from_title}}`, `{{from_email}}`, `{{from_phone}}`, `{{digital_card_url}}`

4. **키 값 복사**
   - Service ID, Template ID → 각 페이지에서 확인
   - Account → Public Key 복사
   - 모두 `.env.local`에 입력

### 배포 (Firebase Hosting)

```bash
# 1. Firebase CLI 로그인
npx firebase login

# 2. 프로젝트 연결 확인 (firebase.json이 이미 설정되어 있음)
npx firebase projects:list

# 3. 프로덕션 빌드
npm run build

# 4. Firebase에 배포
npx firebase deploy --only hosting

# 5. Firestore 보안 규칙 배포
npx firebase deploy --only firestore:rules
```

배포 후 `https://<프로젝트ID>.web.app` 으로 접속할 수 있습니다.

> **참고:** 이 앱은 Next.js의 정적 내보내기(`output: 'export'`)가 아닌 서버 사이드 기능(API Route)을 사용합니다.
> Firebase Hosting만으로 배포하려면 `next.config.ts`에 `output: 'export'`를 설정하고 OCR API를 Cloud Functions로 분리해야 합니다.
> 가장 간단한 방법은 Vercel에 배포하는 것입니다 — Push만 하면 자동 배포됩니다.

### 배포 (Vercel — 추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포 (안내에 따라 진행)
vercel
```

Vercel 대시보드에서 환경변수를 설정하면 끝입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS v4 |
| 인증 | Firebase Authentication (Google OAuth) |
| 데이터베이스 | Cloud Firestore |
| AI OCR | Google Gemini 2.5 Flash |
| 이메일 | EmailJS |
| 이미지 처리 | browser-image-compression |
| 호스팅 | Firebase Hosting / Vercel |

## 비용

이 앱은 **실질적으로 무료** ($0/년)로 운영할 수 있습니다.

| 서비스 | 무료 한도 | 예상 사용량 |
|--------|-----------|-------------|
| Firebase Auth | 무제한 | 1명 (개인 사용) |
| Firestore | 일 50,000 읽기 | 수십~수백 건 |
| Gemini API | 무료 티어 (분당 15건) | 하루 수 건 |
| EmailJS | 월 200건 | 월 수십 건 |
| Firebase Hosting | 10GB/월 | 수 MB |
| Vercel | Hobby 플랜 무료 | 충분 |

## 프로젝트 구조

```
src/
  app/
    page.tsx          — 홈 (명함 목록)
    scan/page.tsx     — 명함 스캔
    card/[id]/page.tsx — 명함 상세
    mycard/page.tsx   — 내 디지털 명함
    p/[slug]/page.tsx — 공개 디지털 명함
    settings/page.tsx — 설정
    api/ocr/route.ts  — Gemini OCR API
    components/       — 공통 컴포넌트 (BottomNav)
    globals.css       — 전역 스타일
    layout.tsx        — 루트 레이아웃
  components/         — 재사용 컴포넌트
    CameraCapture.tsx — 카메라/갤러리 촬영
    CardListItem.tsx  — 명함 목록 아이템
    DuplicateDialog.tsx — 중복 명함 대화상자
    GreetingEmailDialog.tsx — 인사 이메일 대화상자
  lib/                — 유틸리티 라이브러리
    auth.ts           — Firebase 인증 컨텍스트
    firebase.ts       — Firebase 초기화
    cards.ts          — 명함 CRUD
    profile.ts        — 프로필 관리
    emailjs.ts        — 이메일 발송
    image-utils.ts    — 이미지 압축
  types/              — TypeScript 타입 정의
public/
  manifest.json       — PWA 매니페스트
  icon-192.png        — 앱 아이콘 (192x192)
  icon-512.png        — 앱 아이콘 (512x512)
```

## PWA (홈화면에 추가)

모바일 브라우저에서 "홈 화면에 추가" 기능을 사용하면 앱처럼 사용할 수 있습니다.

- **iOS Safari:** 공유 버튼 → "홈 화면에 추가"
- **Android Chrome:** 메뉴(점 3개) → "홈 화면에 추가" 또는 자동 설치 배너

## 아이콘 교체

`public/icon-192.png`과 `public/icon-512.png`는 플레이스홀더입니다.
앱을 커스터마이징하려면 192x192, 512x512 크기의 PNG 파일로 교체하세요.
`public/icon.svg`를 편집하여 새 아이콘을 디자인할 수 있습니다.

## 라이선스

개인 프로젝트용으로 자유롭게 사용하세요.
