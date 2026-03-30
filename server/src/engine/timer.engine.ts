import type { TimerState } from '@codenames/shared';
import { SPYMASTER_TIMER_MS, OPERATIVE_TIMER_MS } from '@codenames/shared';

export function createTimer(phase: 'spymaster' | 'operative'): TimerState {
  const duration = phase === 'spymaster' ? SPYMASTER_TIMER_MS : OPERATIVE_TIMER_MS;
  return {
    phase,
    startedAt: Date.now(),
    duration,
    remaining: duration,
  };
}

export function tickTimer(timer: TimerState): TimerState {
  const remaining = Math.max(0, timer.duration - (Date.now() - timer.startedAt));
  return { ...timer, remaining };
}

export function isExpired(timer: TimerState): boolean {
  return timer.remaining <= 0;
}
