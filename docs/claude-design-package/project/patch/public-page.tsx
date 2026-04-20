/**
 * 공개 명함 페이지 /p/[slug] v2
 * - 네이비 카드 + 큰 연락 액션
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileBySlug, type PublicProfile } from "@/lib/profile";

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getProfileBySlug(slug).then((p) => { setProfile(p); setLoading(false); });
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-text-secondary">로딩 중...</div>;
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <h1 className="text-[20px] font-bold text-text">명함을 찾을 수 없어요</h1>
          <p className="text-sm text-text-secondary mt-2">링크가 올바른지 확인해 주세요.</p>
        </div>
      </div>
    );
  }

  const vcf = generateVCF(profile);

  return (
    <div className="min-h-screen pt-16 pb-8 max-w-lg mx-auto px-5">
      <div
        className="relative rounded-[20px] p-8 text-white overflow-hidden"
        style={{ background: "var(--color-primary)", boxShadow: "0 20px 50px rgba(27,42,78,0.3)" }}
      >
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
        <div className="relative">
          <div className="text-[11px] tracking-[1.5px] uppercase text-white/55 mb-1">나만의 리멤버</div>
          <div className="text-[26px] font-bold tracking-tight mt-3">{profile.name}</div>
          {(profile.title || profile.company) && (
            <div className="text-[14px] text-white/75 mt-1 tracking-tight">
              {profile.title}{profile.title && profile.company && " · "}{profile.company}
            </div>
          )}
        </div>
      </div>

      <div className="pt-5 flex flex-col gap-2">
        {profile.email && (
          <ContactRow
            label="이메일 보내기" sub={profile.email}
            href={`mailto:${profile.email}`}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
          />
        )}
        {profile.phone && (
          <ContactRow
            label="전화하기" sub={profile.phone}
            href={`tel:${profile.phone}`}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
          />
        )}
        <ContactRow
          label="연락처에 저장" sub="VCF 파일 다운로드"
          href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcf)}`}
          download={`${profile.name}.vcf`}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>}
        />
      </div>

      <div className="text-center pt-8 text-[12px] text-text-secondary/70">
        <span className="font-medium">나만의 리멤버</span>로 만들어진 명함
      </div>
    </div>
  );
}

function ContactRow({ label, sub, href, icon, download }: {
  label: string; sub: string; href: string; icon: React.ReactNode; download?: string;
}) {
  return (
    <a
      href={href}
      download={download}
      className="flex items-center gap-3.5 px-4 py-3.5 bg-surface rounded-2xl border border-border/80 active:scale-[0.98] transition-transform"
    >
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 text-primary" style={{ background: "rgba(27,42,78,0.08)" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold text-text tracking-tight">{label}</div>
        <div className="text-[12px] text-text-secondary mt-0.5 truncate">{sub}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary/40">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </a>
  );
}

function generateVCF(p: PublicProfile): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${p.name}`,
    p.company && `ORG:${p.company}`,
    p.title && `TITLE:${p.title}`,
    p.email && `EMAIL:${p.email}`,
    p.phone && `TEL:${p.phone}`,
    "END:VCARD",
  ].filter(Boolean).join("\n");
}
