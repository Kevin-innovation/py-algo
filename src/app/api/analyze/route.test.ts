import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateContentMock = vi.fn();
const cookiesMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: generateContentMock,
    }),
  })),
}));

import { POST } from './route';

const createReq = (body: unknown) => new Request('http://localhost/api/analyze', {
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

const createResponsePayload = (text: string, finishReason = 'STOP') => ({
  response: Promise.resolve({
    text: () => text,
    candidates: [{ finishReason }],
  }),
});

describe('POST /api/analyze', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    generateContentMock.mockReset();
    cookiesMock.mockReturnValue({
      get: (name: string) => (name === 'ai_analyze_auth' ? { value: '1' } : undefined),
    });
  });

  it('returns 400 when code is empty', async () => {
    const res = await POST(createReq({ code: '   ' }));
    expect(res.status).toBe(400);
  });

  it('returns 401 when auth cookie is missing', async () => {
    cookiesMock.mockReturnValue({ get: () => undefined });
    const res = await POST(createReq({ code: 'print(1)' }));
    expect(res.status).toBe(401);
  });

  it('returns 401 for forged auth cookie', async () => {
    cookiesMock.mockReturnValue({ get: () => ({ value: 'ai_analyze_auth=1' }) });
    const res = await POST(createReq({ code: 'print(1)' }));
    expect(res.status).toBe(401);
  });

  it('marks diagnostics as truncated for long code', async () => {
    generateContentMock.mockResolvedValueOnce(createResponsePayload('ok'));
    const longCode = 'a'.repeat(12000);

    const res = await POST(createReq({ code: longCode }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.diagnostics.truncatedInput).toBe(true);
    expect(data.result).toBe('ok');
  });

  it('retries when AI returns empty response', async () => {
    generateContentMock
      .mockResolvedValueOnce(createResponsePayload(''))
      .mockResolvedValueOnce(createResponsePayload('second try success'));

    const res = await POST(createReq({ code: 'print(123)' }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.result).toContain('second try success');
    expect(generateContentMock).toHaveBeenCalledTimes(2);
  });
});
