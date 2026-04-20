/**
 * 설정 페이지 — Apple 스타일 v2
 * - 섹션 기반 구조: 내 정보 / 공개 주소 / 데이터 / 계정
 * - 네이비 섹션 라벨 (시각적 리듬)
 * - 저장 / 새로생성 등 핵심 액션만 네이비로 강조
 * - CSV 내보내기는 iOS Settings 스타일 행 카드로 통합
 * - 로그아웃은 "계정" 섹션 안으로
 */

"use client";

import { useEffect, useState, ReactNode } from "react";
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
          setSlug(generateSlug());
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
      setSaveError("공개 주소(slug)는 필수입니다.");
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

  /** CSV 내보내기 */
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
      const bom = "\uFEFF";
      const csvContent =
        bom +
        headers.join(",") +
        "\n" +
        rows.map((row) => row.join(",")).join("\n");
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

  /** CSV 특수문자 이스케이프 */
  function escapeCSV(value: string): string {
    if (!value) return '""';
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
    <div className="px-4 pt-14 pb-24 max-w-lg mx-auto">
      {/* 헤더 (홈과 같은 어법: 작은 라벨 + 큰 타이틀) */}
      <header className="mb-6 px-1">
        <div className="text-[13px] font-medium text-text-secondary/80 uppercase tracking-wider">
          설정
        </div>
        <h1 className="text-[28px] font-bold text-text tracking-tight mt-1">
          내 정보 · 데이터
        </h1>
      </header>

      {/* ───── 내 정보 섹션 ───── */}
      <Section title="내 정보">
        <Field
          label="이름"
          value={name}
          onChange={setName}
          placeholder="홍길동"
          required
        />
        <Field
          label="회사"
          value={company}
          onChange={setCompany}
          placeholder="우리회사"
        />
        <Field
          label="직책"
          value={title}
          onChange={setTitle}
          placeholder="팀장"
        />
        <Field
          label="이메일"
          value={email}
          onChange={setEmail}
          placeholder="me@company.com"
          type="email"
        />
        <Field
          label="전화"
          value={phone}
          onChange={setPhone}
          placeholder="010-1234-5678"
          type="tel"
        />
      </Section>

      {/* ───── 공개 주소 섹션 ───── */}
      <Section title="공개 주소">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">
            Slug
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              placeholder="my-card"
              className="flex-1 px-3.5 py-2.5 bg-surface border border-border/70 rounded-[10px] text-[14px] text-primary font-mono tracking-tight placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              onClick={handleRegenerateSlug}
              className="px-3.5 py-2.5 text-[12px] font-medium text-primary border border-primary/25 rounded-[10px] hover:bg-primary/5 active:scale-[0.98] transition-all flex-shrink-0 tracking-tight"
            >
              새로 생성
            </button>
          </div>
          <p className="text-[11px] text-text-secondary/70 mt-1.5 tracking-tight">
            영문 소문자, 숫자, 하이픈만
          </p>
        </div>

        {/* URL 프리뷰 */}
        {publicUrl && (
          <div className="px-3.5 py-3 bg-primary/[0.05] rounded-[10px] text-[12px] font-mono text-primary-light tracking-tight break-all">
            {publicUrl.replace(/^https?:\/\//, "")}
          </div>
        )}
      </Section>

      {/* ───── 에러/성공 메시지 ───── */}
      {saveError && (
        <p className="text-sm text-red-500 mb-3 px-1">{saveError}</p>
      )}
      {saveSuccess && (
        <p className="text-sm text-green-600 mb-3 px-1">저장되었습니다!</p>
      )}

      {/* ───── 저장 버튼 (네이비 강조) ───── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3.5 bg-primary text-white rounded-xl text-[15px] font-semibold tracking-tight hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_4px_12px_rgba(27,42,78,0.2)] mb-7"
      >
        {saving ? "저장 중..." : "저장"}
      </button>

      {/* ───── 디지털 명함 미리보기 행 (데이터 섹션 위) ───── */}
      {publicUrl && (
        <Section title="디지털 명함">
          <RowCard
            icon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <circle cx="8" cy="11" r="2" />
                <path d="M14 9h4" />
                <path d="M14 13h4" />
                <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
              </svg>
            }
            title="내 명함 미리보기"
            subtitle="공유 화면으로 이동"
            onClick={() => router.push("/mycard")}
          />
        </Section>
      )}

      {/* ───── 데이터 섹션 ───── */}
      <Section title="데이터">
        {exportError && (
          <p className="text-sm text-red-500 px-1">{exportError}</p>
        )}
        {exportSuccess && (
          <p className="text-sm text-green-600 px-1">
            CSV 파일이 다운로드되었습니다!
          </p>
        )}
        <RowCard
          icon={
            exporting ? (
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )
          }
          title="CSV로 내보내기"
          subtitle={
            exporting ? "내보내는 중..." : "저장한 모든 명함 다운로드"
          }
          onClick={handleExportCSV}
          disabled={exporting}
        />
      </Section>

      {/* ───── 계정 섹션 (로그아웃 포함) ───── */}
      <Section title="계정">
        <button
          onClick={signOut}
          className="w-full px-4 py-3.5 bg-surface border border-border/60 rounded-xl text-[15px] font-medium text-text-secondary tracking-tight hover:bg-surface-2 active:scale-[0.99] transition-all text-center"
        >
          로그아웃
        </button>
      </Section>
    </div>
  );
}

/* ─── 섹션 컨테이너 (네이비 라벨) ─── */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-bold text-primary uppercase tracking-wider px-1 pb-2.5">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

/* ─── 섹션 안 입력 필드 (iOS Settings 톤) ─── */
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary/80 mb-1.5">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-surface border border-border/70 rounded-[10px] text-[15px] text-text tracking-tight placeholder-text-secondary/45 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  );
}

/* ─── iOS Settings 스타일 행 카드 ─── */
function RowCard({
  icon,
  title,
  subtitle,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface border border-border/60 rounded-xl hover:bg-surface-2 active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none"
    >
      <div className="w-8 h-8 rounded-lg bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[15px] font-medium text-text tracking-tight">
          {title}
        </div>
        {subtitle && (
          <div className="text-[12px] text-text-secondary/80 mt-0.5 tracking-tight truncate">
            {subtitle}
          </div>
        )}
      </div>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-text-secondary/40 flex-shrink-0"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
