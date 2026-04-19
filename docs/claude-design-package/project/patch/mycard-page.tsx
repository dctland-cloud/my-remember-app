/**
 * 내 디지털 명함 (mycard) v2
 * - 네이비 풀블리드 카드 미리보기
 * - 공개 URL 복사 + 공유 + QR
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getProfile, type PublicProfile } from "@/lib/profile";

export default function MyCardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => { setProfile(p); setLoading(false); });
  }, [user]);

  const publicUrl = profile && typeof window !== "undefined"
    ? `${window.location.origin}/p/${profile.slug}`
    : "";

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!publicUrl || !profile) return;
    if (navigator.share) {
      await navigator.share({ title: `${profile.name}의 명함`, url: publicUrl });
    } else {
      handleCopy();
    }
  };

  if (loading) return <div className="pt-20 text-center text-text-secondary">로딩 중...</div>;

  if (!profile) {
    return (
      <div className="pt-20 px-6 text-center max-w-lg mx-auto">
        <h1 className="text-[22px] font-bold text-text tracking-tight">아직 명함이 없어요</h1>
        <p className="text-sm text-text-secondary mt-2">설정에서 내 정보를 저장하면 디지털 명함이 만들어져요.</p>
        <Link href="/settings" className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-xl text-[15px] font-semibold">
          설정으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-12 pb-24 max-w-lg mx-auto">
      <div className="px-5">
        <div className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">내 디지털 명함</div>
        <h1 className="text-[28px] font-bold text-text tracking-tight mt-1">이렇게 보여요</h1>
        <p className="text-[14px] text-text-secondary mt-1 leading-relaxed">
          링크로 공유하면 상대방에게 이 모습으로 보입니다
        </p>
      </div>

      {/* 명함 카드 */}
      <div className="px-5 pt-6">
        <div
          className="relative rounded-[20px] p-7 text-white overflow-hidden"
          style={{ background: "var(--color-primary)", boxShadow: "0 16px 40px rgba(27,42,78,0.3)" }}
        >
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
          <div className="absolute -bottom-14 right-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="text-[11px] tracking-[1.5px] uppercase text-white/55 mb-1">나만의 리멤버</div>
            <div className="text-[26px] font-bold tracking-tight mt-3">{profile.name}</div>
            {(profile.title || profile.company) && (
              <div className="text-[14px] text-white/75 mt-1 tracking-tight">
                {profile.title}{profile.title && profile.company && " · "}{profile.company}
              </div>
            )}
            <div className="mt-7 pt-4 border-t border-white/15 flex flex-col gap-2.5">
              {profile.email && (
                <Row icon="mail" text={profile.email} />
              )}
              {profile.phone && (
                <Row icon="phone" text={profile.phone} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 공개 URL */}
      <div className="mx-5 mt-4 flex items-center gap-2.5 px-3.5 py-3 bg-surface border border-border/80 rounded-xl">
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">URL</span>
        <span className="flex-1 font-mono text-[12px] text-primary truncate">{publicUrl}</span>
        <button onClick={handleCopy} className="flex-shrink-0">
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      {/* 액션 */}
      <div className="flex gap-2 px-5 pt-4">
        <button
          onClick={handleShare}
          className="flex-1 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold inline-flex items-center justify-center gap-1.5"
          style={{ boxShadow: "0 4px 12px rgba(27,42,78,0.2)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          공유하기
        </button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-3 bg-surface border border-border/80 rounded-xl text-[14px] font-medium text-text inline-flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          미리보기
        </a>
      </div>

      <div className="text-center pt-7">
        <Link href="/settings" className="text-[14px] font-medium text-primary-light">
          설정에서 내 정보 편집
        </Link>
      </div>
    </div>
  );
}

function Row({ icon, text }: { icon: "mail" | "phone"; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-white/85 tracking-tight">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {icon === "mail" && (<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>)}
        {icon === "phone" && (<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />)}
      </svg>
      <span>{text}</span>
    </div>
  );
}
