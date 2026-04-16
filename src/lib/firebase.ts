/**
 * Firebase 클라이언트 초기화 파일
 * - Auth(인증), Firestore(데이터베이스) 인스턴스를 생성하고 내보냅니다.
 * - 환경변수에서 Firebase 설정값을 읽어옵니다.
 * - 빌드 시(서버 사이드)에는 초기화를 건너뜁니다.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebase 앱을 지연 초기화 (빌드 시 에러 방지)
function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey) return null;
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

// 지연 초기화된 인스턴스를 반환하는 함수들
export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getAuth(app);
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  return getFirestore(app);
}

// Google 로그인 제공자 설정
export const googleProvider = new GoogleAuthProvider();
