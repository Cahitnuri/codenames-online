import type { Team } from '@codenames/shared';
import type { GameLogEntry } from '@codenames/shared';
import { useGameStore } from '../../store/game.store';
import { useGameActions } from '../../socket/socket.hooks';
import { Avatars, AvatarList, AvatarDisplay } from '../ui/Avatars';
import { usePlayerStore } from '../../store/player.store';
import { useState } from 'react';

interface ClueHistoryEntry {
  clueWord: string;
  clueNumber: number;
  givenByName: string;
  guesses: Array<{ word: string; correct: boolean; guessedByName: string }>;
}

function buildClueHistory(log: GameLogEntry[], team: Team): ClueHistoryEntry[] {
  const result: ClueHistoryEntry[] = [];
  let current: ClueHistoryEntry | null = null;

  for (const entry of log) {
    if (entry.type === 'clue' && entry.team === team) {
      if (current) result.push(current);
      current = {
        clueWord: String(entry.payload.word ?? '').toUpperCase(),
        clueNumber: Number(entry.payload.number ?? 0),
        givenByName: String(entry.payload.givenByName ?? '?'),
        guesses: [],
      };
    } else if (entry.type === 'guess' && entry.team === team && current) {
      current.guesses.push({
        word: String(entry.payload.word ?? ''),
        correct: Boolean(entry.payload.correct),
        guessedByName: String(entry.payload.guessedByName ?? '?'),
      });
    } else if (entry.type === 'turn-end' && entry.team === team && current) {
      result.push(current);
      current = null;
    }
  }
  if (current) result.push(current);

  return result;
}

export default function TeamPanel({ team }: { team: Team }) {
  const { game, myTeam, myPlayerId } = useGameStore();
  const actions = useGameActions();
  const { avatar: myAvatar, setAvatar } = usePlayerStore();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!game) return null;

  const teamState = game.teams[team];
  const players = game.players.filter(p => p.team === team);
  const isMyTeam = myTeam() === team;
  const isRed = team === 'red';
  const isCurrentTurn = game.currentTurn === team;
  const panelClass = isRed ? 'glass-red' : 'glass-blue';
  const accentColor = isRed ? '#DC2626' : '#2563EB';
  const scoreGlowClass = isRed ? 'text-glow-red' : 'text-glow-blue';

  const clueHistory = buildClueHistory(game.log, team).slice(-5).reverse();

  return (
    <div className={`w-44 shrink-0 flex flex-col ${panelClass} p-3 overflow-y-auto`}
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
      <div className="space-y-1 mb-2">
        {players.map(p => {
          const AvatarComp = p.avatar ? Avatars[p.avatar] : null;
          const isMe = p.id === myPlayerId;
          return (
            <div key={p.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${isMe ? 'bg-white/5' : ''}`}>
              {AvatarComp ? (
                <div
                  className="w-7 h-7 rounded-full overflow-hidden shrink-0 border"
                  style={{ borderColor: isRed ? '#DC262660' : '#2563EB60', background: isRed ? 'rgba(127,29,29,0.4)' : 'rgba(30,58,138,0.4)', cursor: isMe ? 'pointer' : 'default' }}
                  onClick={isMe ? () => setShowAvatarPicker(v => !v) : undefined}
                  title={isMe ? 'Avatarı değiştir' : undefined}
                >
                  <AvatarComp />
                </div>
              ) : (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                  style={{ background: isRed ? 'linear-gradient(135deg,#7f1d1d,#DC2626)' : 'linear-gradient(135deg,#1e3a8a,#2563EB)', cursor: isMe ? 'pointer' : 'default' }}
                  onClick={isMe ? () => setShowAvatarPicker(v => !v) : undefined}
                  title={isMe ? 'Avatar seç' : undefined}
                >
                  {p.displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className={`font-body text-xs truncate block ${p.connected ? 'text-slate-300' : 'text-slate-600'}`}>
                  {p.displayName}
                </span>
              </div>
              {p.role === 'spymaster' && <span className="text-amber-500 text-xs shrink-0">★</span>}
            </div>
          );
        })}
      </div>

      {/* In-game avatar picker (shown when clicking own avatar) */}
      {showAvatarPicker && isMyTeam && (
        <div className="mb-2 rounded-lg p-2 bg-black/30 border border-white/10">
          <p className="font-mono-code text-xs text-slate-500 tracking-widest mb-1.5">AVATAR</p>
          <div className="grid grid-cols-5 gap-1">
            {AvatarList.map(name => {
              const AComp = Avatars[name]!;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setAvatar(name);
                    actions.setAvatar(name);
                    setShowAvatarPicker(false);
                  }}
                  className="rounded overflow-hidden transition-all"
                  style={{
                    outline: myAvatar === name ? '2px solid #F59E0B' : '2px solid transparent',
                    background: myAvatar === name ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="w-full aspect-square p-0.5">
                    <AComp />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5 mb-2" />

      {/* Pass turn */}
      {isMyTeam && isCurrentTurn && game.phase === 'operative-turn' && (
        <button
          onClick={actions.endTurn}
          className="mb-2 w-full py-1.5 font-mono-code text-xs text-slate-500 hover:text-white border border-ink-500 hover:border-slate-500 rounded-lg transition-colors tracking-wider"
        >
          SIRAYA GEÇ
        </button>
      )}

      {/* Clue history */}
      {clueHistory.length > 0 && (
        <>
          <div className="font-mono-code text-xs text-slate-600 tracking-widest mb-1.5">TARİHÇE</div>
          <div className="space-y-2 overflow-y-auto flex-1">
            {clueHistory.map((entry, i) => (
              <div key={i} className="rounded-lg p-1.5 bg-black/20 border border-white/5">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-mono-code text-xs font-bold tracking-wider" style={{ color: accentColor }}>
                    {entry.clueWord}
                  </span>
                  <span className="font-mono-code text-xs text-slate-500">({entry.clueNumber})</span>
                  <span className="font-body text-xs text-slate-600 ml-auto truncate max-w-[60px]" title={entry.givenByName}>
                    {entry.givenByName}
                  </span>
                </div>
                {entry.guesses.map((g, gi) => (
                  <div key={gi} className="flex items-center gap-1 pl-1">
                    <span className={`text-xs ${g.correct ? 'text-green-500' : 'text-red-400'}`}>
                      {g.correct ? '✓' : '✗'}
                    </span>
                    <span className="font-body text-xs text-slate-400 truncate">{g.word}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
