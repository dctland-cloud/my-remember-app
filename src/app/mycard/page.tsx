/**
 * 내 디지털 명함 미리보기 페이지
 * - 내 공개 명함이 다른 사람에게 어떻게 보이는지 미리 확인합니다.
 * - 공개 링크 복사, 공유하기 기능을 제공합니다.
 * - 설정 페이지로 이동하여 정보를 수정할 수 있습니다.
 * - 로그인 필수 페이지입니다.
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
      // fallback
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
          text: `${profile.name} (${profile.company})의 디지털 명함입니다.`,
          url: publicUrl,
        });
      } catch {
        // 사용자가 취소한 경우 무시
      }
    } else {
      // Web Share API 미지원 시 링크 복사로 대체
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

  // 프로필이 없는 경우
  if (!profile) {
    return (
      <div className="px-4 pt-12 max-w-lg mx-auto">
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
          <p className="text-sm text-text-secondary mb-6">
            설정에서 내 정보를 입력하면
            <br />
            나만의 디지털 명함이 만들어집니다.
          </p>
          <button
            onClick={() => router.push("/settings")}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
          >
            설정에서 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-8 pb-4 max-w-lg mx-auto">
      {/* 페이지 타이틀 */}
      <h1 className="text-xl font-bold text-text text-center mb-6">
        내 디지털 명함
      </h1>

      {/* 명함 카드 미리보기 */}
      <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden mb-6">
        {/* 상단 컬러 바 */}
        <div className="h-20 bg-gradient-to-r from-primary to-blue-400" />

        {/* 프로필 정보 */}
        <div className="px-6 pb-6 -mt-6">
          {/* 아바타 */}
          <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-primary font-bold text-xl mb-4">
            {profile.name.charAt(0)}
          </div>

          <h2 className="text-2xl font-bold text-text">{profile.name}</h2>
          {(profile.company || profile.title) && (
            <p className="text-sm text-text-secondary mt-1">
              {profile.company}
              {profile.company && profile.title && " | "}
              {profile.title}
            </p>
          )}

          {/* 연락처 */}
          <div className="mt-4 space-y-2">
            {profile.email && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4 text-primary/70"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {profile.email}
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4 text-primary/70"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {profile.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 공개 URL 표시 */}
      {publicUrl && (
        <div className="bg-surface rounded-xl border border-border p-3 mb-4">
          <p className="text-xs text-text-secondary mb-1">공개 링크</p>
          <p className="text-sm text-primary font-mono break-all">{publicUrl}</p>
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-text hover:bg-border/30 active:scale-[0.98] transition-all"
        >
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
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {copied ? "복사됨!" : "링크 복사"}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all"
        >
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
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          공유하기
        </button>
      </div>

      {/* 설정으로 이동 */}
      <button
        onClick={() => router.push("/settings")}
        className="w-full py-3 text-sm text-text-secondary border border-border rounded-xl hover:bg-border/30 transition-colors"
      >
        내 정보 수정하기
      </button>
    </div>
  );
}
