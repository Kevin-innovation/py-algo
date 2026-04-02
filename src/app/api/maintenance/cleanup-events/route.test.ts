import { beforeEach, describe, expect, it, vi } from 'vitest';

const readSessionMock = vi.fn();
const fromMock = vi.fn();
const rpcMock = vi.fn();

vi.mock('../../../../lib/supabase/cookies', () => ({
  getSupabaseCookies: vi.fn().mockResolvedValue({ getAll: vi.fn(), setAll: vi.fn() }),
}));

vi.mock('../../../../lib/supabase/server', () => ({
  createSupabaseServerContext: vi.fn(() => ({
    ok: true,
    data: {
      client: { from: fromMock, rpc: rpcMock },
      readSession: readSessionMock,
    },
  })),
}));

import { POST } from './route';

describe('POST /api/maintenance/cleanup-events', () => {
  beforeEach(() => {
    readSessionMock.mockReset();
    fromMock.mockReset();
    rpcMock.mockReset();
  });

  it('rejects non-admin user', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'user-1' } } });

    const profileMaybeSingle = vi.fn().mockResolvedValue({ data: { role: 'teacher' }, error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: profileMaybeSingle,
            }),
          }),
        };
      }

      return {};
    });

    const res = await POST();
    expect(res.status).toBe(403);
  });

  it('runs cleanup and returns deleted_count audit summary for admin', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'admin-1' } } });

    const profileMaybeSingle = vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: profileMaybeSingle,
            }),
          }),
        };
      }

      return {};
    });

    rpcMock.mockResolvedValue({
      data: [{ deleted_count: 42, executed_at: '2026-04-02T00:00:00.000Z' }],
      error: null,
    });

    const res = await POST();
    const body = await res.json() as { deletedCount?: number; retentionDays?: number };

    expect(res.status).toBe(200);
    expect(body.deletedCount).toBe(42);
    expect(body.retentionDays).toBe(30);
  });
});
