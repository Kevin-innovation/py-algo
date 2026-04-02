import { NextResponse } from 'next/server';

import { createSupabaseServerContext } from '../../../lib/supabase/server';
import { getSupabaseCookies } from '../../../lib/supabase/cookies';
import { buildClassScopeChannel, buildSessionEventChannel } from '../../../lib/realtime/channels';

const MAX_EVENT_PAYLOAD_BYTES = 64 * 1024;
const MIN_EVENT_INTERVAL_MS = 500;

interface SessionEventBody {
  sessionId?: string;
  classId?: string;
  diff?: string;
  clientTimestamp?: string;
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_EVENT_PAYLOAD_BYTES) {
    return NextResponse.json({ error: '이벤트 payload 크기 제한(64KB)을 초과했습니다.' }, { status: 413 });
  }

  let body: SessionEventBody;
  try {
    body = JSON.parse(raw) as SessionEventBody;
  } catch {
    return NextResponse.json({ error: '유효한 JSON payload가 필요합니다.' }, { status: 400 });
  }
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : '';
  const classId = typeof body.classId === 'string' ? body.classId : '';
  const diff = typeof body.diff === 'string' ? body.diff : '';

  if (!sessionId || !classId || !diff) {
    return NextResponse.json({ error: 'sessionId, classId, diff는 필수입니다.' }, { status: 400 });
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

  const activeSession = await client
    .from('coding_sessions')
    .select('id,class_id,student_id,status,last_heartbeat_at')
    .eq('id', sessionId)
    .eq('student_id', userId)
    .maybeSingle<{ id: string; class_id: string; student_id: string; status: string; last_heartbeat_at: string }>();

  if (activeSession.error || !activeSession.data) {
    return NextResponse.json({ error: '유효한 세션을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (activeSession.data.class_id !== classId || activeSession.data.status !== 'active') {
    return NextResponse.json({ error: '활성 클래스 세션에서만 이벤트를 수집할 수 있습니다.' }, { status: 409 });
  }

  const lastEvent = await client
    .from('session_events')
    .select('created_at,sequence_number')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .maybeSingle<{ created_at: string; sequence_number: number }>();

  if (lastEvent.error) {
    return NextResponse.json({ error: '이전 이벤트 상태를 조회할 수 없습니다.' }, { status: 500 });
  }

  const now = new Date();
  const lastCreatedAt = lastEvent.data?.created_at ? new Date(lastEvent.data.created_at) : null;
  if (lastCreatedAt && (now.getTime() - lastCreatedAt.getTime()) < MIN_EVENT_INTERVAL_MS) {
    return NextResponse.json({ error: '이벤트 전송 간격은 최소 500ms여야 합니다.' }, { status: 429 });
  }

  const sequenceNumber = (lastEvent.data?.sequence_number ?? 0) + 1;

  const insertEvent = await client
    .from('session_events')
    .insert({
      session_id: sessionId,
      student_id: userId,
      class_id: classId,
      event_type: 'code_diff',
      sequence_number: sequenceNumber,
      payload: {
        diff,
        clientTimestamp: body.clientTimestamp ?? null,
      },
      created_by: userId,
    })
    .select('id,session_id,class_id,event_type,sequence_number,created_at')
    .single();

  if (insertEvent.error) {
    return NextResponse.json({ error: '세션 이벤트 저장에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({
    event: insertEvent.data,
    channels: {
      classScope: buildClassScopeChannel(classId),
      studentScope: buildSessionEventChannel({ classId, studentId: userId }),
    },
  }, { status: 201 });
}
