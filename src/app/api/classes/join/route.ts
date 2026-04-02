import { NextResponse } from 'next/server';

import { createSupabaseServerContext } from '../../../../lib/supabase/server';
import { getSupabaseCookies } from '../../../../lib/supabase/cookies';
import { evaluateJoinCodeEnrollment } from '../../../../lib/classes/join-code';

interface JoinClassBody {
  joinCode?: string;
}

export async function POST(req: Request) {
  const body = await req.json() as JoinClassBody;
  const joinCode = typeof body.joinCode === 'string' ? body.joinCode.trim().toUpperCase() : '';

  if (!joinCode) {
    return NextResponse.json({ error: '클래스 코드를 입력하세요.' }, { status: 400 });
  }

  const supabaseCookies = await getSupabaseCookies();
  const contextResult = createSupabaseServerContext(supabaseCookies);
  if (!contextResult.ok) {
    return NextResponse.json({ error: '인증 구성을 불러올 수 없습니다.' }, { status: 500 });
  }

  const sessionResult = await contextResult.data.readSession();
  if (!sessionResult.ok) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const userId = sessionResult.data.user.id;
  const client = contextResult.data.client;

  const classResult = await client
    .from('classes')
    .select('id,join_code,join_code_expires_at')
    .eq('join_code', joinCode)
    .eq('is_active', true)
    .maybeSingle();

  if (classResult.error || !classResult.data) {
    return NextResponse.json({ error: '유효하지 않은 클래스 코드입니다.' }, { status: 404 });
  }

  const enrollmentResult = await client
    .from('enrollments')
    .select('id')
    .eq('class_id', classResult.data.id)
    .eq('student_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (enrollmentResult.error) {
    return NextResponse.json({ error: '수강 상태를 확인할 수 없습니다.' }, { status: 500 });
  }

  const decision = evaluateJoinCodeEnrollment({
    providedCode: joinCode,
    classJoinCode: classResult.data.join_code,
    joinCodeExpiresAt: classResult.data.join_code_expires_at ? new Date(classResult.data.join_code_expires_at) : null,
    alreadyEnrolled: Boolean(enrollmentResult.data),
  });

  if (!decision.ok) {
    if (decision.code === 'ALREADY_ENROLLED') {
      return NextResponse.json({ error: '이미 참여 중인 클래스입니다.' }, { status: 409 });
    }
    if (decision.code === 'JOIN_CODE_EXPIRED') {
      return NextResponse.json({ error: '만료된 클래스 코드입니다.' }, { status: 403 });
    }
    return NextResponse.json({ error: '유효하지 않은 클래스 코드입니다.' }, { status: 400 });
  }

  const ensureProfile = await client
    .from('profiles')
    .upsert({ id: userId, role: 'student', created_by: userId, updated_by: userId });

  if (ensureProfile.error) {
    return NextResponse.json({ error: '프로필 정보를 준비할 수 없습니다.' }, { status: 500 });
  }

  const insertEnrollment = await client.from('enrollments').insert({
    class_id: classResult.data.id,
    student_id: userId,
    created_by: userId,
    updated_by: userId,
  });

  if (insertEnrollment.error) {
    return NextResponse.json({ error: '클래스 참여에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, classId: classResult.data.id }, { status: 201 });
}
