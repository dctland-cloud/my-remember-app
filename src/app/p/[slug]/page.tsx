/**
 * 공개 디지털 명함 페이지 — Apple 스타일 v2 · 인증 불필요
 * - /mycard와 동일한 네이비 풀블리드 명함 카드 (브랜드 일관성)
 * - 큰 탭 타깃의 3개 액션 행: 이메일 / 전화 / 연락처 저장(vCard)
 * - 푸터에 "나만의 리멤버" 브랜딩
 * - slug가 존재하지 않으면 "찾을 수 없음" 화면
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPublicProfile, type PublicProfile } from "@/lib/profile";
import { downloadVCard } from "@/lib/vcard";

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

  /** 연락처 저장 — vCard(VCF) 파일 다운로드 */
  const handleSaveContact = () => {
    if (!profile) return;
    downloadVCard(profile);
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen px-5 bg-background">
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
        <h1 className="text-xl font-bold text-text mb-2 tracking-tight">
          명함을 찾을 수 없습니다
        </h1>
        <p className="text-sm text-text-secondary text-center leading-relaxed">
          이 주소의 디지털 명함이 존재하지 않거나
          <br />
          삭제되었을 수 있습니다.
        </p>
      </div>
    );
  }

  // 액션 행 정의 (존재하는 것만)
  type ActionRow = {
    key: string;
    label: string;
    sub: string;
    icon: "mail" | "phone" | "user-plus";
    href?: string;
    onClick?: () => void;
  };
  const actions: ActionRow[] = [];
  if (profile.email) {
    actions.push({
      key: "email",
      label: "이메일 보내기",
      sub: profile.email,
      icon: "mail",
      href: `mailto:${profile.email}`,
    });
  }
  if (profile.phone) {
    actions.push({
      key: "phone",
      label: "전화하기",
      sub: profile.phone,
      icon: "phone",
      href: `tel:${profile.phone}`,
    });
  }
  actions.push({
    key: "vcard",
    label: "연락처에 저장",
    sub: "VCF 파일 다운로드",
    icon: "user-plus",
    onClick: handleSaveContact,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto pt-20 pb-10 px-5">
        {/* ───── 네이비 풀블리드 명함 카드 (mycard와 동일) ───── */}
        <div className="relative overflow-hidden rounded-[20px] bg-primary text-white px-6 py-8 shadow-[0_20px_50px_rgba(27,42,78,0.3)]">
          <div className="absolute -right-10 -top-10 w-[180px] h-[180px] rounded-full bg-white/[0.04]" />
          <div className="relative">
            <div className="text-[11px] uppercase tracking-[0.15em] text-white/55 mb-1">
              나만의 리멤버
            </div>
            <div className="text-[26px] font-bold tracking-tight mt-3">
              {profile.name}
            </div>
            {(profile.company || profile.title) && (
              <div className="text-[14px] text-white/75 mt-0.5 tracking-tight">
                {profile.title}
                {profile.title && profile.company && " · "}
                {profile.company}
              </div>
            )}
          </div>
        </div>

        {/* ───── 큰 액션 행 (44px 이상 탭 타깃) ───── */}
        <div className="mt-5 flex flex-col gap-2">
          {actions.map((a) => {
            const Inner = (
              <>
                <div className="w-9 h-9 rounded-[10px] bg-primary/[0.08] flex items-center justify-center flex-shrink-0">
                  <ActionIcon icon={a.icon} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[15px] font-semibold text-text tracking-tight">
                    {a.label}
                  </div>
                  <div className="text-[12px] text-text-secondary/80 tracking-tight truncate mt-0.5">
                    {a.sub}
                  </div>
                </div>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-secondary/40"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            );
            const commonClass =
              "w-full flex items-center gap-3.5 bg-surface border border-border/60 rounded-2xl px-4 py-3.5 hover:bg-surface-2 active:scale-[0.99] transition-all";
            return a.href ? (
              <a key={a.key} href={a.href} className={commonClass}>
                {Inner}
              </a>
            ) : (
              <button key={a.key} onClick={a.onClick} className={commonClass}>
                {Inner}
              </button>
            );
          })}
        </div>

        {/* ───── 푸터 브랜딩 ───── */}
        <div className="text-center mt-8 text-[12px] text-text-secondary/60 tracking-tight">
          <span className="font-medium">나만의 리멤버</span>로 만들어진 명함
        </div>
      </div>
    </div>
  );
}

/** 액션 행 아이콘 — 공개 페이지 3개 액션 */
function ActionIcon({ icon }: { icon: "mail" | "phone" | "user-plus" }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "text-primary",
  };
  if (icon === "mail") {
    return (
      <svg {...common}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    );
  }
  if (icon === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}
