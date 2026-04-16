/**
 * 홈 페이지 — 명함 목록
 * - 로그인 전: Google 로그인 버튼 표시
 * - 로그인 후: 저장된 명함 목록을 검색/필터와 함께 표시
 * - 검색: 이름, 회사, 직책에서 검색
 * - 필터: "만난 장소(metAt)"별 필터 칩
 */

"use client";

import { useAuth } from "@/lib/auth";
import { getCards } from "@/lib/cards";
import { useEffect, useState, useMemo } from "react";
import CardListItem from "@/components/CardListItem";
import type { CardData } from "@/types/card";

export default function Home() {
  const { user, loading, signIn, signOut } = useAuth();

  // 명함 목록 관련 상태
  const [cards, setCards] = useState<CardData[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMetAt, setSelectedMetAt] = useState<string>("전체");

  // 사용자가 로그인되면 명함 목록을 가져옴
  useEffect(() => {
    if (!user) return;

    const fetchCards = async () => {
      setLoadingCards(true);
      try {
        const result = await getCards(user.uid);
        setCards(result);
      } catch (err) {
        console.error("명함 목록 로딩 실패:", err);
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, [user]);

  // "만난 장소" 필터용 고유값 목록 추출
  const metAtOptions = useMemo(() => {
    const unique = new Set<string>();
    cards.forEach((card) => {
      if (card.metAt && card.metAt.trim()) {
        unique.add(card.metAt.trim());
      }
    });
    return ["전체", ...Array.from(unique).sort()];
  }, [cards]);

  // 검색 + 필터 적용된 명함 목록
  const filteredCards = useMemo(() => {
    let result = cards;

    // 만난 장소 필터
    if (selectedMetAt !== "전체") {
      result = result.filter((c) => c.metAt === selectedMetAt);
    }

    // 검색 필터 (이름, 회사, 직책)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q)
      );
    }

    return result;
  }, [cards, selectedMetAt, searchQuery]);

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
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-text">나만의 리멤버</h1>
        <p className="text-sm text-text-secondary mt-1">
          명함을 촬영하고 한곳에서 관리하세요
        </p>
      </div>

      {user ? (
        /* ───── 로그인된 상태: 명함 목록 ───── */
        <div className="max-w-lg mx-auto">
          {/* 검색바 */}
          <div className="relative mb-4">
            {/* 돋보기 아이콘 */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 회사, 직책으로 검색"
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {/* 검색어 지우기 버튼 */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-text-secondary"
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* 만난 장소 필터 칩 (명함이 있고, 장소 옵션이 2개 이상일 때만 표시) */}
          {metAtOptions.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {metAtOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedMetAt(option)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedMetAt === option
                      ? "bg-primary text-white"
                      : "bg-surface border border-border text-text-secondary hover:bg-border/30"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* 명함 개수 표시 */}
          {cards.length > 0 && (
            <p className="text-xs text-text-secondary mb-3">
              {filteredCards.length === cards.length
                ? `총 ${cards.length}장`
                : `${filteredCards.length}장 / 총 ${cards.length}장`}
            </p>
          )}

          {/* 명함 목록 */}
          {loadingCards ? (
            // 로딩 스켈레톤
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 animate-pulse"
                >
                  <div className="w-14 h-14 rounded-lg bg-border" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-border rounded w-24" />
                    <div className="h-3 bg-border rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCards.length > 0 ? (
            // 명함 목록
            <div className="space-y-2">
              {filteredCards.map((card) => (
                <CardListItem key={card.id} card={card} />
              ))}
            </div>
          ) : cards.length > 0 ? (
            // 검색/필터 결과 없음
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-12 h-12 mx-auto text-text-secondary/30 mb-3"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="text-text-secondary text-sm">
                검색 결과가 없습니다
              </p>
            </div>
          ) : (
            // 명함이 아예 없는 빈 상태
            <div className="text-center py-12">
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
              <p className="text-text-secondary text-sm">
                아직 저장된 명함이 없습니다
              </p>
              <p className="text-text-secondary/60 text-xs mt-1">
                하단의 &lsquo;촬영&rsquo; 버튼으로 명함을 스캔해보세요
              </p>
            </div>
          )}

          {/* 로그아웃 버튼 */}
          <button
            onClick={signOut}
            className="w-full mt-8 py-3 text-sm text-text-secondary border border-border rounded-xl hover:bg-border/30 transition-colors"
          >
            로그아웃
          </button>
        </div>
      ) : (
        /* ───── 비로그인 상태 ───── */
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
