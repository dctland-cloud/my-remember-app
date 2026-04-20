/**
 * 내 디지털 명함 미리보기 페이지 — Apple 스타일 v2
 * - 딥 네이비 풀블리드 명함 카드 (공개 페이지와 동일 디자인)
 * - 공개 URL 인라인 표시 + 복사
 * - 공유하기(Web Share API) + QR 코드 보조 버튼
 * - 설정으로 이동하는 조용한 링크
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, type PublicProfile } from "@/lib/profile";

export default function MyCardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  // 비로그인 시 홈으로 이동
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // 프로필 로드
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const result = await getProfile(user.uid);
        setProfile(result);
      } catch (err) {
        console.error("프로필 로드 실패:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  /** 공개 링크 URL */
  const publicUrl =
    typeof window !== "undefined" && profile?.slug
      ? `${window.location.origin}/p/${profile.slug}`
      : "";

  /** 링크 복사 */
  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = publicUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /** 공유하기 (Web Share API) */
  const handleShare = async () => {
    if (!publicUrl || !profile) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} - 디지털 명함`,
          text: `${profile.name}${profile.company ? ` (${profile.company})` : ""}의 디지털 명함입니다.`,
          url: publicUrl,
        });
      } catch {
        // 사용자가 취소한 경우 무시
      }
    } else {
      handleCopyLink();
    }
  };

  // 로딩 중
  if (authLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  // 프로필이 없는 경우 (첫 방문)
  if (!profile) {
    return (
      <div className="px-5 pt-14 max-w-lg mx-auto">
        <div className="text-center py-16">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-16 h-16 mx-auto text-text-secondary/40 mb-4"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <circle cx="8" cy="11" r="2" />
            <path d="M14 9h4" />
            <path d="M14 13h4" />
            <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
          </svg>
          <h2 className="text-lg font-bold text-text mb-2">
            아직 디지털 명함이 없습니다
          </h2>
          <p className="text-sm text-text-secondary mb-6 leading-relaxed">
            설정에서 내 정보를 입력하면
            <br />
            나만의 디지털 명함이 만들어집니다.
          </p>
          <button
            onClick={() => router.push("/settings")}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(27,42,78,0.2)]"
          >
            설정에서 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-24 max-w-lg mx-auto">
      {/* 헤더 (좌측 정렬, 작은 라벨 + 큰 타이틀) */}
      <header className="mb-6">
        <div className="text-[13px] font-medium text-text-secondary/80 uppercase tracking-wider">
          내 디지털 명함
        </div>
        <h1 className="text-[28px] font-bold text-text tracking-tight mt-1">
          이렇게 보여요
        </h1>
        <p className="text-[14px] text-text-secondary/80 mt-1 leading-relaxed tracking-tight">
          링크로 공유하면 상대방에게 이 모습으로 보입니다
        </p>
      </header>

      {/* ───── 네이비 풀블리드 명함 카드 ───── */}
      <div
        className="relative overflow-hidden rounded-[20px] bg-primary text-white px-6 py-7 shadow-[0_16px_40px_rgba(27,42,78,0.3)]"
      >
        {/* 배경 장식 원 */}
        <div className="absolute -right-10 -top-10 w-[180px] h-[180px] rounded-full bg-white/[0.04]" />
        <div className="absolute right-8 -bottom-16 w-[120px] h-[120px] rounded-full bg-white/[0.03]" />

        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.15em] text-white/55 mb-1">
            나만의 리멤버
          </div>
          <div className="text-[26px] font-bold tracking-tight mt-3">
            {profile.name}
          </div>
          {(profile.company || profile.title) && (
            <div className="text-[14px] text-white/75 mt-0.5 tracking-tight">
              {profile.title}
              {profile.title && profile.company && " · "}
              {profile.company}
            </div>
          )}

          {(profile.email || profile.phone) && (
            <div className="mt-7 pt-[18px] border-t border-white/15 flex flex-col gap-2.5">
              {profile.email && (
                <div className="flex items-center gap-2.5 text-[13px] text-white/85 tracking-tight">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {profile.email}
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-2.5 text-[13px] text-white/85 tracking-tight">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {profile.phone}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───── 공개 URL 칩 ───── */}
      {publicUrl && (
        <button
          onClick={handleCopyLink}
          className="mt-4 w-full flex items-center gap-2.5 bg-surface border border-border/70 rounded-xl px-3.5 py-3 hover:bg-surface-2 active:scale-[0.99] transition-all"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary/80">
            URL
          </span>
          <span className="flex-1 text-[12px] font-mono text-primary truncate text-left">
            {publicUrl.replace(/^https?:\/\//, "")}
          </span>
          {copied ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      )}

      {/* ───── 액션 버튼 (공유하기 + QR 코드) ───── */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold tracking-tight hover:bg-primary-dark active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(27,42,78,0.2)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          공유하기
        </button>
        <button
          onClick={() => setQrOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-3 bg-surface border border-border/70 rounded-xl text-[14px] font-medium text-text tracking-tight hover:bg-surface-2 active:scale-[0.98] transition-all"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9a9 9 0 1 0 9-9" />
            <polyline points="3 4 3 9 8 9" />
          </svg>
          QR 코드
        </button>
      </div>

      {/* ───── 설정 링크 (조용하게) ───── */}
      <button
        onClick={() => router.push("/settings")}
        className="w-full mt-7 text-center text-[14px] font-medium text-primary-light tracking-tight hover:text-primary transition-colors"
      >
        설정에서 내 정보 편집
      </button>

      {/* ───── QR 코드 모달 ───── */}
      {qrOpen && publicUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6 modal-overlay bg-black/40"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-xs w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary mb-2">
                QR 코드
              </div>
              <h3 className="text-[17px] font-bold text-text mb-4">
                이 코드를 스캔하세요
              </h3>
              {/* QR 이미지 — 외부 서비스로 생성 (네트워크 없으면 공백) */}
              <div className="bg-white border border-border rounded-xl p-4 mb-4 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(publicUrl)}&margin=10&color=1B2A4E`}
                  alt="QR 코드"
                  width={240}
                  height={240}
                  className="w-full max-w-[240px] h-auto"
                />
              </div>
              <p className="text-[12px] font-mono text-text-secondary break-all mb-4">
                {publicUrl.replace(/^https?:\/\//, "")}
              </p>
              <button
                onClick={() => setQrOpen(false)}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-[14px] tracking-tight hover:bg-primary-dark active:scale-[0.98] transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
