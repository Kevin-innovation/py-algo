import { createHmac, timingSafeEqual } from 'crypto';

const TOKEN_TTL_SECONDS = 60 * 60;

const base64UrlEncode = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');
const base64UrlDecode = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payload: string, secret: string): string => (
  createHmac('sha256', secret).update(payload).digest('base64url')
);

const safeEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
};

export const createAnalyzeAuthToken = (secret: string, issuedAtMs = Date.now()): string => {
  const payload = base64UrlEncode(JSON.stringify({
    iat: Math.floor(issuedAtMs / 1000),
    exp: Math.floor(issuedAtMs / 1000) + TOKEN_TTL_SECONDS,
  }));
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
};

export const verifyAnalyzeAuthToken = (token: string, secret: string, nowMs = Date.now()): boolean => {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = sign(payload, secret);
  if (!safeEqual(signature, expectedSignature)) return false;

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as { exp?: number };
    if (typeof decoded.exp !== 'number') return false;
    return decoded.exp >= Math.floor(nowMs / 1000);
  } catch {
    return false;
  }
};
