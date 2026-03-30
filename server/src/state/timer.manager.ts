import { TIMER_TICK_INTERVAL_MS } from '@codenames/shared';

class TimerManager {
  private handles = new Map<string, ReturnType<typeof setInterval>>();

  startTimer(
    roomId: string,
    phase: 'spymaster' | 'operative',
    onTick: (remaining: number) => void,
    onExpire: () => void,
    durationMs: number,
  ): void {
    this.stopTimer(roomId);

    const startedAt = Date.now();
    const handle = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, durationMs - elapsed);
      onTick(remaining);
      if (remaining <= 0) {
        this.stopTimer(roomId);
        onExpire();
      }
    }, TIMER_TICK_INTERVAL_MS);

    this.handles.set(roomId, handle);
  }

  stopTimer(roomId: string): void {
    const handle = this.handles.get(roomId);
    if (handle !== undefined) {
      clearInterval(handle);
      this.handles.delete(roomId);
    }
  }

  isRunning(roomId: string): boolean {
    return this.handles.has(roomId);
  }
}

export const timerManager = new TimerManager();
