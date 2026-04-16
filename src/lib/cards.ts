/**
 * Firestore 명함 CRUD 함수 모음
 * - saveCard: 명함 새로 저장
 * - getCards: 사용자의 전체 명함 목록 가져오기
 * - getCard: 특정 명함 1건 가져오기
 * - updateCard: 명함 정보 수정
 * - deleteCard: 명함 삭제
 * - checkDuplicate: 중복 명함 체크 (이메일 > 전화번호 > 이름+회사 순서)
 */

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { CardData } from "@/types/card";

const COLLECTION_NAME = "cards";

/** Firestore DB 인스턴스를 가져오고, 없으면 에러를 던짐 */
function getDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore가 초기화되지 않았습니다.");
  return db;
}

/**
 * 전화번호 정규화 — 중복 체크용
 * - 하이픈, 공백, 대시 제거
 * - +82를 0으로 변환 (국제번호 → 국내번호)
 * 예: "+82 10-1234-5678" → "01012345678"
 */
function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-\u2010\u2011\u2012\u2013\u2014\u2015]/g, "");
  normalized = normalized.replace(/^\+82/, "0");
  return normalized;
}

/** 명함을 Firestore에 새로 저장하고, 생성된 문서 ID를 반환 */
export async function saveCard(card: Omit<CardData, "id">): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), card);
  return docRef.id;
}

/** 특정 사용자의 전체 명함 목록을 최신순으로 가져옴 */
export async function getCards(userId: string): Promise<CardData[]> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as CardData[];
}

/** 특정 명함 1건을 ID로 가져옴 */
export async function getCard(cardId: string): Promise<CardData | null> {
  const db = getDb();
  const docSnap = await getDoc(doc(db, COLLECTION_NAME, cardId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as CardData;
}

/** 명함 정보 부분 수정 */
export async function updateCard(
  cardId: string,
  data: Partial<CardData>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTION_NAME, cardId);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
}

/** 명함 삭제 */
export async function deleteCard(cardId: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COLLECTION_NAME, cardId));
}

/**
 * 중복 명함 체크 — 이미 같은 사람의 명함이 저장되어 있는지 확인
 * 체크 순서: ① 이메일 정확히 일치 → ② 전화번호 (정규화 후) 일치 → ③ 이름+회사 모두 일치
 * 중복이면 기존 명함 데이터를 반환, 중복이 아니면 null 반환
 */
export async function checkDuplicate(
  userId: string,
  card: { email: string; phone: string; name: string; company: string }
): Promise<CardData | null> {
  const db = getDb();
  const cardsRef = collection(db, COLLECTION_NAME);

  // ① 이메일로 중복 체크 (비어있지 않은 경우만)
  if (card.email.trim()) {
    const emailQuery = query(
      cardsRef,
      where("userId", "==", userId),
      where("email", "==", card.email.trim())
    );
    const emailSnap = await getDocs(emailQuery);
    if (!emailSnap.empty) {
      const d = emailSnap.docs[0];
      return { id: d.id, ...d.data() } as CardData;
    }
  }

  // ② 전화번호로 중복 체크 (비어있지 않은 경우만)
  // Firestore는 정규화된 값을 비교할 수 없으므로 전체를 가져와 비교
  if (card.phone.trim()) {
    const normalizedInput = normalizePhone(card.phone);
    if (normalizedInput) {
      const phoneQuery = query(
        cardsRef,
        where("userId", "==", userId)
      );
      const phoneSnap = await getDocs(phoneQuery);
      for (const d of phoneSnap.docs) {
        const data = d.data();
        if (data.phone && normalizePhone(data.phone) === normalizedInput) {
          return { id: d.id, ...data } as CardData;
        }
      }
    }
  }

  // ③ 이름+회사 모두 일치하는 경우 체크
  if (card.name.trim() && card.company.trim()) {
    const nameCompanyQuery = query(
      cardsRef,
      where("userId", "==", userId),
      where("name", "==", card.name.trim()),
      where("company", "==", card.company.trim())
    );
    const nameCompanySnap = await getDocs(nameCompanyQuery);
    if (!nameCompanySnap.empty) {
      const d = nameCompanySnap.docs[0];
      return { id: d.id, ...d.data() } as CardData;
    }
  }

  return null;
}
