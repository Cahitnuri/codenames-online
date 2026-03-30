import { useState, useEffect } from 'react';
import type { Card } from '@codenames/shared';
import { cn } from '../../utils/cn';

interface WordCardProps {
  card: Card;
  isSpymaster: boolean;
  canClick: boolean;
  sabotageMode: boolean;
  onClick: () => void;
}

// Revealed card styles
const REVEALED_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  red: {
    bg: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
    text: '#FFFFFF',
    border: 'rgba(220,38,38,0.6)',
  },
  blue: {
    bg: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
    text: '#FFFFFF',
    border: 'rgba(37,99,235,0.6)',
  },
  neutral: {
    bg: 'linear-gradient(135deg, #78350F 0%, #92400E 100%)',
    text: '#FDE68A',
    border: 'rgba(146,64,14,0.6)',
  },
  assassin: {
    bg: 'linear-gradient(135deg, #030712 0%, #0A0A0F 100%)',
    text: '#9CA3AF',
    border: 'rgba(75,85,99,0.5)',
  },
};

// Spymaster hint border colors for unrevealed cards
const SPY_HINT_COLORS: Record<string, string> = {
  red: 'rgba(220,38,38,0.7)',
  blue: 'rgba(37,99,235,0.7)',
  neutral: 'rgba(146,64,14,0.6)',
  assassin: 'rgba(107,114,128,0.6)',
};

const SPY_HINT_BG: Record<string, string> = {
  red: 'rgba(127,29,29,0.2)',
  blue: 'rgba(29,78,216,0.2)',
  neutral: 'rgba(120,53,15,0.15)',
  assassin: 'rgba(17,24,39,0.4)',
};

export default function WordCard({ card, isSpymaster, canClick, sabotageMode, onClick }: WordCardProps) {
  const [animating, setAnimating] = useState(false);
  const [wasRevealed, setWasRevealed] = useState(card.revealed);

  useEffect(() => {
    if (card.revealed && !wasRevealed) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 550);
      setWasRevealed(true);
      return () => clearTimeout(t);
    }
  }, [card.revealed, wasRevealed]);

  const isClickable = canClick && !card.revealed && !card.sabotaged;

  // Build inline styles for revealed vs unrevealed
  const revealedStyle = REVEALED_STYLES[card.owner];

  let cardStyle: React.CSSProperties = {};
  let cardClassName = '';

  if (card.revealed && revealedStyle) {
    cardStyle = {
      background: revealedStyle.bg,
      color: revealedStyle.text,
      borderColor: revealedStyle.border,
      boxShadow: card.owner === 'red'
        ? '0 4px 16px rgba(220,38,38,0.3)'
        : card.owner === 'blue'
          ? '0 4px 16px rgba(37,99,235,0.3)'
          : card.owner === 'assassin'
            ? '0 4px 16px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.5)'
            : '0 2px 8px rgba(0,0,0,0.3)',
    };
    cardClassName = 'word-card border opacity-90';
  } else if (isSpymaster && !card.revealed) {
    cardStyle = {
      backgroundColor: SPY_HINT_BG[card.owner] ?? 'rgba(30,30,50,0.5)',
      borderColor: SPY_HINT_COLORS[card.owner] ?? 'rgba(255,255,255,0.1)',
      color: '#E2E8F0',
    };
    cardClassName = 'word-card border-2';
  } else {
    cardClassName = 'word-card-unknown';
    cardStyle = {};
  }

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        cardClassName,
        'font-mono-code transition-all duration-200 select-none relative overflow-hidden',
        isClickable && !sabotageMode && 'cursor-pointer',
        isClickable && sabotageMode && 'cursor-crosshair',
        !isClickable && 'cursor-default',
        animating && 'animate-flip-card',
        // hover effects only for clickable unrevealed cards
        isClickable && !sabotageMode && !card.revealed && 'hover:-translate-y-1.5 hover:shadow-card-hover',
        isClickable && sabotageMode && !card.revealed && 'hover:brightness-75',
        card.sabotaged && 'opacity-40',
      )}
      style={cardStyle}
    >
      {/* Word text */}
      <span className="relative z-10 px-1 leading-tight break-all text-center"
        style={{ fontSize: 'clamp(7px, 1vw, 12px)', fontWeight: 700, letterSpacing: '0.1em' }}>
        {card.word}
      </span>

      {/* Assassin skull overlay */}
      {card.revealed && card.owner === 'assassin' && (
        <div className="absolute inset-0 flex items-end justify-end p-1 pointer-events-none">
          <span className="text-gray-700 text-xs">☠</span>
        </div>
      )}

      {/* Spymaster color indicator dot */}
      {isSpymaster && !card.revealed && (
        <span className={cn(
          'absolute bottom-1 right-1 w-2 h-2 rounded-full border border-black/20',
          card.owner === 'red' && 'bg-red-500',
          card.owner === 'blue' && 'bg-blue-500',
          card.owner === 'neutral' && 'bg-amber-600',
          card.owner === 'assassin' && 'bg-gray-500',
        )} />
      )}

      {/* Sabotaged overlay */}
      {card.sabotaged && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-orange-950/60 z-20">
          <span className="text-orange-400 text-base">⊘</span>
        </div>
      )}

      {/* Hover shimmer for unrevealed clickable */}
      {isClickable && !sabotageMode && !card.revealed && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />
      )}
    </button>
  );
}
