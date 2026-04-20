/**
 * 홈 페이지 — 명함 목록 (v2)
 * - 로그인 전: Google 로그인
 * - 로그인 후: 큰 타이틀 + 기억 키워드 필터 + 명함 카드 리스트
 * - 검색: 이름/회사/직책
 * - 필터: 사용자의 "기억 키워드" (tags[]) — 빈도순 정렬
 * - 빈 상태: EmptyState 컴포넌트
 */

"use client";

import { useAuth } from "@/lib/auth";
import { getCards } from "@/lib/cards";
import { useEffect, useState, useMemo } from "react";
import CardListItem from "@/components/CardListItem";
import TagFilter from "@/components/TagFilter";
import EmptyState from "@/components/EmptyState";
import type { CardData } from "@/types/card";
import { getCardTags } from "@/types/card";

export default function Home() {
  const { user, loading, signIn } = useAuth();

  const [cards, setCards] = useState<CardData[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

  // 전체 태그 + 빈도
  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach((c) => {
      getCardTags(c).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [cards]);

  // 이번 달 저장된 명함 수
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    return cards.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getFullYear() === y && d.getMonth() === m;
    }).length;
  }, [cards]);

  // 검색 + 필터 적용
  const filteredCards = useMemo(() => {
    let result = cards;
    if (activeTag) {
      result = result.filter((c) => getCardTags(c).includes(activeTag));
    }
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
  }, [cards, activeTag, searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <div className="text-sm text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  // ──── 비로그인 ────
  if (!user) {
    return (
      <div className="px-4 pt-12">
        <div className="max-w-sm mx-auto text-center animate-fade-in-up pt-16">
          <div className="mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-20 h-20 mx-auto text-primary/60"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <circle cx="8" cy="11" r="2" />
              <path d="M14 9h4" />
              <path d="M14 13h4" />
              <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">나만의 리멤버</h1>
          <p className="text-text-secondary mt-2 mb-8 text-sm">
            명함을 AI로 읽고 기억 키워드로 간직하세요
          </p>
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-surface border border-border text-text font-medium py-3.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google로 로그인
          </button>
        </div>
      </div>
    );
  }

  // ──── 빈 상태 ────
  if (!loadingCards && cards.length === 0) {
    return (
      <div className="pt-12 pb-24">
        {/* 타이틀 */}
        <div className="px-5">
          <div className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
            나만의 리멤버
          </div>
          <h1 className="text-[32px] font-bold text-text tracking-tight mt-1">
            만난 사람들
          </h1>
          <p className="text-[15px] text-text-secondary mt-1 tracking-tight">
            아직 저장된 명함이 없어요
          </p>
        </div>
        <EmptyState />
      </div>
    );
  }

  // ──── 로그인 + 명함 있음 ────
  return (
    <div className="pt-12 pb-24 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="px-5">
        <div className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
          나만의 리멤버
        </div>
        <h1 className="text-[32px] font-bold text-text tracking-tight mt-1">
          만난 사람들
        </h1>
        <p className="text-[15px] text-text-secondary mt-1 tracking-tight">
          총 <span className="text-text font-medium">{cards.length}장</span>
          {thisMonthCount > 0 && (
            <>
              <span className="mx-1.5">·</span>
              이번 달 <span className="text-text font-medium">{thisMonthCount}장</span>
            </>
          )}
        </p>
      </div>

      {/* 필터 */}
      {allTags.length > 0 && (
        <div className="mt-4">
          <TagFilter tags={allTags} active={activeTag} onPick={setActiveTag} />
        </div>
      )}

      {/* 검색 */}
      <div className="relative mt-3 mx-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/55"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름, 회사, 직책 검색"
          className="w-full pl-10 pr-4 py-2.5 bg-black/[0.04] rounded-xl text-[15px] text-text placeholder-text-secondary/55 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border-0"
        />
      </div>

      {/* 그룹 헤더 (필터 선택 시) */}
      {activeTag && (
        <div className="mt-4 px-5 flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-full bg-primary text-white text-xs font-semibold tracking-tight">
            {activeTag}
          </div>
          <div className="text-[13px] text-text-secondary tracking-tight">
            {filteredCards.length}명
          </div>
        </div>
      )}

      {/* 리스트 */}
      <div className="px-4 mt-3.5">
        {loadingCards ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-surface rounded-2xl p-3"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <div className="w-11 h-11 rounded-full skeleton-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton-shimmer rounded w-24" />
                  <div className="h-3 skeleton-shimmer rounded w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCards.length > 0 ? (
          <div className="space-y-2">
            {filteredCards.map((card, index) => (
              <div
                key={card.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 30}ms`, animationFillMode: "backwards" }}
              >
                <CardListItem card={card} activeTag={activeTag} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
