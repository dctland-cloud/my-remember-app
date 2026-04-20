/**
 * 명함 스캔 페이지 — 다중 업로드 큐 + 자동 트리거 + 5초 Undo 토스트
 *
 * 흐름:
 * 1. 갤러리에서 여러 장 선택 (또는 카메라로 1장) → queue에 적재
 * 2. 한 장씩 AI 분석 → 편집 화면 ("2/5장" 진행률 뱃지)
 * 3. [저장] 누르면:
 *    a) Firestore 저장 (중복 체크)
 *    b) vCard(.vcf) 자동 다운로드  — autoContact 토글 ON일 때
 *    c) 5초 후 인사 이메일 자동 발송 — autoEmail 토글 ON + email 있을 때 (취소 가능)
 *    d) 큐에 다음 장 있으면 자동으로 분석 시작, 없으면 요약 토스트 후 홈
 * 4. 토글은 편집 폼 하단. 기본 둘 다 ON.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { compressForApi, generateThumbnail } from "@/lib/image-utils";
import { extractCardInfo } from "@/lib/gemini-client";
import { saveCard, updateCard, checkDuplicate, getCards } from "@/lib/cards";
import {
  getMyProfile,
  buildGreetingSubject,
  buildGreetingBody,
  type GreetingEmailParams,
} from "@/lib/emailjs";
import { sendViaGmail, isGmailSendConfigured } from "@/lib/gmail-send";
import { downloadVCard } from "@/lib/vcard";
import CameraCapture from "@/components/CameraCapture";
import DuplicateDialog from "@/components/DuplicateDialog";
import TagInput from "@/components/TagInput";
import type { DuplicateChoice } from "@/components/DuplicateDialog";
import type { CardData } from "@/types/card";
import { getCardTags } from "@/types/card";

/** 페이지 진행 단계 */
type Step = "capture" | "analyzing" | "edit";

/** 대기 중인 자동 발송 작업 */
interface PendingEmail {
  id: string;
  toName: string;
  toEmail: string;
  status: "pending" | "sending" | "sent" | "cancelled" | "failed";
  errorMsg?: string;
  secondsLeft: number;
}

const UNDO_WINDOW_SEC = 5;

