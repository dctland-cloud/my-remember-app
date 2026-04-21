/**
 * 인사 이메일 발송 유틸리티 (Gmail 작성창 방식)
 * - 사용자의 Gmail 작성창을 새 탭에 열어줍니다.
 * - 수신자/제목/본문이 미리 채워진 상태 → 사용자가 "보내기" 클릭으로 발송
 * - 가입/API 키 불필요, 완전 무료, 무제한
 * - 내 Gmail 보낸편지함에 기록됨 (본인 명의 발신)
 */

/** 인사 이메일 발송에 필요한 파라미터 */
export interface GreetingEmailParams {
  toEmail: string;
  toName: string;
  fromName: string;
  fromCompany: string;
  fromTitle: string;
  fromEmail: string;
  fromPhone: string;
  digitalCardUrl: string;
}

/** 인사 이메일 본문 생성 */
export function buildGreetingBody(params: GreetingEmailParams): string {
  return buildBody(params);
}

/** 인사 이메일 제목 생성 */
export function buildGreetingSubject(params: GreetingEmailParams): string {
  return buildSubject(params);
}

/** 인사 이메일 본문 생성 (내부) */
function buildBody(params: GreetingEmailParams): string {
  const lines: string[] = [
    `${params.toName}님, 안녕하세요.`,
    `만나 뵙게 되어 반갑습니다.`,
    ``,
    `제 연락처를 보내드립니다:`,
    `- 이름: ${params.fromName}`,
  ];
  if (params.fromCompany) {
    lines.push(
      `- 회사: ${params.fromCompany}${params.fromTitle ? ` / ${params.fromTitle}` : ""}`
    );
  } else if (params.fromTitle) {
    lines.push(`- 직책: ${params.fromTitle}`);
  }
  if (params.fromEmail) lines.push(`- 이메일: ${params.fromEmail}`);
  if (params.fromPhone) lines.push(`- 전화: ${params.fromPhone}`);
  if (params.digitalCardUrl) {
    lines.push(``, `제 디지털 명함: ${params.digitalCardUrl}`);
  }
  lines.push(``, `좋은 하루 되세요.`, `${params.fromName} 드림`);
  return lines.join("\n");
}

/** 이메일 제목 생성 */
function buildSubject(params: GreetingEmailParams): string {
  return params.fromCompany
    ? `만나서 반갑습니다 - ${params.fromName} (${params.fromCompany})`
    : `만나서 반갑습니다 - ${params.fromName}`;
}

/**
 * Gmail 작성창 URL 생성
 * - 로그인된 Gmail이 새 탭에서 열리며 수신자/제목/본문이 자동 채워짐
 */
export function buildGmailComposeUrl(params: GreetingEmailParams): string {
  const url = new URL("https://mail.google.com/mail/");
  url.searchParams.set("view", "cm");
  url.searchParams.set("fs", "1");
  url.searchParams.set("to", params.toEmail);
  url.searchParams.set("su", buildSubject(params));
  url.searchParams.set("body", buildBody(params));
  return url.toString();
}

/**
 * 인사 이메일 작성창 열기
 * - Gmail 작성창을 새 탭에 엽니다.
 * - 팝업 차단 시 false를 반환합니다.
 */
export function openGreetingEmail(params: GreetingEmailParams): boolean {
  const url = buildGmailComposeUrl(params);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  return win !== null;
}

/**
 * 내 프로필 정보 (localStorage에서 읽기/저장)
 */
export interface MyProfile {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  slug?: string;
}

const PROFILE_STORAGE_KEY = "my-remember-profile";

export function getMyProfile(): MyProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as MyProfile;
  } catch {
    return null;
  }
}

export function saveMyProfile(profile: MyProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
