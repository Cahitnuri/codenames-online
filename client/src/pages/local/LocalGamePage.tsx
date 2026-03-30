import { useState, useRef, useEffect } from 'react';
import { useLocalGame } from '../../context/LocalGameContext';
import { AvatarDisplay } from '../../components/local/AvatarPicker';
import type { BoardCard } from '../../data/localWords';
import type { LogEntry } from '../../context/LocalGameContext';

// ─── TIMER RING ────────────────────────────────────────────────
function TimerRing({
  remaining,
  total,
  size = 40,
}: {
  remaining: number;
  total: number;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = total > 0 ? remaining / total : 0;
  const offset = circumference * (1 - progress);
  const urgent = remaining <= 10;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={urgent ? '#FF4040' : '#FF9050'}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>
      <span
        className="absolute font-mono-code font-bold text-center leading-none"
        style={{
          fontSize: size < 48 ? '9px' : '12px',
          color: urgent ? '#FF4040' : '#FFB080',
        }}
      >
        {remaining}
      </span>
    </div>
  );
}

// ─── TOP BAR ───────────────────────────────────────────────────
function TopBar() {
  const { state, newGame, toggleSpymasterView, goToSetup } = useLocalGame();
  const { turn, gamePhase, clue, winner, timerActive, timerRemaining, settings, currentProfile } = state;

  const tColor = turn === 'red' ? '#FF7060' : '#70B8FF';
  const tName = turn === 'red' ? 'Kırmızı' : 'Mavi';

  let statusText = '';
  if (winner) {
    statusText = `${winner === 'red' ? 'Kırmızı' : 'Mavi'} kazandı!`;
  } else if (gamePhase === 'spymaster') {
    statusText = `${tName} · Casus İpucu Veriyor`;
  } else if (gamePhase === 'operative') {
    statusText = clue
      ? `${tName} · ${clue.word} (${clue.count === 0 ? '∞' : clue.count}) · ${state.guessesLeft} hak`
      : `${tName} · Tahmin Yapılıyor`;
  }

  const maxTimer = gamePhase === 'spymaster' ? settings.clueTime : settings.guessTime;

  return (
    <div
      className="flex items-center gap-4 px-4 py-2 border-b border-white/8 flex-shrink-0"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', height: '52px' }}
    >
      {/* Left: logo + player */}
      <div className="flex items-center gap-2 min-w-0 w-48">
        <button
          onClick={goToSetup}
          className="font-display text-lg leading-none hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <span style={{ color: '#FF9070' }}>KOD</span>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
          <span style={{ color: '#70C0FF' }}>ADLAR</span>
        </button>
        {currentProfile && (
          <div className="flex items-center gap-1.5 ml-2 min-w-0">
            <AvatarDisplay avatarId={currentProfile.avatarId} size="sm" />
            <span className="text-xs text-slate-500 truncate hidden sm:block">{currentProfile.name}</span>
          </div>
        )}
      </div>

      {/* Center: status */}
      <div className="flex-1 text-center">
        <p
          className="font-display text-lg leading-none truncate"
          style={{ color: winner ? (winner === 'red' ? '#FF7060' : '#70B8FF') : tColor }}
        >
          {statusText}
        </p>
      </div>

      {/* Right: timer + buttons */}
      <div className="flex items-center gap-2 w-48 justify-end">
        {timerActive && maxTimer > 0 && (
          <TimerRing remaining={timerRemaining} total={maxTimer} size={40} />
        )}
        {gamePhase === 'spymaster' && !winner && (
          <button
            onClick={toggleSpymasterView}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono-code tracking-wide transition-all ${
              state.spymasterView
                ? 'border-orange-500/60 text-orange-400 bg-orange-950/40'
                : 'border-white/15 text-slate-500 hover:border-white/30 hover:text-slate-300'
            }`}
          >
            {state.spymasterView ? 'CASUSi' : 'CASUSi?'}
          </button>
        )}
        <button
          onClick={newGame}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 font-mono-code tracking-wide transition-all"
        >
          YENİ
        </button>
      </div>
    </div>
  );
}

// ─── TEAM PANEL ────────────────────────────────────────────────
function TeamPanel({ side }: { side: 'red' | 'blue' }) {
  const { state } = useLocalGame();
  const { board, turn, gamePhase, totals, scores, currentProfile, winner } = state;

  const isActive = turn === side && !winner;
  const remaining = totals[side] - scores[side];
  const tName = side === 'red' ? 'Kırmızı' : 'Mavi';
  const accentColor = side === 'red' ? '#FF7060' : '#70B8FF';
  const bgColor = side === 'red' ? 'rgba(180,50,30,0.12)' : 'rgba(40,100,180,0.12)';
  const borderColor = side === 'red' ? 'rgba(180,50,30,0.25)' : 'rgba(40,100,180,0.25)';

  // Count revealed cards for this team
  const revealedCount = board.filter(c => c.type === side && c.revealed).length;

  const roleLabel = gamePhase === 'spymaster' ? 'Casus' : 'Operatör';

  return (
    <div
      className="flex flex-col items-center py-4 px-2 gap-3 border-r border-white/6 overflow-hidden"
      style={{
        background: isActive ? bgColor : 'transparent',
        borderColor: side === 'blue' ? 'transparent' : undefined,
        borderLeftColor: side === 'blue' ? borderColor : undefined,
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: accentColor }}
          />
          <span className="text-xs font-mono-code" style={{ color: accentColor }}>
            OYNUYOR
          </span>
        </div>
      )}
      {!isActive && <div className="h-5" />}

      {/* Team icon */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg"
        style={{ background: side === 'red' ? 'linear-gradient(135deg,#C84030,#801020)' : 'linear-gradient(135deg,#2860A8,#103060)' }}
      >
        {side === 'red' ? '🔴' : '🔵'}
      </div>

      {/* Team name */}
      <p className="font-display text-sm" style={{ color: accentColor }}>
        {tName}
      </p>

      {/* Remaining count */}
      <div className="text-center">
        <p className="font-display leading-none" style={{ fontSize: '2.5rem', color: accentColor }}>
          {remaining}
        </p>
        <p className="font-mono-code text-xs text-slate-600 mt-0.5">kart kaldı</p>
      </div>

      {/* Progress dots */}
      <div className="flex flex-wrap gap-1 justify-center px-1">
        {Array.from({ length: totals[side] }).map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: i < revealedCount
                ? (side === 'red' ? '#C84030' : '#2860A8')
                : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/6 my-1" />

      {/* Player avatar */}
      {currentProfile && (
        <div className="flex flex-col items-center gap-1.5">
          <AvatarDisplay avatarId={currentProfile.avatarId} size="sm" />
          <p className="text-xs text-slate-500 text-center truncate w-full font-medium">
            {currentProfile.name}
          </p>
          {isActive && (
            <span
              className="text-xs font-mono-code px-2 py-0.5 rounded-full"
              style={{ background: `${accentColor}22`, color: accentColor }}
            >
              {roleLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GAME CARD ─────────────────────────────────────────────────
function GameCard({
  card,
  idx,
  isLastRevealed,
}: {
  card: BoardCard;
  idx: number;
  isLastRevealed: boolean;
}) {
  const { state, guessCard } = useLocalGame();
  const { gamePhase, spymasterView, winner } = state;

  const canClick = gamePhase === 'operative' && !card.revealed && !winner;

  const revealedBg: Record<BoardCard['type'], string> = {
    red: 'linear-gradient(155deg,#C8604A,#8C3020)',
    blue: 'linear-gradient(155deg,#4880B0,#284868)',
    neutral: 'linear-gradient(155deg,#8A7550,#5C4C30)',
    assassin: 'linear-gradient(155deg,#282828,#0A0A0A)',
  };

  const spyTint: Record<BoardCard['type'], string> = {
    red: 'rgba(200,96,74,0.22)',
    blue: 'rgba(72,128,176,0.22)',
    neutral: 'rgba(138,117,80,0.14)',
    assassin: 'rgba(20,20,20,0.45)',
  };

  const spyBorder: Record<BoardCard['type'], string> = {
    red: '#C8604A',
    blue: '#4880B0',
    neutral: '#8A7550',
    assassin: '#484848',
  };

  let cardBg = 'linear-gradient(155deg,#D8C8A0,#C0AA78)';
  let textColor = '#3A2A10';
  let borderStyle = '1px solid rgba(255,255,255,0.08)';

  if (card.revealed) {
    cardBg = revealedBg[card.type];
    textColor = card.type === 'neutral' ? '#E8D8B0' : '#FFFFFF';
    borderStyle = '1px solid rgba(255,255,255,0.15)';
  } else if (spymasterView) {
    borderStyle = `2px solid ${spyBorder[card.type]}`;
  }

  return (
    <button
      onClick={() => canClick && guessCard(idx)}
      disabled={!canClick}
      className={`
        relative rounded-xl flex items-center justify-center text-center font-semibold
        transition-all duration-200 overflow-hidden
        ${canClick ? 'cursor-pointer hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]' : 'cursor-default'}
        ${isLastRevealed && card.revealed ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-transparent' : ''}
      `}
      style={{
        background: cardBg,
        border: borderStyle,
        aspectRatio: '1 / 0.65',
        padding: '4px 6px',
      }}
    >
      {/* Spy tint overlay */}
      {!card.revealed && spymasterView && (
        <div
          className="absolute inset-0 rounded-xl"
          style={{ background: spyTint[card.type] }}
        />
      )}

      {/* Word text */}
      <span
        className="relative z-10 font-mono-code leading-tight text-center break-all hyphens-auto"
        style={{
          color: textColor,
          fontSize: card.word.length > 14 ? '8px' : card.word.length > 10 ? '9px' : '10px',
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        {card.word}
      </span>

      {/* Revealed type icon */}
      {card.revealed && card.type === 'assassin' && (
        <span className="absolute top-1 right-1 text-xs">💀</span>
      )}
    </button>
  );
}

// ─── BOARD GRID ────────────────────────────────────────────────
function BoardSection() {
  const { state } = useLocalGame();
  const { board, lastRevealedIdx } = state;

  return (
    <div className="flex flex-col p-3 gap-3 overflow-hidden">
      <div
        className="grid gap-2 flex-1"
        style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)' }}
      >
        {board.map((card, idx) => (
          <GameCard
            key={`${card.word}-${idx}`}
            card={card}
            idx={idx}
            isLastRevealed={idx === lastRevealedIdx}
          />
        ))}
      </div>
      <ClueArea />
    </div>
  );
}

// ─── CLUE AREA ─────────────────────────────────────────────────
function ClueArea() {
  const { state, submitClue, endTurn } = useLocalGame();
  const { gamePhase, clue, guessesLeft, turn, winner, spymasterView } = state;

  const [clueWord, setClueWord] = useState('');
  const [clueCount, setClueCount] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gamePhase === 'spymaster' && spymasterView) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [gamePhase, spymasterView]);

  if (winner) return null;

  const accentColor = turn === 'red' ? '#FF7060' : '#70B8FF';
  const tName = turn === 'red' ? 'Kırmızı' : 'Mavi';

  if (gamePhase === 'spymaster') {
    if (!spymasterView) {
      return (
        <div
          className="rounded-xl py-3 px-4 text-center"
          style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-slate-500 font-mono-code tracking-widest">
            {tName} Casus · Kart görünümünü açarak ipucu ver
          </p>
        </div>
      );
    }

    return (
      <div
        className="rounded-xl p-3 flex items-center gap-3"
        style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${accentColor}33` }}
      >
        <input
          ref={inputRef}
          type="text"
          value={clueWord}
          onChange={e => setClueWord(e.target.value.replace(/\s/g, ''))}
          onKeyDown={e => {
            if (e.key === 'Enter' && clueWord.trim()) {
              submitClue(clueWord.trim(), clueCount);
              setClueWord('');
              setClueCount(1);
            }
          }}
          maxLength={30}
          placeholder="İpucu kelimesi..."
          className="flex-1 bg-transparent border-b text-sm font-mono-code text-white placeholder-slate-600 outline-none py-1"
          style={{ borderColor: `${accentColor}50` }}
        />
        <select
          value={clueCount}
          onChange={e => setClueCount(Number(e.target.value))}
          className="bg-black/40 border border-white/10 rounded-lg text-sm text-slate-300 px-2 py-1 font-mono-code outline-none"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <option key={n} value={n}>{n === 0 ? '∞' : n}</option>
          ))}
        </select>
        <button
          onClick={() => {
            if (clueWord.trim()) {
              submitClue(clueWord.trim(), clueCount);
              setClueWord('');
              setClueCount(1);
            }
          }}
          disabled={!clueWord.trim()}
          className="px-4 py-1.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
          style={{ background: `linear-gradient(135deg,${accentColor}80,${accentColor}50)`, color: '#fff' }}
        >
          Ver
        </button>
      </div>
    );
  }

  if (gamePhase === 'operative' && clue) {
    return (
      <div
        className="rounded-xl p-3 flex items-center gap-4"
        style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${accentColor}33` }}
      >
        <div className="flex-1">
          <p className="font-display text-base" style={{ color: accentColor }}>
            {clue.word}
            <span className="text-slate-500 font-mono-code text-sm ml-2">
              {clue.count === 0 ? '∞' : clue.count}
            </span>
          </p>
          <p className="text-xs text-slate-600 font-mono-code mt-0.5">
            {guessesLeft === 99 ? '∞' : guessesLeft} tahmin hakkı kaldı
          </p>
        </div>
        <button
          onClick={endTurn}
          className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20 font-mono-code transition-all"
        >
          Turu Bitir
        </button>
      </div>
    );
  }

  return null;
}

// ─── GAME LOG ──────────────────────────────────────────────────
function GameLog() {
  const { state } = useLocalGame();
  const { log } = state;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [log.length]);

  const typeStyles: Record<LogEntry['type'], { color: string; bg: string }> = {
    red: { color: '#FF9080', bg: 'rgba(200,80,60,0.12)' },
    blue: { color: '#80C0FF', bg: 'rgba(60,120,200,0.12)' },
    neutral: { color: '#C0A870', bg: 'rgba(160,140,80,0.12)' },
    assassin: { color: '#FF4040', bg: 'rgba(200,0,0,0.18)' },
    system: { color: '#707090', bg: 'transparent' },
    winner: { color: '#FFD060', bg: 'rgba(255,200,0,0.12)' },
    'clue-red': { color: '#FF9070', bg: 'rgba(200,80,40,0.15)' },
    'clue-blue': { color: '#70C0FF', bg: 'rgba(40,120,200,0.15)' },
  };

  return (
    <div className="flex flex-col h-full border-l border-white/6 overflow-hidden">
      <div
        className="px-3 py-2 border-b border-white/6 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <p className="font-mono-code text-xs tracking-widest text-slate-600 uppercase">Kayıtlar</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1">
        {log.map(entry => {
          const style = typeStyles[entry.type];
          return (
            <div
              key={entry.id}
              className="rounded-lg px-2.5 py-1.5"
              style={{ background: style.bg }}
            >
              <p
                className="font-mono-code text-xs leading-relaxed"
                style={{ color: style.color }}
              >
                {entry.text}
              </p>
            </div>
          );
        })}
        {log.length === 0 && (
          <p className="text-xs text-slate-700 text-center py-4 font-mono-code">
            Henüz kayıt yok
          </p>
        )}
      </div>
    </div>
  );
}

function LogPanel() {
  return <GameLog />;
}

// ─── SPY OVERLAY ───────────────────────────────────────────────
function SpyOverlay() {
  const { state, spyContinue, spySkip } = useLocalGame();
  const { turn, currentProfile } = state;

  const tName = turn === 'red' ? 'Kırmızı' : 'Mavi';
  const accentColor = turn === 'red' ? '#FF7060' : '#70B8FF';
  const bgGradient = turn === 'red'
    ? 'linear-gradient(135deg,rgba(120,30,15,0.97),rgba(60,10,5,0.98))'
    : 'linear-gradient(135deg,rgba(15,50,120,0.97),rgba(5,20,60,0.98))';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center space-y-6 border"
        style={{
          background: bgGradient,
          borderColor: `${accentColor}30`,
          boxShadow: `0 0 60px ${accentColor}25`,
        }}
      >
        {/* Avatar */}
        {currentProfile && (
          <div className="flex justify-center">
            <AvatarDisplay avatarId={currentProfile.avatarId} size="lg" />
          </div>
        )}

        {/* Title */}
        <div>
          <p
            className="font-display text-3xl leading-tight"
            style={{ color: accentColor }}
          >
            {tName} Takım
          </p>
          <p className="font-display text-xl text-white/80 mt-1">Casus Sırası</p>
          <p className="text-xs text-slate-500 font-mono-code tracking-wide mt-2">
            Diğerleri bakmasın — Sadece casus görüyor
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={spyContinue}
            className="w-full py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg,${accentColor}80,${accentColor}50)`,
              boxShadow: `0 4px 16px ${accentColor}30`,
            }}
          >
            Kartları Gör & İpucu Ver
          </button>
          <button
            onClick={spySkip}
            className="w-full py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 border border-white/8 hover:border-white/15 transition-all font-mono-code"
          >
            Zaten Biliyor — Atla
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GAME OVER OVERLAY ─────────────────────────────────────────
function GameOverOverlay() {
  const { state, newGame, goToSetup } = useLocalGame();
  const { winner, scores, totals } = state;

  if (!winner) return null;

  const wName = winner === 'red' ? 'Kırmızı' : 'Mavi';
  const accentColor = winner === 'red' ? '#FF7060' : '#70B8FF';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-xs rounded-2xl p-8 text-center space-y-6 border"
        style={{
          background: 'linear-gradient(135deg,rgba(20,16,10,0.98),rgba(10,8,5,0.99))',
          borderColor: `${accentColor}40`,
          boxShadow: `0 0 80px ${accentColor}30`,
        }}
      >
        {/* Trophy */}
        <div className="text-6xl">🏆</div>

        {/* Winner */}
        <div>
          <p
            className="font-display text-4xl"
            style={{ color: accentColor }}
          >
            {wName}
          </p>
          <p className="font-display text-2xl text-white/70 mt-1">Kazandı!</p>
        </div>

        {/* Scores */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="font-display text-2xl" style={{ color: '#FF7060' }}>{scores.red}</p>
            <p className="text-xs text-slate-500 font-mono-code">/ {totals.red} Kırmızı</p>
          </div>
          <div className="text-center">
            <p className="font-display text-2xl" style={{ color: '#70B8FF' }}>{scores.blue}</p>
            <p className="text-xs text-slate-500 font-mono-code">/ {totals.blue} Mavi</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={newGame}
            className="w-full py-3.5 rounded-xl font-display text-lg text-white tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg,#C05030,#802010)',
              boxShadow: '0 4px 20px rgba(192,80,48,0.35)',
            }}
          >
            TEKRAR OYNA
          </button>
          <button
            onClick={goToSetup}
            className="w-full py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 border border-white/8 hover:border-white/15 transition-all font-mono-code"
          >
            Ayarlara Dön
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function LocalGamePage() {
  const { state } = useLocalGame();

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 120% 100% at 50% 0%, #8B4A22 0%, #5C2A0E 100%)',
      }}
    >
      <TopBar />
      <div
        className="flex-1 overflow-hidden"
        style={{ display: 'grid', gridTemplateColumns: '148px 1fr 148px 196px' }}
      >
        <TeamPanel side="red" />
        <BoardSection />
        <TeamPanel side="blue" />
        <LogPanel />
      </div>
      {state.showSpyOverlay && state.gamePhase === 'spymaster' && !state.winner && (
        <SpyOverlay />
      )}
      {state.winner && <GameOverOverlay />}
    </div>
  );
}
