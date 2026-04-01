import { beforeEach, describe, expect, it } from 'vitest';
import { POST } from './route';

const createReq = (password: string) => new Request('http://localhost/api/analyze/auth', {
  method: 'POST',
  body: JSON.stringify({ password }),
  headers: { 'Content-Type': 'application/json' },
});

describe('POST /api/analyze/auth', () => {
  beforeEach(() => {
    process.env.AI_ANALYZE_PASSWORD = 'test-password';
  });

  it('sets auth cookie on valid password', async () => {
    const res = await POST(createReq('test-password'));
    expect(res.status).toBe(200);
    const cookieHeader = res.headers.get('set-cookie') ?? '';
    expect(cookieHeader).toContain('ai_analyze_auth=1');
  });

  it('returns 401 on invalid password', async () => {
    const res = await POST(createReq('wrong'));
    expect(res.status).toBe(401);
  });

  it('returns config-missing error when auth env is not set', async () => {
    delete process.env.AI_ANALYZE_PASSWORD;

    const res = await POST(createReq('anything'));
    expect(res.status).toBe(500);

    const body = await res.json() as { code?: string; missing?: string[] };
    expect(body.code).toBe('AUTH_CONFIG_MISSING');
    expect(body.missing).toEqual(expect.arrayContaining(['AI_ANALYZE_PASSWORD']));
  });
});
