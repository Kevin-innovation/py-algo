import { beforeEach, describe, expect, it, vi } from 'vitest';

const readSessionMock = vi.fn();
const fromMock = vi.fn();

vi.mock('../../../lib/supabase/cookies', () => ({
  getSupabaseCookies: vi.fn().mockResolvedValue({ getAll: vi.fn(), setAll: vi.fn() }),
}));

vi.mock('../../../lib/supabase/server', () => ({
  createSupabaseServerContext: vi.fn(() => ({
    ok: true,
    data: {
      client: { from: fromMock },
      readSession: readSessionMock,
    },
  })),
}));

import { POST } from './route';

const createReq = (body: unknown) => new Request('http://localhost/api/sessions', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

describe('POST /api/sessions', () => {
  beforeEach(() => {
    readSessionMock.mockReset();
    fromMock.mockReset();
  });

  it('starts a session for accessible class', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'user-1' } } });

    const classMaybeSingle = vi.fn().mockResolvedValue({ data: { id: 'class-1', teacher_id: 'user-1' }, error: null });
    const insertSingle = vi.fn().mockResolvedValue({ data: { id: 'sess-1', status: 'active' }, error: null });

    fromMock.mockImplementation((table: string) => {
      if (table === 'classes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: classMaybeSingle,
              }),
            }),
          }),
        };
      }

      if (table === 'coding_sessions') {
        return {
          insert: () => ({
            select: () => ({
              single: insertSingle,
            }),
          }),
        };
      }

      return {};
    });

    const res = await POST(createReq({ action: 'start', classId: 'class-1', exerciseId: 'algo-1' }));
    expect(res.status).toBe(201);
  });

  it('rejects heartbeat without sessionId', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'user-1' } } });

    const res = await POST(createReq({ action: 'heartbeat' }));
    expect(res.status).toBe(400);
  });

  it('rejects end for non-existing session', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'user-1' } } });

    const sessionMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === 'coding_sessions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: sessionMaybeSingle,
              }),
            }),
          }),
        };
      }

      return {};
    });

    const res = await POST(createReq({ action: 'end', sessionId: 'missing' }));
    expect(res.status).toBe(404);
  });
});
