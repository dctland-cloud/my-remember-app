/**
 * 카메라 촬영 / 갤러리 선택 컴포넌트
 * - "명함 촬영" 버튼: 모바일에서 후면 카메라를 직접 열어 1장 촬영 (브라우저 제약상 연속 촬영 불가)
 * - "사진 선택" 버튼: 갤러리에서 여러 장 한꺼번에 선택 가능 (multiple)
 * - 선택된 파일(들)을 onCapture 콜백으로 부모에게 전달
 */

"use client";

import { useRef } from "react";

interface CameraCaptureProps {
  /** 사용자가 사진을 촬영하거나 선택하면 호출되는 콜백 (여러 장이면 배열로 전달) */
  onCapture: (files: File[]) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  /** 파일이 선택되었을 때 처리 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      onCapture(Array.from(fileList));
    }
    // 같은 파일을 다시 선택할 수 있도록 값을 초기화
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      {/* 숨겨진 파일 입력 - 카메라 촬영용 (1장) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="카메라로 명함 촬영"
      />

      {/* 숨겨진 파일 입력 - 갤러리 선택용 (여러 장) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-label="갤러리에서 사진 선택"
      />

      {/* 명함 촬영 버튼 */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white font-semibold rounded-2xl shadow-md hover:bg-primary-dark active:scale-[0.98] transition-all text-base"
      >
        {/* 카메라 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        명함 촬영
      </button>

      {/* 카메라 버튼 힌트 - 여러 장 촬영 안내 */}
      <p className="text-xs text-text-secondary/70 text-center -mt-2 px-2 leading-relaxed">
        여러 장은 카메라 앱에서 먼저 찍고<br />
        아래 &quot;사진 선택&quot;에서 한 번에 올려주세요
      </p>

      {/* 사진 선택 버튼 */}
      <button
        type="button"
        onClick={() => galleryInputRef.current?.click()}
        className="flex items-center justify-center gap-3 w-full py-4 bg-surface text-text font-semibold rounded-2xl border border-border shadow-sm hover:bg-border/30 active:scale-[0.98] transition-all text-base"
      >
        {/* 사진 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        사진 선택 (여러 장 가능)
      </button>
    </div>
  );
}
