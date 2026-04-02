import { beforeEach, describe, expect, it } from 'vitest';
import { resolveSupabaseClientConfig, resolveSupabaseServerConfig } from './config';

describe('supabase config resolution', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('resolves client config when public env is present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://demo.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

    const result = resolveSupabaseClientConfig();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data).toEqual({
      url: 'https://demo.supabase.co/',
      anonKey: 'public-anon-key',
    });
  });

  it('returns deterministic missing env error for client config', () => {
    const result = resolveSupabaseClientConfig();

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.code).toBe('SUPABASE_CONFIG_MISSING');
    expect(result.error.scope).toBe('client');
    expect(result.error.missing).toEqual([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ]);
  });

  it('returns invalid url error for client config', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

    const result = resolveSupabaseClientConfig();

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.code).toBe('SUPABASE_CONFIG_INVALID');
    expect(result.error.invalid).toEqual([
      { key: 'NEXT_PUBLIC_SUPABASE_URL', reason: '유효한 URL이 아닙니다.' },
    ]);
  });

  it('resolves server config when all env is present', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://demo.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const result = resolveSupabaseServerConfig();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data).toEqual({
      url: 'https://demo.supabase.co/',
      anonKey: 'public-anon-key',
      serviceRoleKey: 'service-role-key',
    });
  });

  it('returns missing env error for server-only secrets', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://demo.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';

    const result = resolveSupabaseServerConfig();

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.code).toBe('SUPABASE_CONFIG_MISSING');
    expect(result.error.scope).toBe('server');
    expect(result.error.missing).toEqual(['SUPABASE_SERVICE_ROLE_KEY']);
  });
});
