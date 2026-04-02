import { describe, expect, it, vi } from 'vitest';

import {
  JOIN_CODE_LENGTH,
  evaluateJoinCodeEnrollment,
  generateUniqueJoinCode,
  isJoinCodeExpired,
  isValidJoinCodeFormat,
} from './join-code';

describe('join-code domain service', () => {
  it('validates fixed-length uppercase join code format', () => {
    expect(isValidJoinCodeFormat('ABC234')).toBe(true);
    expect(isValidJoinCodeFormat('abc234')).toBe(false);
    expect(isValidJoinCodeFormat('ABC23')).toBe(false);
  });

  it('handles join-code expiry boundaries', () => {
    const now = new Date('2026-04-02T00:00:00.000Z');
    const expired = new Date('2026-04-01T23:59:59.999Z');
    const future = new Date('2026-04-02T00:00:00.001Z');

    expect(isJoinCodeExpired(expired, now)).toBe(true);
    expect(isJoinCodeExpired(future, now)).toBe(false);
    expect(isJoinCodeExpired(null, now)).toBe(false);
  });

  it('retries collision candidates until available code is generated', async () => {
    const isTaken = vi
      .fn<(candidate: string) => Promise<boolean>>()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const code = await generateUniqueJoinCode(async (candidate) => isTaken(candidate), 5);

    expect(code).toHaveLength(JOIN_CODE_LENGTH);
    expect(isTaken).toHaveBeenCalledTimes(3);
  });

  it('returns deterministic enrollment decisions for invalid, expired, and success cases', () => {
    expect(evaluateJoinCodeEnrollment({
      providedCode: 'ABC234',
      classJoinCode: 'ABC234',
      joinCodeExpiresAt: null,
      alreadyEnrolled: true,
    })).toEqual({ ok: false, code: 'ALREADY_ENROLLED' });

    expect(evaluateJoinCodeEnrollment({
      providedCode: 'wrong!',
      classJoinCode: 'ABC234',
      joinCodeExpiresAt: null,
      alreadyEnrolled: false,
    })).toEqual({ ok: false, code: 'JOIN_CODE_INVALID' });

    expect(evaluateJoinCodeEnrollment({
      providedCode: 'ABC234',
      classJoinCode: 'ABC234',
      joinCodeExpiresAt: new Date('2026-04-01T00:00:00.000Z'),
      alreadyEnrolled: false,
    })).toEqual({ ok: false, code: 'JOIN_CODE_EXPIRED' });

    expect(evaluateJoinCodeEnrollment({
      providedCode: 'ABC234',
      classJoinCode: 'ABC234',
      joinCodeExpiresAt: new Date('2999-01-01T00:00:00.000Z'),
      alreadyEnrolled: false,
    })).toEqual({ ok: true, code: 'ALLOW' });
  });
});
