const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const JOIN_CODE_LENGTH = 6 as const;
export const JOIN_CODE_MAX_ATTEMPTS = 16 as const;

const randomInt = (maxExclusive: number): number => {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    return bytes[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
};

export const createJoinCodeCandidate = (): string => {
  let code = '';
  for (let idx = 0; idx < JOIN_CODE_LENGTH; idx += 1) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
};

export const isValidJoinCodeFormat = (value: string): boolean => (
  new RegExp(`^[${ALPHABET}]{${JOIN_CODE_LENGTH}}$`).test(value)
);

export const isJoinCodeExpired = (expiresAt: Date | null, now = new Date()): boolean => {
  if (!expiresAt) return false;
  return expiresAt.getTime() < now.getTime();
};

export const generateUniqueJoinCode = async (
  isTaken: (candidate: string) => Promise<boolean>,
  maxAttempts: number = JOIN_CODE_MAX_ATTEMPTS,
): Promise<string> => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = createJoinCodeCandidate();
    const taken = await isTaken(candidate);
    if (!taken) return candidate;
  }

  throw new Error('JOIN_CODE_GENERATION_FAILED');
};

export interface JoinCodeEnrollmentInput {
  providedCode: string;
  classJoinCode: string;
  joinCodeExpiresAt: Date | null;
  alreadyEnrolled: boolean;
}

export type JoinCodeEnrollmentDecision =
  | { ok: true; code: 'ALLOW' }
  | { ok: false; code: 'JOIN_CODE_INVALID' | 'JOIN_CODE_EXPIRED' | 'ALREADY_ENROLLED' };

export const evaluateJoinCodeEnrollment = ({
  providedCode,
  classJoinCode,
  joinCodeExpiresAt,
  alreadyEnrolled,
}: JoinCodeEnrollmentInput): JoinCodeEnrollmentDecision => {
  if (alreadyEnrolled) {
    return { ok: false, code: 'ALREADY_ENROLLED' };
  }

  if (!isValidJoinCodeFormat(providedCode) || providedCode !== classJoinCode) {
    return { ok: false, code: 'JOIN_CODE_INVALID' };
  }

  if (isJoinCodeExpired(joinCodeExpiresAt)) {
    return { ok: false, code: 'JOIN_CODE_EXPIRED' };
  }

  return { ok: true, code: 'ALLOW' };
};
