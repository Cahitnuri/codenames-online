import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/game.store';
import { useUIStore } from '../store/ui.store';
import GameBoard from '../components/board/GameBoard';
import TeamPanel from '../components/team/TeamPanel';
import ClueInput from '../components/clue/ClueInput';
import ClueDisplay from '../components/clue/ClueDisplay';
import CountdownRing from '../components/timer/CountdownRing';
import GameOverModal from '../components/modals/GameOverModal';
import Toast from '../components/ui/Toast';
import ComboIndicator from '../components/score/ComboIndicator';

export default function GamePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { game, myPlayerId, gameOver, isSpymaster, myTeam } = useGameStore();
  const { toasts } = useUIStore();

  useEffect(() => {
    if (!game) navigate(roomId ? `/room/${roomId}` : '/');
  }, [game, navigate, roomId]);

  if (!game) return null;

  const myTeamVal = myTeam();
  const isMySpy = isSpymaster();
  const isMyTurn = myTeamVal === game.currentTurn;
  const showClueInput = isMySpy && isMyTurn && game.phase === 'spymaster-turn';
  const showClueDisplay = game.activeClue !== null && game.phase === 'operative-turn';
  const isRedTurn = game.currentTurn === 'red';

  return (
    <div className="h-screen bg-ops-room flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="glass-panel border-b border-white/5 px-4 py-2.5 flex items-center justify-between shrink-0 z-10">
        {/* Logo */}
        <h1 className="font-display text-2xl tracking-wider">
          <span style={{ color: '#94A3B8' }}>öz</span><span style={{ color: '#DC2626' }}>CODE</span><span style={{ color: '#2563EB' }}>NAMES</span>
        </h1>

        {/* Turn indicator + timer */}
        <div className="flex items-center gap-4">
          <TurnIndicator team={game.currentTurn} phase={game.phase} isMyTurn={isMyTurn} />
          <CountdownRing
            remaining={game.timer.remaining}
            duration={game.timer.duration}
            phase={game.timer.phase}
          />
        </div>

        {/* Room code */}
        <div className="flex items-center gap-2">
          <span className="font-mono-code text-xs text-slate-600 tracking-widest">RM</span>
          <span className="font-mono-code text-sm text-slate-400 tracking-[0.2em]">{game.roomId}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Red panel */}
        <TeamPanel team="red" />

        {/* Center */}
        <div className="flex-1 flex flex-col items-center justify-start py-4 px-3 overflow-y-auto">
          {/* Clue area */}
          <div className="w-full max-w-4xl mb-3 min-h-[68px]">
            {showClueInput && <ClueInput />}
            {showClueDisplay && <ClueDisplay />}
            {!showClueInput && !showClueDisplay && (
              <PhaseMessage
                phase={game.phase}
                currentTurn={game.currentTurn}
                isMyTurn={isMyTurn}
                isMySpy={isMySpy}
              />
            )}
          </div>

          {/* Combo flash */}
          <ComboIndicator />

          {/* Board */}
          <GameBoard />
        </div>

        {/* Blue panel */}
        <TeamPanel team="blue" />
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} toast={t} />)}
      </div>

      {/* Game over */}
      {(gameOver || game.phase === 'game-end') && <GameOverModal />}
    </div>
  );
}

function TurnIndicator({ team, phase, isMyTurn }: { team: 'red' | 'blue'; phase: string; isMyTurn: boolean }) {
  const isRed = team === 'red';
  const color = isRed ? '#DC2626' : '#2563EB';
  const glowClass = isRed ? 'shadow-red-glow-sm' : 'shadow-blue-glow-sm';
  const phaseLabel = phase === 'spymaster-turn' ? 'İSTİHBARAT' : phase === 'operative-turn' ? 'TAHMİN' : '';

  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
      <div className="text-center">
        <div className="font-display text-lg leading-none" style={{ color }}>{team.toUpperCase()}</div>
        {phaseLabel && (
          <div className="font-mono-code text-xs text-slate-500 tracking-widest">{phaseLabel}</div>
        )}
      </div>
      {isMyTurn && (
        <span className="font-mono-code text-xs text-slate-500 border border-slate-700 rounded-full px-2 py-0.5 tracking-wider">
          SIRANIZ
        </span>
      )}
    </div>
  );
}

function PhaseMessage({ phase, currentTurn, isMyTurn, isMySpy }: {
  phase: string; currentTurn: 'red' | 'blue'; isMyTurn: boolean; isMySpy: boolean;
}) {
  if (phase !== 'spymaster-turn') return null;
  const color = currentTurn === 'red' ? 'text-red-400' : 'text-blue-400';
  const msg = isMyTurn && !isMySpy
    ? 'İstihbaratın düşünüyor...'
    : `${currentTurn === 'red' ? 'KIRMIZI' : 'MAVİ'} istihbarat düşünüyor...`;
  return (
    <div className={`flex items-center justify-center gap-2 py-5 ${color}`}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'currentcolor' }} />
      <span className="font-mono-code text-sm tracking-widest">{msg}</span>
    </div>
  );
}
