/**
 * 명함 스캔 페이지
 * - 1단계: 카메라 촬영 또는 갤러리에서 명함 이미지 선택
 * - 2단계: 이미지를 압축 후 Gemini AI에 보내 명함 정보 자동 추출
 * - 3단계: AI가 읽어낸 결과를 폼에 채워 보여주고 사용자가 확인/수정
 * - 4단계: 중복 체크 후 Firestore에 저장
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { compressForApi, generateThumbnail } from "@/lib/image-utils";
import { saveCard, updateCard, checkDuplicate } from "@/lib/cards";
import CameraCapture from "@/components/CameraCapture";
import DuplicateDialog from "@/components/DuplicateDialog";
import GreetingEmailDialog from "@/components/GreetingEmailDialog";
import type { DuplicateChoice } from "@/components/DuplicateDialog";
import type { OcrResult, CardData } from "@/types/card";

/** 페이지 진행 단계 */
type Step = "capture" | "analyzing" | "edit";

export default function ScanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 상태 관리
  const [step, setStep] = useState<Step>("capture");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [thumbnailBase64, setThumbnailBase64] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 중복 체크 관련 상태
  const [duplicateCard, setDuplicateCard] = useState<CardData | null>(null);

  // 저장 후 이메일 발송 제안 관련 상태
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [savedCardForEmail, setSavedCardForEmail] = useState<CardData | null>(null);

  // 폼 데이터
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [metAt, setMetAt] = useState("");

  // 로그인 확인 (비로그인 시 홈으로 이동)
  if (!loading && !user) {
    router.push("/");
    return null;
  }

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  /** 사진 선택/촬영 후 처리 */
  const handleCapture = async (file: File) => {
    setError("");
    setStep("analyzing");

    // 선택된 사진의 미리보기 URL 생성
    setPreviewUrl(URL.createObjectURL(file));

    try {
      // 이미지 압축 (API용 1MB, 썸네일 50KB) 동시 실행
      const [apiBase64, thumbnail] = await Promise.all([
        compressForApi(file),
        generateThumbnail(file),
      ]);

      setThumbnailBase64(thumbnail);

      // Gemini API로 명함 분석 요청
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: apiBase64,
          mimeType: file.type || "image/jpeg",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || "명함 인식에 실패했습니다."
        );
      }

      const result: OcrResult = await response.json();

      // AI 결과를 폼에 채움
      setName(result.name);
      setCompany(result.company);
      setTitle(result.title);
      setEmail(result.email);
      setPhone(result.phone);
      setAddress(result.address);
      setStep("edit");
    } catch (err) {
      console.error("명함 분석 오류:", err);
      setError(
        err instanceof Error
          ? err.message
          : "명함 인식 중 오류가 발생했습니다."
      );
      setStep("capture");
    }
  };

  /** 성공 메시지를 잠깐 보여주고 홈으로 이동 */
  const showSuccessAndNavigate = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  /** 저장 버튼 클릭 — 중복 체크 후 Firestore에 저장 */
  const handleSave = async () => {
    setSaving(true);

    try {
      // 먼저 중복 체크
      const existing = await checkDuplicate(user!.uid, {
        email,
        phone,
        name,
        company,
      });

      if (existing) {
        // 중복 발견 — 대화상자 표시
        setDuplicateCard(existing);
        setSaving(false);
        return;
      }

      // 중복 없음 — 바로 저장
      await performSave();
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  /** 실제 Firestore 저장 실행 */
  const performSave = async () => {
    const cardData = {
      userId: user!.uid,
      name,
      company,
      title,
      email,
      phone,
      address,
      memo,
      metAt,
      thumbnailBase64,
      greetingEmailSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedId = await saveCard(cardData);
    setSaving(false);

    // 이메일이 있으면 인사 이메일 발송 제안
    if (email.trim()) {
      setSavedCardForEmail({ ...cardData, id: savedId });
      setShowEmailPrompt(true);
    } else {
      showSuccessAndNavigate("명함이 저장되었습니다");
    }
  };

  /** 중복 대화상자에서 사용자 선택 처리 */
  const handleDuplicateChoice = async (choice: DuplicateChoice) => {
    setDuplicateCard(null);

    if (choice === "cancel") {
      // 취소 — 편집 폼으로 돌아감
      return;
    }

    setSaving(true);
    try {
      if (choice === "update" && duplicateCard?.id) {
        // 기존 명함 업데이트
        await updateCard(duplicateCard.id, {
          name,
          company,
          title,
          email,
          phone,
          address,
          memo,
          metAt,
          thumbnailBase64,
        });
        setSaving(false);
        showSuccessAndNavigate("명함이 업데이트되었습니다");
      } else {
        // 새로 저장
        await performSave();
      }
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  /** 폼 초기화 */
  const resetForm = () => {
    setStep("capture");
    setPreviewUrl("");
    setThumbnailBase64("");
    setName("");
    setCompany("");
    setTitle("");
    setEmail("");
    setPhone("");
    setAddress("");
    setMemo("");
    setMetAt("");
    setError("");
  };

  return (
    <div className="px-4 pt-8 pb-4 max-w-lg mx-auto">
      {/* 성공 메시지 토스트 */}
      {successMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg animate-toast">
          {successMsg}
        </div>
      )}

      {/* 중복 명함 발견 대화상자 */}
      {duplicateCard && (
        <DuplicateDialog
          existingCard={duplicateCard}
          onChoice={handleDuplicateChoice}
        />
      )}

      {/* 저장 후 인사 이메일 발송 제안 */}
      {showEmailPrompt && savedCardForEmail && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 modal-overlay">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-xs p-6 animate-scale-in">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-green-600"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-text text-center mb-2">
              명함이 저장되었습니다
            </h3>
            <p className="text-sm text-text-secondary text-center mb-6">
              {savedCardForEmail.name}님에게
              <br />
              인사 이메일을 보내시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowEmailPrompt(false);
                  setSavedCardForEmail(null);
                  showSuccessAndNavigate("명함이 저장되었습니다");
                }}
                className="flex-1 py-2.5 text-text-secondary font-medium border border-border rounded-xl hover:bg-border/30 transition-colors"
              >
                나중에
              </button>
              <button
                onClick={() => {
                  setShowEmailPrompt(false);
                  setShowEmailDialog(true);
                }}
                className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
              >
                보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인사 이메일 발송 대화상자 */}
      {showEmailDialog && savedCardForEmail && (
        <GreetingEmailDialog
          card={savedCardForEmail}
          onClose={() => {
            setShowEmailDialog(false);
            setSavedCardForEmail(null);
            showSuccessAndNavigate("명함이 저장되었습니다");
          }}
          onSent={async () => {
            setShowEmailDialog(false);
            // Firestore에 발송 완료 기록
            if (savedCardForEmail.id) {
              try {
                await updateCard(savedCardForEmail.id, {
                  greetingEmailSent: true,
                });
              } catch (err) {
                console.error("발송 상태 업데이트 실패:", err);
              }
            }
            setSavedCardForEmail(null);
            showSuccessAndNavigate("인사 이메일이 발송되었습니다");
          }}
        />
      )}

      {/* 페이지 제목 */}
      <h1 className="text-xl font-bold text-text mb-6 text-center">
        명함 스캔
      </h1>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* ───── 1단계: 촬영/선택 ───── */}
      {step === "capture" && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center text-text-secondary text-sm mb-2">
            명함을 촬영하거나 사진을 선택하세요
          </div>

          {/* 가이드 일러스트 */}
          <div className="w-64 h-40 bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-text-secondary/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-12 h-12"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <circle cx="8" cy="11" r="2" />
              <path d="M14 9h4" />
              <path d="M14 13h4" />
              <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
            </svg>
            <span className="text-xs">명함을 여기에 비춰주세요</span>
          </div>

          <CameraCapture onCapture={handleCapture} />
        </div>
      )}

      {/* ───── 2단계: AI 분석 중 ───── */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center gap-6 py-12">
          {/* 촬영한 이미지 미리보기 */}
          {previewUrl && (
            <img
              src={previewUrl}
              alt="촬영한 명함"
              className="w-64 h-auto rounded-xl shadow-md border border-border"
            />
          )}

          {/* 로딩 애니메이션 */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-text-secondary text-sm animate-pulse">
              AI가 명함을 분석하고 있습니다...
            </p>
          </div>
        </div>
      )}

      {/* ───── 3단계: 결과 편집 폼 ───── */}
      {step === "edit" && (
        <div className="space-y-5">
          {/* 썸네일 미리보기 */}
          {thumbnailBase64 && (
            <div className="flex justify-center mb-4">
              <img
                src={thumbnailBase64}
                alt="명함 썸네일"
                className="w-48 h-auto rounded-xl shadow-sm border border-border"
              />
            </div>
          )}

          <p className="text-sm text-text-secondary text-center mb-4">
            AI가 인식한 결과를 확인하고 수정해주세요
          </p>

          {/* 폼 필드들 */}
          <div className="space-y-4">
            <FormField label="이름" value={name} onChange={setName} placeholder="홍길동" />
            <FormField label="회사" value={company} onChange={setCompany} placeholder="삼성전자" />
            <FormField label="직책" value={title} onChange={setTitle} placeholder="팀장" />
            <FormField label="이메일" value={email} onChange={setEmail} placeholder="hong@company.com" type="email" />
            <FormField label="전화" value={phone} onChange={setPhone} placeholder="010-1234-5678" type="tel" />
            <FormField label="주소" value={address} onChange={setAddress} placeholder="서울시 강남구..." />

            {/* 구분선 */}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-text-secondary mb-3">추가 정보 (선택)</p>
            </div>

            <FormField label="메모" value={memo} onChange={setMemo} placeholder="AI 프로젝트 협업 논의" />
            <FormField label="만난 장소" value={metAt} onChange={setMetAt} placeholder="CES 2026" />
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-3.5 text-text-secondary bg-surface border border-border rounded-xl font-medium hover:bg-border/30 transition-colors"
            >
              다시 촬영
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 text-white bg-primary rounded-xl font-semibold shadow-md hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** 개별 입력 필드 컴포넌트 */
function FormField({
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
      <label className="block text-sm font-medium text-text mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  );
}
