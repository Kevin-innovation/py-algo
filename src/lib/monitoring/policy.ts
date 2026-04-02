export const MONITORING_CONSENT_METADATA_KEY = 'monitoringConsentAcceptedAt' as const;
export const MONITORING_RETENTION_DAYS = 30 as const;
export const MONITORING_RETENTION_MS = MONITORING_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export interface MonitoringConsentDecision {
  ok: boolean;
  code: 'ALLOW' | 'CONSENT_REQUIRED';
  reason: string;
}

export const isWithinMonitoringRetentionWindow = (
  createdAt: Date,
  now = new Date(),
): boolean => (
  now.getTime() - createdAt.getTime() <= MONITORING_RETENTION_MS
);

const hasConsentTimestamp = (metadata: unknown): boolean => {
  if (typeof metadata !== 'object' || metadata === null) return false;
  const value = (metadata as Record<string, unknown>)[MONITORING_CONSENT_METADATA_KEY];
  if (typeof value !== 'string') return false;
  return Number.isFinite(Date.parse(value));
};

export const enforceMonitoringConsent = (metadata: unknown): MonitoringConsentDecision => {
  if (hasConsentTimestamp(metadata)) {
    return {
      ok: true,
      code: 'ALLOW',
      reason: 'Monitoring consent metadata is present.',
    };
  }

  return {
    ok: false,
    code: 'CONSENT_REQUIRED',
    reason: 'Monitoring consent is required before accessing teacher monitoring surfaces.',
  };
};
