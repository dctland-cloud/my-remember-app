/**
 * EmailJS 이메일 발송 유틸리티
 * - EmailJS는 클라이언트에서 직접 이메일을 보내는 서비스입니다.
 * - 환경변수(NEXT_PUBLIC_EMAILJS_*)에서 설정을 읽어 초기화합니다.
 * - sendGreetingEmail(): 인사 이메일을 발송하고 성공 여부를 반환합니다.
 */

import emailjs from "@emailjs/browser";

/** EmailJS 환경변수에서 읽어오는 설정 */
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

/** EmailJS가 사용 가능한지 확인 (환경변수 3개 모두 설정됐는지) */
export function isEmailJSConfigured(): boolean {
  return !!(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

/** 인사 이메일 발송에 필요한 파라미터 */
export interface GreetingEmailParams {
  /** 수신자 이메일 주소 */
  toEmail: string;
  /** 수신자 이름 */
  toName: string;
  /** 내 이름 */
  fromName: string;
  /** 내 회사 */
  fromCompany: string;
  /** 내 직책 */
  fromTitle: string;
  /** 내 이메일 */
  fromEmail: string;
  /** 내 전화번호 */
  fromPhone: string;
  /** 디지털 명함 링크 */
  digitalCardUrl: string;
}

/**
 * 인사 이메일 발송
 * - EmailJS를 통해 인사 이메일을 보냅니다.
 * - 성공하면 true, 실패하면 false를 반환합니다.
 */
export async function sendGreetingEmail(
  params: GreetingEmailParams
): Promise<boolean> {
  if (!isEmailJSConfigured()) {
    console.error(
      "EmailJS 설정이 완료되지 않았습니다. .env.local에 NEXT_PUBLIC_EMAILJS_* 값을 설정해주세요."
    );
    return false;
  }

  try {
    // EmailJS 템플릿에 전달할 변수 (EmailJS 대시보드의 템플릿과 변수명을 맞춰야 함)
    const templateParams = {
      to_email: params.toEmail,
      to_name: params.toName,
      from_name: params.fromName,
      from_company: params.fromCompany,
      from_title: params.fromTitle,
      from_email: params.fromEmail,
      from_phone: params.fromPhone,
      digital_card_url: params.digitalCardUrl,
      // 이메일 제목용
      subject: `만나서 반갑습니다 - ${params.fromName} (${params.fromCompany})`,
    };

    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    if (result.status === 200) {
      return true;
    }

    console.error("EmailJS 발송 실패 - 상태코드:", result.status);
    return false;
  } catch (error) {
    console.error("EmailJS 발송 오류:", error);
    return false;
  }
}

/**
 * 내 프로필 정보 (localStorage에서 읽기/저장)
 * - Phase 5의 설정 페이지에서 본격적으로 관리됩니다.
 * - 지금은 localStorage를 임시 저장소로 사용합니다.
 */
export interface MyProfile {
  name: string;
  company: string;
  title: string;
  email: string;
  phone: string;
}

const PROFILE_STORAGE_KEY = "my-remember-profile";

/** localStorage에서 내 프로필 가져오기 */
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

/** localStorage에 내 프로필 저장하기 */
export function saveMyProfile(profile: MyProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
