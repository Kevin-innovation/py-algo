export type AppRole = 'admin' | 'teacher' | 'student';

export interface AuthPrincipal {
  userId: string;
  role: AppRole;
}

export interface ClassScope {
  classId: string;
  teacherId: string;
}

export interface GuardDecision {
  ok: boolean;
  code: 'ALLOW' | 'RBAC_FORBIDDEN';
  reason: string;
}

export const APP_ROLES: readonly AppRole[] = ['admin', 'teacher', 'student'] as const;

export const isAppRole = (value: string): value is AppRole => (
  (APP_ROLES as readonly string[]).includes(value)
);

export const canAccessTeacherClass = (principal: AuthPrincipal, scope: ClassScope): boolean => {
  if (principal.role === 'admin') return true;
  if (principal.role !== 'teacher') return false;
  return principal.userId === scope.teacherId;
};

export const enforceTeacherClassScope = (
  principal: AuthPrincipal,
  scope: ClassScope,
): GuardDecision => {
  if (canAccessTeacherClass(principal, scope)) {
    return {
      ok: true,
      code: 'ALLOW',
      reason: 'Authorized for teacher-class scope.',
    };
  }

  return {
    ok: false,
    code: 'RBAC_FORBIDDEN',
    reason: 'Only class owner teacher or admin can access this class scope.',
  };
};

export interface AnalyzeGuardInput {
  legacyCookieValue: string | undefined;
  hasSupabaseSession: boolean;
}

export const canAccessAnalyzeApi = ({
  legacyCookieValue,
  hasSupabaseSession,
}: AnalyzeGuardInput): boolean => (
  legacyCookieValue === '1' || hasSupabaseSession
);
