import { beforeEach, describe, expect, it, vi } from 'vitest';

const readSessionMock = vi.fn();
const fromMock = vi.fn();
const generateUniqueJoinCodeMock = vi.fn();

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

vi.mock('../../../lib/classes/join-code', () => ({
  generateUniqueJoinCode: (...args: unknown[]) => generateUniqueJoinCodeMock(...args),
}));

import { POST } from './route';

const createReq = (body: unknown) => new Request('http://localhost/api/classes', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

describe('POST /api/classes', () => {
  beforeEach(() => {
    readSessionMock.mockReset();
    fromMock.mockReset();
    generateUniqueJoinCodeMock.mockReset();
  });

  it('returns 401 when session is unavailable', async () => {
    readSessionMock.mockResolvedValue({ ok: false, error: { code: 'SUPABASE_SESSION_UNAVAILABLE' } });

    const res = await POST(createReq({ name: 'Algo 1' }));
    expect(res.status).toBe(401);
  });

  it('creates class successfully for teacher role', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'teacher-1' } } });
    generateUniqueJoinCodeMock.mockResolvedValue('ABC234');

    const profileMaybeSingle = vi.fn().mockResolvedValue({ data: { role: 'teacher' }, error: null });
    const classCollisionCheck = vi.fn().mockResolvedValue({ data: null, error: null });
    const classInsertSingle = vi.fn().mockResolvedValue({
      data: { id: 'class-1', name: 'Algo 1', join_code: 'ABC234' },
      error: null,
    });

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

      if (table === 'classes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: classCollisionCheck,
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: classInsertSingle,
            }),
          }),
        };
      }

      return {};
    });

    const res = await POST(createReq({ name: 'Algo 1', description: 'sorting class' }));
    const body = await res.json() as { createdClass?: { join_code?: string } };

    expect(res.status).toBe(201);
    expect(body.createdClass?.join_code).toBe('ABC234');
  });
});
