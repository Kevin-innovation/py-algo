import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const body = await req.json();
    const { code, password } = body;

    if (password !== '4490') {
      return NextResponse.json({ error: '잘못된 패스워드입니다.' }, { status: 401 });
    }

    if (!code || code.trim() === '') {
      return NextResponse.json({ error: '코드가 제공되지 않았습니다.' }, { status: 400 });
    }

    const prompt = `
다음 파이썬 알고리즘 코드를 분석해 주세요. 주 대상은 학생입니다.
반드시 아래의 3가지 섹션으로 나누어 마크다운 형식으로 답변해 주세요.

## 1. 학생 기준 접근법
(학생이 이 문제를 만났을 때 어떤 식으로 사고를 전개하고 접근해야 하는지 설명)

## 2. 실전 풀이법
(이 코드의 핵심 로직과 시간복잡도, 실전에서 어떻게 효율적으로 풀 수 있는지 설명)

## 3. 스토리텔링형 풀이
(이 알고리즘을 비유나 이야기를 통해 아주 쉽고 직관적으로 이해할 수 있게 설명)

--- 
[분석할 코드]
${code}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return NextResponse.json({ result: content });
  } catch (error: unknown) {
    console.error("AI Analysis Error Details:", error);
    
    let errorMessage = '알 수 없는 서버 오류가 발생했습니다.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      error: `AI 분석 실패: ${errorMessage}` 
    }, { status: 500 });
  }
}
