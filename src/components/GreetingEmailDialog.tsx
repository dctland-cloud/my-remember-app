/**
 * 인사 이메일 발송 대화상자 컴포넌트 — Gmail API 자동 전송
 * - 발송 전 이메일 미리보기
 * - 내 프로필이 없으면 입력 폼을 먼저
 * - "보내기" 클릭 → 첫 사용 시 한 번 Gmail 발송 권한 동의 → 완전 자동 전송
 * - 그 다음부터는 팝업 없이 조용히 전송됨 (1시간 캐시)
 * - 환경변수 NEXT_PUBLIC_GOOGLE_CLIENT_ID 미설정 시 Gmail 작성창 열기로 자동 폴백
 */

"use client";

import { useState, useEffect } from "react";
import {
  openGreetingEmail,
  buildGreetingBody,
  buildGreetingSubject,
  getMyProfile,
  saveMyProfile,
  type GreetingEmailParams,
} from "@/lib/emailjs";
import { sendViaGmail, isGmailSendConfigured } from "@/lib/gmail-send";
import { useAuth } from "@/lib/auth";
import type { CardData } from "@/types/card";

interface GreetingEmailDialogProps {
  /** 수신자의 명함 데이터 */
  card: CardData;
  /** 대화상자 닫기 */
  onClose: () => void;
  /** 이메일 발송 완료 후 콜백 */
  onSent: () => void;
}

/** 대화상자 표시 단계 */
type DialogStep = "profile" | "preview" | "sending" | "sent" | "error";

