import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState, Card, Clue, TeamState, Team, TimerState, Player, GamePhase } from '@codenames/shared';
import type { GuessResultPayload, TurnEndPayload, GameOverPayload } from '@codenames/shared';

interface GameStore {
  roomId: string | null;
  game: GameState | null;
  myPlayerId: string | null;
  gameOver: GameOverPayload | null;
  comboFlash: Record<Team, number>;

  // Derived helpers
  isSpymaster: () => boolean;
  myTeam: () => Team | 'spectator' | null;
  myPlayer: () => Player | null;

  // Mutations
  setRoomId: (roomId: string) => void;
  setMyPlayerId: (id: string) => void;
  setFullState: (state: GameState) => void;
  applyCardsUpdate: (cards: Card[]) => void;
  applyPhaseChange: (phase: GamePhase, currentTurn: Team) => void;
  applyClueGiven: (clue: Clue) => void;
  applyGuessResult: (payload: GuessResultPayload) => void;
  applyTurnEnded: (payload: TurnEndPayload) => void;
  applyTeamScoreUpdate: (team: Team, teamState: TeamState) => void;
  applyComboUpdate: (team: Team, combo: number) => void;
  applyTimerTick: (timer: TimerState) => void;
  applyPlayerJoined: (player: Player) => void;
  applyPlayerLeft: (playerId: string) => void;
  applyBluffActivated: (team: Team, active: boolean) => void;
  applyIndicationsUpdate: (selections: Record<number, string[]>) => void;
  setGameOver: (payload: GameOverPayload) => void;
  clearGameOver: () => void;
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    roomId: null,
    game: null,
    myPlayerId: null,
    gameOver: null,
    comboFlash: { red: 0, blue: 0 },

    isSpymaster: () => {
      const { game, myPlayerId } = get();
      if (!game || !myPlayerId) return false;
      const player = game.players.find(p => p.id === myPlayerId);
      return player?.role === 'spymaster';
    },

    myTeam: () => {
      const { game, myPlayerId } = get();
      if (!game || !myPlayerId) return null;
      const player = game.players.find(p => p.id === myPlayerId);
      return player?.team ?? null;
    },

    myPlayer: () => {
      const { game, myPlayerId } = get();
      if (!game || !myPlayerId) return null;
      return game.players.find(p => p.id === myPlayerId) ?? null;
    },

    setRoomId: (roomId) => set(s => { s.roomId = roomId; }),
    setMyPlayerId: (id) => set(s => { s.myPlayerId = id; }),

    setFullState: (state) => set(s => {
      s.game = state;
      s.roomId = state.roomId;
    }),

    applyCardsUpdate: (cards) => set(s => {
      if (s.game) s.game.cards = cards;
    }),

    applyPhaseChange: (phase, currentTurn) => set(s => {
      if (s.game) {
        s.game.phase = phase;
        s.game.currentTurn = currentTurn;
      }
    }),

    applyClueGiven: (clue) => set(s => {
      if (s.game) {
        s.game.activeClue = clue;
        s.game.phase = 'operative-turn';
      }
    }),

    applyGuessResult: (payload) => set(s => {
      if (!s.game) return;
      const card = s.game.cards.find(c => c.id === payload.cardId);
      if (card) {
        card.revealed = true;
        card.owner = payload.cardOwner;
      }
    }),

    applyTurnEnded: (_payload) => set(s => {
      if (s.game) {
        s.game.activeClue = null;
        s.game.guessesThisTurn = 0;
      }
    }),

    applyTeamScoreUpdate: (team, teamState) => set(s => {
      if (s.game) s.game.teams[team] = teamState;
    }),

    applyComboUpdate: (team, combo) => set(s => {
      if (s.game) s.game.teams[team].combo = combo;
      s.comboFlash[team] = combo;
    }),

    applyTimerTick: (timer) => set(s => {
      if (s.game) s.game.timer = timer;
    }),

    applyPlayerJoined: (player) => set(s => {
      if (!s.game) return;
      const idx = s.game.players.findIndex(p => p.id === player.id || p.displayName === player.displayName);
      if (idx >= 0) {
        s.game.players[idx] = player;
      } else {
        s.game.players.push(player);
      }
    }),

    applyPlayerLeft: (playerId) => set(s => {
      if (!s.game) return;
      const player = s.game.players.find(p => p.id === playerId);
      if (player) player.connected = false;
    }),

    applyBluffActivated: (team, active) => set(s => {
      if (!s.game) return;
      s.game.bluffActive = active;
      s.game.bluffTeam = active ? team : null;
    }),

    applyIndicationsUpdate: (selections) => set(s => {
      if (s.game) s.game.pendingSelections = selections;
    }),

    setGameOver: (payload) => set(s => {
      s.gameOver = payload;
      if (s.game) {
        s.game.phase = 'game-end';
        s.game.winner = payload.winner;
        s.game.winReason = payload.reason ?? null;
      }
    }),

    clearGameOver: () => set(s => { s.gameOver = null; }),
  })),
);
