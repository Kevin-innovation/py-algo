import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseCookies } from '../../../lib/supabase/cookies';
import { createSupabaseServerContext } from '../../../lib/supabase/server';
import { generateUniqueJoinCode } from '../../../lib/classes/join-code';
import { isAppRole } from '../../../lib/auth/rbac';

interface ClassCreateBody {
  name?: string;
  description?: string;
}

const ensureProfileRole = async (client: SupabaseClient, userId: string) => {
  const profileQuery = await client
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle<{ role: string }>();

  if (profileQuery.error) {
    return { ok: false as const, error: '프로필 정보를 조회할 수 없습니다.' };
  }

  if (!profileQuery.data) {
    const insertProfile = await client
      .from('profiles')
      .insert({ id: userId, role: 'teacher', created_by: userId, updated_by: userId });

    if (insertProfile.error) {
      return { ok: false as const, error: '프로필 생성에 실패했습니다.' };
    }

    return { ok: true as const, role: 'teacher' as const };
  }

  if (!isAppRole(profileQuery.data.role)) {
    return { ok: false as const, error: '유효하지 않은 역할 정보입니다.' };
  }

  return { ok: true as const, role: profileQuery.data.role };
};

export async function GET() {
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

  const teacherClasses = await client
    .from('classes')
    .select('id,name,description,join_code,join_code_expires_at,is_active,created_at')
    .eq('teacher_id', userId)
    .order('created_at', { ascending: false });

  if (teacherClasses.error) {
    return NextResponse.json({ error: '클래스 목록을 조회할 수 없습니다.' }, { status: 500 });
  }

  const enrolledClasses = await client
    .from('enrollments')
    .select('class_id, classes:class_id(id,name,description,join_code,join_code_expires_at,is_active,created_at)')
    .eq('student_id', userId)
    .eq('is_active', true);

  if (enrolledClasses.error) {
    return NextResponse.json({ error: '참여 클래스 목록을 조회할 수 없습니다.' }, { status: 500 });
  }

  return NextResponse.json({
    teacherClasses: teacherClasses.data ?? [],
    enrolledClasses: enrolledClasses.data ?? [],
  });
}

export async function POST(req: Request) {
  const body = await req.json() as ClassCreateBody;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : null;

  if (!name) {
    return NextResponse.json({ error: '클래스 이름은 필수입니다.' }, { status: 400 });
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

  const roleResult = await ensureProfileRole(client, userId);
  if (!roleResult.ok) {
    return NextResponse.json({ error: roleResult.error }, { status: 500 });
  }

  if (roleResult.role === 'student') {
    return NextResponse.json({ error: '학생 계정은 클래스를 생성할 수 없습니다.' }, { status: 403 });
  }

  const joinCode = await generateUniqueJoinCode(async (candidate) => {
    const result = await client
      .from('classes')
      .select('id')
      .eq('join_code', candidate)
      .eq('is_active', true)
      .maybeSingle();

    if (result.error) return false;
    return Boolean(result.data);
  });

  const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString();
  const insertClass = await client
    .from('classes')
    .insert({
      name,
      description,
      teacher_id: userId,
      join_code: joinCode,
      join_code_expires_at: expiresAt,
      created_by: userId,
      updated_by: userId,
    })
    .select('id,name,description,join_code,join_code_expires_at,is_active,created_at')
    .single();

  if (insertClass.error) {
    return NextResponse.json({ error: '클래스 생성에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ createdClass: insertClass.data }, { status: 201 });
}
