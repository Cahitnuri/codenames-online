import { useState, useEffect } from 'react';
import type { Card } from '@codenames/shared';
import { cn } from '../../utils/cn';
import CardIllustration from './CardIllustrations';

interface WordCardProps {
  card: Card;
  isSpymaster: boolean;
  canClick: boolean;
  onClick: () => void;
  indicatingInitials: string[];
  isMyIndication: boolean;
}

const REVEALED_STYLES: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
  red: {
    bg: 'linear-gradient(135deg, #c46040 0%, #d97b56 100%)',
    text: '#fff',
    border: '#c46040',
    shadow: '0 4px 14px rgba(217,123,86,0.4)',
  },
  blue: {
    bg: 'linear-gradient(135deg, #3d6b8a 0%, #5a87a8 100%)',
    text: '#fff',
    border: '#3d6b8a',
    shadow: '0 4px 14px rgba(90,135,168,0.4)',
  },
  neutral: {
    bg: 'linear-gradient(135deg, #7a5c3a 0%, #9a7350 100%)',
    text: '#f5e8d0',
    border: '#7a5c3a',
    shadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  assassin: {
    bg: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
    text: '#9ca3af',
    border: '#444',
    shadow: '0 4px 14px rgba(0,0,0,0.6)',
  },
};

const SPY_HINT_BG: Record<string, string> = {
  red: 'rgba(217,123,86,0.22)',
  blue: 'rgba(90,135,168,0.22)',
  neutral: 'rgba(154,115,80,0.2)',
  assassin: 'rgba(30,30,30,0.4)',
};

const SPY_HINT_BORDER: Record<string, string> = {
  red: '#d97b5680',
  blue: '#5a87a880',
  neutral: '#9a735060',
  assassin: '#55555580',
};

export default function WordCard({ card, isSpymaster, canClick, onClick, indicatingInitials, isMyIndication }: WordCardProps) {
  const [animating, setAnimating] = useState(false);
  const [wasRevealed, setWasRevealed] = useState(card.revealed);

  useEffect(() => {
    if (card.revealed && !wasRevealed) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 500);
      setWasRevealed(true);
      return () => clearTimeout(t);
    }
  }, [card.revealed, wasRevealed]);

  const isClickable = canClick && !card.revealed;
  const revealedStyle = REVEALED_STYLES[card.owner];

  let cardStyle: React.CSSProperties = {};
  let cardClassName = '';

  if (card.revealed && revealedStyle) {
    cardStyle = {
      borderColor: revealedStyle.border,
      boxShadow: revealedStyle.shadow,
      background: 'transparent',
      color: '#fff',
    };
    cardClassName = 'word-card border opacity-95 overflow-hidden';
  } else if (isSpymaster && !card.revealed) {
    cardStyle = {
      backgroundColor: SPY_HINT_BG[card.owner] ?? 'rgba(239,230,214,0.6)',
      borderColor: SPY_HINT_BORDER[card.owner] ?? '#d6c7b280',
      color: '#2d1f14',
    };
    cardClassName = 'word-card border-2';
  } else {
    cardClassName = 'word-card-unknown';
    cardStyle = {};
  }

  if (isMyIndication && !card.revealed) {
    cardStyle = {
      ...cardStyle,
      outline: '2px solid #f59e0b',
      outlineOffset: '2px',
    };
  } else if (indicatingInitials.length > 0 && !card.revealed) {
    cardStyle = {
      ...cardStyle,
      outline: '1px solid rgba(245,158,11,0.5)',
      outlineOffset: '2px',
    };
  }

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={cn(
        cardClassName,
        'transition-all select-none relative overflow-hidden',
        isClickable && 'cursor-pointer',
        !isClickable && 'cursor-default',
        animating && 'animate-flip-card',
      )}
      style={cardStyle}
    >
      {/* Card illustration (revealed) */}
      {card.revealed && (
        <div className="absolute inset-0 z-0">
          <CardIllustration cardId={card.id} />
        </div>
      )}

      {/* Revealed word band at bottom */}
      {card.revealed && (
        <div
          className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center py-1 px-1"
          style={{ background: revealedStyle ? `${revealedStyle.border}e6` : 'rgba(0,0,0,0.75)' }}
        >
          <span style={{ fontSize: 'clamp(7px, 0.9vw, 11px)', fontWeight: 800, letterSpacing: '0.06em', color: '#fff' }}>
            {card.word}
          </span>
        </div>
      )}

      {/* Indicating players' initials */}
      {indicatingInitials.length > 0 && !card.revealed && (
        <div className="absolute top-1 left-1 flex gap-0.5 z-10 pointer-events-none">
          {indicatingInitials.slice(0, 4).map((initial, i) => (
            <span
              key={i}
              className="text-[9px] font-bold leading-none px-1 py-0.5 rounded"
              style={{
                background: isMyIndication && i === indicatingInitials.indexOf(indicatingInitials.find((_, idx) => idx === 0) ?? '') ? 'rgba(245,158,11,0.85)' : 'rgba(0,0,0,0.55)',
                color: '#fff',
              }}
            >
              {initial}
            </span>
          ))}
        </div>
      )}

      {!card.revealed && (
        <span
          className="relative z-10 px-1 leading-tight break-all text-center"
          style={{ fontSize: 'clamp(9px, 1.1vw, 13px)', fontWeight: 800, letterSpacing: '0.08em' }}
        >
          {card.word}
        </span>
      )}


      {isSpymaster && !card.revealed && (
        <span className={cn(
          'absolute bottom-1 right-1 w-2 h-2 rounded-full border border-black/10',
          card.owner === 'red' && 'bg-card-red',
          card.owner === 'blue' && 'bg-card-blue',
          card.owner === 'neutral' && 'bg-amber-600',
          card.owner === 'assassin' && 'bg-gray-600',
        )} />
      )}
    </button>
  );
}
