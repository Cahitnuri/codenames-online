import { useGameStore } from '../../store/game.store';
import { useUIStore } from '../../store/ui.store';
import WordCard from './WordCard';
import { useGameActions } from '../../socket/socket.hooks';

export default function GameBoard() {
  const { game, isSpymaster, myTeam } = useGameStore();
  const { sabotageMode, setSabotageMode } = useUIStore();
  const actions = useGameActions();

  if (!game) return null;

  const isSpy = isSpymaster();
  const myTeamVal = myTeam();
  const isMyTurn = myTeamVal === game.currentTurn;
  const canGuess = !isSpy && isMyTurn && game.phase === 'operative-turn';
  const canSabotage = sabotageMode && myTeamVal !== null && myTeamVal !== 'spectator';

  function handleCardClick(cardId: number) {
    if (canSabotage) {
      actions.useSabotage(cardId);
      setSabotageMode(false);
      return;
    }
    if (canGuess) actions.guessWord(cardId);
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Sabotage mode banner */}
      {canSabotage && (
        <div className="mb-2 text-center font-mono-code text-xs text-orange-400 tracking-widest animate-pulse-glow border border-orange-800/50 bg-orange-950/30 rounded-lg py-2">
          SABOTAJ MODU — HEDEF KELİMEYİ SEÇ
        </div>
      )}

      {/* 5×5 grid */}
      <div className="grid grid-cols-5 gap-2">
        {game.cards.map(card => (
          <WordCard
            key={card.id}
            card={card}
            isSpymaster={isSpy}
            canClick={canSabotage ? (!card.revealed && !card.sabotaged) : canGuess && !card.revealed && !card.sabotaged}
            sabotageMode={canSabotage}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>

      {/* Pass turn */}
      {canGuess && game.activeClue && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={actions.endTurn}
            className="btn-ghost px-8 py-2 text-sm tracking-wider font-mono-code"
          >
            SIRAYA GEÇ
          </button>
        </div>
      )}
    </div>
  );
}
