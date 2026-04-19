/**
 * 명함 스캔 페이지 v2
 * - 1: 카메라 촬영 or 갤러리
 * - 2: AI 분석 중 (로딩)
 * - 3: 편집 + 기억 키워드 입력
 * - 4: 저장 완료 + 이메일 제안
 *
 * 기존 로직은 유지하되 UI만 B안 톤으로 교체.
 * `tags: string[]` 가 saveCard() 호출 시 함께 저장됨.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { saveCard, getCards, checkDuplicate } from "@/lib/cards";
import TagEditor from "@/components/TagEditor";
import type { OcrResult } from "@/types/card";
import { getCardTags } from "@/types/card";

type Step = "capture" | "analyzing" | "edit" | "done";

export default function ScanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("capture");
  const [imageBase64, setImageBase64] = useState("");
  const [ocrError, setOcrError] = useState("");
  const [form, setForm] = useState<OcrResult & { memo: string; tags: string[] }>({
    name: "", company: "", title: "", email: "", phone: "", address: "",
    memo: "", tags: [],
  });
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // 최근 태그 로드
  useEffect(() => {
    if (!user) return;
    getCards(user.uid).then((cards) => {
      const counts: Record<string, number> = {};
      cards.forEach((c) => getCardTags(c).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      }));
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([t]) => t);
      setRecentTags(sorted.slice(0, 8));
    }).catch(() => {});
  }, [user]);

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImageBase64(base64);
      setStep("analyzing");
      setOcrError("");

      try {
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        if (!res.ok) throw new Error("OCR failed");
        const data: OcrResult = await res.json();
        setForm({ ...data, memo: "", tags: [] });
        setStep("edit");
      } catch (err) {
        console.error(err);
        setOcrError("명함을 읽는 중 오류가 발생했어요. 다시 시도해 주세요.");
        setStep("capture");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user || !form.name.trim()) return;
    setSaving(true);
    try {
      const dup = await checkDuplicate(user.uid, {
        email: form.email, phone: form.phone, name: form.name, company: form.company,
      });
      if (dup) {
        if (!confirm(`이미 저장된 명함이에요 (${dup.name}). 새로 저장할까요?`)) {
          setSaving(false);
          return;
        }
      }
      const now = new Date().toISOString();
      const id = await saveCard({
        userId: user.uid,
        name: form.name, company: form.company, title: form.title,
        email: form.email, phone: form.phone, address: form.address,
        memo: form.memo,
        metAt: "", // legacy field
        tags: form.tags,
        thumbnailBase64: imageBase64,
        greetingEmailSent: false,
        createdAt: now, updatedAt: now,
      });
      setSavedId(id);
      setStep("done");
    } catch (err) {
      console.error(err);
      alert("저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  };

  // 진행 막대
  const stepIndex = { capture: 1, analyzing: 2, edit: 3, done: 4 }[step];

  return (
    <div className="pt-12 pb-24 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="px-5">
        <div className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">
          STEP {stepIndex} / 4
        </div>
        <h1 className="text-[28px] font-bold text-text tracking-tight mt-1">
          {step === "capture" && "명함 촬영"}
          {step === "analyzing" && "AI 분석 중"}
          {step === "edit" && "확인 · 저장"}
          {step === "done" && "저장되었습니다"}
        </h1>
      </div>

      {/* 진행 막대 */}
      <div className="flex gap-1 px-5 pt-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-[3px] rounded-full transition-colors duration-300"
            style={{ background: i <= stepIndex ? "var(--color-primary)" : "rgba(60,60,67,0.12)" }}
          />
        ))}
      </div>

      {ocrError && (
        <div className="mx-5 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl">
          {ocrError}
        </div>
      )}

      {/* STEP 1: 촬영 */}
      {step === "capture" && (
        <div className="px-5 pt-8">
          <div className="aspect-[5/6] bg-[#1A1A1C] rounded-[22px] relative overflow-hidden shadow-lg">
            {[
              { top: 20, left: 20, tl: true },
              { top: 20, right: 20, tr: true },
              { bottom: 20, left: 20, bl: true },
              { bottom: 20, right: 20, br: true },
            ].map((s, i) => (
              <div
                key={i}
                className="absolute w-7 h-7"
                style={{
                  top: s.top, bottom: s.bottom, left: s.left, right: s.right,
                  borderTop: s.tl || s.tr ? "2px solid #fff" : undefined,
                  borderBottom: s.bl || s.br ? "2px solid #fff" : undefined,
                  borderLeft: s.tl || s.bl ? "2px solid #fff" : undefined,
                  borderRight: s.tr || s.br ? "2px solid #fff" : undefined,
                }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
              명함을 프레임 안에 맞춰주세요
            </div>
          </div>

          <div className="flex items-center justify-center gap-10 mt-10">
            <button
              onClick={() => fileInput.current?.click()}
              className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center active:scale-95 transition-transform"
              aria-label="갤러리에서 선택"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              className="w-[76px] h-[76px] rounded-full bg-white border-[3px] border-primary flex items-center justify-center active:scale-95 transition-transform"
              style={{ boxShadow: "0 8px 20px rgba(27,42,78,0.25)" }}
              aria-label="촬영"
            >
              <div className="w-[60px] h-[60px] rounded-full bg-primary" />
            </button>
            <div className="w-12 h-12" />
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* STEP 2: 분석 중 */}
      {step === "analyzing" && (
        <div className="px-5 pt-9">
          {imageBase64 && (
            <div className="flex justify-center">
              <div className="w-60 rounded-2xl overflow-hidden shadow-lg relative" style={{ aspectRatio: "1.6 / 1" }}>
                <img src={imageBase64} alt="명함" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary/60" style={{ boxShadow: "0 0 12px var(--color-primary)" }} />
              </div>
            </div>
          )}
          <div className="flex flex-col items-center gap-2.5 mt-9">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 border-[3px] border-primary/15 rounded-full" />
              <div className="absolute inset-0 border-[3px] border-transparent border-t-primary rounded-full animate-spin" />
            </div>
            <div className="text-[15px] font-medium text-text tracking-tight">명함을 읽고 있어요</div>
            <div className="text-[13px] text-text-secondary tracking-tight">이름 · 회사 · 연락처를 자동으로 추출합니다</div>
          </div>
        </div>
      )}

      {/* STEP 3: 편집 + 키워드 */}
      {step === "edit" && (
        <div className="px-4 pt-4">
          {imageBase64 && (
            <div className="flex justify-center mb-5">
              <img src={imageBase64} alt="명함" className="w-44 rounded-xl shadow-md" style={{ aspectRatio: "1.6 / 1", objectFit: "cover" }} />
            </div>
          )}

          <div className="space-y-3">
            {(["name", "company", "title", "email", "phone"] as const).map((k) => (
              <FormField
                key={k}
                label={{ name: "이름", company: "회사", title: "직책", email: "이메일", phone: "전화" }[k]}
                value={form[k]}
                onChange={(v) => setForm({ ...form, [k]: v })}
              />
            ))}
          </div>

          <div className="mt-4">
            <TagEditor
              value={form.tags}
              onChange={(tags) => setForm({ ...form, tags })}
              recentTags={recentTags}
              emphasis
            />
          </div>

          <div>
            <div className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-4 mb-1.5 px-1">메모</div>
            <textarea
              value={form.memo}
              onChange={(e) => setForm({ ...form, memo: e.target.value })}
              rows={3}
              placeholder="어떤 대화를 나눴는지, 어떤 맥락인지 짧게..."
              className="w-full px-3.5 py-2.5 bg-surface border border-border/80 rounded-xl text-[14px] text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div className="flex gap-2 mt-6">
            <button
              onClick={() => { setImageBase64(""); setStep("capture"); }}
              className="w-28 py-3.5 bg-surface border border-border rounded-xl text-[15px] font-medium text-text-secondary"
            >
              다시 촬영
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 py-3.5 bg-primary text-white rounded-xl text-[15px] font-semibold disabled:opacity-50 active:scale-[0.98] transition-all"
              style={{ boxShadow: "0 6px 16px rgba(27,42,78,0.25)" }}
            >
              {saving ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: 저장 완료 */}
      {step === "done" && (
        <div className="px-5 pt-16 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-5"
            style={{ boxShadow: "0 12px 24px rgba(27,42,78,0.25)" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-[22px] font-bold text-text tracking-tight">저장되었습니다</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-[260px] mt-1.5">
            <span className="text-text font-medium">{form.name}</span>님의 명함이
            {form.tags.length > 0 && <> <span className="text-primary font-medium">{form.tags.slice(0, 2).join(", ")}</span> 키워드로</>} 저장되었어요
          </p>

          <div className="w-full mt-8 flex flex-col gap-2">
            {savedId && (
              <button
                onClick={() => router.push(`/card/${savedId}`)}
                className="w-full py-3 bg-primary text-white rounded-xl text-[15px] font-semibold"
              >
                명함 보기
              </button>
            )}
            <button
              onClick={() => {
                setStep("capture");
                setImageBase64("");
                setForm({ name: "", company: "", title: "", email: "", phone: "", address: "", memo: "", tags: [] });
                setSavedId(null);
              }}
              className="w-full py-3 bg-surface border border-border rounded-xl text-[15px] font-medium text-text"
            >
              한 장 더 촬영
            </button>
            <button
              onClick={() => router.push("/")}
              className="mt-2 text-sm text-primary-light font-medium"
            >
              목록으로
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
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