export default function ScanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 페이지 단계
  const [step, setStep] = useState<Step>("capture");
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // 큐 관리
  const [queue, setQueue] = useState<File[]>([]);
  const [queueIndex, setQueueIndex] = useState(0); // 1-based, 0 = 시작 전
  const queueRef = useRef<File[]>([]); // 상태 동기 참조용
  const [summary, setSummary] = useState({ saved: 0, emailed: 0, failed: 0 });
  // async await 후 최신 count 읽기용 (React state는 클로저에 찍혀서 await 후 낡은 값)
  const summaryRef = useRef({ saved: 0, emailed: 0, failed: 0 });

  // 현재 처리 중인 카드
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [thumbnailBase64, setThumbnailBase64] = useState<string>("");

  // 중복 체크
  const [duplicateCard, setDuplicateCard] = useState<CardData | null>(null);

  // 자동 액션 토글 (기본 ON)
  const [autoContact, setAutoContact] = useState(true);
  const [autoEmail, setAutoEmail] = useState(true);

  // 발송 대기 토스트
  const [pendingEmail, setPendingEmail] = useState<PendingEmail | null>(null);
  const pendingTimeoutRef = useRef<number | null>(null);
  const pendingIntervalRef = useRef<number | null>(null);

  // 현재 대기 중인 발송 한 건 — 다음 명함 저장이나 큐 종료 시 "드롭" 대신 "즉시 발송"으로 처리
  // done Promise는 finishQueue가 홈 이동 전에 대기하도록 해줌 (컴포넌트 언마운트로 5초 타이머가 사라지는 버그 방지)
  const activeSendRef = useRef<{
    id: string;
    card: CardData;
    done: Promise<void>;
    resolveDone: () => void;
  } | null>(null);

  // 폼 데이터
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // 자주 쓴 키워드 제안
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
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
        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([t]) => t);
        setTagSuggestions(sorted);
      })
      .catch(() => {
        /* 조용히 무시 */
      });
  }, [user]);

  // 로그인 확인
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) window.clearTimeout(pendingTimeoutRef.current);
      if (pendingIntervalRef.current) window.clearInterval(pendingIntervalRef.current);
    };
  }, []);

  /** 로딩 중 표시 */
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-text-secondary">로딩 중...</div>
      </div>
    );
  }

  // ───────────────────────────────────────────────
  // summary 갱신 헬퍼 — state + ref 동시 업데이트
  // ───────────────────────────────────────────────
  const bumpSummary = (key: "saved" | "emailed" | "failed") => {
    summaryRef.current = {
      ...summaryRef.current,
      [key]: summaryRef.current[key] + 1,
    };
    setSummary({ ...summaryRef.current });
  };

  // ───────────────────────────────────────────────
  // 큐 처리
  // ───────────────────────────────────────────────

  /** 큐 전체 리셋 (다시 촬영 / 전체 취소) — 대기 중 이메일도 취소 */
  const resetAll = () => {
    // 대기 중 발송이 있다면 같이 취소 (타이머 정리 + done resolve)
    if (activeSendRef.current) {
      clearPendingTimers();
      const active = activeSendRef.current;
      activeSendRef.current = null;
      active.resolveDone();
      setPendingEmail(null);
    }
    queueRef.current = [];
    setQueue([]);
    setQueueIndex(0);
    summaryRef.current = { saved: 0, emailed: 0, failed: 0 };
    setSummary({ saved: 0, emailed: 0, failed: 0 });
    resetFormOnly();
    setStep("capture");
    setError("");
  };

  /** 폼만 초기화 (다음 카드로 넘어갈 때) */
  const resetFormOnly = () => {
    setPreviewUrl("");
    setThumbnailBase64("");
    setName("");
    setCompany("");
    setTitle("");
    setEmail("");
    setPhone("");
    setAddress("");
    setMemo("");
    setTags([]);
  };

  /** 특정 인덱스의 파일 분석 (0-based) */
  const analyzeAt = async (index: number) => {
    const files = queueRef.current;
    if (index >= files.length) {
      // 큐 끝 — 요약 표시 후 홈으로
      finishQueue();
      return;
    }

    setQueueIndex(index + 1);
    setStep("analyzing");
    setError("");
    resetFormOnly();

    const file = files[index];
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const [apiBase64, thumbnail] = await Promise.all([
        compressForApi(file),
        generateThumbnail(file),
      ]);
      setThumbnailBase64(thumbnail);

      const result = await extractCardInfo(apiBase64, file.type || "image/jpeg");

      setName(result.name);
      setCompany(result.company);
      setTitle(result.title);
      setEmail(result.email);
      setPhone(result.phone);
      setAddress(result.address);
      setStep("edit");
    } catch (err) {
      console.error("명함 분석 오류:", err);
      // 이 장은 실패 처리하고 다음으로
      bumpSummary("failed");
      setError(
        err instanceof Error
          ? `${index + 1}번째 명함 분석 실패: ${err.message} — 다음 장으로 넘어갑니다`
          : `${index + 1}번째 명함 분석에 실패했습니다`
      );
      // 1초 뒤 다음 장으로
      window.setTimeout(() => analyzeAt(index + 1), 1000);
    }
  };

  /** 큐 처리 시작 (카메라/갤러리 콜백) */
  const handleCapture = (files: File[]) => {
    if (files.length === 0) return;
    queueRef.current = files;
    setQueue(files);
    setQueueIndex(0);
    summaryRef.current = { saved: 0, emailed: 0, failed: 0 };
    setSummary({ saved: 0, emailed: 0, failed: 0 });
    analyzeAt(0);
  };

  /**
   * 큐 완료 — 대기 중인 이메일을 먼저 마저 처리한 뒤 요약 토스트 + 홈 이동
   *
   * [Codex 리뷰 Finding 1 대응]
   * 이전에는 1.8초 뒤에 router.push로 강제 이동하면서 컴포넌트 언마운트 →
   * cleanup에서 5초 타이머를 clear하여 마지막 장 이메일이 실제로는 안 나가는 버그가 있었음.
   * 이제는 activeSendRef.done을 await하여, 타이머가 자연 완료(또는 사용자가 취소)한 뒤에만 이동함.
   */
  const finishQueue = async () => {
    // 현재 대기 중인 이메일의 완료를 기다림 (자동 발송 / 취소 / 실패 모두)
    if (activeSendRef.current) {
      try {
        await activeSendRef.current.done;
      } catch {
        /* 실패도 종료로 간주 */
      }
    }

    // ref에서 최신 count 읽기 (await 후 state 클로저는 낡은 값)
    const s = summaryRef.current;
    const parts: string[] = [];
    if (s.saved > 0) parts.push(`${s.saved}장 저장`);
    if (s.emailed > 0) parts.push(`${s.emailed}장 이메일 발송`);
    if (s.failed > 0) parts.push(`${s.failed}장 실패`);
    const msg = parts.length > 0 ? parts.join(" · ") : "명함이 저장되었습니다";
    setSuccessMsg(msg);
    window.setTimeout(() => router.push("/"), 1500);
  };

  // ───────────────────────────────────────────────
  // 저장 처리
  // ───────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await checkDuplicate(user.uid, {
        email,
        phone,
        name,
        company,
      });
      if (existing) {
        setDuplicateCard(existing);
        setSaving(false);
        return;
      }
      await performSave();
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  /** 실제 저장 + 자동 액션 트리거 */
  const performSave = async () => {
    const cardData = {
      userId: user.uid,
      name,
      company,
      title,
      email,
      phone,
      address,
      memo,
      metAt: tags[0] ?? "",
      tags,
      thumbnailBase64,
      greetingEmailSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedId = await saveCard(cardData);
    const savedCard: CardData = { ...cardData, id: savedId };

    bumpSummary("saved");
    setSaving(false);

    // 자동 액션들 (백그라운드로)
    triggerAutoActions(savedCard);

    // 다음 장으로
    analyzeAt(queueIndex);
  };

  /** 중복 발견 시 사용자 선택 처리 */
  const handleDuplicateChoice = async (choice: DuplicateChoice) => {
    setDuplicateCard(null);
    if (choice === "cancel") return;

    setSaving(true);
    try {
      if (choice === "update" && duplicateCard?.id) {
        const mergedTags = Array.from(
          new Set([...getCardTags(duplicateCard), ...tags])
        );
        await updateCard(duplicateCard.id, {
          name,
          company,
          title,
          email,
          phone,
          address,
          memo,
          metAt: mergedTags[0] ?? "",
          tags: mergedTags,
          thumbnailBase64,
        });
        bumpSummary("saved");
        setSaving(false);
        // 업데이트된 카드에도 자동 액션 적용
        const updatedCard: CardData = {
          ...duplicateCard,
          name,
          company,
          title,
          email,
          phone,
          address,
          memo,
          tags: mergedTags,
          thumbnailBase64,
        };
        triggerAutoActions(updatedCard);
        analyzeAt(queueIndex);
      } else {
        await performSave();
      }
    } catch (err) {
      console.error("저장 실패:", err);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
      setSaving(false);
    }
  };

  // ───────────────────────────────────────────────
  // 자동 액션: vCard 다운로드 + 이메일 5초 Undo 스케줄
  // ───────────────────────────────────────────────

  const triggerAutoActions = (card: CardData) => {
    // 1) vCard 다운로드 (실패는 조용히)
    if (autoContact) {
      try {
        downloadVCard({
          name: card.name,
          company: card.company,
          title: card.title,
          email: card.email,
          phone: card.phone,
        });
      } catch (err) {
        console.warn("vCard 다운로드 실패:", err);
      }
    }

    // 2) 이메일 5초 Undo 스케줄 — Promise는 finishQueue에서 기다리므로 여기선 fire-and-forget
    if (autoEmail && card.email.trim() && isGmailSendConfigured()) {
      void scheduleEmail(card);
    }
  };

  /** 타이머(시작-취소 공통) 정리 */
  const clearPendingTimers = () => {
    if (pendingTimeoutRef.current) {
      window.clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    if (pendingIntervalRef.current) {
      window.clearInterval(pendingIntervalRef.current);
      pendingIntervalRef.current = null;
    }
  };

  /**
   * 5초 Undo 토스트와 함께 이메일 발송 예약
   *
   * [Codex 리뷰 Finding 2 대응]
   * 이전에는 대기 중인 이메일이 있으면 타이머만 clear해서 그 메일이 영원히 사라졌음.
   * 이제는 flushActiveSend로 즉시 발송한 뒤에만 새 예약을 시작 → 다음 장 저장해도
   * 이전 이메일이 손실되지 않음.
   */
  const scheduleEmail = async (card: CardData) => {
    // 이미 대기 중인 건이 있으면 먼저 즉시 발송 (드롭하지 않음)
    await flushActiveSend();

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());

    // 이 발송의 완료(성공/실패/취소)를 알리는 Promise — finishQueue가 await함
    let resolveDone!: () => void;
    const done = new Promise<void>((r) => {
      resolveDone = r;
    });
    activeSendRef.current = { id, card, done, resolveDone };

    const pending: PendingEmail = {
      id,
      toName: card.name,
      toEmail: card.email,
      status: "pending",
      secondsLeft: UNDO_WINDOW_SEC,
    };
    setPendingEmail(pending);

    // 카운트다운 1초씩 업데이트
    pendingIntervalRef.current = window.setInterval(() => {
      setPendingEmail((p) =>
        p && p.id === id && p.status === "pending"
          ? { ...p, secondsLeft: Math.max(0, p.secondsLeft - 1) }
          : p
      );
    }, 1000);

    // 5초 후 실제 발송
    pendingTimeoutRef.current = window.setTimeout(() => {
      clearPendingTimers();
      void doSend(id, card);
    }, UNDO_WINDOW_SEC * 1000);
  };

  /**
   * 대기 중인 발송을 즉시 처리(가능하면 실제 발송, 이미 발송 중이면 완료 대기)
   * - 다음 명함 저장 전에 호출 → 직전 명함 이메일을 드롭하지 않고 먼저 보냄
   * - finishQueue 전에 호출 → 타이머 만료(5초)를 기다림
   */
  const flushActiveSend = async (): Promise<void> => {
    const active = activeSendRef.current;
    if (!active) return;

    // 아직 pending 상태(타이머가 살아있음) → 지금 즉시 발송
    if (pendingTimeoutRef.current !== null) {
      clearPendingTimers();
      await doSend(active.id, active.card);
      return;
    }

    // 이미 발송 중이거나 카운트다운은 끝났음 → done이 resolve될 때까지 대기
    try {
      await active.done;
    } catch {
      /* 실패도 종료로 간주 */
    }
  };

  /** 실제 Gmail 발송 — 완료 후 activeSendRef.done을 resolve하여 finishQueue 차단 해제 */
  const doSend = async (pendingId: string, card: CardData) => {
    setPendingEmail((p) =>
      p && p.id === pendingId ? { ...p, status: "sending" } : p
    );

    const profile = getMyProfile();
    const myName = profile?.name || user?.displayName || "";
    const myEmail = profile?.email || user?.email || "";

    const params: GreetingEmailParams = {
      toEmail: card.email,
      toName: card.name,
      fromName: myName,
      fromCompany: profile?.company || "",
      fromTitle: profile?.title || "",
      fromEmail: myEmail,
      fromPhone: profile?.phone || "",
      digitalCardUrl: profile?.slug
        ? `${window.location.origin}/p/${profile.slug}`
        : `${window.location.origin}/mycard`,
    };

    try {
      await sendViaGmail({
        toEmail: card.email,
        fromEmail: myEmail,
        fromName: myName,
        subject: buildGreetingSubject(params),
        body: buildGreetingBody(params),
        // [Codex Finding 3 부분 대응] 다중 Google 계정 환경에서 엉뚱한 계정으로
        // 발송되는 사고 방지 — Firebase 로그인한 이메일을 힌트로 전달
        hint: user?.email || undefined,
      });
      bumpSummary("emailed");
      setPendingEmail((p) =>
        p && p.id === pendingId ? { ...p, status: "sent" } : p
      );
      // Firestore에 발송 기록
      if (card.id) {
        updateCard(card.id, { greetingEmailSent: true }).catch(() => {});
      }
      // 2초 후 토스트 자동 닫기
      window.setTimeout(() => {
        setPendingEmail((p) => (p && p.id === pendingId ? null : p));
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "알 수 없는 오류";
      setPendingEmail((p) =>
        p && p.id === pendingId
          ? { ...p, status: "failed", errorMsg: msg }
          : p
      );
      // 실패 토스트는 5초간 유지
      window.setTimeout(() => {
        setPendingEmail((p) => (p && p.id === pendingId ? null : p));
      }, 5000);
    } finally {
      // 현재 활성 슬롯이면 해제 + done Promise resolve
      const active = activeSendRef.current;
      if (active && active.id === pendingId) {
        activeSendRef.current = null;
        active.resolveDone();
      }
    }
  };

  /** 5초 내 취소 — 타이머 정리 + done 해제 (finishQueue가 무한 대기하지 않도록) */
  const cancelPendingEmail = () => {
    if (!pendingEmail || pendingEmail.status !== "pending") return;
    clearPendingTimers();
    const active = activeSendRef.current;
    setPendingEmail((p) => (p ? { ...p, status: "cancelled" } : p));
    window.setTimeout(() => {
      setPendingEmail((p) => (p && p.status === "cancelled" ? null : p));
    }, 1500);
    if (active) {
      activeSendRef.current = null;
      active.resolveDone();
    }
  };

  // ───────────────────────────────────────────────
  // 렌더
  // ───────────────────────────────────────────────

  const hasQueue = queue.length > 1;

  return (
    <div className="px-4 pt-8 pb-4 max-w-lg mx-auto">
      {/* 성공 메시지 토스트 */}
      {successMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg animate-toast">
          {successMsg}
        </div>
      )}

      {/* 대기 중 이메일 Undo 토스트 (하단 고정) */}
      {pendingEmail && (
        <PendingEmailToast
          pending={pendingEmail}
          onCancel={cancelPendingEmail}
        />
      )}

      {/* 중복 명함 발견 대화상자 */}
      {duplicateCard && (
        <DuplicateDialog
          existingCard={duplicateCard}
          onChoice={handleDuplicateChoice}
        />
      )}

      {/* 페이지 제목 + 진행률 */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <h1 className="text-xl font-bold text-text">명함 스캔</h1>
        {hasQueue && step !== "capture" && (
          <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
            {queueIndex}/{queue.length}
          </span>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
          {error}
        </div>
      )}

      {/* ───── 1단계: 촬영/선택 ───── */}
      {step === "capture" && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center text-text-secondary text-sm mb-2">
            명함을 촬영하거나 사진을 선택하세요
          </div>

          {/* 가이드 일러스트 */}
          <div className="w-64 h-40 bg-surface border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-text-secondary/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-12 h-12"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <circle cx="8" cy="11" r="2" />
              <path d="M14 9h4" />
              <path d="M14 13h4" />
              <path d="M6 17c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
            </svg>
            <span className="text-xs">명함을 여기에 비춰주세요</span>
          </div>

          <CameraCapture onCapture={handleCapture} />
        </div>
      )}

      {/* ───── 2단계: AI 분석 중 ───── */}
      {step === "analyzing" && (
        <div className="flex flex-col items-center gap-6 py-12">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="촬영한 명함"
              className="w-64 h-auto rounded-xl shadow-md border border-border"
            />
          )}
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
            </div>
            <p className="text-text-secondary text-sm animate-pulse">
              {hasQueue
                ? `${queueIndex}/${queue.length} · AI가 명함을 분석하고 있습니다...`
                : "AI가 명함을 분석하고 있습니다..."}
            </p>
          </div>
        </div>
      )}

      {/* ───── 3단계: 결과 편집 폼 ───── */}
      {step === "edit" && (
        <div className="space-y-5">
          {thumbnailBase64 && (
            <div className="flex justify-center mb-4">
              <img
                src={thumbnailBase64}
                alt="명함 썸네일"
                className="w-48 h-auto rounded-xl shadow-sm border border-border"
              />
            </div>
          )}

          <p className="text-sm text-text-secondary text-center mb-4">
            AI가 인식한 결과를 확인하고 수정해주세요
          </p>

          <div className="space-y-4">
            <FormField label="이름" value={name} onChange={setName} placeholder="홍길동" />
            <FormField label="회사" value={company} onChange={setCompany} placeholder="삼성전자" />
            <FormField label="직책" value={title} onChange={setTitle} placeholder="팀장" />
            <FormField label="이메일" value={email} onChange={setEmail} placeholder="hong@company.com" type="email" />
            <FormField label="전화" value={phone} onChange={setPhone} placeholder="010-1234-5678" type="tel" />
            <FormField label="주소" value={address} onChange={setAddress} placeholder="서울시 강남구..." />

            <div className="border-t border-border pt-4">
              <p className="text-xs text-text-secondary mb-3">추가 정보 (선택)</p>
            </div>

            <FormField label="메모" value={memo} onChange={setMemo} placeholder="AI 프로젝트 협업 논의" />

            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                기억 키워드
                <span className="ml-1.5 text-xs font-normal text-text-secondary">
                  장소·역할·프로젝트 등 자유롭게
                </span>
              </label>
              <TagInput
                value={tags}
                onChange={setTags}
                suggestions={tagSuggestions}
              />
            </div>
          </div>

          {/* 자동 액션 토글 */}
          <div className="pt-4 mt-2 border-t border-border space-y-3">
            <p className="text-xs text-text-secondary">저장 시 자동 실행</p>
            <ToggleRow
              label="휴대폰 연락처에 저장"
              hint=".vcf 파일 다운로드 → 열어서 연락처에 추가"
              checked={autoContact}
              onChange={setAutoContact}
            />
            <ToggleRow
              label="인사 이메일 자동 발송"
              hint={
                email.trim()
                  ? isGmailSendConfigured()
                    ? "저장 후 5초 내 취소 가능"
                    : "Gmail API 미설정 — 발송 안 됨"
                  : "수신 이메일이 없어 발송 안 됨"
              }
              checked={autoEmail}
              onChange={setAutoEmail}
              disabled={!email.trim() || !isGmailSendConfigured()}
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={resetAll}
              className="flex-1 py-3.5 text-text-secondary bg-surface border border-border rounded-xl font-medium hover:bg-border/30 transition-colors"
            >
              {hasQueue ? "전체 취소" : "다시 촬영"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 text-white bg-primary rounded-xl font-semibold shadow-md hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving
                ? "저장 중..."
                : hasQueue && queueIndex < queue.length
                ? "저장 · 다음"
                : "저장"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 개별 입력 필드 ───
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  );
}

// ─── 토글 행 ───
function ToggleRow({
  label,
  hint,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start justify-between gap-4 py-1 ${
        disabled ? "opacity-50" : "cursor-pointer"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text">{label}</div>
        {hint && (
          <div className="text-xs text-text-secondary mt-0.5">{hint}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
          checked && !disabled ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

// ─── 이메일 발송 대기 / 진행 토스트 ───
function PendingEmailToast({
  pending,
  onCancel,
}: {
  pending: PendingEmail;
  onCancel: () => void;
}) {
  let content: React.ReactNode;
  let bg = "bg-text";
  let extra: React.ReactNode = null;

  switch (pending.status) {
    case "pending":
      content = (
        <>
          <span className="font-medium">{pending.toName}</span>님께 이메일
          발송 <span className="opacity-70">({pending.secondsLeft}초)</span>
        </>
      );
      extra = (
        <button
          onClick={onCancel}
          className="ml-3 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-semibold"
        >
          취소
        </button>
      );
      break;
    case "sending":
      content = (
        <>
          <span className="font-medium">{pending.toName}</span>님께 발송
          중…
        </>
      );
      break;
    case "sent":
      bg = "bg-green-600";
      content = (
        <>
          <span className="font-medium">{pending.toName}</span>님께 이메일
          발송 완료 ✓
        </>
      );
      break;
    case "cancelled":
      bg = "bg-text-secondary";
      content = <>이메일 발송을 취소했습니다</>;
      break;
    case "failed":
      bg = "bg-red-600";
      content = (
        <>
          <span className="font-medium">{pending.toName}</span>님 발송 실패
          {pending.errorMsg ? ` — ${pending.errorMsg}` : ""}
        </>
      );
      break;
  }

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 ${bg} text-white text-sm px-4 py-3 rounded-full shadow-xl flex items-center max-w-[92vw]`}
    >
      <span className="truncate">{content}</span>
      {extra}
    </div>
  );
}
