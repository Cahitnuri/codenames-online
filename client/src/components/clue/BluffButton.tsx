import { useGameStore } from '../../store/game.store';
import { useGameActions } from '../../socket/socket.hooks';

export default function BluffButton() {
  const { game, myTeam } = useGameStore();
  const actions = useGameActions();

  if (!game) return null;
  const team = myTeam();
  if (!team || team === 'spectator') return null;

  const used = game.teams[team].bluffUsed;
  const active = game.bluffActive && game.bluffTeam === team;

  if (used && !active) {
    return <span className="font-mono-code text-xs text-slate-600 tracking-widest">BLÖF KULLANILDI</span>;
  }

  return (
    <button
      onClick={actions.useBluff}
      className={`font-mono-code text-xs px-3 py-1.5 rounded-lg border tracking-widest transition-all duration-200 ${
        active
          ? 'bg-orange-700 border-orange-500 text-white animate-pulse-glow'
          : 'border-orange-800 text-orange-600 hover:border-orange-600 hover:text-orange-400 hover:bg-orange-950/30'
      }`}
      title="Blöf aktifleştir: rakip senin kelimeni seçerse +3 puan"
    >
      {active ? '⚡ BLÖF AKTİF' : '⚡ BLÖF'}
    </button>
  );
}
