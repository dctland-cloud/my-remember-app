/**
 * 홈 페이지
 * - 로그인 전: Google 로그인 버튼 표시
 * - 로그인 후: 사용자 정보와 환영 메시지 표시
 */

"use client";

import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, loading, signIn, signOut } = useAuth();

  // 로딩 중일 때 스켈레톤 UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-12">
      {/* 앱 타이틀 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-text">나만의 리멤버</h1>
        <p className="text-sm text-text-secondary mt-1">
          명함을 촬영하고 한곳에서 관리하세요
        </p>
      </div>

      {user ? (
        /* 로그인된 상태 */
        <div className="max-w-sm mx-auto">
          {/* 사용자 프로필 카드 */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mb-6">
            <div className="flex items-center gap-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="프로필"
                  className="w-14 h-14 rounded-full border-2 border-primary/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {user.displayName?.charAt(0) || "U"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold text-text">
                  {user.displayName || "사용자"}
                </p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>
          </div>

          {/* 빈 상태 안내 */}
          <div className="text-center py-12">
            <div className="text-5xl mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-16 h-16 mx-auto text-text-secondary/40"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <circle cx="8" cy="11" r="2" />
                <path d="M14 9h4" />
                <path d="M14 13h4" />
                <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">
              아직 저장된 명함이 없습니다
            </p>
            <p className="text-text-secondary/60 text-xs mt-1">
              하단의 &lsquo;촬영&rsquo; 버튼으로 명함을 스캔해보세요
            </p>
          </div>

          {/* 로그아웃 버튼 */}
          <button
            onClick={signOut}
            className="w-full py-3 text-sm text-text-secondary border border-border rounded-xl hover:bg-border/30 transition-colors"
          >
            로그아웃
          </button>
        </div>
      ) : (
        /* 비로그인 상태 */
        <div className="max-w-sm mx-auto text-center">
          {/* 앱 아이콘 */}
          <div className="mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-24 h-24 mx-auto text-primary/60"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <circle cx="8" cy="11" r="2" />
              <path d="M14 9h4" />
              <path d="M14 13h4" />
              <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
            </svg>
          </div>

          <p className="text-text-secondary mb-8 text-sm">
            Google 계정으로 간편하게 시작하세요
          </p>

          {/* Google 로그인 버튼 */}
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-border text-text font-medium py-3.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 로그인
          </button>
        </div>
      )}
    </div>
  );
}
