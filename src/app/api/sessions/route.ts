import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseServerContext } from '../../../lib/supabase/server';
import { getSupabaseCookies } from '../../../lib/supabase/cookies';

type SessionAction = 'start' | 'heartbeat' | 'end';

interface SessionActionBody {
  action?: SessionAction;
  classId?: string;
  exerciseId?: string;
  sessionId?: string;
}

const canAccessClass = async (client: SupabaseClient, userId: string, classId: string) => {
  const classOwner = await client
    .from('classes')
    .select('id,teacher_id')
    .eq('id', classId)
    .eq('is_active', true)
    .maybeSingle<{ id: string; teacher_id: string }>();

  if (classOwner.error || !classOwner.data) return false;
  if (classOwner.data.teacher_id === userId) return true;

  const enrollment = await client
    .from('enrollments')
    .select('id')
    .eq('class_id', classId)
    .eq('student_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return !enrollment.error && Boolean(enrollment.data);
};

export async function POST(req: Request) {
  const body = await req.json() as SessionActionBody;

  if (!body.action) {
    return NextResponse.json({ error: 'action은 필수입니다.' }, { status: 400 });
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

  if (body.action === 'start') {
    if (!body.classId) {
      return NextResponse.json({ error: 'classId는 필수입니다.' }, { status: 400 });
    }

    const classAccess = await canAccessClass(client, userId, body.classId);
    if (!classAccess) {
      return NextResponse.json({ error: '해당 클래스에 접근할 수 없습니다.' }, { status: 403 });
    }

    const insertResult = await client
      .from('coding_sessions')
      .insert({
        student_id: userId,
        class_id: body.classId,
        exercise_id: body.exerciseId ?? null,
        status: 'active',
        started_at: new Date().toISOString(),
        last_heartbeat_at: new Date().toISOString(),
        created_by: userId,
        updated_by: userId,
      })
      .select('id,class_id,student_id,status,started_at,last_heartbeat_at')
      .single();

    if (insertResult.error) {
      return NextResponse.json({ error: '세션 시작에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ session: insertResult.data }, { status: 201 });
  }

  if (!body.sessionId) {
    return NextResponse.json({ error: 'sessionId는 필수입니다.' }, { status: 400 });
  }

  const existing = await client
    .from('coding_sessions')
    .select('id,status')
    .eq('id', body.sessionId)
    .eq('student_id', userId)
    .maybeSingle<{ id: string; status: string }>();

  if (existing.error || !existing.data) {
    return NextResponse.json({ error: '세션을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (body.action === 'heartbeat') {
    if (existing.data.status !== 'active') {
      return NextResponse.json({ error: '활성 세션만 heartbeat를 갱신할 수 있습니다.' }, { status: 409 });
    }

    const update = await client
      .from('coding_sessions')
      .update({
        last_heartbeat_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', body.sessionId)
      .eq('student_id', userId)
      .select('id,status,last_heartbeat_at')
      .single();

    if (update.error) {
      return NextResponse.json({ error: 'heartbeat 갱신에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ session: update.data });
  }

  if (body.action === 'end') {
    if (existing.data.status === 'ended') {
      return NextResponse.json({ error: '이미 종료된 세션입니다.' }, { status: 409 });
    }

    const update = await client
      .from('coding_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        last_heartbeat_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', body.sessionId)
      .eq('student_id', userId)
      .select('id,status,ended_at')
      .single();

    if (update.error) {
      return NextResponse.json({ error: '세션 종료에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ session: update.data });
  }

  return NextResponse.json({ error: '지원하지 않는 action입니다.' }, { status: 400 });
}
