import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from './socket.client';
import { useGameStore } from '../store/game.store';
import { usePlayerStore } from '../store/player.store';
import { useUIStore } from '../store/ui.store';

export function useSocketSync() {
  const store = useGameStore();
  const { displayName } = usePlayerStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    socket.on('game:sync', (state) => {
      store.setFullState(state);
    });

    socket.on('game:state-update', (state) => {
      store.setFullState(state);
    });

    socket.on('game:cards-update', (cards) => {
      store.applyCardsUpdate(cards);
    });

    socket.on('game:phase-change', ({ phase, currentTurn }) => {
      store.applyPhaseChange(phase, currentTurn);
    });

    socket.on('game:clue-given', (clue) => {
      store.applyClueGiven(clue);
    });

    socket.on('game:guess-result', (payload) => {
      store.applyGuessResult(payload);
    });

    socket.on('game:turn-ended', (payload) => {
      store.applyTurnEnded(payload);
    });

    socket.on('game:timer-tick', (timer) => {
      store.applyTimerTick(timer);
    });

    socket.on('game:timer-expired', ({ phase }) => {
      addToast({ message: `${phase === 'spymaster' ? 'Spymaster' : 'Guess'} time expired!`, type: 'warning' });
    });

    socket.on('game:over', (payload) => {
      store.setGameOver(payload);
    });

    socket.on('team:score-update', ({ team, teamState }) => {
      store.applyTeamScoreUpdate(team, teamState);
    });

    socket.on('team:combo-update', ({ team, combo }) => {
      store.applyComboUpdate(team, combo);
    });

    socket.on('player:joined', (player) => {
      store.applyPlayerJoined(player);
      addToast({ message: `${player.displayName} joined`, type: 'info' });
    });

    socket.on('player:left', (playerId) => {
      store.applyPlayerLeft(playerId);
    });

    socket.on('player:reconnected', (player) => {
      store.applyPlayerJoined(player);
      addToast({ message: `${player.displayName} reconnected`, type: 'info' });
    });

    socket.on('player:state-update', (player) => {
      store.applyPlayerJoined(player);
    });

    socket.on('ability:bluff-activated', ({ team }) => {
      store.applyBluffActivated(team, true);
      addToast({ message: `${team.toUpperCase()} team activated BLUFF!`, type: 'warning' });
    });

    socket.on('ability:bluff-deactivated', ({ team }) => {
      store.applyBluffActivated(team, false);
    });

    socket.on('ability:sabotage-activated', ({ team, cardId }) => {
      addToast({ message: `${team.toUpperCase()} team used SABOTAGE on a word!`, type: 'warning' });
      void cardId;
    });

    socket.on('ability:bluff-triggered', ({ team, points }) => {
      addToast({ message: `BLUFF triggered! ${team.toUpperCase()} gets +${points} points!`, type: 'success' });
    });

    socket.on('error', ({ message }) => {
      addToast({ message, type: 'error' });
    });

    return () => {
      socket.removeAllListeners();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle reconnection
  useEffect(() => {
    socket.on('connect', () => {
      const roomId = store.roomId;
      if (roomId && displayName) {
        socket.emit('room:reconnect', { roomId, displayName }, (res) => {
          if (res.ok && res.state) {
            store.setFullState(res.state);
          }
        });
      }
    });

    return () => {
      socket.off('connect');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.roomId, displayName]);
}

export function useGameActions() {
  return {
    giveClue: (word: string, number: number) => socket.emit('game:give-clue', { word, number }),
    guessWord: (cardId: number) => socket.emit('game:guess-word', { cardId }),
    endTurn: () => socket.emit('game:end-turn'),
    useBluff: () => socket.emit('ability:use-bluff'),
    useSabotage: (cardId: number) => socket.emit('ability:use-sabotage', { cardId }),
    selectTeam: (team: 'red' | 'blue' | 'spectator') =>
      socket.emit('player:select-team', { team }),
    selectRole: (role: 'spymaster' | 'operative') => socket.emit('player:select-role', { role }),
    startGame: () => socket.emit('game:start'),
    rematch: () => socket.emit('game:rematch'),
  };
}
