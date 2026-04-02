import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import TeacherRealtimeMonitor from './TeacherRealtimeMonitor';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';

vi.mock('../lib/supabase/browser', () => ({
  createSupabaseBrowserClient: vi.fn(),
}));

describe('TeacherRealtimeMonitor', () => {
  let postgresCallback: ((payload: { new: unknown }) => void) | null;
  let subscribeCallback: ((state: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED') => void) | null;
  let client: {
    channel: ReturnType<typeof vi.fn>;
    removeChannel: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    postgresCallback = null;
    subscribeCallback = null;

    const channel = {
      on: vi.fn().mockImplementation((_, __, callback: (payload: { new: unknown }) => void) => {
        postgresCallback = callback;
        return channel;
      }),
      subscribe: vi.fn().mockImplementation((callback: (state: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED') => void) => {
        subscribeCallback = callback;
        return channel;
      }),
    };

    client = {
      channel: vi.fn().mockReturnValue(channel),
      removeChannel: vi.fn(),
    };

    vi.mocked(createSupabaseBrowserClient).mockReturnValue({
      ok: true,
      data: client as never,
    });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        teacherClasses: [{ id: 'class-1', name: 'Class 1' }],
        enrolledClasses: [],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    globalThis.fetch = fetchMock as typeof fetch;
  });

  const flushMicrotasks = async () => {
    await act(async () => {
      await Promise.resolve();
    });
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('shows LIVE when realtime subscription succeeds', async () => {
    render(<TeacherRealtimeMonitor />);

    await waitFor(() => {
      expect(client.channel).toHaveBeenCalled();
    });

    act(() => {
      subscribeCallback?.('SUBSCRIBED');
    });

    await waitFor(() => {
      expect(screen.getByText('LIVE')).toBeTruthy();
    });
  });

  it('shows STALE when no event arrives for 10 seconds', async () => {
    vi.useFakeTimers();
    render(<TeacherRealtimeMonitor />);

    await flushMicrotasks();
    await flushMicrotasks();
    expect(client.channel).toHaveBeenCalled();

    act(() => {
      subscribeCallback?.('SUBSCRIBED');
      postgresCallback?.({
        new: {
          id: 'event-1',
          session_id: 'session-1',
          student_id: 'student-1',
          class_id: 'class-1',
          sequence_number: 1,
          payload: { diff: 'print(1)' },
          created_at: new Date().toISOString(),
        },
      });
    });

    await flushMicrotasks();

    act(() => {
      vi.advanceTimersByTime(11_000);
    });

    expect(screen.getByText('STALE')).toBeTruthy();
    expect(screen.getByText(/최근 10초 동안 이벤트가 없어 stale 상태입니다/)).toBeTruthy();
  });

  it('retries subscription and recovers to LIVE when retry is clicked', async () => {
    render(<TeacherRealtimeMonitor />);

    await flushMicrotasks();
    await flushMicrotasks();
    const initialChannelCalls = client.channel.mock.calls.length;
    expect(initialChannelCalls).toBeGreaterThan(0);

    act(() => {
      subscribeCallback?.('CHANNEL_ERROR');
    });
    expect(screen.getByText('RECONNECTING')).toBeTruthy();
    expect(screen.getByText(/자동으로 재연결을 시도합니다/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '재연결 시도' }));
    await flushMicrotasks();

    expect(client.channel.mock.calls.length).toBeGreaterThan(initialChannelCalls);

    act(() => {
      subscribeCallback?.('SUBSCRIBED');
    });

    await waitFor(() => {
      expect(screen.getByText('LIVE')).toBeTruthy();
    });
  });

  it('moves to ERROR when reconnecting exceeds 30 seconds', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    render(<TeacherRealtimeMonitor />);

    await flushMicrotasks();
    await flushMicrotasks();

    act(() => {
      subscribeCallback?.('CHANNEL_ERROR');
    });

    await flushMicrotasks();

    act(() => {
      vi.advanceTimersByTime(31_000);
    });

    expect(screen.getByText('ERROR')).toBeTruthy();
    expect(screen.getByText(/재연결 시간이 30초를 초과했습니다/)).toBeTruthy();
  });
});
