/**
 * 기억 키워드 에디터 — 태그 선택/추가/제거
 * - 선택된 태그: 네이비 배경 + × 버튼
 * - "+ 새 키워드" 입력 필드
 * - 최근 사용 태그 추천 (탭으로 추가)
 */

"use client";

import { useState, KeyboardEvent } from "react";

interface TagEditorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  recentTags?: string[];
  emphasis?: boolean; // 네이비 배경으로 강조할지
}

export default function TagEditor({
  value,
  onChange,
  recentTags = [],
  emphasis = false,
}: TagEditorProps) {
  const [input, setInput] = useState("");
  const [editing, setEditing] = useState(false);

  const addTag = (t: string) => {
    const clean = t.trim();
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
    setInput("");
  };

  const removeTag = (t: string) => {
    onChange(value.filter((x) => x !== t));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const suggestions = recentTags.filter((t) => !value.includes(t));

  const containerCls = emphasis
    ? "rounded-2xl p-4 bg-primary/[0.04] border border-primary/15"
    : "";

  return (
    <div className={containerCls}>
      {emphasis && (
        <>
          <div className="text-[12px] font-bold text-primary uppercase tracking-wider mb-1">
            기억 키워드
          </div>
          <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
            장소, 역할, 프로젝트 등 자유롭게. 엔터 또는 쉼표로 추가.
          </p>
        </>
      )}

      {/* 선택된 태그 + 입력 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {value.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => removeTag(t)}
            className="flex items-center gap-1.5 px-3 py-[5px] bg-primary text-white rounded-full text-[13px] font-medium active:scale-95 transition-transform"
          >
            <span>{t}</span>
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </svg>
            </span>
          </button>
        ))}
        {editing ? (
          <input
            autoFocus
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onBlur={() => {
              if (input.trim()) addTag(input);
              setEditing(false);
            }}
            placeholder="새 키워드"
            className="px-3 py-[5px] rounded-full text-[13px] bg-white border border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[100px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="px-3 py-[5px] rounded-full text-[13px] font-medium text-primary-light bg-white border border-dashed border-primary/30"
          >
            + 키워드
          </button>
        )}
      </div>

      {/* 최근 사용 */}
      {suggestions.length > 0 && (
        <>
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
            최근 사용
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                className="px-2.5 py-1 rounded-full text-[12px] font-medium text-text-secondary bg-white border border-border active:scale-95 transition-transform"
              >
                + {t}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
