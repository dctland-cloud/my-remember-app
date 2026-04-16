/**
 * 명함 OCR API 라우트 (서버 전용)
 * - 클라이언트에서 base64 이미지를 받아 Gemini 2.5 Flash로 명함 정보를 추출
 * - GEMINI_API_KEY는 서버 환경변수에서만 사용 (클라이언트에 노출 안 됨)
 * - 추출된 정보를 JSON으로 반환
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/** Gemini에게 보내는 프롬프트 */
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

export async function POST(request: NextRequest) {
  try {
    // 1) 환경변수에서 API 키 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "서버에 Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 2) 요청 본문에서 이미지 데이터 추출
    const body = await request.json();
    const { imageBase64, mimeType } = body as {
      imageBase64: string;
      mimeType: string;
    };

    if (!imageBase64) {
      return NextResponse.json(
        { error: "이미지 데이터가 없습니다." },
        { status: 400 }
      );
    }

    // 3) Gemini 2.5 Flash 모델로 이미지 분석
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

    const response = result.response;
    const text = response.text();

    // 4) Gemini 응답에서 JSON 파싱
    //    Gemini가 ```json ... ``` 블록으로 감쌀 수도 있으므로 정리
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    // 5) 모든 필드가 문자열인지 확인 (null → 빈 문자열)
    const ocrResult = {
      name: String(parsed.name || ""),
      company: String(parsed.company || ""),
      title: String(parsed.title || ""),
      email: String(parsed.email || ""),
      phone: String(parsed.phone || ""),
      address: String(parsed.address || ""),
    };

    return NextResponse.json(ocrResult);
  } catch (error) {
    console.error("OCR API 오류:", error);

    // JSON 파싱 에러인지 구분
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답을 해석하는 데 실패했습니다. 다시 시도해주세요." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "명함 인식 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
