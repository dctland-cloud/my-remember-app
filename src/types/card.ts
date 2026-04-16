/**
 * 명함 데이터 타입 정의
 * - CardData: Firestore에 저장되는 명함 전체 데이터
 * - OcrResult: Gemini AI가 명함에서 추출한 결과
 */

/** Gemini AI OCR 결과 - 명함에서 자동으로 읽어낸 정보 */
export interface OcrResult {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  address: string;
}

/** Firestore에 저장되는 명함 한 장의 전체 데이터 */
export interface CardData {
  /** Firestore 문서 ID (저장 후 자동 부여) */
  id?: string;
  /** 이 명함을 소유한 사용자의 Firebase Auth UID */
  userId: string;
  /** 명함 주인 이름 */
  name: string;
  /** 회사명 */
  company: string;
  /** 직책/직급 */
  title: string;
  /** 이메일 주소 */
  email: string;
  /** 전화번호 */
  phone: string;
  /** 주소 */
  address: string;
  /** 사용자가 추가하는 메모 */
  memo: string;
  /** 이 사람을 만난 장소/이벤트 */
  metAt: string;
  /** 명함 이미지 썸네일 (약 50KB, base64 Data URL) */
  thumbnailBase64: string;
  /** 인사 이메일 발송 여부 */
  greetingEmailSent: boolean;
  /** 생성 일시 (ISO 8601 문자열) */
  createdAt: string;
  /** 수정 일시 (ISO 8601 문자열) */
  updatedAt: string;
}
