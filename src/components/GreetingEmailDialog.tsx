/**
 * 인사 이메일 발송 대화상자 컴포넌트
 * - 발송 전 이메일 미리보기를 보여줍니다.
 * - 내 프로필이 없으면 입력 폼을 먼저 보여줍니다.
 * - 발송 중 로딩, 성공/실패 피드백을 제공합니다.
 */

"use client";

import { useState, useEffect } from "react";
import {
  sendGreetingEmail,
  isEmailJSConfigured,
  getMyProfile,
  saveMyProfile,
  type GreetingEmailParams,
} from "@/lib/emailjs";
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
type DialogStep = "profile" | "preview" | "sending" | "success" | "error";

export default function GreetingEmailDialog({
  card,
  onClose,
  onSent,
}: GreetingEmailDialogProps) {
  const [step, setStep] = useState<DialogStep>("preview");
  const [errorMsg, setErrorMsg] = useState("");

  // 내 프로필 (localStorage에서 불러옴)
  const [myName, setMyName] = useState("");
  const [myCompany, setMyCompany] = useState("");
  const [myTitle, setMyTitle] = useState("");
  const [myEmail, setMyEmail] = useState("");
  const [myPhone, setMyPhone] = useState("");

  // slug 상태 (디지털 명함 공개 링크용)
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
    } else {
      // 프로필이 없으면 입력부터
      setStep("profile");
    }
  }, []);

  /** 프로필 저장 후 미리보기로 이동 */
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

  /** 이메일 발송 실행 */
  const handleSend = async () => {
    if (!isEmailJSConfigured()) {
      setErrorMsg(
        "이메일 서비스가 설정되지 않았습니다. 관리자에게 문의해주세요."
      );
      setStep("error");
      return;
    }

    setStep("sending");
    setErrorMsg("");

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

    const success = await sendGreetingEmail(params);

    if (success) {
      setStep("success");
      // 1.5초 후 자동으로 닫기
      setTimeout(() => {
        onSent();
      }, 1500);
    } else {
      setErrorMsg("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-end sm:items-center justify-center modal-overlay">
      <div className="bg-surface rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-text">
            {step === "profile"
              ? "내 프로필 설정"
              : step === "success"
              ? "발송 완료"
              : "인사 이메일 보내기"}
          </h3>
          {step !== "sending" && step !== "success" && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text p-1"
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
              <p className="text-sm text-text-secondary">
                인사 이메일에 포함될 내 정보를 입력해주세요.
                <br />
                <span className="text-xs text-text-secondary/70">
                  (한 번 입력하면 다음부터는 자동으로 채워집니다)
                </span>
              </p>

              {errorMsg && (
                <p className="text-sm text-red-500">{errorMsg}</p>
              )}

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
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {card.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-text">
                    {card.name}
                  </p>
                  <p className="text-xs text-text-secondary">{card.email}</p>
                </div>
              </div>

              {/* 이메일 미리보기 */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-surface border-b border-border">
                  <p className="text-xs text-text-secondary">제목</p>
                  <p className="text-sm font-medium text-text">
                    만나서 반갑습니다 - {myName} ({myCompany || "회사명"})
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

              {/* 프로필 수정 링크 */}
              <button
                onClick={() => setStep("profile")}
                className="text-xs text-primary hover:underline"
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
                  className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
                >
                  보내기
                </button>
              </div>
            </div>
          )}

          {/* ───── 발송 중 ───── */}
          {step === "sending" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-sm text-text-secondary">
                이메일을 발송하고 있습니다...
              </p>
            </div>
          )}

          {/* ───── 발송 성공 ───── */}
          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7 text-green-600"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-text">
                  인사 이메일이 발송되었습니다
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {card.name}님에게 이메일을 보냈습니다.
                </p>
              </div>
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
                <p className="text-base font-semibold text-text">발송 실패</p>
                <p className="text-sm text-text-secondary mt-1">{errorMsg}</p>
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
      <label className="block text-sm font-medium text-text mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  );
}
