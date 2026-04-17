/**
 * 인증(Auth) 컨텍스트 & 훅
 * - 앱 전체에서 로그인 상태를 공유합니다.
 * - useAuth() 훅으로 현재 사용자 정보, 로딩 상태, 로그인/로그아웃 함수를 사용할 수 있습니다.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Firebase가 설정되지 않은 경우 (빌드 시 또는 env 미설정)
      setLoading(false);
      return;
    }

    // Firebase 인증 상태 변화를 감지하여 사용자 정보를 업데이트
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 리다이렉트 결과 처리 (페이지 로드 시)
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    getRedirectResult(auth).catch((error) => {
      console.error("리다이렉트 로그인 결과 처리 실패:", error);
    });
  }, []);

  // Google 로그인 (팝업 시도 → 실패 시 리다이렉트로 전환)
  const signIn = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.error("Firebase가 초기화되지 않았습니다.");
      return;
    }
    try {
      await signInWithPopup(auth, getGoogleProvider());
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === "auth/popup-blocked" || firebaseError.code === "auth/popup-closed-by-user") {
        // 팝업이 차단되면 리다이렉트 방식으로 전환
        console.log("팝업 차단됨, 리다이렉트 방식으로 전환");
        await signInWithRedirect(auth, getGoogleProvider());
      } else {
        console.error("로그인 실패:", error);
      }
    }
  };

  // 로그아웃
  const signOut = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// 다른 컴포넌트에서 useAuth()로 인증 정보에 접근
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  }
  return context;
}
