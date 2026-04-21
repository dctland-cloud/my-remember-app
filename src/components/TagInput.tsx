/**
 * 기억 키워드 입력 컴포넌트 — 칩(pill) 스타일
 * - 입력창에 타이핑 후 Enter/쉼표/스페이스로 추가
 * - 기존 칩은 × 버튼으로 제거
 * - 중복/빈 값 자동 제거
 * - 추천 키워드(사용자가 이전에 쓴 태그)를 제안 형태로 보여줄 수 있음 (선택)
 */

"use client";

import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** 입력창 placeholder */
  placeholder?: string;
  /** 자주 쓰는 태그 제안 (클릭 시 추가) */
  suggestions?: string[];
}

export default function TagInput({
  value,
  onChange,
  placeholder = "예: CES 2026, 박사, 회사 동료",
  suggestions = [],
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      // 빈 상태에서 backspace → 마지막 태그 제거
      removeTag(value[value.length - 1]);
    }
  };

  const availableSuggestions = suggestions.filter((s) => !value.includes(s));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-surface border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all min-h-[48px]">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-primary text-white text-[13px] font-medium px-2.5 py-1 rounded-full tracking-tight"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="opacity-70 hover:opacity-100 leading-none"
              aria-label={`${tag} 제거`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3 h-3"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addTag(draft)}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent text-[14px] text-text placeholder-text-secondary/55 focus:outline-none py-1"
        />
      </div>

      {availableSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[11px] text-text-secondary self-center mr-1">
            자주 쓴:
          </span>
          {availableSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="text-[12px] text-primary bg-[rgba(27,42,78,0.07)] hover:bg-[rgba(27,42,78,0.12)] px-2 py-0.5 rounded-full tracking-tight"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
