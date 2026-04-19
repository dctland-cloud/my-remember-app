/**
 * 빈 상태 컴포넌트 — 명함이 하나도 없을 때
 * - 스택된 명함 일러스트
 * - 키워드 사용 안내
 * - 촬영하기 CTA (네이비)
 */

"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="px-8 pt-16 flex flex-col items-center text-center animate-fade-in-up">
      {/* 스택 일러스트 */}
      <div className="relative mb-6" style={{ width: 140, height: 96 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute bg-white"
            style={{
              left: i * 10,
              top: i * 6,
              width: 110,
              height: 70,
              borderRadius: 10,
              border: `0.5px solid rgba(60,60,67,${0.08 + i * 0.04})`,
              boxShadow: `0 ${1 + i}px ${2 + i * 2}px rgba(0,0,0,0.04)`,
              transform: `rotate(${(i - 1) * 3}deg)`,
            }}
          >
            {i === 2 && (
              <div style={{ padding: 10 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    background: "oklch(0.94 0.03 210)",
                  }}
                />
                <div
                  style={{
                    marginTop: 6,
                    height: 5,
                    width: 50,
                    borderRadius: 3,
                    background: "rgba(60,60,67,0.15)",
                  }}
                />
                <div
                  style={{
                    marginTop: 4,
                    height: 4,
                    width: 70,
                    borderRadius: 3,
                    background: "rgba(60,60,67,0.08)",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-[19px] font-semibold text-text tracking-tight mb-1.5">
        첫 명함을 추가해보세요
      </h2>
      <p className="text-sm text-text-secondary leading-relaxed max-w-[260px]">
        명함을 촬영하면 AI가 자동으로 읽어 저장합니다.
        <br />
        키워드를 붙여 &ldquo;CES 2026&rdquo;, &ldquo;박사&rdquo;, &ldquo;회사 동료&rdquo;처럼 기억해두세요.
      </p>

      {/* CTA */}
      <Link
        href="/scan"
        className="mt-7 px-6 py-3 bg-primary text-white rounded-xl text-[15px] font-semibold tracking-tight inline-flex items-center gap-2 active:scale-[0.98] transition-all"
        style={{ boxShadow: "0 4px 12px rgba(27,42,78,0.18)" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[17px] h-[17px]"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        명함 촬영하기
      </Link>
    </div>
  );
}
