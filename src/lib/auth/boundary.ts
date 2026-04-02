import { SUPABASE_ENV_KEYS } from '../supabase/config';

export const AUTH_PROVIDER = 'supabase' as const;

export const LEGACY_AI_PASSWORD_GATE = {
  route: '/api/analyze/auth',
  purpose: 'legacy-ai-analysis-only',
  primary: false,
} as const;

export const AUTH_SESSION_BOUNDARY = {
  provider: AUTH_PROVIDER,
  sessionSource: 'supabase-session',
  serverBootstrap: [SUPABASE_ENV_KEYS.url, SUPABASE_ENV_KEYS.serviceRoleKey],
  clientBootstrap: [SUPABASE_ENV_KEYS.url, SUPABASE_ENV_KEYS.anonKey],
  legacySupport: LEGACY_AI_PASSWORD_GATE,
} as const;

export const describeAuthBoundary = () => ({
  provider: AUTH_SESSION_BOUNDARY.provider,
  sessionSource: AUTH_SESSION_BOUNDARY.sessionSource,
  serverBootstrap: [...AUTH_SESSION_BOUNDARY.serverBootstrap],
  clientBootstrap: [...AUTH_SESSION_BOUNDARY.clientBootstrap],
  legacySupport: { ...AUTH_SESSION_BOUNDARY.legacySupport },
});
