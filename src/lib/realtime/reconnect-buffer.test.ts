import { describe, expect, it } from 'vitest';

import { DEFAULT_RECONNECT_WINDOW_MS, ReconnectBuffer } from './reconnect-buffer';

describe('ReconnectBuffer', () => {
  it('replays buffered diffs when reconnected within 30s window', () => {
    const buffer = new ReconnectBuffer(DEFAULT_RECONNECT_WINDOW_MS);
    const queuedAt = 1_000;

    buffer.enqueue('a+=1', queuedAt);
    buffer.enqueue('print(a)', queuedAt + 500);

    const result = buffer.replay(queuedAt + 29_000);

    expect(result.ok).toBe(true);
    expect(result.code).toBe('REPLAY_OK');
    expect(result.replay).toHaveLength(2);
    expect(buffer.snapshot()).toHaveLength(0);
  });

  it('fails explicitly when reconnect occurs after 30s timeout', () => {
    const buffer = new ReconnectBuffer(DEFAULT_RECONNECT_WINDOW_MS);
    const queuedAt = 10_000;

    buffer.enqueue('x=1', queuedAt);

    const result = buffer.replay(queuedAt + DEFAULT_RECONNECT_WINDOW_MS + 1);

    expect(result.ok).toBe(false);
    expect(result.code).toBe('RECONNECT_TIMEOUT');
    expect(result.replay).toHaveLength(1);
    expect(buffer.snapshot()).toHaveLength(0);
  });
});
