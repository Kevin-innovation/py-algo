import { NextResponse } from 'next/server';

import { createSupabaseServerContext } from '../../../../lib/supabase/server';
import { getSupabaseCookies } from '../../../../lib/supabase/cookies';
import { isAppRole } from '../../../../lib/auth/rbac';

const RETENTION_DAYS = 30;

export async function POST() {
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

  const profile = await client
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle<{ role: string }>();

  if (profile.error || !profile.data || !isAppRole(profile.data.role) || profile.data.role !== 'admin') {
    return NextResponse.json({ error: '관리자만 정리 작업을 실행할 수 있습니다.' }, { status: 403 });
  }

  const cleanup = await client.rpc('cleanup_expired_session_events', {
    p_retention_days: RETENTION_DAYS,
    p_initiated_by: userId,
  });

  if (cleanup.error) {
    return NextResponse.json({ error: '정리 작업 실행에 실패했습니다.' }, { status: 500 });
  }

  const result = Array.isArray(cleanup.data) ? cleanup.data[0] : cleanup.data;

  return NextResponse.json({
    ok: true,
    retentionDays: RETENTION_DAYS,
    deletedCount: result?.deleted_count ?? 0,
    executedAt: result?.executed_at ?? null,
  });
}
