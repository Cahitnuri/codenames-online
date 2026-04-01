import { useGameStore } from '../../store/game.store';
import WordCard from './WordCard';
import { useGameActions } from '../../socket/socket.hooks';

export default function GameBoard() {
  const { game, isSpymaster, myTeam, myPlayerId } = useGameStore();
  const actions = useGameActions();

  if (!game) return null;

  const isSpy = isSpymaster();
  const myTeamVal = myTeam();
  const isMyTurn = myTeamVal === game.currentTurn;
  const canGuess = !isSpy && isMyTurn && game.phase === 'operative-turn';

  const pendingSelections = game.pendingSelections ?? {};

  // Find which card I've indicated
  let myIndicatedCardId: number | null = null;
  for (const [cIdStr, playerIds] of Object.entries(pendingSelections)) {
    if ((playerIds as string[]).includes(myPlayerId ?? '')) {
      myIndicatedCardId = Number(cIdStr);
      break;
    }
  }
  const myIndicatedCard = myIndicatedCardId !== null
    ? game.cards.find(c => c.id === myIndicatedCardId)
    : null;

  function handleCardClick(cardId: number) {
    if (!canGuess) return;
    // Toggle: click same card = un-indicate; click different card = switch indication
    if (myIndicatedCardId === cardId) {
      actions.indicateWord(null);
    } else {
      actions.indicateWord(cardId);
    }
  }

  function handleConfirmGuess() {
    if (myIndicatedCardId !== null) {
      actions.guessWord(myIndicatedCardId);
    }
  }

  return (
    <div className="w-full max-w-4xl">
      {/* 5×5 grid */}
      <div className="grid grid-cols-5 gap-2">
        {game.cards.map(card => {
          const cardPlayerIds: string[] = (pendingSelections[card.id] as string[]) ?? [];
          const indicatingInitials = cardPlayerIds.map(pid => {
            const player = game.players.find(p => p.id === pid);
            return (player?.displayName[0] ?? '?').toUpperCase();
          });
          const isMyIndication = myIndicatedCardId === card.id;

          return (
            <WordCard
              key={card.id}
              card={card}
              isSpymaster={isSpy}
              canClick={canGuess && !card.revealed}
              onClick={() => handleCardClick(card.id)}
              indicatingInitials={indicatingInitials}
              isMyIndication={isMyIndication}
            />
          );
        })}
      </div>

      {/* Indication confirm bar */}
      {myIndicatedCard && canGuess && (
        <div className="mt-3 flex items-center justify-center gap-3 py-2 px-4 rounded-xl border border-amber-700/50 bg-amber-950/30">
          <span className="font-mono-code text-sm text-slate-300 tracking-wider">
            SEÇİLDİ: <strong className="text-amber-400">{myIndicatedCard.word}</strong>
          </span>
          <button
            onClick={handleConfirmGuess}
            className="btn-blue px-5 py-1.5 text-xs font-mono-code tracking-widest"
          >
            ONAYLA
          </button>
          <button
            onClick={() => actions.indicateWord(null)}
            className="btn-ghost px-4 py-1.5 text-xs font-mono-code tracking-widest"
          >
            İPTAL
          </button>
        </div>
      )}

      {/* Pass turn */}
      {canGuess && game.activeClue && !myIndicatedCard && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={actions.endTurn}
            className="btn-ghost px-8 py-2 text-sm tracking-wider font-mono-code"
          >
            SIRAYA GEÇ
          </button>
        </div>
      )}

      {/* Pass turn when indication active */}
      {canGuess && game.activeClue && myIndicatedCard && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={actions.endTurn}
            className="font-mono-code text-xs text-slate-600 hover:text-slate-400 transition-colors tracking-wider"
          >
            SIRAYA GEÇ
          </button>
        </div>
      )}
    </div>
  );
}
