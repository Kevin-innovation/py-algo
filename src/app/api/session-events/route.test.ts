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

const createReq = (body: unknown) => new Request('http://localhost/api/session-events', {
  method: 'POST',
  body: typeof body === 'string' ? body : JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

describe('POST /api/session-events', () => {
  beforeEach(() => {
    readSessionMock.mockReset();
    fromMock.mockReset();
  });

  it('rejects payload larger than 64KB', async () => {
    const res = await POST(createReq({
      sessionId: 'sess-1',
      classId: 'class-1',
      diff: 'x'.repeat((64 * 1024) + 1),
    }));

    expect(res.status).toBe(413);
  });

  it('rejects events arriving faster than 500ms cadence', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'user-1' } } });

    const activeSession = vi.fn().mockResolvedValue({
      data: { id: 'sess-1', class_id: 'class-1', student_id: 'user-1', status: 'active', last_heartbeat_at: new Date().toISOString() },
      error: null,
    });

    const lastEvent = vi.fn().mockResolvedValue({
      data: { created_at: new Date().toISOString(), sequence_number: 3 },
      error: null,
    });

    fromMock.mockImplementation((table: string) => {
      if (table === 'coding_sessions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: activeSession,
              }),
            }),
          }),
        };
      }

      if (table === 'session_events') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: lastEvent,
                }),
              }),
            }),
          }),
        };
      }

      return {};
    });

    const res = await POST(createReq({ sessionId: 'sess-1', classId: 'class-1', diff: 'a+=1' }));
    expect(res.status).toBe(429);
  });

  it('accepts compliant payload and persists event', async () => {
    readSessionMock.mockResolvedValue({ ok: true, data: { user: { id: 'user-1' } } });

    const activeSession = vi.fn().mockResolvedValue({
      data: { id: 'sess-1', class_id: 'class-1', student_id: 'user-1', status: 'active', last_heartbeat_at: new Date().toISOString() },
      error: null,
    });

    const oldEvent = vi.fn().mockResolvedValue({
      data: { created_at: '2020-01-01T00:00:00.000Z', sequence_number: 5 },
      error: null,
    });

    const insertEvent = vi.fn().mockResolvedValue({
      data: { id: 'evt-1', event_type: 'code_diff', sequence_number: 6 },
      error: null,
    });

    fromMock.mockImplementation((table: string) => {
      if (table === 'coding_sessions') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: activeSession,
              }),
            }),
          }),
        };
      }

      if (table === 'session_events') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () => ({
                  maybeSingle: oldEvent,
                }),
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: insertEvent,
            }),
          }),
        };
      }

      return {};
    });

    const res = await POST(createReq({ sessionId: 'sess-1', classId: 'class-1', diff: 'a+=1' }));
    const body = await res.json() as { channels?: { classScope?: string; studentScope?: string } };

    expect(res.status).toBe(201);
    expect(body.channels?.classScope).toBe('teacher:class:class-1');
    expect(body.channels?.studentScope).toBe('teacher:class:class-1:student:user-1');
  });
});