export default function GreetingEmailDialog({
  card,
  onClose,
  onSent,
}: GreetingEmailDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<DialogStep>("preview");
  const [errorMsg, setErrorMsg] = useState("");

  // 내 프로필 (localStorage)
  const [myName, setMyName] = useState("");
  const [myCompany, setMyCompany] = useState("");
  const [myTitle, setMyTitle] = useState("");
  const [myEmail, setMyEmail] = useState("");
  const [myPhone, setMyPhone] = useState("");
  const [mySlug, setMySlug] = useState("");

  // 컴포넌트 마운트 시 프로필 불러오기
  useEffect(() => {
    const profile = getMyProfile();
    if (profile) {
      setMyName(profile.name);
      setMyCompany(profile.company);
      setMyTitle(profile.title);
      setMyEmail(profile.email);
      setMyPhone(profile.phone);
      if (profile.slug) setMySlug(profile.slug);
      setStep("preview");
    } else if (user) {
      setMyName(user.displayName || "");
      setMyEmail(user.email || "");
      if (user.displayName && user.email) {
        saveMyProfile({
          name: user.displayName,
          company: "",
          title: "",
          email: user.email,
          phone: "",
        });
        setStep("preview");
      } else {
        setStep("profile");
      }
    } else {
      setStep("profile");
    }
  }, [user]);

  /** 프로필 저장 후 미리보기로 */
  const handleProfileSave = () => {
    if (!myName.trim() || !myEmail.trim()) {
      setErrorMsg("이름과 이메일은 필수입니다.");
      return;
    }
    saveMyProfile({
      name: myName.trim(),
      company: myCompany.trim(),
      title: myTitle.trim(),
      email: myEmail.trim(),
      phone: myPhone.trim(),
    });
    setErrorMsg("");
    setStep("preview");
  };

  /** ✉️ 자동 전송 (Gmail API) */
  const handleSend = async () => {
    setErrorMsg("");

    if (!card.email) {
      setErrorMsg("수신자의 이메일 주소가 없습니다.");
      setStep("error");
      return;
    }

    const params: GreetingEmailParams = {
      toEmail: card.email,
      toName: card.name,
      fromName: myName,
      fromCompany: myCompany,
      fromTitle: myTitle,
      fromEmail: myEmail,
      fromPhone: myPhone,
      digitalCardUrl: mySlug
        ? `${window.location.origin}/p/${mySlug}`
        : `${window.location.origin}/mycard`,
    };

    // Gmail API 미설정 시: 기존 Gmail 작성창 폴백
    if (!isGmailSendConfigured()) {
      const opened = openGreetingEmail(params);
      if (opened) {
        // 작성창이 열렸지만 자동 전송은 아님 — 사용자에게 알림
        setErrorMsg(
          "Gmail API가 설정되지 않아 Gmail 작성창을 대신 열었습니다. '보내기'를 눌러 발송해주세요."
        );
        setStep("error");
      } else {
        setErrorMsg(
          "팝업이 차단되어 Gmail 창을 열 수 없습니다. 브라우저의 팝업 차단을 해제해주세요."
        );
        setStep("error");
      }
      return;
    }

    // Gmail API 자동 전송
    setStep("sending");
    try {
      await sendViaGmail({
        toEmail: card.email,
        fromEmail: myEmail || user?.email || "",
        fromName: myName,
        subject: buildGreetingSubject(params),
        body: buildGreetingBody(params),
      });
      setStep("sent");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "알 수 없는 오류";
      setErrorMsg(msg);
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-end sm:items-center justify-center modal-overlay">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-text tracking-tight">
            {step === "profile"
              ? "내 프로필 설정"
              : step === "sending"
              ? "발송 중..."
              : step === "sent"
              ? "발송 완료"
              : step === "error"
              ? "발송 실패"
              : "인사 이메일 보내기"}
          </h3>
          {step !== "sending" && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text p-1"
              aria-label="닫기"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-5 py-4">
          {/* ───── 프로필 입력 단계 ───── */}
          {step === "profile" && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                인사 이메일에 포함될 내 정보를 입력해주세요.
                <br />
                <span className="text-xs text-text-secondary/70">
                  (한 번 입력하면 다음부터는 자동으로 채워집니다)
                </span>
              </p>

              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

              <ProfileField
                label="이름 *"
                value={myName}
                onChange={setMyName}
                placeholder="홍길동"
              />
              <ProfileField
                label="회사"
                value={myCompany}
                onChange={setMyCompany}
                placeholder="우리회사"
              />
              <ProfileField
                label="직책"
                value={myTitle}
                onChange={setMyTitle}
                placeholder="팀장"
              />
              <ProfileField
                label="이메일 *"
                value={myEmail}
                onChange={setMyEmail}
                placeholder="me@company.com"
                type="email"
              />
              <ProfileField
                label="전화번호"
                value={myPhone}
                onChange={setMyPhone}
                placeholder="010-1234-5678"
                type="tel"
              />

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-text-secondary font-medium border border-border rounded-xl hover:bg-border/30 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleProfileSave}
                  className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {/* ───── 미리보기 단계 ───── */}
          {step === "preview" && (
            <div className="space-y-4">
              {/* 수신자 정보 */}
              <div className="flex items-center gap-3 p-3 bg-primary/[0.05] rounded-xl">
                <div className="w-10 h-10 bg-primary/[0.1] rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {card.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text tracking-tight">
                    {card.name}
                  </p>
                  <p className="text-xs text-text-secondary">{card.email}</p>
                </div>
              </div>

              {/* 이메일 미리보기 */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-surface-2 border-b border-border">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    제목
                  </p>
                  <p className="text-sm font-medium text-text tracking-tight">
                    만나서 반갑습니다 - {myName}
                    {myCompany ? ` (${myCompany})` : ""}
                  </p>
                </div>
                <div className="px-4 py-3 text-sm text-text leading-relaxed whitespace-pre-line bg-white">
                  {`${card.name}님, 안녕하세요.
만나 뵙게 되어 반갑습니다.

제 연락처를 보내드립니다:
- 이름: ${myName}${myCompany ? `\n- 회사: ${myCompany}` : ""}${myTitle ? ` / ${myTitle}` : ""}${myEmail ? `\n- 이메일: ${myEmail}` : ""}${myPhone ? `\n- 전화: ${myPhone}` : ""}

좋은 하루 되세요.
${myName} 드림`}
                </div>
              </div>

              {/* 발신자 안내 */}
              <div className="flex items-start gap-2 text-[12px] text-text-secondary/80 tracking-tight">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 flex-shrink-0 text-primary/70"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>
                  내 Gmail({myEmail || user?.email})에서 발송되고 보낸편지함에도
                  기록됩니다.
                  <br />
                  첫 발송 시 "허용" 팝업이 한 번 뜹니다.
                </span>
              </div>

              {/* 프로필 수정 링크 */}
              <button
                onClick={() => setStep("profile")}
                className="text-[12px] text-primary-light hover:text-primary tracking-tight"
              >
                내 정보 수정하기
              </button>

              {/* 버튼 */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-text-secondary font-medium border border-border rounded-xl hover:bg-border/30 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(27,42,78,0.2)]"
                >
                  보내기
                </button>
              </div>
            </div>
          )}

          {/* ───── 발송 중 ───── */}
          {step === "sending" && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-base font-semibold text-text tracking-tight">
                  발송 중...
                </p>
                <p className="text-[13px] text-text-secondary mt-1 tracking-tight">
                  잠시만 기다려주세요
                </p>
              </div>
            </div>
          )}

          {/* ───── 발송 완료 ───── */}
          {step === "sent" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-14 h-14 bg-primary/[0.08] rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7 text-primary"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text tracking-tight">
                  인사 이메일이 발송되었습니다
                </p>
                <p className="text-[13px] text-text-secondary mt-1 leading-relaxed tracking-tight">
                  {card.name}님께 <b className="text-text">{card.email}</b>로
                  전송했어요.
                  <br />
                  내 Gmail 보낸편지함에서도 확인할 수 있습니다.
                </p>
              </div>
              <button
                onClick={onSent}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all mt-2 shadow-[0_4px_12px_rgba(27,42,78,0.2)]"
              >
                확인
              </button>
            </div>
          )}

          {/* ───── 발송 실패 ───── */}
          {step === "error" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7 text-red-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text tracking-tight">
                  발송 실패
                </p>
                <p className="text-[13px] text-text-secondary mt-1 leading-relaxed tracking-tight">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-text-secondary font-medium border border-border rounded-xl hover:bg-border/30 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={() => setStep("preview")}
                  className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
                >
                  다시 시도
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 프로필 입력 필드 */
function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1 tracking-tight">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  );
}
