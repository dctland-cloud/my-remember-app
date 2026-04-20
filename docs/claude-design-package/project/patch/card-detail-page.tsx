/**
 * 명함 상세 페이지 v2
 * - 보기 / 편집 모드 토글
 * - 편집: 필드 + TagEditor(강조) + 메모 + 삭제
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { getCard, updateCard, deleteCard, getCards } from "@/lib/cards";
import type { CardData } from "@/types/card";
import { getCardTags } from "@/types/card";
import TagEditor from "@/components/TagEditor";
import QuickAction from "@/components/QuickAction";

export default function CardDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<CardData>>({});
  const [recentTags, setRecentTags] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    getCard(id).then((c) => { setCard(c); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!user) return;
    getCards(user.uid).then((cards) => {
      const counts: Record<string, number> = {};
      cards.forEach((c) => getCardTags(c).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      }));
      setRecentTags(Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t).slice(0, 8));
    });
  }, [user]);

  const startEdit = () => {
    if (!card) return;
    setForm({
      name: card.name, company: card.company, title: card.title,
      email: card.email, phone: card.phone, address: card.address,
      memo: card.memo, tags: getCardTags(card),
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!card?.id) return;
    await updateCard(card.id, form);
    setCard({ ...card, ...form } as CardData);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!card?.id) return;
    if (!confirm("이 명함을 삭제할까요?")) return;
    await deleteCard(card.id);
    router.push("/");
  };

  if (loading) return <div className="pt-20 text-center text-text-secondary">로딩 중...</div>;
  if (!card) return <div className="pt-20 text-center text-text-secondary">명함을 찾을 수 없어요.</div>;

  const tags = editing ? (form.tags ?? []) : getCardTags(card);
  const hue = hueFromName(card.name);

  // ─── 편집 모드 ───
  if (editing) {
    return (
      <div className="pt-12 pb-24 max-w-lg mx-auto">
        <div className="flex justify-between items-center px-4 py-2.5">
          <button onClick={() => setEditing(false)} className="text-[15px] text-text-secondary">취소</button>
          <div className="text-[16px] font-semibold text-text">편집</div>
          <button onClick={saveEdit} className="text-[15px] font-semibold text-primary">저장</button>
        </div>

        <div className="text-center pt-3">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-medium"
            style={{ background: `oklch(0.94 0.03 ${hue})`, color: `oklch(0.38 0.07 ${hue})` }}
          >
            {card.name.charAt(0)}
          </div>
        </div>

        <div className="px-4 pt-5 space-y-2.5">
          {(["name", "company", "title", "email", "phone", "address"] as const).map((k) => (
            <Field
              key={k}
              label={{ name: "이름", company: "회사", title: "직책", email: "이메일", phone: "전화", address: "주소" }[k]}
              value={(form as any)[k] ?? ""}
              onChange={(v) => setForm({ ...form, [k]: v })}
            />
          ))}
        </div>

        <div className="px-4 pt-5">
          <TagEditor
            value={form.tags ?? []}
            onChange={(tags) => setForm({ ...form, tags })}
            recentTags={recentTags}
            emphasis
          />
        </div>

        <div className="px-4 pt-5">
          <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 px-1">메모</div>
          <textarea
            value={form.memo ?? ""}
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
            rows={4}
            className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-[14px] text-text focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div className="px-4 pt-7">
          <button
            onClick={handleDelete}
            className="w-full py-3 bg-surface rounded-xl text-[15px] font-medium text-red-600 border border-red-500/15"
          >
            이 명함 삭제
          </button>
        </div>
      </div>
    );
  }

  // ─── 보기 모드 ───
  return (
    <div className="pt-12 pb-24 max-w-lg mx-auto">
      <div className="flex justify-between items-center px-4 py-2.5">
        <Link href="/" className="flex items-center gap-1 text-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-[15px] font-medium">목록</span>
        </Link>
        <button onClick={startEdit} className="text-[15px] font-semibold text-primary">편집</button>
      </div>

      {/* 히어로 */}
      <div className="pt-6 text-center px-6">
        <div
          className="w-[88px] h-[88px] rounded-full mx-auto mb-4 flex items-center justify-center text-[34px] font-medium"
          style={{ background: `oklch(0.94 0.03 ${hue})`, color: `oklch(0.38 0.07 ${hue})` }}
        >
          {card.name.charAt(0)}
        </div>
        <h1 className="text-[26px] font-bold text-text tracking-tight">{card.name}</h1>
        {(card.title || card.company) && (
          <p className="text-[15px] text-text-secondary mt-1 tracking-tight">
            {card.title}{card.title && card.company && " · "}{card.company}
          </p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-3.5">
            {tags.map((t) => (
              <span key={t} className="px-2.5 py-1 rounded-full text-[12px] font-medium text-primary" style={{ background: "rgba(27,42,78,0.08)" }}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 빠른 액션 */}
      <div className="flex gap-2 px-4 pt-6">
        {card.phone && (
          <QuickAction
            label="전화"
            href={`tel:${card.phone}`}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>}
          />
        )}
        {card.email && (
          <QuickAction
            label="이메일"
            href={`mailto:${card.email}`}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>}
          />
        )}
        {card.email && (
          <QuickAction
            label="인사 메일"
            href={`mailto:${card.email}?subject=${encodeURIComponent("반갑습니다")}&body=${encodeURIComponent(`${card.name}님,\n\n만나서 반가웠습니다.\n\n`)}`}
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
          />
        )}
      </div>

      {/* 정보 카드 */}
      <div className="mx-4 mt-5 bg-surface rounded-2xl border border-border/80 overflow-hidden">
        {(["company", "email", "phone", "address"] as const).map((k, i) => {
          const value = card[k];
          if (!value) return null;
          return (
            <div key={k} className={`flex items-start gap-3 px-4 py-3.5 ${i > 0 ? "border-t border-border/60" : ""}`}>
              <div className="text-text-secondary pt-0.5">
                {k === "company" && (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="22" x2="9" y2="18" /><line x1="15" y1="22" x2="15" y2="18" /></svg>)}
                {k === "email" && (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>)}
                {k === "phone" && (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>)}
                {k === "address" && (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                  {({ company: "회사", email: "이메일", phone: "전화", address: "주소" } as any)[k]}
                </div>
                <div className="text-[15px] text-text mt-0.5 break-words">{value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 메모 */}
      {card.memo && (
        <div className="mx-4 mt-3 bg-surface rounded-2xl border border-border/80 p-4">
          <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">메모</div>
          <p className="text-[14px] text-text leading-relaxed">{card.memo}</p>
        </div>
      )}

      {/* 메타 */}
      <div className="px-5 pt-5 text-center text-[12px] text-text-secondary/70">
        {new Date(card.createdAt).toLocaleDateString("ko-KR")} 저장
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1 px-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-[15px] text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 360;
}
