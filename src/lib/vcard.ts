/**
 * vCard (VCF) 유틸리티
 * - RFC 6350 vCard 3.0 포맷 (iOS/Android 기본 연락처 앱 호환)
 * - 명함 정보를 .vcf 파일로 만들어 다운로드 → 사용자가 "연락처에 추가"
 * - 공개 명함 페이지(/p/[slug])와 저장된 명함 상세(/card/[id]), /scan 저장 흐름에서 재사용
 */

export interface VCardContact {
  name: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
}

/**
 * vCard 3.0 값 이스케이프 (RFC 6350 §3.4)
 * - 백슬래시·개행·쉼표·세미콜론은 vCard 문법상 구분자라 반드시 escape해야 함
 * - OCR·사용자 편집 결과에 이런 문자가 들어가면 연락처 파일이 깨짐
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * 다운로드 파일명 안전화
 * - 파일시스템에서 금지된 문자 치환 + 길이 제한
 */
function sanitizeFilename(name: string): string {
  const cleaned = (name || "contact")
    // eslint-disable-next-line no-control-regex
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/^\.+/, "")
    .trim()
    .slice(0, 80);
  return cleaned || "contact";
}

/**
 * vCard 3.0 문자열 생성 (라인 구분자는 RFC 6350에 따라 CRLF)
 * - 모든 값 필드는 escapeVCardValue를 거쳐 구분자 충돌을 방지함
 */
export function buildVCard(contact: VCardContact): string {
  const name = escapeVCardValue(contact.name);
  const company = contact.company ? escapeVCardValue(contact.company) : "";
  const title = contact.title ? escapeVCardValue(contact.title) : "";
  const email = contact.email ? escapeVCardValue(contact.email) : "";
  const phone = contact.phone ? escapeVCardValue(contact.phone) : "";

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `N:${name};;;;`,
    company ? `ORG:${company}` : null,
    title ? `TITLE:${title}` : null,
    email ? `EMAIL;TYPE=INTERNET:${email}` : null,
    phone ? `TEL;TYPE=CELL:${phone}` : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/**
 * 연락처 vCard 파일 다운로드
 * - 브라우저에서 Blob URL을 생성 → 숨겨진 <a download>로 클릭 → 즉시 정리
 * - iOS Safari: 열면 "연락처에 추가" 제안
 * - Android Chrome: 연락처 앱으로 인텐트 전달
 * - 데스크톱: 파일 다운로드
 */
export function downloadVCard(contact: VCardContact): void {
  if (typeof window === "undefined") return;

  const vcard = buildVCard(contact);
  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${contact.name || "contact"}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
