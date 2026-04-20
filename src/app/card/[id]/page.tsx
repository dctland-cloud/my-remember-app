/**
 * 명함 상세 페이지
 * - 명함의 모든 정보를 표시
 * - 원터치 전화/이메일 연결 버튼
 * - 편집 모드로 전환하여 정보 수정 가능
 * - 삭제 기능 (확인 대화상자 포함)
 * - 인사 이메일 발송 (EmailJS를 통해 미리보기 후 발송)
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getCard, updateCard, deleteCard, getCards } from "@/lib/cards";
import type { CardData } from "@/types/card";
import { getCardTags } from "@/types/card";
import GreetingEmailDialog from "@/components/GreetingEmailDialog";
import TagInput from "@/components/TagInput";
import { downloadVCard } from "@/lib/vcard";

export default function CardDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;

  // 상태 관리
  const [card, setCard] = useState<CardData | null>(null);
  const [loadingCard, setLoadingCard] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 편집용 폼 상태
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);

  // 자주 쓴 키워드 제안
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  // 비로그인 시 홈으로 이동
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // 명함 데이터 가져오기
  useEffect(() => {
    if (!user || !cardId) return;

    const fetchCard = async () => {
      setLoadingCard(true);
      try {
        const result = await getCard(cardId);
        if (!result || result.userId !== user.uid) {
          // 존재하지 않거나 권한이 없는 명함
          router.push("/");
          return;
        }
        setCard(result);
        // 편집 폼 초기값 설정 — tags는 레거시 metAt까지 자동 병합
        setEditName(result.name);
        setEditCompany(result.company);
        setEditTitle(result.title);
        setEditEmail(result.email);
        setEditPhone(result.phone);
        setEditAddress(result.address);
        setEditMemo(result.memo);
        setEditTags(getCardTags(result));
      } catch (err) {
        console.error("명함 불러오기 실패:", err);
        router.push("/");
      } finally {
        setLoadingCard(false);
      }
    };

    fetchCard();
  }, [user, cardId, router]);

  // 자주 쓴 키워드 추천 로드 (사용자의 전체 명함 기반)
  useEffect(() => {
    if (!user) return;
    getCards(user.uid)
      .then((all) => {
        const counts: Record<string, number> = {};
        all.forEach((c) => {
          getCardTags(c).forEach((t) => {
            counts[t] = (counts[t] || 0) + 1;
          });
        });
        setTagSuggestions(
          Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([t]) => t)
        );
      })
      .catch(() => { /* 조용히 무시 */ });
  }, [user]);

  /** 편집 모드 시작 */
  const startEdit = () => {
    if (!card) return;
    setEditName(card.name);
    setEditCompany(card.company);
    setEditTitle(card.title);
    setEditEmail(card.email);
    setEditPhone(card.phone);
    setEditAddress(card.address);
    setEditMemo(card.memo);
    setEditTags(getCardTags(card));
    setEditing(true);
  };

  /** 편집 저장 */
  const handleSaveEdit = async () => {
    if (!card?.id) return;
    setSaving(true);
    try {
      const updates = {
        name: editName,
        company: editCompany,
        title: editTitle,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        memo: editMemo,
        // 레거시 metAt은 첫 키워드 mirror (기존 UI·CSV 호환)
        metAt: editTags[0] ?? "",
        tags: editTags,
      };
      await updateCard(card.id, updates);
      setCard({ ...card, ...updates, updatedAt: new Date().toISOString() });
      setEditing(false);
      showSuccess("수정되었습니다");
    } catch (err) {
      console.error("명함 수정 실패:", err);
      alert("수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  /** 명함 삭제 */
  const handleDelete = async () => {
    if (!card?.id) return;
    try {
      await deleteCard(card.id);
      router.push("/");
    } catch (err) {
      console.error("명함 삭제 실패:", err);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  /** 성공 메시지 표시 (2초 후 자동 사라짐) */
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // 로딩 중
  if (authLoading || loadingCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  // 명함을 찾을 수 없음
  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-text-secondary">명함을 찾을 수 없습니다</p>
        <button
          onClick={() => router.push("/")}
          className="text-primary font-medium"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* 성공 메시지 토스트 */}
      {successMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg animate-toast">
          {successMsg}
        </div>
      )}

      {/* 상단 바 - 뒤로가기 + 편집/삭제 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-text-secondary hover:text-text transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="text-sm">목록</span>
        </button>

        <div className="flex items-center gap-2">
          {!editing && (
            <>
              <button
                onClick={startEdit}
                className="text-sm text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                편집
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-sm text-red-500 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {/* 삭제 확인 대화상자 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 modal-overlay">
          <div className="bg-surface rounded-2xl shadow-xl w-full max-w-xs p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-text text-center mb-2">
              명함 삭제
            </h3>
            <p className="text-sm text-text-secondary text-center mb-6">
              {card.name}님의 명함을 삭제하시겠습니까?
              <br />
              <span className="text-red-500">이 작업은 되돌릴 수 없습니다.</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 text-text-secondary font-medium border border-border rounded-xl hover:bg-border/30 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {editing ? (
        /* ───── 편집 모드 ───── */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text text-center mb-4">
            명함 정보 수정
          </h2>

          <EditField label="이름" value={editName} onChange={setEditName} />
          <EditField label="회사" value={editCompany} onChange={setEditCompany} />
          <EditField label="직책" value={editTitle} onChange={setEditTitle} />
          <EditField label="이메일" value={editEmail} onChange={setEditEmail} type="email" />
          <EditField label="전화" value={editPhone} onChange={setEditPhone} type="tel" />
          <EditField label="주소" value={editAddress} onChange={setEditAddress} />
          <EditField label="메모" value={editMemo} onChange={setEditMemo} />

          {/* 기억 키워드 */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              기억 키워드
              <span className="ml-1.5 text-xs font-normal text-text-secondary">
                장소·역할·프로젝트 등 자유롭게
              </span>
            </label>
            <TagInput
              value={editTags}
              onChange={setEditTags}
              suggestions={tagSuggestions}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-3 text-text-secondary font-medium border border-border rounded-xl hover:bg-border/30 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        /* ───── 보기 모드 ───── */
        <div className="space-y-5">
          {/* 썸네일 이미지 */}
          {card.thumbnailBase64 && (
            <div className="flex justify-center">
              <img
                src={card.thumbnailBase64}
                alt={`${card.name} 명함`}
                className="w-full max-w-xs h-auto rounded-xl shadow-sm border border-border"
              />
            </div>
          )}

          {/* 이름, 회사, 직책 */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-text">{card.name}</h2>
            {card.company && (
              <p className="text-sm text-text-secondary mt-1">
                {card.company}
                {card.title && ` | ${card.title}`}
              </p>
            )}
            {/* 인사 이메일 발송 배지 */}
            {card.greetingEmailSent && (
              <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full">
                인사 이메일 발송됨
              </span>
            )}
          </div>

          {/* 원터치 전화 / 이메일 버튼 */}
          <div className="flex gap-3">
            {card.phone && (
              <a
                href={`tel:${card.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 font-semibold rounded-xl border border-green-200 hover:bg-green-100 active:scale-[0.98] transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                전화
              </a>
            )}
            {card.email && (
              <a
                href={`mailto:${card.email}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 font-semibold rounded-xl border border-blue-200 hover:bg-blue-100 active:scale-[0.98] transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                이메일
              </a>
            )}
          </div>

          {/* 인사 이메일 발송 버튼 */}
          {card.email && !card.greetingEmailSent && (
            <button
              onClick={() => setShowEmailDialog(true)}
              className="w-full py-3 bg-surface text-primary font-medium border border-primary/30 rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all text-sm"
            >
              인사 이메일 보내기
            </button>
          )}

          {/* 📇 연락처에 저장 버튼 — vCard(VCF) 다운로드 */}
          <button
            onClick={() => {
              downloadVCard({
                name: card.name,
                company: card.company,
                title: card.title,
                email: card.email,
                phone: card.phone,
              });
              showSuccess("연락처 파일(.vcf)이 다운로드되었습니다");
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-surface text-text font-medium border border-border rounded-xl hover:bg-border/30 active:scale-[0.98] transition-all text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            휴대폰 연락처에 저장
          </button>

          {/* 인사 이메일 대화상자 */}
          {showEmailDialog && card && (
            <GreetingEmailDialog
              card={card}
              onClose={() => setShowEmailDialog(false)}
              onSent={async () => {
                setShowEmailDialog(false);
                // Firestore에 발송 완료 기록
                if (card.id) {
                  try {
                    await updateCard(card.id, { greetingEmailSent: true });
                    setCard({ ...card, greetingEmailSent: true });
                  } catch (err) {
                    console.error("발송 상태 업데이트 실패:", err);
                  }
                }
                showSuccess("인사 이메일이 발송되었습니다");
              }}
            />
          )}

          {/* 기억 키워드 칩 */}
          {getCardTags(card).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {getCardTags(card).map((t) => (
                <span
                  key={t}
                  className="inline-block text-[12px] font-medium text-primary px-2.5 py-1 rounded-full tracking-tight"
                  style={{ background: "rgba(27,42,78,0.08)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* 상세 정보 */}
          <div className="bg-surface rounded-xl border border-border divide-y divide-border">
            <InfoRow label="이름" value={card.name} />
            <InfoRow label="회사" value={card.company} />
            <InfoRow label="직책" value={card.title} />
            <InfoRow label="이메일" value={card.email} />
            <InfoRow label="전화" value={card.phone} />
            <InfoRow label="주소" value={card.address} />
            <InfoRow label="메모" value={card.memo} />
          </div>

          {/* 생성/수정 일시 */}
          <div className="text-xs text-text-secondary/60 text-center space-y-0.5">
            <p>
              저장: {card.createdAt ? new Date(card.createdAt).toLocaleDateString("ko-KR") : "-"}
            </p>
            {card.updatedAt !== card.createdAt && (
              <p>
                수정: {card.updatedAt ? new Date(card.updatedAt).toLocaleDateString("ko-KR") : "-"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** 상세 정보 행 컴포넌트 */
function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start px-4 py-3">
      <span className="text-xs text-text-secondary w-16 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-text flex-1 break-all">{value}</span>
    </div>
  );
}

/** 편집 모드 입력 필드 */
function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  );
}
