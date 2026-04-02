import { describe, expect, it } from 'vitest';

import {
  MONITORING_CONSENT_METADATA_KEY,
  MONITORING_RETENTION_DAYS,
  enforceMonitoringConsent,
  isWithinMonitoringRetentionWindow,
} from './policy';

describe('monitoring policy', () => {
  it('blocks access when monitoring consent metadata is missing', () => {
    const decision = enforceMonitoringConsent({});

    expect(decision.ok).toBe(false);
    expect(decision.code).toBe('CONSENT_REQUIRED');
  });

  it('allows access when monitoring consent metadata has a valid timestamp', () => {
    const decision = enforceMonitoringConsent({
      [MONITORING_CONSENT_METADATA_KEY]: '2026-04-01T00:00:00.000Z',
    });

    expect(decision.ok).toBe(true);
    expect(decision.code).toBe('ALLOW');
  });

  it('accepts records exactly at retention threshold and rejects one millisecond older', () => {
    const now = new Date('2026-04-02T00:00:00.000Z');
    const exactThreshold = new Date(now.getTime() - (MONITORING_RETENTION_DAYS * 24 * 60 * 60 * 1000));
    const tooOld = new Date(exactThreshold.getTime() - 1);

    expect(isWithinMonitoringRetentionWindow(exactThreshold, now)).toBe(true);
    expect(isWithinMonitoringRetentionWindow(tooOld, now)).toBe(false);
  });
});
