import { describe, expect, it } from 'vitest';

import {
  canAccessAnalyzeApi,
  canAccessTeacherClass,
  enforceTeacherClassScope,
  isAppRole,
  type AuthPrincipal,
  type ClassScope,
} from './rbac';

const classScope: ClassScope = {
  classId: 'class-1',
  teacherId: 'teacher-1',
};

describe('rbac helpers', () => {
  it('allows a teacher to access their own class scope', () => {
    const principal: AuthPrincipal = { userId: 'teacher-1', role: 'teacher' };

    expect(canAccessTeacherClass(principal, classScope)).toBe(true);

    const decision = enforceTeacherClassScope(principal, classScope);
    expect(decision.ok).toBe(true);
    expect(decision.code).toBe('ALLOW');
  });

  it('rejects students for teacher class scope', () => {
    const principal: AuthPrincipal = { userId: 'student-1', role: 'student' };

    expect(canAccessTeacherClass(principal, classScope)).toBe(false);

    const decision = enforceTeacherClassScope(principal, classScope);
    expect(decision.ok).toBe(false);
    expect(decision.code).toBe('RBAC_FORBIDDEN');
  });

  it('rejects teacher access to a foreign class', () => {
    const principal: AuthPrincipal = { userId: 'teacher-2', role: 'teacher' };

    const decision = enforceTeacherClassScope(principal, classScope);
    expect(decision.ok).toBe(false);
    expect(decision.code).toBe('RBAC_FORBIDDEN');
  });

  it('allows admin regardless of class owner', () => {
    const principal: AuthPrincipal = { userId: 'admin-1', role: 'admin' };

    expect(canAccessTeacherClass(principal, classScope)).toBe(true);
  });

  it('supports analyze API guard with legacy-cookie or supabase-session', () => {
    expect(canAccessAnalyzeApi({ legacyCookieValue: '1', hasSupabaseSession: false })).toBe(true);
    expect(canAccessAnalyzeApi({ legacyCookieValue: undefined, hasSupabaseSession: true })).toBe(true);
    expect(canAccessAnalyzeApi({ legacyCookieValue: undefined, hasSupabaseSession: false })).toBe(false);
  });

  it('validates known app roles', () => {
    expect(isAppRole('teacher')).toBe(true);
    expect(isAppRole('owner')).toBe(false);
  });
});
