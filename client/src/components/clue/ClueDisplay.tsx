import { useGameStore } from '../../store/game.store';

export default function ClueDisplay() {
  const { game } = useGameStore();
  if (!game?.activeClue) return null;

  const { activeClue, currentTurn, guessesThisTurn, maxGuessesThisTurn } = game;
  const isRed = currentTurn === 'red';
  const accentColor = isRed ? '#DC2626' : '#2563EB';
  const remaining = Math.max(0, maxGuessesThisTurn - guessesThisTurn);

  return (
    <div
      className="rounded-xl px-5 py-4 border flex items-center justify-between"
      style={{
        background: isRed ? 'rgba(127,29,29,0.12)' : 'rgba(29,78,216,0.12)',
        borderColor: `${accentColor}44`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-xs text-slate-500 tracking-widest">İPUCU</span>
          <span
            className="font-display text-3xl leading-none tracking-wider"
            style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}80` }}
          >
            {activeClue.word.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-mono-code text-xs text-slate-500">İÇİN</span>
          <span className="font-display text-3xl leading-none text-white">{activeClue.number}</span>
        </div>

        {activeClue.isBluff && (
          <span className="font-mono-code text-xs border border-orange-700 bg-orange-950/40 text-orange-400 px-2 py-1 rounded-lg tracking-widest animate-pulse-glow">
            ⚡ BLÖF?
          </span>
        )}
      </div>

      {/* Remaining guesses */}
      <div className="text-right">
        <div
          className="font-display text-4xl leading-none"
          style={{ color: remaining === 0 ? '#6B7280' : accentColor }}
        >
          {remaining}
        </div>
        <div className="font-mono-code text-xs text-slate-600 tracking-widest">KALAN</div>

        {/* Mini dots for remaining */}
        <div className="flex gap-1 mt-1 justify-end">
          {Array.from({ length: maxGuessesThisTurn }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < guessesThisTurn ? '#374151' : accentColor,
                boxShadow: i >= guessesThisTurn ? `0 0 4px ${accentColor}` : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
