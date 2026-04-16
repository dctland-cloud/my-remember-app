/**
 * 공개 디지털 명함 페이지 — 인증 불필요
 * - 누구나 /p/[slug] 주소로 접근하여 명함 정보를 볼 수 있습니다.
 * - 인사 이메일에 포함되는 링크의 도착 페이지입니다.
 * - 이메일(mailto:)과 전화(tel:) 클릭이 가능합니다.
 * - slug가 존재하지 않으면 404 메시지를 표시합니다.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicProfile, type PublicProfile } from "@/lib/profile";

export default function PublicCardPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const result = await getPublicProfile(slug);
        if (result) {
          setProfile(result);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("프로필 로드 실패:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  // 로딩 중
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  // 찾을 수 없음 (404)
  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-16 h-16 text-text-secondary/30 mb-4"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="12" y2="14" />
        </svg>
        <h1 className="text-xl font-bold text-text mb-2">
          명함을 찾을 수 없습니다
        </h1>
        <p className="text-sm text-text-secondary text-center">
          이 주소의 디지털 명함이 존재하지 않거나
          <br />
          삭제되었을 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* 명함 카드 */}
        <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* 상단 컬러 그라데이션 */}
          <div className="h-24 bg-gradient-to-r from-primary to-blue-400 relative">
            {/* 장식 원형 패턴 */}
            <div className="absolute top-4 right-6 w-16 h-16 border-2 border-white/20 rounded-full" />
            <div className="absolute top-8 right-2 w-8 h-8 border-2 border-white/10 rounded-full" />
          </div>

          {/* 프로필 영역 */}
          <div className="px-6 pb-8 -mt-8">
            {/* 아바타 */}
            <div className="w-16 h-16 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-primary font-bold text-2xl mb-4">
              {profile.name.charAt(0)}
            </div>

            {/* 이름 */}
            <h1 className="text-2xl font-bold text-text">{profile.name}</h1>

            {/* 회사 / 직책 */}
            {(profile.company || profile.title) && (
              <p className="text-base text-text-secondary mt-1">
                {profile.company}
                {profile.company && profile.title && " | "}
                {profile.title}
              </p>
            )}

            {/* 구분선 */}
            <div className="border-t border-border my-5" />

            {/* 연락처 정보 */}
            <div className="space-y-3">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-blue-600"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">이메일</p>
                    <p className="text-sm text-text group-hover:text-primary transition-colors">
                      {profile.email}
                    </p>
                  </div>
                </a>
              )}

              {profile.phone && (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4 text-green-600"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">전화</p>
                    <p className="text-sm text-text group-hover:text-primary transition-colors">
                      {profile.phone}
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 하단 브랜딩 */}
        <p className="text-center text-xs text-text-secondary/50 mt-4">
          나만의 리멤버로 만든 디지털 명함
        </p>
      </div>
    </div>
  );
}
