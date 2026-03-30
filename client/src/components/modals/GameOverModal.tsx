import { useGameStore } from '../../store/game.store';
import { useGameActions } from '../../socket/socket.hooks';
import { useNavigate } from 'react-router-dom';

export default function GameOverModal() {
  const { game, gameOver, clearGameOver, myTeam } = useGameStore();
  const actions = useGameActions();
  const navigate = useNavigate();

  if (!game) return null;

  const winner = gameOver?.winner ?? game.winner;
  const reason = gameOver?.reason ?? game.winReason;
  const finalScores = gameOver?.finalScores ?? { red: game.teams.red.score, blue: game.teams.blue.score };
  const myTeamVal = myTeam();
  const iWon = myTeamVal === winner;
  const isRedWinner = winner === 'red';
  const winnerColor = isRedWinner ? '#DC2626' : '#2563EB';
  const reasonText = reason === 'assassin' ? 'SUİKASTÇIYA bastı' : 'tüm kelimelerini ilk bulan oldu';

  function handleRematch() { clearGameOver(); actions.rematch(); }
  function handleLeave() { clearGameOver(); navigate('/'); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(3,4,15,0.92)', backdropFilter: 'blur(20px)' }}>

      {/* Particle effect background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {iWon && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? winnerColor : '#F59E0B',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 2}s ease-in-out ${Math.random() * 2}s infinite`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <div className="relative glass-panel rounded-2xl p-8 max-w-lg w-full animate-slide-up text-center"
        style={{ border: `1px solid ${winnerColor}30`, boxShadow: `0 0 60px ${winnerColor}20` }}>

        {/* Result header */}
        <div className="mb-6">
          <div className="text-6xl mb-3">{iWon ? '🏆' : '💀'}</div>

          {iWon ? (
            <h2 className="font-display text-6xl text-glow-gold" style={{ color: '#F59E0B' }}>
              ZAFERİNİZ
            </h2>
          ) : (
            <h2 className="font-display text-6xl" style={{ color: '#6B7280' }}>
              YENILDINIZ
            </h2>
          )}

          <p className="font-body text-slate-400 mt-2 text-sm">
            <span className="font-bold uppercase" style={{ color: winnerColor }}>{winner === 'red' ? 'KIRMIZI' : 'MAVİ'} takım</span>
            {' '}{reasonText}
          </p>
        </div>

        {/* Score cards */}
        <div className="flex gap-4 mb-6">
          <ScoreCard team="red" score={finalScores.red} isWinner={winner === 'red'} />
          <ScoreCard team="blue" score={finalScores.blue} isWinner={winner === 'blue'} />
        </div>

        {/* Stats */}
        {gameOver && (
          <div className="font-mono-code text-xs text-slate-600 tracking-wider space-y-1 mb-6 border border-ink-600 rounded-xl p-3">
            <div className="flex justify-between">
              <span className="text-red-800">KIRMIZI KELİMELER</span>
              <span className="text-slate-500">{gameOver.redWordsFound} / 9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">MAVİ KELİMELER</span>
              <span className="text-slate-500">{gameOver.blueWordsFound} / 8</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRematch}
            className="flex-1 py-3.5 rounded-xl font-mono-code font-bold tracking-widest text-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #166534, #16a34a)',
              boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
              color: 'white',
            }}
          >
            RÖVANŞ
          </button>
          <button
            onClick={handleLeave}
            className="flex-1 py-3.5 rounded-xl font-mono-code font-bold tracking-widest text-sm btn-ghost"
          >
            ÇIKIŞ
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ team, score, isWinner }: { team: 'red' | 'blue'; score: number; isWinner: boolean }) {
  const isRed = team === 'red';
  const color = isRed ? '#DC2626' : '#2563EB';
  return (
    <div
      className="flex-1 rounded-xl p-4 transition-all"
      style={{
        background: isRed ? 'rgba(127,29,29,0.2)' : 'rgba(29,78,216,0.2)',
        border: `1px solid ${color}${isWinner ? '60' : '20'}`,
        boxShadow: isWinner ? `0 0 20px ${color}30` : 'none',
      }}
    >
      <div className="font-mono-code text-xs tracking-widest mb-1" style={{ color: `${color}99` }}>
        {team.toUpperCase()}
      </div>
      <div className="score-number text-5xl" style={{ color }}>
        {score}
      </div>
      {isWinner && (
        <div className="font-mono-code text-xs mt-1 text-amber-500 tracking-widest">KAZANAN</div>
      )}
    </div>
  );
}
