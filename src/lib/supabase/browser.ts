import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import { resolveSupabaseClientConfig, type SupabaseConfigResult } from './config';

export type SupabaseBrowserClient = SupabaseClient;

export type SupabaseBrowserClientResult = SupabaseConfigResult<SupabaseBrowserClient>;

export const createSupabaseBrowserClient = (): SupabaseBrowserClientResult => {
  const config = resolveSupabaseClientConfig();
  if (!config.ok) return config;

  return {
    ok: true,
    data: createBrowserClient(config.data.url, config.data.anonKey),
  };
};
