/**
 * 기억 키워드 필터 — 상단 가로 스크롤 pill
 * - "전체" + 사용자가 쓴 모든 태그 (빈도순)
 * - 활성 pill은 딥 네이비 배경
 */

"use client";

interface TagFilterProps {
  tags: { tag: string; count: number }[];
  active: string | null;
  onPick: (tag: string | null) => void;
}

export default function TagFilter({ tags, active, onPick }: TagFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-5 pt-1 pb-1 scrollbar-hide">
      <Pill
        label="전체"
        active={active === null}
        onClick={() => onPick(null)}
      />
      {tags.map(({ tag, count }) => (
        <Pill
          key={tag}
          label={tag}
          count={count}
          active={active === tag}
          onClick={() => onPick(tag)}
        />
      ))}
    </div>
  );
}

function Pill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-[7px] rounded-full text-[13px] font-medium transition-colors ${
        active
          ? "bg-primary text-white"
          : "bg-white text-text/80 border border-border hover:bg-surface-2"
      }`}
    >
      <span>{label}</span>
      {count != null && (
        <span
          className={`text-[11px] tabular-nums ${
            active ? "opacity-80" : "opacity-50"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
