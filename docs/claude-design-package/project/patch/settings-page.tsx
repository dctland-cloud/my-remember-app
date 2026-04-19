/**
 * 설정 페이지 v2 — 섹션 리스트 구조
 * 내 정보 / 공개 주소 / 데이터 / 계정
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getProfile, saveProfile, generateSlug, type PublicProfile } from "@/lib/profile";
import { getCards } from "@/lib/cards";
import type { CardData } from "@/types/card";

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [slug, setSlug] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [exporting, setExporting] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => {
      if (p) {
        setName(p.name); setCompany(p.company); setTitle(p.title);
        setEmail(p.email); setPhone(p.phone); setSlug(p.slug);
      } else {
        setSlug(generateSlug());
        if (user.displayName) setName(user.displayName);
        if (user.email) setEmail(user.email);
      }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { setMsg({ ok: false, text: "이름은 필수예요." }); return; }
    if (!slug.trim()) { setMsg({ ok: false, text: "공개 주소가 필요해요." }); return; }
    setSaving(true); setMsg(null);
    try {
      const profile: PublicProfile = {
        name: name.trim(), company: company.trim(), title: title.trim(),
        email: email.trim(), phone: phone.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
      };
      await saveProfile(user.uid, profile);
      setSlug(profile.slug);
      setMsg({ ok: true, text: "저장되었어요." });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ ok: false, text: "저장에 실패했어요." });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const cards: CardData[] = await getCards(user.uid);
      if (cards.length === 0) { alert("내보낼 명함이 없어요."); return; }
      const headers = ["이름", "회사", "직책", "이메일", "전화", "주소", "메모", "키워드", "저장일"];
      const rows = cards.map((c) => [
        c.name, c.company, c.title, c.email, c.phone, c.address, c.memo,
        (c.tags ?? (c.metAt ? [c.metAt] : [])).join(" / "),
        c.createdAt ? new Date(c.createdAt).toLocaleDateString("ko-KR") : "",
      ].map(csv));
      const bom = "\uFEFF";
      const content = bom + headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `나만의리멤버_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const publicUrl = typeof window !== "undefined" && slug ? `${window.location.origin}/p/${slug}` : "";

  if (authLoading || loading) return <div className="pt-20 text-center text-text-secondary">로딩 중...</div>;

  return (
    <div className="pt-12 pb-24 max-w-lg mx-auto">
      <div className="px-5 pb-5">
        <div className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">설정</div>
        <h1 className="text-[28px] font-bold text-text tracking-tight mt-1">내 정보 · 데이터</h1>
      </div>

      <div className="px-4">
        <Section title="내 정보">
          <Field label="이름 *" value={name} onChange={setName} />
          <Field label="회사" value={company} onChange={setCompany} />
          <Field label="직책" value={title} onChange={setTitle} />
          <Field label="이메일" value={email} onChange={setEmail} type="email" />
          <Field label="전화" value={phone} onChange={setPhone} type="tel" />
        </Section>

        <Section title="공개 주소">
          <div>
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1 px-1">slug</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="flex-1 px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-[14px] font-mono text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={() => setSlug(generateSlug())}
                className="px-3.5 py-2.5 border border-primary/25 text-primary rounded-xl text-[12px] font-medium"
              >
                새로 생성
              </button>
            </div>
            <p className="text-[11px] text-text-secondary mt-1 px-1">영문 소문자, 숫자, 하이픈만</p>
          </div>
          {publicUrl && (
            <div className="px-3.5 py-3 bg-primary/5 rounded-xl font-mono text-[12px] text-primary-light break-all">
              {publicUrl}
            </div>
          )}
        </Section>

        {msg && (
          <div className={`text-[13px] px-1 mb-3 ${msg.ok ? "text-green-600" : "text-red-600"}`}>
            {msg.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-primary text-white rounded-xl text-[15px] font-semibold disabled:opacity-50 mb-7"
          style={{ boxShadow: "0 4px 12px rgba(27,42,78,0.2)" }}
        >
          {saving ? "저장 중..." : "저장"}
        </button>

        <Section title="데이터">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface rounded-xl border border-border/80 text-left active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-primary" style={{ background: "rgba(27,42,78,0.08)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-medium text-text tracking-tight">
                {exporting ? "내보내는 중..." : "CSV로 내보내기"}
              </div>
              <div className="text-[12px] text-text-secondary mt-0.5">저장한 모든 명함 다운로드</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary/40">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </Section>

        <Section title="계정">
          <button
            onClick={signOut}
            className="w-full py-3.5 bg-surface rounded-xl border border-border/80 text-[15px] font-medium text-text-secondary"
          >
            로그아웃
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-bold text-primary uppercase tracking-wider px-1 pb-2.5">{title}</div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1 px-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-[15px] text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function csv(v: string): string {
  if (!v) return '""';
  if (v.includes(",") || v.includes("\n") || v.includes('"')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}
