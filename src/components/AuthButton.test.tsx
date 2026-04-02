import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import AuthButton from './AuthButton';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('../lib/supabase/browser', () => ({
  createSupabaseBrowserClient: vi.fn(),
}));

describe('AuthButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login link when not authenticated', async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue({
      ok: true,
      data: {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
      } as unknown as SupabaseClient,
    });

    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByText('로그인')).toBeTruthy();
    });
  });

  it('renders dashboard and logout buttons when authenticated', async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue({
      ok: true,
      data: {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: '1' } } } }),
          onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
      } as unknown as SupabaseClient,
    });

    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByText('대시보드')).toBeTruthy();
      expect(screen.getByText('로그아웃')).toBeTruthy();
    });
  });
});
