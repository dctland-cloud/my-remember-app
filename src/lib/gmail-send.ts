/**
 * Gmail API 자동 발송 — Google Identity Services (GIS) 기반
 * - 첫 사용 시 한 번만 "이 앱이 내 Gmail로 발송하는 것 허용" 동의 팝업
 * - 이후 1시간 동안은 캐시된 토큰으로 완전 자동 발송
 * - 토큰 만료되면 자동으로 재발급 (사용자 조작 없음, 같은 세션이면 조용히)
 * - 본인 Gmail 계정으로 발송되므로 "보낸편지함"에도 기록됨
 */

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";

/** GIS 토큰 응답 타입 */
interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  error?: string;
  error_description?: string;
}

/** 메모리 토큰 캐시 (탭이 살아있는 동안) */
let cachedToken: { token: string; expiresAt: number } | null = null;

/** GIS 스크립트 로드 (한 번만) */
function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("브라우저에서만 호출 가능합니다"));
      return;
    }
    // 이미 로드된 경우
    if ((window as unknown as { google?: { accounts?: { oauth2?: unknown } } }).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    // 로드 진행 중이면 기다림
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GIS_SCRIPT_URL}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("GIS 스크립트 로드 실패")), { once: true });
      return;
    }
    // 새로 로드
    const script = document.createElement("script");
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("GIS 스크립트 로드 실패"));
    document.head.appendChild(script);
  });
}

/**
 * Gmail 발송 토큰 획득 (필요 시 동의 팝업)
 * @param forceConsent 기존 토큰 무시하고 강제 재동의
 * @param hint 특정 Google 계정을 미리 지정 (Firebase 로그인 사용자의 이메일) — 다중 계정 시 잘못된 계정으로 발송되는 사고 방지
 */
async function getGmailToken(forceConsent = false, hint?: string): Promise<string> {
  // 캐시가 유효하면 (만료 60초 전까지는 재사용)
  if (!forceConsent && cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  await loadGIS();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "Google Client ID가 설정되지 않았습니다. .env.local에 NEXT_PUBLIC_GOOGLE_CLIENT_ID를 추가해주세요."
    );
  }

  return new Promise<string>((resolve, reject) => {
    const google = (
      window as unknown as {
        google: {
          accounts: {
            oauth2: {
              initTokenClient: (config: {
                client_id: string;
                scope: string;
                prompt?: string;
                hint?: string;
                callback: (resp: TokenResponse) => void;
                error_callback?: (err: { type?: string; message?: string }) => void;
              }) => { requestAccessToken: (opts?: { prompt?: string }) => void };
            };
          };
        };
      }
    ).google;

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPE,
      // 로그인한 Firebase 계정의 이메일을 힌트로 전달 → GIS 팝업에서 그 계정 자동 선택
      ...(hint ? { hint } : {}),
      callback: (resp) => {
        if (resp.error) {
          reject(new Error(resp.error_description || resp.error));
          return;
        }
        if (!resp.access_token) {
          reject(new Error("액세스 토큰을 받지 못했습니다"));
          return;
        }
        // 만료 60초 전에 갱신하도록 여유 둠
        cachedToken = {
          token: resp.access_token,
          expiresAt: Date.now() + (resp.expires_in - 60) * 1000,
        };
        resolve(resp.access_token);
      },
      error_callback: (err) => {
        reject(
          new Error(
            err.type === "popup_closed"
              ? "권한 동의 창이 닫혔습니다. 다시 시도해주세요."
              : err.message || "권한 요청 실패"
          )
        );
      },
    });

    tokenClient.requestAccessToken({
      prompt: forceConsent ? "consent" : "",
    });
  });
}

/** UTF-8 문자열을 base64로 안전하게 인코딩 (한글 등) */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/** base64 → base64url (Gmail API는 base64url을 요구) */
function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** MIME 헤더용 UTF-8 Q-인코딩 (RFC 2047 base64 형식) */
function encodeMimeHeader(value: string): string {
  // ASCII만 있으면 인코딩 불필요
  if (/^[\x20-\x7E]*$/.test(value)) return value;
  return `=?UTF-8?B?${utf8ToBase64(value)}?=`;
}

/** RFC 822 이메일 메시지 빌드 (한글 안전) */
function buildRawMessage(params: {
  to: string;
  from: string;
  fromName?: string;
  subject: string;
  body: string;
}): string {
  const fromHeader = params.fromName
    ? `${encodeMimeHeader(params.fromName)} <${params.from}>`
    : params.from;

  const lines = [
    `From: ${fromHeader}`,
    `To: ${params.to}`,
    `Subject: ${encodeMimeHeader(params.subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    utf8ToBase64(params.body),
  ];

  const raw = lines.join("\r\n");
  return toBase64Url(utf8ToBase64(raw));
}

/**
 * Gmail로 이메일 자동 발송
 * @throws 권한 부족·네트워크 오류 시 Error 던짐
 */
export async function sendViaGmail(params: {
  toEmail: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  body: string;
  /** Firebase 로그인한 사용자의 이메일 (다중 Google 계정 사고 방지용) */
  hint?: string;
}): Promise<void> {
  let token = await getGmailToken(false, params.hint);

  const raw = buildRawMessage({
    to: params.toEmail,
    from: params.fromEmail,
    fromName: params.fromName,
    subject: params.subject,
    body: params.body,
  });

  const doFetch = (accessToken: string) =>
    fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    });

  let res = await doFetch(token);

  // 401/403이면 토큰 만료/권한 부족 → 재동의 받고 한 번 재시도
  if (res.status === 401 || res.status === 403) {
    cachedToken = null;
    token = await getGmailToken(true, params.hint);
    res = await doFetch(token);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as { error?: { message?: string } })?.error?.message;
    throw new Error(
      `Gmail 발송 실패${msg ? `: ${msg}` : ` (HTTP ${res.status})`}`
    );
  }
}

/** Gmail 연동 가능 여부 (클라이언트 ID 설정 체크용) */
export function isGmailSendConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}
