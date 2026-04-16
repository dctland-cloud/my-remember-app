/**
 * 명함 목록에서 사용하는 개별 카드 항목 컴포넌트
 * - 왼쪽: 명함 썸네일 이미지 (없으면 이니셜)
 * - 가운데: 이름, 회사, 직책
 * - 오른쪽: 만난 장소 태그
 * - 탭하면 상세 페이지로 이동
 */

"use client";

import Link from "next/link";
import type { CardData } from "@/types/card";

interface CardListItemProps {
  card: CardData;
}

export default function CardListItem({ card }: CardListItemProps) {
  return (
    <Link
      href={`/card/${card.id}`}
      className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 card-hover active:scale-[0.99]"
    >
      {/* 썸네일 또는 이니셜 */}
      <div className="flex-shrink-0">
        {card.thumbnailBase64 ? (
          <img
            src={card.thumbnailBase64}
            alt={`${card.name} 명함`}
            className="w-14 h-14 rounded-lg object-cover border border-border"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {card.name.charAt(0) || "?"}
            </span>
          </div>
        )}
      </div>

      {/* 이름, 회사, 직책 */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-text text-sm truncate">{card.name}</p>
        {card.company && (
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {card.company}
          </p>
        )}
        {card.title && (
          <p className="text-xs text-text-secondary/70 truncate">
            {card.title}
          </p>
        )}
      </div>

      {/* 만난 장소 태그 */}
      {card.metAt && (
        <div className="flex-shrink-0">
          <span className="inline-block text-[11px] bg-primary/10 text-primary font-medium px-2 py-1 rounded-full whitespace-nowrap max-w-[80px] truncate">
            {card.metAt}
          </span>
        </div>
      )}

      {/* 화살표 아이콘 */}
      <div className="flex-shrink-0 text-text-secondary/40">
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Link>
  );
}
