/**
 * 앱 전체 레이아웃
 * - 모바일 우선 반응형 디자인
 * - 하단 네비게이션 바 포함 (홈, 촬영, 내 명함, 설정)
 * - Firebase 인증 컨텍스트로 앱 전체를 감쌈
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import BottomNav from "@/app/components/BottomNav";

export const metadata: Metadata = {
  title: "나만의 리멤버",
  description: "명함을 촬영하면 AI가 자동으로 정보를 저장하는 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "나만의 리멤버",
  },
  other: {
    "apple-touch-icon": "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-background">
        <AuthProvider>
          {/* 메인 콘텐츠 영역 - 하단 네비게이션 높이만큼 패딩 */}
          <main className="pb-20 min-h-screen">{children}</main>

          {/* 하단 고정 네비게이션 바 */}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
