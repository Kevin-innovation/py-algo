export const DEFAULT_RECONNECT_WINDOW_MS = 30_000 as const;

export interface BufferedDiffEvent {
  diff: string;
  queuedAt: number;
}

export interface ReplayDecision {
  ok: boolean;
  replay: BufferedDiffEvent[];
  code: 'REPLAY_OK' | 'RECONNECT_TIMEOUT';
}

export class ReconnectBuffer {
  private readonly windowMs: number;

  private readonly queue: BufferedDiffEvent[] = [];

  constructor(windowMs = DEFAULT_RECONNECT_WINDOW_MS) {
    this.windowMs = windowMs;
  }

  enqueue(diff: string, queuedAt = Date.now()): void {
    this.queue.push({ diff, queuedAt });
  }

  snapshot(): BufferedDiffEvent[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue.length = 0;
  }

  replay(now = Date.now()): ReplayDecision {
    if (this.queue.length === 0) {
      return { ok: true, replay: [], code: 'REPLAY_OK' };
    }

    const oldest = this.queue[0];
    const elapsed = now - oldest.queuedAt;

    if (elapsed > this.windowMs) {
      const dropped = this.snapshot();
      this.clear();
      return { ok: false, replay: dropped, code: 'RECONNECT_TIMEOUT' };
    }

    const replayItems = this.snapshot();
    this.clear();
    return { ok: true, replay: replayItems, code: 'REPLAY_OK' };
  }
}
