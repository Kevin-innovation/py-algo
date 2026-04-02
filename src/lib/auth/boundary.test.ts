import { describe, expect, it } from 'vitest';
import { AUTH_PROVIDER, AUTH_SESSION_BOUNDARY, LEGACY_AI_PASSWORD_GATE, describeAuthBoundary } from './boundary';

describe('auth boundary', () => {
  it('declares supabase as the primary provider', () => {
    expect(AUTH_PROVIDER).toBe('supabase');
    expect(AUTH_SESSION_BOUNDARY.provider).toBe('supabase');
    expect(AUTH_SESSION_BOUNDARY.legacySupport.primary).toBe(false);
  });

  it('keeps the ai password gate as legacy-only support', () => {
    expect(LEGACY_AI_PASSWORD_GATE.route).toBe('/api/analyze/auth');
    expect(LEGACY_AI_PASSWORD_GATE.purpose).toBe('legacy-ai-analysis-only');
    expect(LEGACY_AI_PASSWORD_GATE.primary).toBe(false);
  });

  it('exposes a serializable boundary summary for future bootstrap code', () => {
    expect(describeAuthBoundary()).toEqual({
      provider: 'supabase',
      sessionSource: 'supabase-session',
      serverBootstrap: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
      clientBootstrap: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
      legacySupport: {
        route: '/api/analyze/auth',
        purpose: 'legacy-ai-analysis-only',
        primary: false,
      },
    });
  });
});
