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
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase";

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

  // Google 팝업으로 로그인
  const signIn = async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      console.error("Firebase가 초기화되지 않았습니다.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("로그인 실패:", error);
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
