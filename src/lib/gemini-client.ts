/**
 * Gemini API 클라이언트 직접 호출
 * - 서버를 거치지 않고 브라우저에서 직접 Gemini API를 호출합니다.
 * - 개인용 앱이므로 API 키를 클라이언트에서 사용합니다.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { OcrResult } from "@/types/card";

const EXTRACTION_PROMPT = `이 명함 이미지에서 다음 정보를 추출해주세요.
반드시 아래 JSON 형식으로만 반환해주세요. 다른 텍스트는 포함하지 마세요.
읽을 수 없거나 없는 필드는 빈 문자열("")로 반환해주세요.

{
  "name": "이름",
  "company": "회사명",
  "title": "직책/직급",
  "email": "이메일 주소",
  "phone": "전화번호",
  "address": "주소"
}`;

export async function extractCardInfo(imageBase64: string, mimeType: string): Promise<OcrResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API 키가 설정되지 않았습니다.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    EXTRACTION_PROMPT,
    {
      inlineData: {
        mimeType: mimeType || "image/jpeg",
        data: imageBase64,
      },
    },
  ]);

  const text = result.response.text();

  // JSON 파싱 (```json ... ``` 블록 처리)
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  return {
    name: String(parsed.name || ""),
    company: String(parsed.company || ""),
    title: String(parsed.title || ""),
    email: String(parsed.email || ""),
    phone: String(parsed.phone || ""),
    address: String(parsed.address || ""),
  };
}
