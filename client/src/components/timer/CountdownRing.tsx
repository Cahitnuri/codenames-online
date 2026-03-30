import { cn } from '../../utils/cn';
import { formatMs } from '../../utils/format';

interface CountdownRingProps {
  remaining: number;
  duration: number;
  phase: 'spymaster' | 'operative' | 'idle';
}

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownRing({ remaining, duration, phase }: CountdownRingProps) {
  if (phase === 'idle' || duration === 0) return null;

  const progress = duration > 0 ? Math.max(0, remaining / duration) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const isLow = remaining < 10_000;
  const isSpyPhase = phase === 'spymaster';

  const strokeColor = isLow ? '#EF4444' : isSpyPhase ? '#F59E0B' : '#3B82F6';
  const glowColor = isLow ? 'rgba(239,68,68,0.7)' : isSpyPhase ? 'rgba(245,158,11,0.6)' : 'rgba(59,130,246,0.6)';
  const bgStroke = '#1A2035';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className={cn(isLow && 'animate-timer-pulse')}
        style={isLow ? { filter: `drop-shadow(0 0 6px ${glowColor})` } : undefined}
      >
        {/* Track */}
        <circle cx="32" cy="32" r={RADIUS} fill="none" stroke={bgStroke} strokeWidth="3.5" />
        {/* Progress arc */}
        <circle
          cx="32" cy="32" r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 32 32)"
          style={{
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s ease',
            filter: `drop-shadow(0 0 4px ${glowColor})`,
          }}
        />
      </svg>

      {/* Time label */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-mono-code font-bold tabular-nums leading-none',
            isLow ? 'text-red-400 text-sm' : 'text-white text-sm',
          )}
        >
          {formatMs(remaining)}
        </span>
        <span className="font-mono-code text-slate-600 tracking-wider" style={{ fontSize: '7px' }}>
          {isSpyPhase ? 'İST' : 'AJAN'}
        </span>
      </div>
    </div>
  );
}
