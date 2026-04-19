/**
 * 명함 데이터 타입 정의
 * - CardData: Firestore에 저장되는 명함 전체 데이터
 * - OcrResult: Gemini AI가 명함에서 추출한 결과
 *
 * ─── v2 변경 ───
 * - `tags: string[]` 추가 — 사용자가 자유롭게 붙이는 "기억 키워드"
 *   ("CES 2026", "박사", "회사 동료", "디자이너" 등)
 * - 기존 `metAt` 필드는 호환성을 위해 유지 (점진적 마이그레이션)
 */

export interface OcrResult {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  address: string;
}

export interface CardData {
  id?: string;
  userId: string;
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  memo: string;
  /** @deprecated v2: `tags` 배열로 대체. 기존 데이터 호환용으로 유지. */
  metAt: string;
  /**
   * 기억 키워드 — 사용자가 자유롭게 붙이는 태그.
   * 장소·역할·분야·프로젝트 등 무엇이든. 한 명함에 여러 개 가능.
   * 예: ["CES 2026", "박사", "AI"]
   */
  tags?: string[];
  thumbnailBase64: string;
  greetingEmailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 기존 카드의 tags를 읽을 때 사용하는 헬퍼.
 * tags가 없고 metAt만 있는 레거시 데이터를 자연스럽게 처리.
 */
export function getCardTags(card: Pick<CardData, "tags" | "metAt">): string[] {
  if (card.tags && card.tags.length > 0) return card.tags;
  if (card.metAt && card.metAt.trim()) return [card.metAt.trim()];
  return [];
}
