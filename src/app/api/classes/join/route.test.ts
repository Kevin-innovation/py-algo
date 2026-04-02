import { beforeEach, describe, expect, it, vi } from 'vitest';

const readSessionMock = vi.fn();
const fromMock = vi.fn();

vi.mock('../../../../lib/supabase/cookies', () => ({
  getSupabaseCookies: vi.fn().mockResolvedValue({ getAll: vi.fn(), setAll: vi.fn() }),
}));

vi.mock('../../../../lib/supabase/server', () => ({
  createSupabaseServerContext: vi.fn(() => ({
    ok: true,
    data: {
      client: { from: fromMock },
      readSession: readSessionMock,
    },
  })),
}));

import { POST } from './route';

const createReq = (body: unknown) => new Request('http://localhost/api/classes/join', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

describe('POST /api/classes/join', () => {
  beforeEach(() => {
    readSessionMock.mockReset();
    fromMock.mockReset();
  });

  it('returns 404 when join code does not map to class', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'student-1' } } });

    const classMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
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
      return {};
    });

    const res = await POST(createReq({ joinCode: 'ABC234' }));
    expect(res.status).toBe(404);
  });

  it('returns 403 for expired join code', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'student-1' } } });

    const classMaybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'class-1',
        join_code: 'ABC234',
        join_code_expires_at: '2020-01-01T00:00:00.000Z',
      },
      error: null,
    });
    const enrollmentMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });

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

      if (table === 'enrollments') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: enrollmentMaybeSingle,
                }),
              }),
            }),
          }),
        };
      }

      return {};
    });

    const res = await POST(createReq({ joinCode: 'ABC234' }));
    expect(res.status).toBe(403);
  });
});
