/**
 * 빠른 액션 버튼 — 아이콘 + 라벨, 흰 카드
 */

"use client";

import { ReactNode } from "react";

interface QuickActionProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  href?: string;
}

export default function QuickAction({ label, icon, onClick, href }: QuickActionProps) {
  const content = (
    <>
      <div className="text-primary">{icon}</div>
      <span className="text-[12px] font-medium text-text tracking-tight">{label}</span>
    </>
  );
  const cls = "flex-1 flex flex-col items-center gap-1.5 py-3.5 bg-surface rounded-xl border border-border/70 active:scale-[0.97] transition-transform";
  if (href) return <a href={href} className={cls}>{content}</a>;
  return <button type="button" onClick={onClick} className={cls}>{content}</button>;
}
