import { beforeEach, describe, expect, it, vi } from 'vitest';

const createBrowserClientMock = vi.fn();
const createServerClientMock = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: (...args: unknown[]) => createBrowserClientMock(...args),
  createServerClient: (...args: unknown[]) => createServerClientMock(...args),
}));

import {
  createSupabaseBrowserClient,
  createSupabaseServerClient,
  createSupabaseServerContext,
  readSupabaseSession,
} from './index';

describe('supabase adapters', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://demo.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'public-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    createBrowserClientMock.mockReset();
    createServerClientMock.mockReset();
  });

  it('creates a browser client from the shared public config contract', () => {
    const browserClient = { kind: 'browser-client' };
    createBrowserClientMock.mockReturnValue(browserClient);

    const result = createSupabaseBrowserClient();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(createBrowserClientMock).toHaveBeenCalledWith(
      'https://demo.supabase.co/',
      'public-anon-key',
    );
    expect(result.data).toBe(browserClient);
  });

  it('creates a server client with cookie access for route handlers', () => {
    const serverClient = { kind: 'server-client' };
    const cookies = { getAll: vi.fn(), setAll: vi.fn() };
    createServerClientMock.mockReturnValue(serverClient);

    const result = createSupabaseServerClient(cookies as never);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(createServerClientMock).toHaveBeenCalledWith(
      'https://demo.supabase.co/',
      'public-anon-key',
      { cookies },
    );
    expect(result.data).toBe(serverClient);
  });

  it('reads a verified session instead of trusting cookie state alone', async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: { access_token: 'token' } } });
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } });
    const client = {
      auth: {
        getSession,
        getUser,
      },
    };

    const result = await readSupabaseSession(client as never);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(getSession).toHaveBeenCalledTimes(1);
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(result.data.session).toEqual({ access_token: 'token' });
    expect(result.data.user).toEqual({ id: 'user-1' });
  });

  it('exposes a bound server context with a safe session reader', async () => {
    const serverClient = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'token' } } }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-2' } } }),
      },
    };
    const cookies = { getAll: vi.fn(), setAll: vi.fn() };
    createServerClientMock.mockReturnValue(serverClient);

    const result = createSupabaseServerContext(cookies as never);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const sessionResult = await result.data.readSession();

    expect(sessionResult.ok).toBe(true);
    if (!sessionResult.ok) return;

    expect(sessionResult.data.client).toBe(serverClient);
    expect(sessionResult.data.user).toEqual({ id: 'user-2' });
  });
});
