import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 같은 Wi-Fi의 핸드폰에서 네트워크 IP로 접속 허용
  // (Next.js 기본 보안 정책이 LAN IP를 차단하기 때문)
  allowedDevOrigins: ["192.168.45.25"],
};

export default nextConfig;
