import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

import { resolveSupabaseServerConfig, type SupabaseConfigResult } from './config';

export type SupabaseServerClient = SupabaseClient;

export interface SupabaseVerifiedSession {
  client: SupabaseServerClient;
  session: Session;
  user: User;
}

export interface SupabaseServerContext {
  client: SupabaseServerClient;
  readSession: () => Promise<SupabaseSessionResult>;
}

export type SupabaseServerClientResult = SupabaseConfigResult<SupabaseServerClient>;
export type SupabaseServerContextResult = SupabaseConfigResult<SupabaseServerContext>;

export type SupabaseSessionResult =
  | { ok: true; data: SupabaseVerifiedSession }
  | { ok: false; error: { code: 'SUPABASE_SESSION_UNAVAILABLE'; message: string } };

export const createSupabaseServerClient = (cookies: CookieMethodsServer): SupabaseServerClientResult => {
  const config = resolveSupabaseServerConfig();
  if (!config.ok) return config;

  return {
    ok: true,
    data: createServerClient(config.data.url, config.data.anonKey, {
      cookies,
    }),
  };
};

export const readSupabaseSession = async (client: SupabaseServerClient): Promise<SupabaseSessionResult> => {
  const [{ data: sessionData }, userResult] = await Promise.all([
    client.auth.getSession(),
    client.auth.getUser(),
  ]);

  const session = sessionData.session;
  const user = userResult.data.user;

  if (!session || userResult.error || !user) {
    return {
      ok: false,
      error: {
        code: 'SUPABASE_SESSION_UNAVAILABLE',
        message: 'Supabase session could not be verified safely.',
      },
    };
  }

  return {
    ok: true,
    data: {
      client,
      session,
      user,
    },
  };
};

export const createSupabaseServerContext = (cookies: CookieMethodsServer): SupabaseServerContextResult => {
  const clientResult = createSupabaseServerClient(cookies);
  if (!clientResult.ok) return clientResult;

  const client = clientResult.data;

  return {
    ok: true,
    data: {
      client,
      readSession: () => readSupabaseSession(client),
    },
  };
};
