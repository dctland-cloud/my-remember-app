/**
 * 중복 명함 발견 시 표시하는 모달 대화상자
 * - 기존에 저장된 명함 정보를 보여줌
 * - "업데이트" / "새로 저장" / "취소" 3가지 선택지 제공
 */

"use client";

import type { CardData } from "@/types/card";

export type DuplicateChoice = "update" | "save-new" | "cancel";

interface DuplicateDialogProps {
  existingCard: CardData;
  onChoice: (choice: DuplicateChoice) => void;
}

export default function DuplicateDialog({
  existingCard,
  onChoice,
}: DuplicateDialogProps) {
  return (
    // 반투명 배경 오버레이
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      {/* 대화상자 본체 */}
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-text text-center">
            이미 저장된 명함입니다
          </h3>
        </div>

        {/* 기존 명함 정보 */}
        <div className="px-6 pb-4">
          <div className="bg-background rounded-xl p-4 border border-border">
            <p className="font-semibold text-text text-base">
              {existingCard.name}
            </p>
            {existingCard.company && (
              <p className="text-sm text-text-secondary mt-1">
                {existingCard.company}
                {existingCard.title && ` / ${existingCard.title}`}
              </p>
            )}
            {existingCard.email && (
              <p className="text-xs text-text-secondary mt-1">
                {existingCard.email}
              </p>
            )}
            {existingCard.phone && (
              <p className="text-xs text-text-secondary">
                {existingCard.phone}
              </p>
            )}
          </div>
          <p className="text-sm text-text-secondary text-center mt-3">
            기존 명함을 업데이트하시겠습니까?
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={() => onChoice("update")}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark active:scale-[0.98] transition-all"
          >
            업데이트
          </button>
          <button
            onClick={() => onChoice("save-new")}
            className="w-full py-3 bg-surface text-primary font-semibold border border-primary rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all"
          >
            새로 저장
          </button>
          <button
            onClick={() => onChoice("cancel")}
            className="w-full py-3 text-text-secondary font-medium rounded-xl hover:bg-border/30 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
