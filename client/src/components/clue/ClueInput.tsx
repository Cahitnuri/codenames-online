import { useState } from 'react';
import { useGameActions } from '../../socket/socket.hooks';
import { useGameStore } from '../../store/game.store';
import BluffButton from './BluffButton';

export default function ClueInput() {
  const [word, setWord] = useState('');
  const [number, setNumber] = useState(1);
  const actions = useGameActions();
  const { game } = useGameStore();

  if (!game) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word.trim()) return;
    actions.giveClue(word.trim(), number);
    setWord('');
    setNumber(1);
  }

  const isRed = game.currentTurn === 'red';
  const accentColor = isRed ? '#DC2626' : '#2563EB';
  const riskBonus = number === 2 ? 1 : number === 3 ? 2 : number >= 4 ? 4 : 0;

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: isRed ? 'rgba(127,29,29,0.15)' : 'rgba(29,78,216,0.15)',
        borderColor: `${accentColor}44`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
          <span className="font-mono-code text-xs tracking-[0.25em] text-slate-400">İPUCUNUZ</span>
        </div>
        <BluffButton />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={word}
          onChange={e => setWord(e.target.value.replace(/\s/g, '').toUpperCase())}
          placeholder="TEK KELİME..."
          maxLength={30}
          className="flex-1 bg-black/30 border rounded-lg px-3 py-2.5 text-white font-mono-code text-sm placeholder-slate-600 focus:outline-none transition-colors tracking-widest uppercase"
          style={{ borderColor: `${accentColor}33` }}
          autoFocus
        />

        {/* Number picker */}
        <div className="flex items-center gap-1 bg-black/30 border rounded-lg px-2 py-1" style={{ borderColor: `${accentColor}33` }}>
          <button type="button" onClick={() => setNumber(n => Math.max(1, n - 1))}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white font-bold rounded transition-colors">−</button>
          <span className="font-display text-2xl w-6 text-center" style={{ color: accentColor }}>{number}</span>
          <button type="button" onClick={() => setNumber(n => Math.min(9, n + 1))}
            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white font-bold rounded transition-colors">+</button>
        </div>

        <button
          type="submit"
          disabled={!word.trim()}
          className="px-5 py-2.5 rounded-lg font-mono-code text-sm font-bold tracking-wider text-white disabled:opacity-30 transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${accentColor}, ${isRed ? '#991B1B' : '#1D4ED8'})`,
            boxShadow: word.trim() ? `0 4px 16px ${accentColor}40` : 'none',
          }}
        >
          GÖNDER
        </button>
      </form>

      {riskBonus > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono-code text-xs text-amber-600 tracking-wider">
            RİSK BONUSU: +{riskBonus} puan — {number} kelime doğru tahmin edilirse
          </span>
        </div>
      )}
    </div>
  );
}
