/**
 * 명함 목록의 개별 카드 — v2
 * - 왼쪽: 둥근 아바타 (썸네일 or 이니셜 타일)
 * - 가운데: 이름 / 직책·회사
 * - 오른쪽: 기억 키워드 태그 배지 (최대 2개)
 *
 * 활성 필터 태그는 카드에서 숨기고, 나머지 태그만 표시.
 */

"use client";

import Link from "next/link";
import type { CardData } from "@/types/card";
import { getCardTags } from "@/types/card";

interface CardListItemProps {
  card: CardData;
  activeTag?: string | null;
}

/** 이름 초성 해시로 부드러운 색상 톤 생성 */
function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}

export default function CardListItem({ card, activeTag }: CardListItemProps) {
  const tags = getCardTags(card);
  const displayTags = activeTag
    ? tags.filter((t) => t !== activeTag).slice(0, 1)
    : tags.slice(0, 2);
  const hue = hueFromName(card.name || "?");

  return (
    <Link
      href={`/card/${card.id}`}
      className="flex items-center gap-3 bg-surface rounded-2xl p-3 card-hover"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)" }}
    >
      {/* 아바타 */}
      <div className="flex-shrink-0">
        {card.thumbnailBase64 ? (
          <img
            src={card.thumbnailBase64}
            alt={`${card.name} 명함`}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-base font-medium"
            style={{
              background: `oklch(0.94 0.03 ${hue})`,
              color: `oklch(0.38 0.07 ${hue})`,
            }}
          >
            {card.name.charAt(0) || "?"}
          </div>
        )}
      </div>

      {/* 이름 + 메타 */}
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-semibold text-text truncate leading-5 tracking-tight">
          {card.name}
        </p>
        {(card.title || card.company) && (
          <p className="text-[14px] text-text-secondary truncate mt-0.5 tracking-tight">
            {card.title}
            {card.title && card.company && " · "}
            {card.company}
          </p>
        )}
      </div>

      {/* 기억 키워드 배지 */}
      {displayTags.length > 0 && (
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {displayTags.map((t) => (
            <span
              key={t}
              className="inline-block text-[11px] font-medium text-primary px-2 py-[3px] rounded-md whitespace-nowrap max-w-[100px] truncate"
              style={{ background: "rgba(27,42,78,0.07)" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
