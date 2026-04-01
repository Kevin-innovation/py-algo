import { NextResponse } from 'next/server';
import { AI_ANALYZE_AUTH_COOKIE } from '../route';
import { createAnalyzeAuthToken } from '../auth-token';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const configuredPassword = process.env.AI_ANALYZE_PASSWORD;
    const sessionSecret = process.env.AI_ANALYZE_SESSION_SECRET;

    if (!configuredPassword || !sessionSecret) {
      const missing: string[] = [];
      if (!configuredPassword) missing.push('AI_ANALYZE_PASSWORD');
      if (!sessionSecret) missing.push('AI_ANALYZE_SESSION_SECRET');

      return NextResponse.json({
        error: '서버 인증 설정이 누락되었습니다.',
        code: 'AUTH_CONFIG_MISSING',
        missing,
      }, { status: 500 });
    }

    if (typeof password !== 'string' || password !== configuredPassword) {
      return NextResponse.json({ error: '패스워드가 일치하지 않습니다.' }, { status: 401 });
    }

    const token = createAnalyzeAuthToken(sessionSecret);
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: AI_ANALYZE_AUTH_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: '인증 요청을 처리할 수 없습니다.' }, { status: 400 });
  }
}
