import type { Team } from '@codenames/shared';
import { useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';
import { useGameActions } from '../../socket/socket.hooks';

export default function TeamPanel({ team }: { team: Team }) {
  const { game, myTeam, myPlayerId } = useGameStore();
  const { sabotageMode, setSabotageMode } = useUIStore();
  const actions = useGameActions();

  if (!game) return null;

  const teamState = game.teams[team];
  const players = game.players.filter(p => p.team === team);
  const isMyTeam = myTeam() === team;
  const isRed = team === 'red';
  const isCurrentTurn = game.currentTurn === team;
  const panelClass = isRed ? 'glass-red' : 'glass-blue';
  const accentColor = isRed ? '#DC2626' : '#2563EB';
  const scoreGlowClass = isRed ? 'text-glow-red' : 'text-glow-blue';

  const canSabotage = isMyTeam
    && !teamState.sabotageUsed
    && game.phase === 'operative-turn'
    && game.currentTurn !== team;

  return (
    <div className={`w-48 shrink-0 flex flex-col ${panelClass} p-3 overflow-y-auto`}
      style={{ opacity: isCurrentTurn ? 1 : 0.7, transition: 'opacity 0.3s' }}>

      {/* Team header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            backgroundColor: accentColor,
            boxShadow: isCurrentTurn ? `0 0 8px ${accentColor}` : 'none',
            animation: isCurrentTurn ? 'pulseGlow 2s ease-in-out infinite' : 'none',
          }}
        />
        <span className="font-display text-sm tracking-widest" style={{ color: accentColor }}>
          {team.toUpperCase()}
        </span>
        {isCurrentTurn && (
          <span className="font-mono-code text-xs text-slate-500 ml-auto tracking-wider">AKTİF</span>
        )}
      </div>

      {/* Score */}
      <div className="text-center py-2 mb-2">
        <div
          className={`score-number text-5xl ${isCurrentTurn ? scoreGlowClass : ''}`}
          style={{ color: accentColor }}
        >
          {teamState.score}
        </div>
        <div className="font-mono-code text-xs text-slate-600 tracking-widest mt-0.5">
          {teamState.wordsRemaining} KALDI
        </div>
      </div>

      {/* Words remaining bar */}
      <div className="mb-3 mx-1">
        <div className="h-1 bg-ink-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              backgroundColor: accentColor,
              width: `${((isRed ? 9 : 8) - teamState.wordsRemaining) / (isRed ? 9 : 8) * 100}%`,
              boxShadow: `0 0 6px ${accentColor}`,
            }}
          />
        </div>
      </div>

      {/* Combo badge */}
      {teamState.combo >= 2 && (
        <div className="text-center mb-2 rounded-lg py-1.5 border"
          style={{
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(120,53,15,0.3)',
            boxShadow: '0 0 12px rgba(245,158,11,0.2)',
          }}>
          <div className="font-display text-xl text-glow-gold" style={{ color: '#F59E0B' }}>
            ×{teamState.combo}
          </div>
          <div className="font-mono-code text-xs text-amber-700 tracking-widest">KOMBO</div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5 mb-2" />

      {/* Players */}
      <div className="flex-1 space-y-1 mb-2">
        {players.map(p => (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
              p.id === myPlayerId ? 'bg-white/5' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
              style={{ background: isRed ? 'linear-gradient(135deg,#7f1d1d,#DC2626)' : 'linear-gradient(135deg,#1e3a8a,#2563EB)' }}
            >
              {p.displayName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className={`font-body text-xs truncate block ${p.connected ? 'text-slate-300' : 'text-slate-600'}`}>
                {p.displayName}
              </span>
            </div>
            {p.role === 'spymaster' && (
              <span className="text-amber-500 text-xs shrink-0">★</span>
            )}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mb-2" />

      {/* Abilities */}
      <div className="space-y-1.5">
        {/* Bluff status */}
        <div className="flex items-center justify-between">
          <span className="font-mono-code text-xs text-slate-600 tracking-wider">BLÖF</span>
          <span className={`font-mono-code text-xs tracking-wider ${
            teamState.bluffUsed ? 'text-slate-600' : 'text-amber-500'
          }`}>
            {teamState.bluffUsed ? 'KULLANILDI' : 'HAZIR'}
          </span>
        </div>

        {/* Sabotage */}
        {canSabotage && (
          <button
            onClick={() => setSabotageMode(!sabotageMode)}
            className={`w-full py-1.5 rounded-lg font-mono-code text-xs tracking-widest border transition-all ${
              sabotageMode
                ? 'bg-orange-700 border-orange-500 text-white'
                : 'border-orange-800 text-orange-600 hover:border-orange-600 hover:text-orange-400'
            }`}
          >
            {sabotageMode ? '✕ İPTAL' : '⊘ SABOTAJ'}
          </button>
        )}
        {teamState.sabotageUsed && (
          <div className="flex items-center justify-between">
            <span className="font-mono-code text-xs text-slate-600 tracking-wider">SABOTAJ</span>
            <span className="font-mono-code text-xs text-slate-600 tracking-wider">KULLANILDI</span>
          </div>
        )}
      </div>

      {/* Pass turn */}
      {isMyTeam && isCurrentTurn && game.phase === 'operative-turn' && (
        <button
          onClick={actions.endTurn}
          className="mt-2 w-full py-1.5 font-mono-code text-xs text-slate-500 hover:text-white border border-ink-500 hover:border-slate-500 rounded-lg transition-colors tracking-wider"
        >
          SIRAYA GEÇ
        </button>
      )}
    </div>
  );
}
