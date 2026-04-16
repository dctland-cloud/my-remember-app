/**
 * 프로필 관리 유틸리티
 * - Firestore의 publicProfile 컬렉션에서 프로필을 저장/조회합니다.
 * - localStorage에도 동기화하여 EmailJS 등에서 바로 사용 가능합니다.
 * - slug(고유 URL 경로)를 생성하여 공개 명함 페이지 주소를 만듭니다.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { MyProfile } from "@/lib/emailjs";

const COLLECTION_NAME = "publicProfile";
const PROFILE_STORAGE_KEY = "my-remember-profile";

/** Firestore에 저장되는 공개 프로필 데이터 */
export interface PublicProfile extends MyProfile {
  slug: string;
}

/** Firestore DB 인스턴스를 가져오고, 없으면 에러를 던짐 */
function getDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firestore가 초기화되지 않았습니다.");
  return db;
}

/**
 * 프로필 저장 — Firestore publicProfile 컬렉션 + localStorage 동시 저장
 * - userId를 문서 ID로 사용하여 1인 1프로필을 보장합니다.
 */
export async function saveProfile(
  userId: string,
  profile: PublicProfile
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(docRef, {
    userId,
    slug: profile.slug,
    name: profile.name,
    company: profile.company,
    title: profile.title,
    email: profile.email,
    phone: profile.phone,
  });

  // localStorage에도 동기화 (EmailJS 등에서 사용, slug 포함)
  if (typeof window !== "undefined") {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        name: profile.name,
        company: profile.company,
        title: profile.title,
        email: profile.email,
        phone: profile.phone,
        slug: profile.slug,
      })
    );
  }
}

/**
 * 내 프로필 조회 — Firestore에서 userId로 조회
 */
export async function getProfile(
  userId: string
): Promise<PublicProfile | null> {
  const db = getDb();
  const docRef = doc(db, COLLECTION_NAME, userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    name: data.name || "",
    company: data.company || "",
    title: data.title || "",
    email: data.email || "",
    phone: data.phone || "",
    slug: data.slug || "",
  };
}

/**
 * 공개 프로필 조회 — slug(URL 경로)로 조회 (인증 불필요)
 * - 누구나 /p/[slug] 주소로 접근할 때 사용합니다.
 */
export async function getPublicProfile(
  slug: string
): Promise<PublicProfile | null> {
  const db = getDb();
  const q = query(
    collection(db, COLLECTION_NAME),
    where("slug", "==", slug)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  return {
    name: data.name || "",
    company: data.company || "",
    title: data.title || "",
    email: data.email || "",
    phone: data.phone || "",
    slug: data.slug || "",
  };
}

/**
 * slug 생성 — 이름을 기반으로 URL에 사용 가능한 고유 문자열을 만듭니다.
 * - 한글 이름은 로마자 변환이 복잡하므로, 랜덤 8자리 영숫자를 사용합니다.
 * - 예: "abc12def"
 */
export function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
