/**
 * 설정 페이지
 * - 내 프로필 정보 편집 (이름, 회사, 직책, 이메일, 전화, slug)
 * - CSV 내보내기 (저장된 명함을 CSV 파일로 다운로드)
 * - 디지털 명함 미리보기 링크
 * - 로그아웃
 * - 로그인 필수 페이지입니다.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  getProfile,
  saveProfile,
  generateSlug,
  type PublicProfile,
} from "@/lib/profile";
import { getCards } from "@/lib/cards";
import type { CardData } from "@/types/card";
import { getCardTags } from "@/types/card";

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // 프로필 폼 상태
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // CSV 내보내기 상태
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState("");

  // 비로그인 시 홈으로 이동
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // 기존 프로필 로드
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const existing = await getProfile(user.uid);
        if (existing) {
          setName(existing.name);
          setCompany(existing.company);
          setTitle(existing.title);
          setEmail(existing.email);
          setPhone(existing.phone);
          setSlug(existing.slug);
        } else {
          // 새 사용자: slug 자동 생성
          setSlug(generateSlug());
          // Google 계정에서 이름/이메일 가져오기
          if (user.displayName) setName(user.displayName);
          if (user.email) setEmail(user.email);
        }
      } catch (err) {
        console.error("프로필 로드 실패:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  /** 프로필 저장 */
  const handleSave = async () => {
    if (!user) return;

    if (!name.trim()) {
      setSaveError("이름은 필수입니다.");
      return;
    }
    if (!slug.trim()) {
      setSaveError("slug(공개 주소)는 필수입니다.");
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const profile: PublicProfile = {
        name: name.trim(),
        company: company.trim(),
        title: title.trim(),
        email: email.trim(),
        phone: phone.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
      };
      await saveProfile(user.uid, profile);
      // slug가 정규화된 값으로 업데이트될 수 있으므로 반영
      setSlug(profile.slug);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("프로필 저장 실패:", err);
      setSaveError("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  /** slug 재생성 */
  const handleRegenerateSlug = () => {
    setSlug(generateSlug());
  };

  /** CSV 내보내기 — 저장된 명함 전체를 CSV 파일로 다운로드 */
  const handleExportCSV = async () => {
    if (!user) return;

    setExporting(true);
    setExportError("");
    setExportSuccess(false);

    try {
      const cards: CardData[] = await getCards(user.uid);

      if (cards.length === 0) {
        setExportError("내보낼 명함이 없습니다.");
        setExporting(false);
        return;
      }

      // CSV 헤더 정의
      const headers = [
        "이름",
        "회사",
        "직책",
        "이메일",
        "전화",
        "주소",
        "메모",
        "기억키워드",
        "저장일",
      ];

      // CSV 행 생성 — 키워드는 세미콜론 구분, 레거시 metAt도 자동 포함
      const rows = cards.map((card) => [
        escapeCSV(card.name),
        escapeCSV(card.company),
        escapeCSV(card.title),
        escapeCSV(card.email),
        escapeCSV(card.phone),
        escapeCSV(card.address),
        escapeCSV(card.memo),
        escapeCSV(getCardTags(card).join("; ")),
        escapeCSV(
          card.createdAt
            ? new Date(card.createdAt).toLocaleDateString("ko-KR")
            : ""
        ),
      ]);

      // CSV 문자열 생성 (BOM 추가로 한글 깨짐 방지)
      const bom = "\uFEFF";
      const csvContent =
        bom +
        headers.join(",") +
        "\n" +
        rows.map((row) => row.join(",")).join("\n");

      // 파일 다운로드
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `나만의리멤버_명함목록_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("CSV 내보내기 실패:", err);
      setExportError("내보내기에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setExporting(false);
    }
  };

  /** CSV 특수문자 이스케이프 — 쉼표, 줄바꿈, 따옴표를 처리 */
  function escapeCSV(value: string): string {
    if (!value) return '""';
    // 쉼표, 줄바꿈, 따옴표가 있으면 따옴표로 감싸기
    if (
      value.includes(",") ||
      value.includes("\n") ||
      value.includes('"')
    ) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  }

  /** 공개 URL */
  const publicUrl =
    typeof window !== "undefined" && slug
      ? `${window.location.origin}/p/${slug}`
      : "";

  // 로딩 중
  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-text text-center mb-6">설정</h1>

      {/* ───── 내 정보 편집 섹션 ───── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-text mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-primary"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          내 정보 편집
        </h2>

        <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
          <SettingsField
            label="이름 *"
            value={name}
            onChange={setName}
            placeholder="홍길동"
          />
          <SettingsField
            label="회사"
            value={company}
            onChange={setCompany}
            placeholder="우리회사"
          />
          <SettingsField
            label="직책"
            value={title}
            onChange={setTitle}
            placeholder="팀장"
          />
          <SettingsField
            label="이메일"
            value={email}
            onChange={setEmail}
            placeholder="me@company.com"
            type="email"
          />
          <SettingsField
            label="전화번호"
            value={phone}
            onChange={setPhone}
            placeholder="010-1234-5678"
            type="tel"
          />

          {/* Slug 필드 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              공개 주소 (slug)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="my-card"
                className="flex-1 px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
              />
              <button
                onClick={handleRegenerateSlug}
                className="px-3 py-2.5 text-xs text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors flex-shrink-0"
              >
                새로 생성
              </button>
            </div>
            <p className="text-xs text-text-secondary/70 mt-1">
              영문 소문자, 숫자, 하이픈만 사용 가능
            </p>
          </div>

          {/* 에러/성공 메시지 */}
          {saveError && (
            <p className="text-sm text-red-500">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-sm text-green-600">저장되었습니다!</p>
          )}

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </section>

      {/* ───── 디지털 명함 미리보기 섹션 ───── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-text mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-primary"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <circle cx="8" cy="11" r="2" />
            <path d="M14 9h4" />
            <path d="M14 13h4" />
            <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
          </svg>
          디지털 명함
        </h2>

        <div className="bg-surface rounded-xl border border-border p-4">
          {publicUrl ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-secondary mb-1">공개 링크</p>
                <p className="text-sm text-primary font-mono break-all">
                  {publicUrl}
                </p>
              </div>
              <button
                onClick={() => router.push("/mycard")}
                className="w-full py-2.5 text-sm text-primary font-medium border border-primary/30 rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all"
              >
                명함 미리보기
              </button>
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-2">
              위에서 정보를 저장하면 디지털 명함이 생성됩니다.
            </p>
          )}
        </div>
      </section>

      {/* ───── 데이터 내보내기 섹션 ───── */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-text mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-primary"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          데이터 내보내기
        </h2>

        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-secondary mb-3">
            저장된 명함 목록을 CSV 파일로 다운로드합니다.
            <br />
            <span className="text-xs text-text-secondary/70">
              다운받은 CSV는 Google Sheets, Excel에서 바로 열 수 있습니다.
            </span>
          </p>

          {exportError && (
            <p className="text-sm text-red-500 mb-2">{exportError}</p>
          )}
          {exportSuccess && (
            <p className="text-sm text-green-600 mb-2">
              CSV 파일이 다운로드되었습니다!
            </p>
          )}

          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                내보내는 중...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                CSV로 내보내기
              </>
            )}
          </button>
        </div>
      </section>

      {/* ───── 로그아웃 ───── */}
      <button
        onClick={signOut}
        className="w-full py-3 text-sm text-text-secondary border border-border rounded-xl hover:bg-border/30 transition-colors"
      >
        로그아웃
      </button>
    </div>
  );
}

/** 설정 폼 입력 필드 컴포넌트 */
function SettingsField({
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
        className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  );
}
