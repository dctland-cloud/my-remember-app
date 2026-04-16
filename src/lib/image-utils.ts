/**
 * 이미지 압축 유틸리티
 * - compressForApi: Gemini API로 보낼 이미지를 1MB 이하로 압축 후 base64로 변환
 * - generateThumbnail: Firestore에 저장할 작은 썸네일(~50KB)을 base64 Data URL로 생성
 */

import imageCompression from "browser-image-compression";

/**
 * Gemini API 전송용으로 이미지를 압축하고 base64 문자열로 변환
 * (최대 1MB, 순수 base64 문자열 — Data URL 접두사 없음)
 */
export async function compressForApi(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    useWebWorker: true,
  });

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // "data:image/jpeg;base64," 접두사를 제거하고 순수 base64만 반환
      const base64 = dataUrl.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("이미지를 읽는 데 실패했습니다."));
    reader.readAsDataURL(compressed);
  });
}

/**
 * Firestore 저장용 썸네일 생성 (~50KB, base64 Data URL 반환)
 * 예: "data:image/jpeg;base64,/9j/4AAQ..."
 */
export async function generateThumbnail(file: File): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.05, // 약 50KB
    maxWidthOrHeight: 400,
    useWebWorker: true,
  });

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () =>
      reject(new Error("썸네일을 생성하는 데 실패했습니다."));
    reader.readAsDataURL(compressed);
  });
}
