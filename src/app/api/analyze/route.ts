import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { verifyAnalyzeAuthToken } from './auth-token';

export const maxDuration = 60; // Vercel Serverless Function Timeout 설정 (60초)
export const AI_ANALYZE_AUTH_COOKIE = 'ai_analyze_auth';

const MAX_CODE_CHARS_FOR_FULL_ANALYSIS = 10000;
const CODE_SEGMENT_CHARS = 2500;
const MAX_RETRIES = 3;

interface CodePromptPayload {
  codeForPrompt: string;
  wasTruncated: boolean;
}

interface GeminiDiagnostics {
  finishReason?: string;
  safetyRatings?: unknown;
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const safeText = (value: unknown): string => (typeof value === 'string' ? value : '');

const extractGeminiContent = (response: { text: () => string; candidates?: unknown[] }): string => {
  const primaryText = safeText(response.text());
  if (primaryText.trim()) return primaryText;

  const firstCandidate = response.candidates?.[0];
  if (!firstCandidate || typeof firstCandidate !== 'object') return '';

  const candidateObj = firstCandidate as Record<string, unknown>;
  const content = candidateObj.content;
  if (!content || typeof content !== 'object') return '';

  const parts = (content as Record<string, unknown>).parts;
  if (!Array.isArray(parts)) return '';

  const fallbackText = parts
    .map((part) => {
      if (part && typeof part === 'object') {
        return safeText((part as Record<string, unknown>).text);
      }
      return '';
    })
    .join('\n')
    .trim();

  return fallbackText;
};

const buildCodePromptPayload = (code: string): CodePromptPayload => {
  if (code.length <= MAX_CODE_CHARS_FOR_FULL_ANALYSIS) {
    return { codeForPrompt: code, wasTruncated: false };
  }

  const head = code.slice(0, CODE_SEGMENT_CHARS);
  const middleStart = Math.max(0, Math.floor(code.length / 2) - Math.floor(CODE_SEGMENT_CHARS / 2));
  const middle = code.slice(middleStart, middleStart + CODE_SEGMENT_CHARS);
  const tail = code.slice(-CODE_SEGMENT_CHARS);

  return {
    codeForPrompt: [
      '[코드가 매우 길어 핵심 구간만 발췌하여 분석합니다]',
      '\n[HEAD]\n',
      head,
      '\n\n[MIDDLE]\n',
      middle,
      '\n\n[TAIL]\n',
      tail,
      '\n\n[요청] 전체 구조/흐름 관점으로 분석하고, 생략된 구간이 있을 수 있음을 명시하세요.',
    ].join(''),
    wasTruncated: true,
  };
};

const buildAnalysisPrompt = (codePayload: CodePromptPayload): string => `
다음 파이썬 알고리즘 코드를 분석해 주세요. 주 대상은 학생입니다.
반드시 아래의 3가지 섹션으로 나누어 마크다운 형식으로 답변해 주세요.
각 섹션 사이에는 가로줄(---)을 넣어 구분해 주세요.
중요한 개념이나 키워드는 **굵은 글씨**로 강조하고, 부연 설명이나 주의사항은 인용구(>)를 사용해 주세요.
목록을 나열할 때는 글머리 기호(- 또는 1. 2.)를 적극적으로 활용하여 가독성을 높여주세요.
코드의 변수명이나 함수명, 짧은 코드는 '인라인 코드' 형태로 표시해 주세요.
${codePayload.wasTruncated ? '\n주의: 코드가 매우 길어 대표 구간 기준으로 분석합니다. 생략 구간이 있음을 답변에 명확히 언급해 주세요.\n' : ''}

## 1. 학생 기준 접근법
(학생이 이 문제를 만났을 때 어떤 식으로 사고를 전개하고 접근해야 하는지 설명)

---

## 2. 실전 풀이법
(이 코드의 핵심 로직과 시간복잡도, 실전에서 어떻게 효율적으로 풀 수 있는지 설명)

---

## 3. 스토리텔링형 풀이
(이 알고리즘을 비유나 이야기를 통해 아주 쉽고 직관적으로 이해할 수 있게 설명)

---
[분석할 코드]
${codePayload.codeForPrompt}
`;

const getDiagnostics = (response: { candidates?: unknown[] }): GeminiDiagnostics => {
  const candidate = response.candidates?.[0];
  if (!candidate || typeof candidate !== 'object') return {};

  const obj = candidate as Record<string, unknown>;
  return {
    finishReason: safeText(obj.finishReason),
    safetyRatings: obj.safetyRatings,
  };
};

const generateWithRetry = async (
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  prompt: string,
): Promise<{ content: string; diagnostics: GeminiDiagnostics }> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });

      const response = await Promise.resolve(result.response);
      const content = extractGeminiContent(response);
      const diagnostics = getDiagnostics(response);

      if (content.trim()) {
        return { content, diagnostics };
      }

      throw new Error(`AI가 빈 응답을 반환했습니다. finishReason=${diagnostics.finishReason ?? 'unknown'}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('AI 요청 처리 중 알 수 없는 오류가 발생했습니다.');
      if (attempt < MAX_RETRIES) {
        const backoff = 1000 * (2 ** (attempt - 1));
        await delay(backoff);
        continue;
      }
    }
  }

  throw lastError ?? new Error('AI 분석 요청이 반복적으로 실패했습니다.');
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const sessionSecret = process.env.AI_ANALYZE_SESSION_SECRET || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }
    if (!sessionSecret) {
      return NextResponse.json({ error: 'AI 분석 인증 시크릿이 설정되지 않았습니다.' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const authToken = cookieStore.get(AI_ANALYZE_AUTH_COOKIE)?.value;
    const isAuthenticated = authToken ? verifyAnalyzeAuthToken(authToken, sessionSecret) : false;
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'AI 분석 인증이 필요합니다.' }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const body = await req.json();
    const { code } = body;

    if (!code || code.trim() === '') {
      return NextResponse.json({ error: '코드가 제공되지 않았습니다.' }, { status: 400 });
    }

    const codePayload = buildCodePromptPayload(code);
    const prompt = buildAnalysisPrompt(codePayload);
    const { content, diagnostics } = await generateWithRetry(model, prompt);

    return NextResponse.json({
      result: content,
      diagnostics: {
        truncatedInput: codePayload.wasTruncated,
        finishReason: diagnostics.finishReason ?? 'unknown',
      },
    });
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
