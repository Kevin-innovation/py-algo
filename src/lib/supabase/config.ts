export const SUPABASE_ENV_KEYS = {
  url: 'NEXT_PUBLIC_SUPABASE_URL',
  anonKey: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  serviceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
} as const;

export type SupabaseConfigScope = 'client' | 'server';

export type SupabaseConfigErrorCode = 'SUPABASE_CONFIG_MISSING' | 'SUPABASE_CONFIG_INVALID';

export interface SupabaseConfigError {
  code: SupabaseConfigErrorCode;
  message: string;
  scope: SupabaseConfigScope;
  missing?: string[];
  invalid?: Array<{ key: string; reason: string }>;
}

export interface SupabaseClientConfig {
  url: string;
  anonKey: string;
}

export interface SupabaseServerConfig extends SupabaseClientConfig {
  serviceRoleKey: string;
}

export type SupabaseConfigResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: SupabaseConfigError };

const readEnv = (key: string): string => {
  const value = process.env[key];
  return typeof value === 'string' ? value.trim() : '';
};

const buildMissingError = (scope: SupabaseConfigScope, missing: string[]): SupabaseConfigError => ({
  code: 'SUPABASE_CONFIG_MISSING',
  message: 'Supabase 환경 설정이 누락되었습니다.',
  scope,
  missing,
});

const buildInvalidError = (scope: SupabaseConfigScope, invalid: Array<{ key: string; reason: string }>): SupabaseConfigError => ({
  code: 'SUPABASE_CONFIG_INVALID',
  message: 'Supabase 환경 설정 형식이 올바르지 않습니다.',
  scope,
  invalid,
});

const validateUrl = (value: string): string | null => {
  try {
    const parsed = new URL(value);
    return parsed.toString();
  } catch {
    return null;
  }
};

export const resolveSupabaseClientConfig = (): SupabaseConfigResult<SupabaseClientConfig> => {
  const missing: string[] = [];
  const url = readEnv(SUPABASE_ENV_KEYS.url);
  const anonKey = readEnv(SUPABASE_ENV_KEYS.anonKey);

  if (!url) missing.push(SUPABASE_ENV_KEYS.url);
  if (!anonKey) missing.push(SUPABASE_ENV_KEYS.anonKey);

  if (missing.length > 0) {
    return { ok: false, error: buildMissingError('client', missing) };
  }

  const normalizedUrl = validateUrl(url);
  if (!normalizedUrl) {
    return {
      ok: false,
      error: buildInvalidError('client', [{ key: SUPABASE_ENV_KEYS.url, reason: '유효한 URL이 아닙니다.' }]),
    };
  }

  return {
    ok: true,
    data: {
      url: normalizedUrl,
      anonKey,
    },
  };
};

export const resolveSupabaseServerConfig = (): SupabaseConfigResult<SupabaseServerConfig> => {
  const clientConfig = resolveSupabaseClientConfig();
  if (!clientConfig.ok) {
    return clientConfig;
  }

  const serviceRoleKey = readEnv(SUPABASE_ENV_KEYS.serviceRoleKey);
  if (!serviceRoleKey) {
    return {
      ok: false,
      error: buildMissingError('server', [SUPABASE_ENV_KEYS.serviceRoleKey]),
    };
  }

  return {
    ok: true,
    data: {
      ...clientConfig.data,
      serviceRoleKey,
    },
  };
};
