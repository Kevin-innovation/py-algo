import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'next/navigation';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import TeacherLayout from './layout';
import { createSupabaseServerContext } from '../../lib/supabase/server';
import { getSupabaseCookies } from '../../lib/supabase/cookies';

vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

vi.mock('../../lib/supabase/cookies', () => ({
  getSupabaseCookies: vi.fn(),
}));

vi.mock('../../lib/supabase/server', () => ({
  createSupabaseServerContext: vi.fn(),
}));

describe('TeacherLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login if supabase config is missing', async () => {
    vi.mocked(getSupabaseCookies).mockResolvedValue({ getAll: vi.fn(), setAll: vi.fn() });
    vi.mocked(createSupabaseServerContext).mockReturnValue({
      ok: false,
      error: { code: 'SUPABASE_CONFIG_MISSING', message: 'Missing', scope: 'server' },
    });

    try {
      await TeacherLayout({ children: <div>Test</div> });
    } catch (e: unknown) {
      expect(e instanceof Error ? e.message : String(e)).toBe('NEXT_REDIRECT');
    }

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to /login if session is unavailable', async () => {
    vi.mocked(getSupabaseCookies).mockResolvedValue({ getAll: vi.fn(), setAll: vi.fn() });
    vi.mocked(createSupabaseServerContext).mockReturnValue({
      ok: true,
      data: {
        client: {} as unknown as SupabaseClient,
        readSession: vi.fn().mockResolvedValue({
          ok: false,
          error: { code: 'SUPABASE_SESSION_UNAVAILABLE', message: 'No session' },
        }),
      },
    });

    try {
      await TeacherLayout({ children: <div>Test</div> });
    } catch (e: unknown) {
      expect(e instanceof Error ? e.message : String(e)).toBe('NEXT_REDIRECT');
    }

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to consent-required when consent metadata is missing', async () => {
    vi.mocked(getSupabaseCookies).mockResolvedValue({ getAll: vi.fn(), setAll: vi.fn() });
    vi.mocked(createSupabaseServerContext).mockReturnValue({
      ok: true,
      data: {
        client: {} as unknown as SupabaseClient,
        readSession: vi.fn().mockResolvedValue({
          ok: true,
          data: {
            client: {} as unknown as SupabaseClient,
            session: {} as unknown as Session,
            user: { id: 'user-1', user_metadata: {} } as unknown as User,
          },
        }),
      },
    });

    try {
      await TeacherLayout({ children: <div>Test</div> });
    } catch (e: unknown) {
      expect(e instanceof Error ? e.message : String(e)).toBe('NEXT_REDIRECT');
    }

    expect(redirect).toHaveBeenCalledWith('/login?reason=consent-required');
  });

  it('renders children if session is valid', async () => {
    vi.mocked(getSupabaseCookies).mockResolvedValue({ getAll: vi.fn(), setAll: vi.fn() });
    vi.mocked(createSupabaseServerContext).mockReturnValue({
      ok: true,
      data: {
        client: {} as unknown as SupabaseClient,
        readSession: vi.fn().mockResolvedValue({
          ok: true,
          data: {
            client: {} as unknown as SupabaseClient,
            session: {} as unknown as Session,
            user: {
              id: 'user-1',
              user_metadata: { monitoringConsentAcceptedAt: '2026-04-01T00:00:00.000Z' },
            } as unknown as User,
          },
        }),
      },
    });

    const result = await TeacherLayout({ children: <div data-testid="child">Test</div> });

    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });
});
